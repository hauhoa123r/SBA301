# SBA301 production releases

Thay đổi chỉ ở repository; chưa push, deploy hoặc sửa database/volume production.

## Audit

- Jenkins cũ đã export IMAGE_TAG trong phiên SSH. Vì vậy không thể kết luận mọi deployment Jenkins cũ bị `.env` ghi đè. Vấn đề đã xác nhận là không lưu version được deploy trên EC2, nên lần chạy Compose thủ công tiếp theo có thể dùng lại `.env` cũ.
- Base Compose cũ dùng `latest` fallback cho backend/nginx; MySQL còn fallback theo IMAGE_TAG. Đây là nguy cơ nâng DB image ngoài ý muốn khi phát hành app.
- Jenkins cũ mặc định NGINX_ONLY=true, chỉ kiểm tra image ID Nginx, không có backend healthcheck hoặc rollback transaction.
- Source `docker-compose.yml` hiện chỉ có mysql/backend/nginx. Không có định nghĩa Grafana/Prometheus trong file này; chưa có quyền truy cập runtime EC2 để xác minh topology monitoring. Vì vậy pipeline mới **không scp đè base Compose hoặc monitoring configuration trên EC2**.
- Override duy nhất trong source là `docker-compose.https.yml`, có bind mount host nginx.https.conf lên default.conf. Nó được giữ nguyên. Nếu EC2 đang dùng override này, config checksum preflight sẽ chặn rollout khi mount che khuất cấu hình trong image. Cần review cấu hình host một lần nếu đang dùng legacy override; không tự bỏ mount.
- Không sửa SQL/init/official MySQL entrypoint. Giữ nguyên stage fresh MySQL verification và JPA tests trước push.

## Version và image identity

Jenkins build/push tag BUILD_NUMBER và lưu image ID ngay sau build trong `.release/built-images.json`. Sau push, `prepare-release` yêu cầu tag vẫn trỏ đúng image ID và ghi registry digest vào `.release/release.json`, được archive trên Jenkins. Release có thể chứa MySQL image đã build, nhưng app deployment **không tự sử dụng** image này cho MySQL.

EC2 nhận payload riêng tại `deployment/releases/<BUILD_NUMBER>/`: release.json, release.py, compose.production.yml, verify-nginx-https.sh, check-schema.sql; chỉ thêm db-approval.json khi có approval. Không upload `.env`, base Compose hoặc monitoring files.

`deployment/versions.json` là version đang chạy, không có secret, gồm:

- image_tag: version ứng dụng gần nhất;
- images.backend / images.nginx / images.mysql: mỗi mục có tag, ref dạng `repository@sha256:...`, id dạng `sha256:...`;
- riêng nginx có config_sha256 để đối chiếu source và effective config.
- backend_ddl_mode: validate cho backend mới; snapshot none/validate của release trước để rollback không vô tình bật validation cho legacy backend. Các mode update/create bị từ chối.

Ví dụ release thành công: image_tag=22, backend.tag=22, nginx.tag=22, mysql.tag=21. Nginx-only release giữ backend.tag=21 và mysql.tag=21, chỉ nâng nginx.tag=22.

Lần đầu, version MySQL/app được bootstrap từ **container thực đang chạy**, không lấy tag cũ trong `.env`. Nếu image cũ chỉ có trong cache local, dùng image ID bất biến cho snapshot/rollback. Tag `latest` bị từ chối. Các lần sau đối chiếu version đã lưu với running image ID, fail khi có drift.

