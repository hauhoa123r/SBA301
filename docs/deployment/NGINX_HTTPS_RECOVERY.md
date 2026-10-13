# Khôi phục HTTPS Nginx Edujar

Ngày: 13/10/2026. Các thay đổi này chưa được push/deploy.

## Nguyên nhân và bằng chứng

Production publish 80/443 nhưng `nginx -T` chỉ có HTTP, `/etc/nginx/conf.d/default.conf` 631 bytes và không có mount ghi đè config. Đây là lỗi **nội dung cấu hình trong container**, không phải thiếu Docker port publishing. Reload đọc lại cùng file HTTP nên không khắc phục được.

Trong Git, `415cc5b:frontend/nginx.conf` **đúng 631 bytes** và chỉ có `listen 80 default_server`. Cấu hình HTTPS đã có lại ở commit `ae69e63`. Source hiện tại cũng có HTTP redirect, TLS 443 với certificate edujar.site, `/api/` proxy tới backend:8081 và React SPA fallback. Bằng chứng rất phù hợp image cũ được build từ bản HTTP; chưa có image ID/hash production để khẳng định container chính xác xuất phát từ commit đó. File trong writable layer cũng có thể đã bị sửa thủ công dù không mount.

Dockerfile trước sửa lấy `/app/nginx.conf` từ frontend build stage; đó là `frontend/nginx.conf` trong context `./frontend`. **Không** dùng `frontend/nginx.https.conf` khi chạy base Compose. File thứ hai chỉ có hiệu lực nếu dùng override `docker-compose.https.yml` để mount default.conf; mounts production được cung cấp cho thấy override này không đang mount config.

Jenkins hiện tại đã dùng `IMAGE_TAG=BUILD_NUMBER` cho build/push và export cùng tag trên EC2 cho pull/up. Không tìm thấy lỗi hardcode latest trong đường Jenkins đó. Tuy nhiên trước sửa chưa đối chiếu image ID/source checksum/container và `nginx -t` chấp nhận bản HTTP. Deploy thủ công không export tag có thể fallback `latest`. Không đủ bằng chứng để kết luận bước nào đã chạy tag sai trên production.

## File thay đổi

| File | Thay đổi |
|---|---|
| `frontend/Dockerfile` | COPY trực tiếp `nginx.conf` từ context vào final image; build thất bại nếu thiếu `listen 443 ssl`; khai báo EXPOSE 80 443. EXPOSE là metadata, không tự tạo listener |
| `Jenkinsfile` | Mặc định `NGINX_ONLY=true`; build/push/pull chỉ nginx. Nếu bỏ chọn thì thêm backend, luôn không deploy MySQL. Explicit `-f docker-compose.yml` tránh override ngoài ý muốn; đối chiếu config SHA256 lúc build và image ID sau pull; preflight cert/config bằng one-off container; recreate Nginx với `--no-deps`; xác minh effective config/TLS rồi public HTTPS từ Jenkins trước success |
| `deployment/verify-nginx-https.sh` | Đối chiếu image ID đã build, running image ID, checksum default.conf; kiểm tra `nginx -T` có listener/redirect/cert/key/proxy/SPA; HTTP 301 đúng domain; HTTPS hai route trả 200 HTML; API health qua HTTPS là 200 UP. Không dùng `-k`, không start/restart container hoặc sửa database |
| `docs/deployment/NGINX_HTTPS_RECOVERY.md` | Bằng chứng, giới hạn, commands build/deploy/verify Nginx riêng |

`frontend/nginx.conf` không cần sửa vì đã đúng. `docker-compose.yml` giữ nguyên thay đổi có sẵn của người dùng; checksum vẫn là `89A045B9CD688542A702D4E56097B68A105A25E71E3B30528D06673DD7A0EE3A`. Không thay database source, container hay volumes. Báo cáo audit trước đó là tài liệu lịch sử, không bị viết lại.

## Build/push chỉ Nginx

