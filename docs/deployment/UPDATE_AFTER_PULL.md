# Cập nhật sau git pull, giữ database hiện hữu

Hướng dẫn này dành cho server Linux đang chạy Docker Compose với các container
`chinese-mysql`, `chinese-backend`, `chinese-nginx`. Chạy trong **Bash trên server**,
không chạy các lệnh Bash này trong PowerShell Windows. Nếu chỉ pull trên máy cá nhân,
cần đưa commit chứa sửa giao diện lên server trước; pull không tự cập nhật image Docker.

Thay đổi trang Gói học chỉ nằm trong frontend: ẩn khung thông báo gói trả phí đang
hoạt động và thay nút đăng ký Premium bằng nút vô hiệu hóa “Đang sử dụng gói học này”
khi tài khoản có gói trả phí còn hạn. Không xóa
subscription, hóa đơn, thanh toán hay quyền học. Gói hết hạn vẫn được đăng ký lại;
người dùng thử vẫn có thể mua Premium. Thay đổi giao diện này không cần migration.

Các lệnh dưới đây không được thực thi trên server thật trong lượt sửa code.
Không thể cam kết không gián đoạn: recreate một backend/nginx có thể gây ngắt ngắn.
Chọn lúc ít người học và tránh chạy đồng thời với Jenkins hoặc người deploy khác.

## 1. Vào đúng thư mục và xem trạng thái

Ví dụ đường dẫn theo Jenkinsfile; đổi nếu server dùng đường dẫn khác:

```bash
cd "$HOME/apps/SBA301"
git status --short
git log -1 --oneline
test -s .env
docker ps --filter name=chinese-
docker inspect chinese-mysql --format '{{.Config.Image}}'
docker inspect chinese-mysql --format '{{range .Mounts}}{{if eq .Destination "/var/lib/mysql"}}{{.Type}} {{.Name}} {{.Source}}{{end}}{{end}}'
```

Giữ nguyên `.env`, mật khẩu, JWT, OAuth, payment, `MYSQL_IMAGE_TAG` và volume MySQL.
Không thay `.env` thật bằng `.env.example`. Không import `database/schema.sql` hay
`database/data.sql` vào database đang có dữ liệu. Không chạy `down -v`, `volume rm`,
`volume prune`, hoặc `up` toàn bộ service cho đợt cập nhật ứng dụng này.

## 2. Chọn đúng project và giữ các override đang dùng

Chạy các bước tiếp theo trong cùng phiên Bash. Lấy project và danh sách Compose
files từ container hiện tại để không bỏ cấu hình HTTPS/monitoring của server:

```bash
project=$(docker inspect chinese-mysql --format '{{index .Config.Labels "com.docker.compose.project"}}')
test -n "$project" && test "$project" != '<no value>' || { echo 'Không xác định được Compose project'; exit 1; }
for container in chinese-backend chinese-nginx; do
  test "$(docker inspect "$container" --format '{{index .Config.Labels "com.docker.compose.project"}}')" = "$project" || exit 1
done
active_files=$(docker inspect chinese-nginx --format '{{index .Config.Labels "com.docker.compose.project.config_files"}}')
test -n "$active_files" && test "$active_files" != '<no value>' || exit 1
printf 'Project: %s\nCompose files: %s\n' "$project" "$active_files"
export COMPOSE_FILE="${active_files//,/:}" COMPOSE_PATH_SEPARATOR=:
compose() { docker compose --env-file .env --project-name "$project" "$@"; }
compose config --quiet
compose config --images
```

Nếu file đang dùng không còn tồn tại hoặc có override release cũ pin image riêng,
dừng để kiểm tra file đó. Không tự bỏ override hoặc tạo project/volume mới. Không
in `compose config` đầy đủ hoặc `.env` vì có thể lộ secret.

## 3. Sao lưu trước khi cập nhật