Mọi lệnh Compose của deployer export IMAGE_TAG, BACKEND_IMAGE_TAG, NGINX_IMAGE_TAG, MYSQL_IMAGE_TAG và ba IMAGE_REF từ version đã kiểm chứng. Shell environment ưu tiên hơn env file theo [Docker interpolation documentation](https://docs.docker.com/compose/how-tos/environment-variables/variable-interpolation/). Vì vậy `.env` EC2 có tag cũ vẫn giữ nguyên secret và không điều khiển version trong đường deploy mới.

File version được ghi bằng fsync + atomic replace **sau khi** deployment đạt checks; versions.previous.json giữ snapshot để rollback. Không tạo file version có tag production giả trong Git. `.release`, payloads, runtime versions và lock file được ignore.

## Application deployment

`release.py` lấy Compose project và danh sách base/override files từ labels của các container hiện hữu. Tất cả phải cùng project/file set, các files phải nằm trong deploy root. Nó lọc các production override do pipeline trước tạo, rồi áp dụng override của release hiện tại ở cuối. Không tạo project mới hoặc bỏ các override monitoring đang dùng.

Trước rollout:

1. Parse effective Compose JSON kín trong process, chỉ log ba image refs/tags. Yêu cầu image config khớp ref mong muốn; so sánh volumes/networks và mọi service ngoài phạm vi deploy.
2. Với full app release, chạy check-schema.sql mới bằng mysql CLI trong container hiện hữu: **chỉ SELECT information_schema**, không ALTER/seed/init. Fail trước recreate nếu schema không tương thích backend mới.
3. Pull **chỉ backend/nginx**, bằng digest. Đối chiếu pulled image ID với build record Jenkins.
4. Nginx one-off preflight: nginx -t và checksum default.conf trong config thực đã mount. Không chỉ dựa vào nginx -t.
5. Kiểm tra rollback images còn trong cache, lưu previous version.

Rollout backend rồi Nginx, chỉ từng service với `--no-build --no-deps --pull never --force-recreate --wait`. Backend dùng Hibernate ddl-auto=validate, không tự sửa schema; healthcheck Actuator phải UP. Nginx healthcheck phải thực trả lời HTTPS loopback, rồi smoke test bên ngoài xác minh certificate bình thường.

Sau rollout kiểm tra effective refs, running image IDs **và** Config.Image digest reference, healthy; `nginx -T`, redirect HTTP→HTTPS, React SPA routes, API health và API `/api/subscriptions/plans` truy vấn DB thật. HTTPS smoke chạy cả origin loopback (giữ hostname edujar.site để verify certificate), public domain từ EC2 và public domain từ Jenkins agent.

Nếu một check sau recreate thất bại, rollback đúng các application services về refs/IDs trước đó, kiểm tra lại health/smoke, khôi phục version file và vẫn fail pipeline. Jenkins có trap rollback cho trường hợp public smoke từ agent thất bại sau remote commit. Expected-tag guard ngăn rollback nhầm release khác; Nginx-only giữ rollback ở phạm vi Nginx. Nếu rollback thất bại, báo rõ cần operator xử lý.

MySQL, Grafana, Prometheus và các service ngoài phạm vi không được up/pull/remove trong application path; container IDs của chúng được so sánh trước/sau. Không dùng down, down -v, volume rm/prune hoặc image prune. Giữ cache rollback images.

## Thiết lập một lần

- Jenkins job Pipeline from SCM dùng branch production của repository; credentials hiện hữu dockerhub-credentials và azure-server-ssh được giữ nguyên. Credentials SSH tên cũ nhưng dùng SERVER_IP EC2 hiện hữu; xác nhận host/path theo môi trường vận hành trước khi chạy.
- Jenkins agent Linux: Docker Engine, Compose v2+ có config JSON/up --wait, Python **3.10+**, Bash, OpenSSL; môi trường build và EC2 cần cùng platform image. Full JVM/React tests chạy trong build-stage Docker images.
- EC2: Python **3.10+**, Docker/Compose, curl, CA trust; container names chinese-mysql/chinese-backend/chinese-nginx và Compose labels hợp lệ; `.env`, certificate/mounts và base Compose files hiện hữu. Deployer dùng flock để chặn concurrent deployments từ job khác.
- Cấu hình Jenkins group/user IDs `sba301-db-admins` tương ứng DB_APPROVERS nếu cần upgrade DB. Input step giới hạn submitter theo [Jenkins input documentation](https://www.jenkins.io/doc/pipeline/steps/pipeline-input-step/).
- Load Jenkinsfile mới một lần và kiểm tra parameters. Default NGINX_ONLY=false, BUILD_MYSQL_IMAGE=false, DEPLOY_MYSQL_IMAGE=false. Poll SCM mỗi khoảng 5 phút tự nhận commit mới; có thể dùng webhook/multibranch indexing thay polling theo cấu hình Jenkins của bạn.
- Base Compose đang dùng trên EC2 được giữ nguyên để bảo toàn monitoring/volumes. Các thay đổi cấu trúc ngoài image/healthcheck phải qua review riêng; release script không tự đồng bộ toàn bộ Compose từ Git.

## Lệnh production

Cách thông thường: push code vào branch production của job, Jenkins tự test/build/push/deploy backend + Nginx với defaults trên. Không phải sửa IMAGE_TAG/MYSQL_IMAGE_TAG trong `.env` bằng SSH.

Nếu operator cần chạy lại một payload **đã build/test/push và chuyển lên EC2 bởi Jenkins**, từ deploy root:

```bash
cd "$HOME/apps/SBA301"
release_tag=22
payload="deployment/releases/$release_tag"
python3 "$payload/release.py" deploy --root . --payload "$payload" \
  --manifest "$payload/release.json"

# Đọc version hiệu lực, không in Compose environment chứa secret:
python3 "$payload/release.py" compose --root . --payload "$payload" config --images
python3 "$payload/release.py" compose --root . --payload "$payload" ps

# Rollback application, giữ MySQL version hiện tại:
python3 "$payload/release.py" rollback --root . --payload "$payload" --expected-tag "$release_tag"
```

Với Nginx-only, thêm `--nginx-only` vào deploy/rollback. Không dùng `docker compose up` trần với `.env` cũ: dùng deployer, nơi runtime version file được đọc và export rõ ràng. Không chạy payload chưa được CI kiểm chứng.

## Upgrade schema / database riêng

**Build MySQL không phải migrate schema.** Official init chỉ chạy trên volume mới; đổi image trên volume hiện hữu không tự chạy lại SQL. Fresh-schema tests bảo đảm DB mới hợp lệ; production schema guard là cổng riêng cho DB đang dùng.

1. Backup production và kiểm chứng restore trên DB cô lập; ghi backup reference. Review migrations dành cho DB hiện hữu trên bản sao dữ liệu. Không import chinese_online_learning.sql/DataChinese.sql lên DB cần giữ dữ liệu; base schema chứa DROP DATABASE và baseline có cleanup demo. Không tự chạy migration tổng hợp mà chưa review các DELETE/DDL.
2. Áp dụng migration đã được approval trong maintenance window qua quy trình DB riêng. Dùng hướng expand/contract để app version hiện tại và version mới cùng tương thích, cho phép application rollback. Pipeline này không tự ALTER hoặc reset volume.
3. Build Jenkins với BUILD_MYSQL_IMAGE=true, DEPLOY_MYSQL_IMAGE=false để build → fresh initialization healthy → verifier → JPA/negative regression → push DB image mới. Ứng dụng vẫn theo NGINX_ONLY được chọn; MySQL production giữ pin cũ.
4. Khi cần **thay DB container image**, build với BUILD_MYSQL_IMAGE=true và DEPLOY_MYSQL_IMAGE=true. Pipeline chờ `APPROVE_DATABASE_UPGRADE`; DB approver nhập verified BACKUP_REFERENCE và xác nhận migrations/maintenance window. Approval được archive cùng release tag và approver. Không có approval thì không chạy DB rollout.
5. DB rollout preflight schema compatibility, pull đúng MySQL digest, up **chỉ mysql** trên volume hiện hữu; kiểm tra healthy, ID/digest, mounts unchanged, schema và các container còn lại. Sau thành công chỉ cập nhật mysql entry trong versions.json, rồi app rollout tiếp tục.
6. DB image/engine upgrade thất bại cần operator xử lý từ backup/runbook; không tự rollback schema, xóa data hoặc downgrade MySQL engine. Application rollback luôn giữ MySQL version hiện tại.

Lệnh DB operator, chỉ sau khi CI artifact **db-approval.json** đã được tạo bởi input approval:

```bash
cd "$HOME/apps/SBA301"
release_tag='<BUILD_NUMBER_DB_DA_DUOC_APPROVAL>'
payload="deployment/releases/$release_tag"
python3 "$payload/release.py" deploy-database --root . --payload "$payload" \
  --manifest "$payload/release.json" --approval "$payload/db-approval.json"
```

## Kiểm thử thực hiện tại local

| Check | Kết quả |
|---|---|
| Deployment suite | 15 tests đạt: real Compose app22/DB21 với stale .env; transaction/rollback failure injection; schema/image/config preflight; approval; bảo toàn monitoring/volumes/secrets; external Jenkins smoke rollback |
| Existing MySQL shell regressions | 17 tests đạt; giữ gate verify-before-push |
| Backend mvn test | 223 discovered, 196 pass, 27 skipped vì yêu cầu MySQL riêng; 0 failure/error |
| Frontend Vitest | 42 tests / 8 suites đạt |
| Frontend typecheck + production build | Đạt qua npm run build |
| Jenkins shell syntax | 10 shell blocks đạt bash -n; hai MySQL shell scripts đạt |
| Schema generator / Python syntax / git diff | --check, py_compile, diff --check đạt |

Tests rollout dùng fake engine có mutable container state và failure injection, không dùng EC2. Real Compose CLI parse config được chạy; **Docker daemon local không khả dụng**, nên chưa build/run Linux images, chạy fresh container, chứng minh runtime healthchecks hoặc validate Jenkins end-to-end trong lượt này. Jenkins stage TEST_BEFORE_RELEASE chạy trước push/deploy; VERIFY_FRESH_MYSQL_SCHEMA tiếp tục kiểm chứng actual image khi BUILD_MYSQL_IMAGE=true.

Chạy lại từ repo root:

```bash
python -m unittest discover -s deployment/tests -v
python -m unittest discover -s database/tests -v
python database/generate-schema-check.py --check
cd backend && mvn test
cd ../frontend && npm test && npm run build
```

## Files thay đổi

- Jenkinsfile: defaults normal app release, explicit CI tags, SCM trigger, test gate, build identity/digest artifacts, independent DB approval, scoped payload upload và agent-smoke rollback.
- docker-compose.yml: bỏ latest/MySQL fallback theo app tag, app service tag overrides, backend/Nginx healthchecks; không sửa mounts/volumes/network.
- deployment/compose.production.yml: digest override cho 3 services, backend validation và app healthchecks; không định nghĩa lại monitoring/volumes.
- deployment/release.py: non-secret versions, effective config/runtime identity, read-only schema gate, approved DB path, transactional app rollout/rollback và EC2 lock.
- deployment/tests/test_release.py, test_jenkins_deploy.py: version separation/approval/protection/rollback và shell workflow regression.
- .gitignore: generated runtime metadata/artifacts/lock.
- Tài liệu này và database/README-fresh-schema.md: audit, vận hành, schema upgrade, version file/approval và kết quả kiểm thử.

Các docs audit/recovery cũ là lịch sử; dùng quy trình này cho deployment có runtime version file.
