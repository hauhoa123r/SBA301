# Fresh MySQL schema tương thích toàn bộ backend SBA301

Kiểm chứng ngày 13/10/2026. Chưa push/deploy/reset dữ liệu đang chạy. Tests MySQL dùng instance riêng tại `127.0.0.1:33087` và data directory mới trong `.deployment-check`.

## Nguyên nhân

Hibernate luôn SELECT `LessonProgressEntity.positionSeconds` từ `lesson_progress`. Schema gốc trước sửa không có cột này; nó chỉ được thêm trong `20261006_learning_progress.sql` và bản gộp `20261012_deploy_update.sql`.

Image `devhoa/chinese-mysql:16` theo log được cung cấp chỉ chạy schema, seed và reading courses. Chuỗi đó không có learning/authentication/feedback migration. Dockerfile checkout hiện tại dùng `03-deploy-update.sql`, `04-feedback.sql`, nên image đang chạy khác chuỗi source. Reset volume rồi dùng cùng image cũ sẽ lặp lại schema thiếu. Chưa có image ID/digest/hash production để xác định commit nguồn chính xác.

Đã sửa schema gốc để đủ mapping **ngay ở bước 01**, và thêm kiểm chứng image/schema trước khi CI push.

## Đối chiếu toàn bộ mapping

- Quét **54 Entity**, các embedded IDs và join tables: **55 bảng, 336 cột JPA**.
- SQL có **343 cột**: thêm 7 audit columns dùng bởi native queries mà AuditLogEntity không map.
- Kiểm tra **55 primary keys, 78 foreign keys, 29 unique constraints**. Khóa tổng hợp so sánh tập cột, không yêu cầu thứ tự index vật lý bằng thứ tự field Java.
- Đối chiếu datatypes qua Hibernate/MySQL, thêm kiểm tra nullability, string capacity, decimal precision/scale, PK/FK/unique. ENUM/JSON/boolean/date/timestamp và các quan hệ scalar ID được kiểm tra trong schema thật.
- Native queries của admin, auth, subscription, courses và learning đã được rà; các cột audit ngoài JPA được đưa vào contract riêng. Không còn bảng/cột mapping thiếu trong schema mới.

| Mismatch trước sửa | Thay đổi |
|---|---|
| position_seconds thiếu | `INT NOT NULL DEFAULT 0`, `CHECK (position_seconds >= 0)` |
| learning_activity_daily thiếu | DDL trong schema gốc, BIGINT counters default 0, DATE, unique user/date, FK users |
| authentication_settings thiếu | DDL + singleton id=1, BOOLEAN NOT NULL DEFAULT TRUE |
| 8 bảng feedback thiếu | Toàn bộ DDL/lock/join table trong schema gốc, decimal(18,4), datetime(6), FK/unique/check constraints |
| 9 columns nullable trái JPA | NOT NULL cho users.status, courses.status, answers.is_correct, assignment_submissions.status, invoices.status, quiz_attempts.status, referrals.status, refunds.status, reports.status; giữ defaults |
| subscription_plans.name VARCHAR(100) trong SQL, VARCHAR(255) trong JPA | Schema và CREATE-if-missing trong hai migration dùng VARCHAR(255) |
| OAuth code_hash CHAR(64), JPA VARCHAR(64) | Chuẩn hóa schema thành VARCHAR(64), giữ hash length/unique/NOT NULL |
| 10 @Lob fields mặc định Hibernate thành tinytext trong khi SQL TEXT | Explicit columnDefinition="TEXT" trong 9 Entity; giữ @Lob và dung lượng TEXT |
| AuditLogEntity không map method/endpoint/ip_address nhưng SQL bắt buộc không default | Defaults SYSTEM/empty endpoint/empty IP để Entity insert được; native AdminAuditRepository vẫn ghi context đầy đủ |
| Migration auth không chọn DB | Thêm USE chinese_online_learning |
| App/MySQL release tags dễ lệch | Pin MYSQL_IMAGE_TAG riêng; opt-in build/validate/push MySQL trong Jenkins |
| Env example thiếu MYSQL_ROOT_PASSWORD, lặp MYSQL_PASSWORD | Sửa key; thêm optional MYSQL_IMAGE_TAG; không in secret |