```bash
umask 077
release_id="$(git rev-parse --short HEAD)-$(date +%Y%m%d-%H%M%S)"
backup_dir="$HOME/sba301-backups/$release_id"
mkdir -p "$backup_dir"
cp -- .env "$backup_dir/env.before"
docker inspect chinese-mysql --format '{{.Id}}' > "$backup_dir/mysql-container.before"
docker inspect chinese-mysql --format '{{range .Mounts}}{{if eq .Destination "/var/lib/mysql"}}{{.Type}} {{.Name}} {{.Source}}{{end}}{{end}}' > "$backup_dir/mysql-mount.before"
docker inspect chinese-backend --format '{{.Image}}' > "$backup_dir/backend-image.before"
docker inspect chinese-nginx --format '{{.Image}}' > "$backup_dir/nginx-image.before"
docker tag "$(cat "$backup_dir/backend-image.before")" "sba301-backend-rollback:$release_id"
docker tag "$(cat "$backup_dir/nginx-image.before")" "sba301-nginx-rollback:$release_id"
if docker exec chinese-mysql sh -c 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysqldump -uroot --single-transaction --quick --routines --triggers --events --hex-blob --no-tablespaces --set-gtid-purged=OFF chinese_online_learning' > "$backup_dir/database.sql"; then
  test -s "$backup_dir/database.sql" || exit 1
  sha256sum "$backup_dir/database.sql" > "$backup_dir/database.sql.sha256"
else
  echo 'Backup thất bại; dừng triển khai.'
  exit 1
fi
printf 'Backup: %s\n' "$backup_dir"
```

Giữ backup ở nơi hạn chế truy cập và sao chép sang nơi lưu trữ riêng. File có dữ
liệu người dùng; bản `.env` có secret. Trước migration, phải thử restore bản dump
vào MySQL 8 cô lập và đối chiếu tài khoản, gói, hóa đơn, thanh toán, tiến độ.
Không restore thử lên database thật. Dump dùng snapshot cho bảng InnoDB; tránh
chạy DDL khác trong lúc sao lưu. File tồn tại/checksum đúng chưa chứng minh restore được.

## 4. Chọn phạm vi

**Chỉ sửa giao diện Gói học:** bỏ qua bước migration, build/deploy **nginx** ở bước
5. Không cần restart backend hay thay database. Cách này không triển khai API mới
của các commit khác vừa pull; frontend mới vẫn cần tương thích backend đang chạy.

**Cập nhật cả backend vừa pull:** trước tiên chạy kiểm tra schema chỉ đọc:

```bash
sh deployment/verify-mysql-schema.sh database/tests/check-schema.sql
```

Nếu báo thiếu bảng/cột/index, chưa deploy backend. Kiểm tra migration đúng phần
thiếu trên bản sao database. Bản dashboard mới có migration
`database/migrations/20261019_learning_analytics.sql`, thêm bảng/index và giữ dữ
liệu hiện hữu. Chỉ khi đã kiểm chứng restore và xác nhận đây là phần còn thiếu,
mới chạy trên server:

```bash
docker exec -i chinese-mysql sh -c 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql -uroot --default-character-set=utf8mb4 chinese_online_learning' < database/migrations/20261019_learning_analytics.sql
sh deployment/verify-mysql-schema.sh database/tests/check-schema.sql
```

Dừng nếu một lệnh lỗi. Nếu guard còn lỗi khác, migration trên chưa đủ; không chạy
hàng loạt file legacy SQL để thử sửa. MySQL DDL tự commit, không rollback toàn bộ
migration bằng `ROLLBACK`. Schema guard đạt chỉ xác nhận cấu trúc, cần kiểm tra
thêm dữ liệu nghiệp vụ và quyền học. Xem [README-deploy-update.md](../../database/README-deploy-update.md)
và [LEARNING_ANALYTICS.md](LEARNING_ANALYTICS.md).

## 5. Build từ source vừa pull

Dùng tag mới để giữ image cũ phục hồi. `IMAGE_TAG` bên dưới chỉ có hiệu lực trong
phiên Bash hiện tại; `MYSQL_IMAGE_TAG` không đổi:

```bash
export IMAGE_TAG="manual-$release_id"
compose config --quiet
compose config --images
```

Xác nhận nginx/backend hiện tag `manual-...` và MySQL giữ nguyên tag đã chọn.
Nếu override vẫn ép tag/digest khác, dừng kiểm tra trước khi build. Nếu `.env`
thiếu `MYSQL_IMAGE_TAG`, lấy đúng tag pin hiện tại từ bước 1; không đoán tag mới.

Chỉ giao diện:

```bash
compose build nginx
compose run --rm --no-deps --entrypoint nginx nginx -t
```

Hoặc cả backend và frontend, sau khi bước 4 đạt:

```bash
compose build backend nginx
compose run --rm --no-deps --entrypoint nginx nginx -t
```

Dockerfile frontend tự chạy test và build. Build thành công chưa thay container
đang chạy. Lỗi build/cấu hình thì dừng trước bước 6. Không chạy `pull` sau build
local vì có thể dùng image registry thay cho code vừa build.

## 6. Thay container ứng dụng

Chỉ giao diện:

```bash
compose up -d --no-deps --no-build --pull never --force-recreate --wait --wait-timeout 180 nginx
```