Chạy trên Jenkins/build host Linux với checkout chứa các thay đổi này, từ repository root. Đây là lệnh để operator thực hiện; agent chưa chạy Docker build/push/deploy. Dùng `.env` vận hành có đủ required keys; không in giá trị secret. Tag bên dưới là ví dụ, chọn tag mới duy nhất cho release.

```bash
export IMAGE_TAG='nginx-https-20261013-1'
docker compose --env-file .env -f docker-compose.yml config --quiet
docker compose --env-file .env -f docker-compose.yml build --no-cache nginx

EXPECTED_CONFIG_SHA=$(sha256sum frontend/nginx.conf | cut -d ' ' -f 1)
BUILT_CONFIG_SHA=$(docker run --rm --entrypoint sha256sum \
  "devhoa/chinese-nginx:$IMAGE_TAG" /etc/nginx/conf.d/default.conf | cut -d ' ' -f 1)
test "$BUILT_CONFIG_SHA" = "$EXPECTED_CONFIG_SHA"
EXPECTED_IMAGE_ID=$(docker image inspect "devhoa/chinese-nginx:$IMAGE_TAG" --format '{{.Id}}')
printf 'IMAGE_TAG=%s\nEXPECTED_IMAGE_ID=%s\nEXPECTED_CONFIG_SHA=%s\n' \
  "$IMAGE_TAG" "$EXPECTED_IMAGE_ID" "$EXPECTED_CONFIG_SHA"

# Chỉ sau khi build/check thành công và operator đã đăng nhập registry:
docker compose --env-file .env -f docker-compose.yml push nginx
```

Chạy từng lệnh và dừng khi lỗi. `docker run ... sha256sum` là container tạm đọc file trong image; không chạy Nginx và không dùng database. Không cần `--no-cache` ở các build sau vì COPY thay nội dung sẽ invalid cache; dùng một lần khi recovery giúp loại bỏ nghi ngờ cache build.

Chuyển `deployment/verify-nginx-https.sh` từ chính checkout đã build tới `$HOME/apps/SBA301/deployment/` trên EC2 bằng cơ chế vận hành hiện có. Ghi nhận ba giá trị metadata ở trên; không tự suy ra EXPECTED_IMAGE_ID từ container cũ.

## Deploy lại riêng Nginx trên EC2

Giữ backend đang hoạt động để proxy/config preflight resolve được upstream. Giữ deploy path, Compose project name và `.env` vận hành hiện có. Nếu project thực dùng tên explicit `-p`, thêm cùng tên đó vào các lệnh Compose; không tạo project mới. Không dùng `docker compose up` không chỉ định service, `down`, `down -v`, pull/build mysql hoặc xóa volume.

```bash
cd "$HOME/apps/SBA301"
export IMAGE_TAG='nginx-https-20261013-1'
# Thay hai giá trị sau bằng metadata từ build host, không phải image đang chạy:
EXPECTED_IMAGE_ID='sha256:<IMAGE_ID_TU_BUILD_HOST>'
EXPECTED_CONFIG_SHA='<SHA256_NGINX_CONF_TU_BUILD_HOST>'

docker compose --env-file .env -f docker-compose.yml config --quiet
OLD_NGINX_IMAGE_ID=$(docker inspect chinese-nginx --format '{{.Image}}')
ROLLBACK_TAG="nginx-before-https-$(date -u +%Y%m%dT%H%M%SZ)"
docker image tag "$OLD_NGINX_IMAGE_ID" "devhoa/chinese-nginx:$ROLLBACK_TAG"
printf 'Rollback tag: %s\n' "$ROLLBACK_TAG"

docker compose --env-file .env -f docker-compose.yml pull nginx
test "$(docker image inspect "devhoa/chinese-nginx:$IMAGE_TAG" --format '{{.Id}}')" = "$EXPECTED_IMAGE_ID"

# Container tạm: dùng cert mount + Docker network thật, không publish port/start dependency.
docker compose --env-file .env -f docker-compose.yml run --rm --no-deps --entrypoint nginx nginx -t

# Chỉ recreate Nginx. Có một khoảng gián đoạn ngắn trên frontend khi thay container.
docker compose --env-file .env -f docker-compose.yml up -d --no-build --no-deps --force-recreate --wait --wait-timeout 180 nginx
sh deployment/verify-nginx-https.sh \
  "devhoa/chinese-nginx:$IMAGE_TAG" "$EXPECTED_IMAGE_ID" "$EXPECTED_CONFIG_SHA"
docker port chinese-nginx
docker exec chinese-nginx nginx -T 2>&1 | grep -E 'listen |ssl_certificate|proxy_pass|try_files'
```