`watch_seconds` là thời gian xem tích lũy, `position_seconds` là vị trí resume. Position không âm, mặc định 0; không thay thế hai cột cho nhau hoặc đổi watch_seconds sang NOT NULL khi backend đang xử lý null. Không thu nhỏ TEXT thành TINYTEXT chỉ để vượt schema validator. Giữ timestamp/datetime/DATE và precision phù hợp mapping hiện hữu.

Schema subscription/enrollment/invoice snapshot/OAuth đã có trong base và được kiểm tra cùng toàn bộ mapping. FK user/plan/daily/feedback tồn tại dù một số Entity lưu ID scalar. Chi tiết từng cột/kiểu/nullability/key nằm trong hai contract TSV.

## SQL initialization

| Thứ tự | File trong image | Vai trò/phụ thuộc |
|---|---|---|
| 01 | 01-schema.sql | Snapshot đầy đủ 55 bảng + singleton defaults, trước seed; đủ JPA ngay ở bước này |
| 02 | 02-data.sql | Seed hiện hữu, có user 4 cho reading courses, plans và legacy enrollments; lesson progress bỏ position sẽ nhận 0 |
| 03 | 03-deploy-update.sql | Baseline giữ hành vi Việt hóa/dọn demo/thêm khóa đọc/index và chuẩn hóa seed progress; không cần nó để bù column thiếu trong base mới |
| 04 | 04-feedback.sql | Migration additive hiện hữu, re-runnable, không tạo survey demo |

Thư mục init chỉ chứa 4 SQL files. Verifier độc lập `/usr/local/bin/verify-edujar-schema` được gọi sau khi MySQL hoàn tất initialization và app-user TCP health check đạt; không được copy `.sh` vào thư mục init.

Baseline bước 03 có cleanup demo và DDL auto-commit. Nó chỉ tự chạy trên volume trống. Không import schema gốc vào DB cần giữ dữ liệu vì đầu file DROP DATABASE. Thay image trên volume cũ không tự migrate; dùng migration review riêng hoặc reset test volume có chủ đích.

## File sửa/thêm

- `database/chinese_online_learning.sql`: schema/defaults/constraints đầy đủ.
- `database/Dockerfile`: init chỉ có SQL; cài `/usr/local/bin/verify-edujar-schema` và SQL check để kiểm chứng sau startup.
- `database/20260928_subscription_plans.sql`, `20261012_deploy_update.sql`: CREATE subscription name đúng capacity; `20261007_auth_settings.sql`: USE DB.
- `database/jpa-schema-contract.tsv`, `native-schema-contract.tsv`: mapping JPA và phần SQL/native bổ sung.
- `database/generate-schema-check.py`, `check-schema.sql`, `verify-schema.sh`: generated read-only check cho toàn bộ columns/keys và position default.
- `backend/src/test/java/com/app/schema/JpaSchemaContractTest.java`: contract regression, real MySQL validate/SELECT/keys/default/negative-value tests; fixture rollback.
- 9 files dưới `backend/src/main/java/com/app/features/model`: `AnswerEntity`, `AssignmentEntity`, `AssignmentSubmissionEntity`, `CourseReviewEntity`, `LessonQaEntity`, `NotificationEntity`, `RefundEntity`, `ReportEntity`, `StudentAnswerEntity`. Chỉ thêm explicit TEXT cho 10 @Lob fields, không đổi service/API logic.
- `Jenkinsfile`: opt-in build/test/push MySQL qua database/network/container cô lập, Hibernate validation trước push.
- `docker-compose.yml`: chỉ đổi expression tag mysql; không đổi volume hoặc hoàn tác thay đổi monitoring có sẵn.
- `.env.example`: sửa key và thêm database tag pin. File này đã bị ignore trong workspace trước lượt sửa; chưa stage/commit nó và không in giá trị.
- README này và README-deploy-update.md: kết quả, build/Jenkins/reset/verification.

Các thay đổi HTTPS từ lượt trước được giữ nguyên.

## Tests thực chạy

