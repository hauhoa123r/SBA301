# CI/CD đơn giản, quản lý tag thủ công trên EC2

Jenkins chạy: checkout → Maven/frontend tests → build images → push Docker Hub → SSH EC2 → Docker Compose → HTTPS smoke test.

Jenkins build/push ứng dụng theo `BUILD_NUMBER`. **Deploy dùng `IMAGE_TAG` trong `.env` EC2 do operator tự cập nhật**, theo lựa chọn của bạn. Ví dụ Jenkins build 23 nhưng EC2 vẫn đặt `IMAGE_TAG=22`, thì EC2 tiếp tục deploy 22. Pipeline kiểm tra container chạy đúng image đã pull theo tag EC2 chọn; không bắt buộc tag này bằng build number vừa chạy. Muốn deploy code mới, đặt tag tương ứng trước khi stage SSH chạy.

MySQL dùng `MYSQL_IMAGE_TAG` riêng, chẳng hạn ứng dụng 22 và MySQL 21. Jenkins không cập nhật `.env`, không tự nâng MySQL và không reset volume. `MYSQL_IMAGE_TAG=ci-validation-only` trong môi trường Jenkins chỉ giúp validate/build Compose khi không build MySQL; không được gửi sang EC2.

## Tham số Jenkins

| Trường hợp | NGINX_ONLY | BUILD_MYSQL_IMAGE |
|---|---|---|
| Backend + Nginx | false | false |
| Chỉ Nginx | true | false |
| Build/verify/push MySQL mới, deploy riêng Nginx | true | true |

`BUILD_MYSQL_IMAGE=true` build MySQL theo BUILD_NUMBER, kiểm tra fresh container healthy sau initialization, verifier độc lập, JPA contract và negative tests thiếu bảng/cột. Chỉ push MySQL khi tất cả checks đạt và image ID khớp container đã kiểm chứng. Nó **không deploy MySQL EC2**, kể cả khi bật cùng `NGINX_ONLY=false`. Không còn tham số DB approval, release hoặc backup reference trong Jenkins.

Prerequisites giữ như job cũ: Linux Jenkins agent có Docker/Compose hỗ trợ `--wait`, Python 3, Bash, OpenSSL, SSH/SCP, curl; credentials `dockerhub-credentials`, `azure-server-ssh`; Jenkins secret env ở `/var/lib/jenkins/env/.env`. SSH host key EC2 phải có trong `known_hosts`. EC2 cần curl, Docker/Compose và quyền pull Docker Hub (login sẵn nếu repository private).

## Đổi tag ứng dụng thủ công

Operator chạy trên EC2, từ thư mục Compose đang dùng. Không source/in toàn bộ `.env` vì file chứa secret. Các lệnh chỉ sửa hai key version khi bạn chủ động yêu cầu.

```bash
cd "$HOME/apps/SBA301"
app_tag=23  # Tag BUILD_NUMBER sẽ được Jenkins push, hoặc tag đã push thành công.
if grep -q '^IMAGE_TAG=' .env; then
  sed -i "s/^IMAGE_TAG=.*/IMAGE_TAG=$app_tag/" .env
else
  printf '\nIMAGE_TAG=%s\n' "$app_tag" >> .env
fi
grep -E '^(IMAGE_TAG|MYSQL_IMAGE_TAG)=' .env
```

Giữ `MYSQL_IMAGE_TAG` ở version hiện tại. Nếu key này chưa có, đặt đúng tag của container MySQL đang chạy; xem `docker inspect chinese-mysql --format '{{.Config.Image}}'` để đối chiếu. Không dùng `latest`.

Sau đó chạy **Build with Parameters** theo bảng phía trên. Trigger SCM vẫn được giữ: push code sẽ kích hoạt job khi polling phát hiện thay đổi; tag EC2 vẫn do bạn quản lý. Khi `NGINX_ONLY=true`, cả hai tag trong env vẫn bắt buộc nhưng Jenkins chỉ pull/recreate Nginx, không recreate backend.

Deploy thủ công ứng dụng sau khi các image đã được push và scripts được cập nhật trên EC2:

```bash
cd "$HOME/apps/SBA301"
sh deployment/deploy-app.sh 'backend nginx'
# Hoặc chỉ Nginx:
sh deployment/deploy-app.sh nginx
```

Script chỉ dùng Compose CLI và shell. Nó lấy project/config files từ container đang chạy để giữ nguyên project, custom overrides, monitoring và tên volumes. Nó bỏ riêng `deployment/compose.production.yml` / `deployment/releases/*/compose.production.yml` của cơ chế release cũ khỏi danh sách active overrides. Các file metadata cũ trên EC2 không bị xóa và không được đọc. Các override HTTPS/custom khác vẫn được giữ. Nếu file cấu hình đang dùng không còn tồn tại hoặc còn pin image khác tag `.env`, script dừng để operator kiểm tra.

Jenkins chỉ SCP ba scripts và SQL kiểm tra vào `deployment/`, không ghi đè base Compose, `.env` hoặc cấu hình Grafana/Prometheus trên EC2. Source Compose hiện có 3 services; monitoring thực tế chưa được xác minh qua SSH. Không thay base EC2 bằng source này nếu base EC2 có thêm services. Nếu có cấu hình pin image tùy chỉnh, review riêng và đổi expression tag của backend/nginx thành `${IMAGE_TAG}`, MySQL thành `${MYSQL_IMAGE_TAG}` trong file đang dùng, giữ toàn bộ phần còn lại.