Preflight `nginx -t` xảy ra trước recreate để phát hiện cert/key không đọc được hoặc upstream không resolve; nó chưa đủ kết luận HTTPS tốt. Script sau recreate mới xác nhận image/config hiệu lực và các TLS request với SNI edujar.site + CA validation.

Nếu verification fail, dừng release, lưu log đã redact và chẩn đoán. Có thể rollback **chỉ Nginx** bằng image đã lưu: export IMAGE_TAG bằng ROLLBACK_TAG rồi chạy lại `up -d --no-build --no-deps --force-recreate nginx`. Bản rollback HTTP cũ chỉ khôi phục trạng thái trước thay đổi, không được coi là HTTPS đã sửa. Không xóa image rollback trước khi release được xác nhận.

## Xác nhận public từ máy ngoài EC2

```bash
curl --silent --show-error --connect-timeout 5 --max-time 15 \
  --output /dev/null --write-out '%{http_code} %{redirect_url}\n' http://edujar.site/learning
curl --fail --silent --show-error --connect-timeout 5 --max-time 15 \
  --output /dev/null --write-out '%{http_code} %{content_type}\n' https://edujar.site/learning
curl --fail --silent --show-error --connect-timeout 5 --max-time 15 \
  --output /dev/null --write-out '%{http_code} %{content_type}\n' https://edujar.site/subscriptions
curl --fail --silent --show-error --connect-timeout 5 --max-time 15 https://edujar.site/api/actuator/health
```

Expected: HTTP `301 https://edujar.site/learning`; HTTPS hai trang `200 text/html` (có thể kèm charset); health 200 và JSON status UP. Không `-k`, không chỉ dựa vào curl --fail vì redirect 3xx có thể vẫn exit 0. Kiểm tra browser assets và GET `/api/subscriptions/plans`, authenticated `/api/learning/stats`/detail/progress nếu cần nghiệm thu chức năng; sửa HTTPS không tự chứng minh schema/JWT/course APIs đã tốt.

## Kiểm chứng local và giới hạn

- `bash -n`: verifier và 8 shell blocks trong Jenkins đều đạt; các escape của triple-single-quoted Groovy shell strings được giải mã trước kiểm tra cú pháp shell.
- Fixture tests verifier: bản HTTPS đạt; HTTP-only effective config, stale image ID, sai config hash, curl TLS failure, thiếu redirect HTTP, HTTPS route 302, backend DOWN và health 301 đều bị từ chối. Dockerfile listener guard nhận bản hiện tại và từ chối cấu hình HTTP 631 bytes trong Git.
- `git diff --check` đạt; Compose base vẫn validate với fixture `.deployment-check/validation.env`; Compose/source Nginx giữ nguyên.
- Docker daemon local không chạy (`docker_engine` pipe không tồn tại), nên chưa build image/preflight với cert thật hoặc chạy smoke TLS thật. Fixtures xác minh logic guard, không chứng minh HTTPS production đang hoạt động.
- Không có Jenkins/Groovy runtime local để chạy Declarative Pipeline end-to-end. Pipeline cần chạy trên Jenkins với Docker, SSH credential, EC2 certificates/backend và registry hiện hữu.