| Kiểm chứng | Kết quả |
|---|---|
| Native MySQL 8.0.45 với data directory/port riêng | Schema + seed + baseline + feedback import thành công |
| Base schema trước seed | Hibernate validate + SELECT toàn bộ 54 Entity đạt |
| Full initialized schema | 55 bảng/343 cột; guard không có violations; PK/FK/unique đầy đủ |
| Playback/defaults | Omitted position nhận 0; NULL/số âm bị từ chối; generic audit insert hợp lệ; fixture rollback |
| 6 lớp MySQL integration hiện có | 26 tests đạt, không failure/error/skip: subscription, learning progress, authentication settings, courses, dashboard/student management |
| Full backend suite | 223 discovered: 197 executed/pass, 26 skipped, không failure/error. 26 skipped đã chạy riêng và đạt, nên tổng 223 tests đã được thực thi qua hai lần chạy |
| Guard regression | Thiếu position trong private test DB bị phát hiện; đã khôi phục test column/check. Shell guard fail khi có violation hoặc mysql CLI lỗi |
| Compose pin/syntax | config --quiet đạt; mysql:16 tách khỏi app-release; 9 Jenkins shell blocks, verifier syntax, generator --check, git diff --check đạt |

Docker daemon local không chạy, chưa build/run image Linux hoặc pipeline Jenkins end-to-end. Native MySQL chứng minh SQL/ORM thật; stage CI mới kiểm tra image/Docker entrypoint trước push. Không khẳng định EC2 đã được sửa khi chưa deploy.

Normal contract test không tự kết nối MySQL:

```bash
cd backend
mvn -Dtest=JpaSchemaContractTest test
```

Real test chỉ cho instance riêng tại loopback port 33087 hoặc CI DNS mysql-schema-test:3306:

```bash
export RUN_FRESH_SCHEMA_TESTS=true
export FRESH_SCHEMA_JDBC_URL='jdbc:mysql://127.0.0.1:33087/chinese_online_learning?serverTimezone=UTC'
export FRESH_SCHEMA_USER='<TAI_KHOAN_TEST>'
# Đặt FRESH_SCHEMA_PASSWORD bằng secret/environment của test, không in password.
mvn -Dtest=JpaSchemaContractTest test
```

Khi JPA đổi, review SQL rồi mới regenerate; không ghi đè contract để che test fail:

```bash
cd backend
mvn -Dtest=JpaSchemaContractTest -Dschema.contract.output=target/jpa-schema-contract.tsv test
cp target/jpa-schema-contract.tsv ../database/jpa-schema-contract.tsv
cd ..
python database/generate-schema-check.py
python database/generate-schema-check.py --check
```

Review native-schema-contract.tsv khi native columns/constraints thay đổi.

## Build image MySQL mới

Dùng checkout đã sửa và tag mới, không ghi đè tag 16. Các lệnh dưới đây do operator chạy; agent chưa build/push/deploy.

```bash
export IMAGE_TAG='mysql-schema-20261013-1'
export MYSQL_IMAGE_TAG="$IMAGE_TAG"
python database/generate-schema-check.py --check
docker compose --env-file .env -f docker-compose.yml config --quiet
docker compose --env-file .env -f docker-compose.yml build --no-cache mysql
docker image inspect "devhoa/chinese-mysql:$MYSQL_IMAGE_TAG" --format '{{.Id}}'
docker run --rm --entrypoint sh "devhoa/chinese-mysql:$MYSQL_IMAGE_TAG" -c \
  'ls -1 /docker-entrypoint-initdb.d; grep -n position_seconds /docker-entrypoint-initdb.d/01-schema.sql'
# Sau isolated init/JPA tests thành công và đăng nhập registry:
docker compose --env-file .env -f docker-compose.yml push mysql
```

Ghi nhận image ID/digest để đối chiếu sau pull. MYSQL_IMAGE_TAG phải là tag mới, không để pin 16 chọn lại image cũ.

## Jenkins

Quản lý release hiện tại dùng version file không có secret, digest pin và DB approval riêng; xem [RELEASES.md](../docs/deployment/RELEASES.md). Không cần sửa image tags trong `.env` EC2 khi Jenkins deploy ứng dụng.