Hoặc cả ứng dụng: chạy backend trước, chỉ tiếp tục khi health UP:

```bash
compose up -d --no-deps --no-build --pull never --force-recreate --wait --wait-timeout 180 backend
docker exec chinese-backend sh -c 'wget -q -O- http://127.0.0.1:8081/actuator/health'
# Chỉ chạy lệnh tiếp theo khi backend báo status UP.
compose up -d --no-deps --no-build --pull never --force-recreate --wait --wait-timeout 180 nginx
```

`--no-deps` giới hạn recreate vào service được chỉ định. Không build/up/pull mysql.
Lỗi health hoặc timeout thì xem log trước khi tiếp tục, không reset database.

## 7. Kiểm tra sau cập nhật

```bash
compose ps
compose logs --tail=100 backend nginx
docker exec chinese-nginx nginx -t
test "$(docker inspect chinese-mysql --format '{{.Id}}')" = "$(cat "$backup_dir/mysql-container.before")"
test "$(docker inspect chinese-mysql --format '{{range .Mounts}}{{if eq .Destination "/var/lib/mysql"}}{{.Type}} {{.Name}} {{.Source}}{{end}}{{end}}')" = "$(cat "$backup_dir/mysql-mount.before")"
curl --fail --show-error --silent --output /dev/null https://edujar.site/subscriptions
curl --fail --show-error --silent https://edujar.site/api/subscriptions/plans
```

Đổi hostname nếu môi trường dùng domain khác. ID/mount MySQL giống trước xác nhận
container/volume không bị thay; không phải bằng chứng toàn bộ dữ liệu bất biến.
Ứng dụng vẫn ghi dữ liệu nghiệp vụ khi người dùng hoạt động.

Mở trang bằng trình duyệt, tải lại Ctrl+F5. Kiểm tra tài khoản Premium còn hạn:
không có khung “Gói PREMIUM đang hoạt động”, có nút “Đang sử dụng gói học này”
bị vô hiệu hóa thay cho nút mua/gia hạn Premium,
vẫn vào học được từ menu. Tài khoản dùng thử/chưa mua/hết hạn vẫn có nút đăng ký;
kiểm tra đăng nhập, tiến độ, hóa đơn và thanh toán theo quy trình hiện có.

Ghi lại `release_id`, tag, backup path và các Compose files để lần deploy sau chọn
đúng image. Build local này không push image lên registry, không sửa tag `.env`.
Không chạy deploy bằng tag `.env` cũ rồi cho rằng vẫn là phiên bản vừa build.

## 8. Phục hồi ứng dụng khi lỗi

Giữ nguyên database và các bảng/index đã thêm. Trong cùng phiên Bash, tạo override
để dùng hai image cũ đã giữ ở bước 3:

```bash
cat > "$backup_dir/rollback.yml" <<EOF
services:
  backend:
    image: sba301-backend-rollback:$release_id
  nginx:
    image: sba301-nginx-rollback:$release_id
EOF
export COMPOSE_FILE="$COMPOSE_FILE:$backup_dir/rollback.yml"
```

Nếu chỉ deploy nginx, chỉ phục hồi nginx:

```bash
compose up -d --no-deps --no-build --pull never --force-recreate --wait --wait-timeout 180 nginx
```

Nếu đã deploy cả hai, phục hồi backend rồi nginx, kiểm tra backend UP giữa hai lệnh
như bước 6. Kiểm tra lại bước 7. Đây là phục hồi image ứng dụng; không phục hồi
schema/dữ liệu bằng cách import dump lên database đang có giao dịch mới.

## Nếu triển khai bằng image CI đã push

Không dùng quy trình build local ở bước 5–6. Đặt `IMAGE_TAG` trong `.env` thành tag
image đã build từ đúng commit và push thành công; giữ `MYSQL_IMAGE_TAG` hiện tại.
Script có sẵn tự lấy project/overrides và kiểm tra readiness/HTTPS:

```bash
sh deployment/deploy-app.sh nginx
# Hoặc, sau khi schema đã tương thích:
sh deployment/deploy-app.sh 'backend nginx'
```

Script này **pull registry**, không build source vừa pull. Jenkinsfile hiện tại
build/push tag `BUILD_NUMBER` rồi export tag đó khi SSH deploy cả backend/nginx;
không có tham số `NGINX_ONLY`. Một số tài liệu CI cũ trong repo mô tả quy trình
khác; đối chiếu Jenkinsfile đang chạy trước khi thao tác. Pipeline hiện tại không
tự chạy migration. Không để CI deploy backend trước khi database sẵn sàng.