## Các kiểm tra được giữ

- Maven tests, frontend tests và `JpaSchemaContractTest` đọc contract qua classpath trong backend-only Docker context.
- Generator `--check` phát hiện SQL check/test resource chưa đồng bộ với contract gốc.
- Trước deploy backend: SQL guard read-only trên MySQL hiện tại phát hiện bảng/cột/datatype/keys thiếu hoặc sai. Không gọi initialization/migration trên production. Với tag ứng dụng cũ, guard dùng contract của checkout đang chạy Jenkins; schema mới được kiểm tra có thể chặt hơn checkout của image cũ.
- Compose validate và in **chỉ danh sách image**, đối chiếu tag ứng dụng/MySQL trước và sau deploy. Container backend/Nginx phải có image ID bằng image đã pull theo tag `.env`.
- `pull backend nginx` và `up --no-deps --no-build` chỉ recreate services được chọn. Có `--wait`, kiểm tra backend Actuator UP, container IDs MySQL/Grafana/Prometheus không đổi; NGINX_ONLY kiểm tra cả ID backend không đổi.
- `nginx -T` phải có listener HTTPS 443, redirect HTTP 80, certificate edujar.site, proxy `/api/` đến backend:8081 và SPA fallback. Kiểm tra checksum cấu hình và curl HTTPS thực tế (TLS verification bật) trên EC2 và public domain; không chỉ dựa `nginx -t`.

Không còn release manifest, digest pinning, version JSON, Python deployer hay automatic rollback. Nếu deploy lỗi, pipeline thất bại; ứng dụng có thể đã được recreate một phần. Operator sửa `IMAGE_TAG` về tag tốt trước đó rồi chạy `sh deployment/deploy-app.sh 'backend nginx'`. MySQL vẫn giữ nguyên.

## Nâng cấp MySQL riêng, giữ volume hiện hữu

1. Bật `BUILD_MYSQL_IMAGE=true` trong Jenkins để build/verify/push tag mới. Ghi nhận BUILD_NUMBER đã thành công.
2. Operator review/test migrations và backup, chọn thời điểm bảo trì rồi mới nâng DB. **Init SQL không chạy lại trên volume hiện hữu**; thay image không tự thêm cột/bảng. Schema guard fail phải được xử lý bằng migration đã review, không reset dữ liệu để vượt guard.
3. Chỉ sửa `MYSQL_IMAGE_TAG` khi quyết định nâng DB:

```bash
cd "$HOME/apps/SBA301"
mysql_tag=23
if grep -q '^MYSQL_IMAGE_TAG=' .env; then
  sed -i "s/^MYSQL_IMAGE_TAG=.*/MYSQL_IMAGE_TAG=$mysql_tag/" .env
else
  printf '\nMYSQL_IMAGE_TAG=%s\n' "$mysql_tag" >> .env
fi
```

4. Dùng đúng project và các Compose files hiện tại. Xem bằng các lệnh read-only sau; không cần version JSON:

```bash
docker inspect chinese-mysql --format '{{index .Config.Labels "com.docker.compose.project"}}'
docker inspect chinese-nginx --format '{{index .Config.Labels "com.docker.compose.project.config_files"}}'
docker inspect chinese-mysql --format '{{range .Mounts}}{{if eq .Destination "/var/lib/mysql"}}{{.Name}}{{end}}{{end}}'
```

Ví dụ dưới đây giả định project `sba301`, base `docker-compose.yml`. Thay đúng project, thêm `-f` cho các custom/monitoring overrides đang dùng, bỏ managed image override của release cũ. Không chạy ví dụ nếu chưa kiểm tra project/mounts.

```bash
unset IMAGE_TAG MYSQL_IMAGE_TAG BACKEND_IMAGE_TAG NGINX_IMAGE_TAG COMPOSE_FILE
docker compose --env-file .env -p sba301 -f docker-compose.yml config --images
docker compose --env-file .env -p sba301 -f docker-compose.yml pull mysql
docker compose --env-file .env -p sba301 -f docker-compose.yml up \
  -d --no-build --no-deps --wait --wait-timeout 300 mysql
sh deployment/verify-mysql-schema.sh deployment/check-schema.sql
docker inspect chinese-mysql --format 'image={{.Config.Image}} id={{.Image}} health={{if .State.Health}}{{.State.Health.Status}}{{end}}'
```

Các lệnh này giữ mount volume, không xóa dữ liệu. Migration cụ thể vẫn cần kế hoạch riêng cho schema đang chạy; không import base schema có `DROP DATABASE` vào production.

## Kiểm chứng tại local

```bash
python -m unittest discover -s deployment/tests -v
python -m unittest discover -s database/tests -v
python database/generate-schema-check.py --check
cd backend && mvn test
cd ../frontend && npm test
```

Compose tests dùng CLI thật không cần daemon, kiểm tra app 22/MySQL 21 và monitoring override. Deployment tests thực thi shell thật với Docker/SSH stubs để kiểm tra failures mà không gọi EC2. Jenkins shell blocks và các scripts được kiểm tra `bash -n`; đây không thay cho Declarative Pipeline linter trên Jenkins controller. Linter/controller và Linux Docker engine không sẵn có tại local, nên chưa chạy Docker image build/fresh-container hoặc pipeline end-to-end ở lượt sửa này.