1. Đưa thay đổi vào branch/build nguồn theo quy trình của bạn; agent không tự push.
2. Build với **BUILD_MYSQL_IMAGE=true**, **NGINX_ONLY=true**. MySQL build/push dùng BUILD_NUMBER, override pin của env Jenkins rõ ràng.
3. VERIFY_FRESH_MYSQL_SCHEMA tạo network/container mới riêng, không publish MySQL host port hoặc mount production volume. Chờ app-user TCP healthy sau init, chạy verifier độc lập rồi JpaSchemaContractTest trong Maven/Java 17 build image. Sau đó chạy fresh-mysql-regression.sh: xác nhận init-complete/healthy/không restart/không init shell script; kiểm tra verifier từ chối thiếu bảng và thiếu cột trên chính DB test. Database contract mount read-only. Chỉ push DB image khi tất cả checks đạt và image ID khớp container đã kiểm chứng; cleanup chỉ test container có label/token khớp và anonymous volume của nó.
4. Jenkins mặc định **không pull/up/reset MySQL EC2**. BUILD_MYSQL_IMAGE chỉ build/test/push; DB rollout cần DEPLOY_MYSQL_IMAGE=true và approval riêng sau backup/migrations review. Pipeline không reset volume.
5. Deployer giữ MySQL pin trong `deployment/versions.json` trên EC2, chỉ cập nhật DB entry khi upgrade đã được approval và healthy/schema checks đạt. Không ghi đè `.env` hoặc yêu cầu sửa secret file để đổi image version.
6. Normal app release dùng NGINX_ONLY=false, BUILD_MYSQL_IMAGE=false, DEPLOY_MYSQL_IMAGE=false. App tag có thể khác DB tag; app rollout --no-deps không recreate MySQL và sẽ chặn nếu schema hiện hữu không tương thích backend mới.

Backend vẫn ddl-auto=none; không bật update/create để che image/schema cũ.

## Regression cho lỗi entrypoint shell state

`05-verify-schema.sh` trước đây được copy với quyền `644`, nên official MySQL entrypoint source nó thay vì chạy process riêng. `set -eu` ở top level bật nounset trên entrypoint; sau khi verifier báo thành công, `mysql_expire_root_user` đọc `$MYSQL_ONETIME_PASSWORD` chưa khai báo và làm init thất bại. Không sửa entrypoint hoặc khai báo biến giả để che lỗi.

Verifier đã được bỏ khỏi init và bọc trong subshell: shell options, variables và `exit` không thoát sang caller ngay cả khi bị source nhầm. Kiểm tra schema vẫn chạy độc lập sau healthy, trước JPA tests và push. Receipt `.mysql-schema-verified` chứa image ID từ container thực sự đã kiểm chứng; receipt được xóa trước build và sau pipeline, và tag phải khớp ID này trước push MySQL.

Chạy local regression từ repo root (Python 3 + Bash/Git Bash):

```bash
python -m unittest discover -s database/tests -v
python database/generate-schema-check.py --check
```

17 shell tests đã đạt: tái hiện nounset leak cũ, giữ options/variables/IFS/traps khi source, exit codes cho schema thiếu bảng/cột, mysql CLI error/missing password (kể cả source trong điều kiện if), chạy PUSH_IMAGE với Docker stub để xác nhận missing/mismatched receipt chặn push, và kiểm tra trình tự/owner/healthy của fresh-container regression bằng stub. Các shell tests không kết nối DB hoặc registry.

Ngoài các stub tests, đã khởi tạo base schema trên MySQL 8.0.45 native với data directory mới/port riêng 33087: verifier thực trả 0 cho schema hợp lệ, trả 1 khi thiếu authentication_settings, trả 0 sau khôi phục bảng, và trả 1 khi thiếu lesson_progress.position_seconds. SQL của cả hai negative fixtures đã chạy thành công; instance test đã shutdown. Đây là kiểm chứng SQL/verifier thật, không thay cho kiểm chứng official Docker entrypoint.

Fresh-container regression thực chạy trong Jenkins với `BUILD_MYSQL_IMAGE=true`, trên container `edujar-schema-<token>` do stage tạo. `fresh-mysql-regression.sh` kiểm tra name/owner label trước các negative fixtures, tạm rename bảng authentication_settings rồi khôi phục, và cuối cùng bỏ position_seconds chỉ trong DB test sẽ được cleanup. Không chạy script này trên database production. Nếu bất kỳ check nào thất bại, stage trả nonzero và PUSH_IMAGE bị bỏ qua.

Docker daemon local chưa khả dụng, nên fresh Linux container và pipeline Jenkins end-to-end chưa được chạy trong lượt sửa lỗi shell này. Kết quả MySQL/JPA ở phần tests phía trên thuộc lượt kiểm chứng schema trước đó.

## Reset riêng test volume MySQL

**Các lệnh này xóa toàn bộ dữ liệu sba301_mysql_data. Chỉ dành cho môi trường thử nghiệm được phép bỏ dữ liệu. Agent chưa thực thi.** Nếu cần giữ dữ liệu, dùng backup/migration riêng. Không dùng down -v hoặc volume prune.

Chạy từng lệnh và dừng khi lỗi. Đúng deploy directory, project sba301 và named volume phải được kiểm chứng trước khi xóa:

```bash
(
set -eu
cd "$HOME/apps/SBA301"
export MYSQL_IMAGE_TAG='<TAG_MYSQL_MOI_DA_KIEM_CHUNG>'
docker compose --env-file .env -p sba301 -f docker-compose.yml config --quiet
docker inspect chinese-mysql --format 'image={{.Config.Image}} id={{.Image}}'
actual_project=$(docker inspect chinese-mysql --format '{{index .Config.Labels "com.docker.compose.project"}}')
test "$actual_project" = sba301
actual_volume=$(docker inspect chinese-mysql --format \
  '{{range .Mounts}}{{if eq .Destination "/var/lib/mysql"}}{{.Name}}{{end}}{{end}}')
test "$actual_volume" = sba301_mysql_data
docker volume inspect sba301_mysql_data --format '{{json .Labels}}'

# Pull/đối chiếu image ID và digest với build đã kiểm chứng trước khi dừng app.
docker compose --env-file .env -p sba301 -f docker-compose.yml pull mysql
docker image inspect "devhoa/chinese-mysql:$MYSQL_IMAGE_TAG" --format '{{.Id}} {{json .RepoDigests}}'
docker run --rm --entrypoint sh "devhoa/chinese-mysql:$MYSQL_IMAGE_TAG" -c \
  'test -x /usr/local/bin/verify-edujar-schema; test -z "$(find /docker-entrypoint-initdb.d -name "*.sh" -print -quit)"; grep -n position_seconds /docker-entrypoint-initdb.d/01-schema.sql'

docker compose --env-file .env -p sba301 -f docker-compose.yml stop nginx backend mysql
docker compose --env-file .env -p sba301 -f docker-compose.yml rm -f mysql
attached_containers=$(docker ps -aq --filter volume=sba301_mysql_data)
test -z "$attached_containers"
docker volume rm sba301_mysql_data
docker compose --env-file .env -p sba301 -f docker-compose.yml up \
  -d --no-deps --wait --wait-timeout 300 mysql
docker exec chinese-mysql sh /usr/local/bin/verify-edujar-schema
)
```

Sau guard đạt, lưu **chỉ key MYSQL_IMAGE_TAG** trong `.env` EC2 thành tag mới, giữ các secret/app variables. Không source hoặc in `.env`. Sau đó start app hiện hữu hoặc deploy app mới bằng Jenkins:

```bash
docker compose --env-file .env -p sba301 -f docker-compose.yml start backend nginx
```

Không reset tiếp nếu image/init lỗi; lưu log và kiểm tra image/source trước. SQL init thất bại giữa chừng có thể để lại data directory đã initialized; MySQL không tự chạy lại toàn bộ scripts ở lần restart sau.

## Verify sau deploy

```bash
docker inspect chinese-mysql --format 'image={{.Config.Image}} id={{.Image}} health={{if .State.Health}}{{.State.Health.Status}}{{end}}'
docker exec chinese-mysql sh /usr/local/bin/verify-edujar-schema
docker logs --tail 200 chinese-mysql 2>&1 | grep -E 'docker-entrypoint-initdb.d|Edujar schema verified'
docker exec chinese-mysql sh -c 'MYSQL_PWD="$MYSQL_PASSWORD" mysql -uchinese_app -Dchinese_online_learning --batch --execute="SHOW COLUMNS FROM lesson_progress LIKE \"position_seconds\"; SELECT COUNT(*) AS table_count FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE(); SELECT code,duration_days,active FROM subscription_plans; SELECT id,email_verification_enabled FROM authentication_settings; SELECT id FROM feedback_publication_lock;"'
```

Expected: image/tag mới, healthy, guard exit 0; position_seconds int/Null=NO/Default=0; 55 bảng; 3 plans nếu admin chưa thay; auth singleton và feedback lock id=1. Log có 01-schema/02-data/03-deploy-update/04-feedback và `MySQL init process done. Ready for start up.`, không có sourcing 05-verify-schema. Verifier success xuất hiện ở output docker exec/Jenkins, không phải initialization log.

Nghiệm thu API: plans 200 JSON; STUDENT có quyền gọi stats/detail/progress 200; save playback lưu/resume đúng vị trí; user không có quyền nhận empty state/403 đúng nghiệp vụ. Không còn Unknown column trong backend logs. Health 200 không thay schema guard và kiểm tra functional API.
