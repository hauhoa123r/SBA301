# Báo cáo hợp nhất SQL — 19/10/2026

> Cập nhật sau báo cáo: đợt thanh toán từng khóa Free/Premium đã được hoàn tác. Cách tổ chức SQL, schema và nội dung hợp nhất vẫn được giữ; seed hiện bán lại ba gói subscription. Các kết quả và mô tả Free/Premium bên dưới là ảnh chụp trước hoàn tác. Xem [trạng thái hiện tại](../../database/README-subscriptions.md).

Database mới khởi tạo được chỉ bằng `database/schema.sql` rồi `database/data.sql`. Đã chạy thật trên MySQL native 8.0.45 và Docker MySQL 8.0.46, đối chiếu toàn bộ DDL/nội dung còn hợp lệ với chuỗi Docker cũ. Database/volume đang sử dụng không bị truy cập, reset hoặc thay đổi; trạng thái migration hiện hữu: **NOT VERIFIED**.

## Nguồn SQL đã audit

Quét toàn repository và các thư mục con: 14 SQL baseline/migration/seed cùng 1 SQL kiểm tra. Thứ tự Docker cũ là `chinese_online_learning.sql` → `DataChinese.sql` → `20261012_deploy_update.sql` → `20261013_feedback.sql` → `20261018_refresh_sessions.sql` → `20261018_course_purchases.sql`. Baseline deploy đã chứa 7 migration trước; không chạy lặp chúng để suy ra trạng thái cuối. OAuth2 migration trùng base nên cũng không thêm vào chuỗi này. Các entity, enum và repository/native queries được đối chiếu qua Hibernate metadata, JPA/native TSV và real-MySQL integration tests.

| SQL cũ | Mục đích / xử lý |
|---|---|
| `20260928_add_reading_courses.sql` | Hai khóa đọc, 4 bài, từ vựng/mẫu câu/quiz; đòi user ID 4, gộp nội dung vào Premium ở seed mới. |
| `20260928_remove_mini_hsk_localize_data.sql` | Xóa đúng Mini HSK demo và dữ liệu liên quan; Việt hóa seed còn khớp. Không phục hồi dữ liệu bị loại. |
| `20260928_remove_placeholder_courses.sql` | Xóa placeholder và tệp/bài tập mẫu; giữ nội dung Sales hợp lệ. |
| `20260928_subscription_plans.sql` | Bảng plan/subscription, legacy_access và snapshot invoice. Chỉ giữ cấu trúc, không seed các gói đang bán cũ. |
| `20261003_admin_dashboard_indexes.sql` | 5 index Dashboard được định nghĩa inline trong schema mới. |
| `20261006_learning_progress.sql` | position_seconds/default/check, learning_activity_daily, index quiz; normalization progress cũ không thuộc fresh seed. |
| `20261007_auth_settings.sql` | Bảng authentication_settings và singleton mặc định bật xác minh email; INSERT chuyển sang data.sql. |
| `20261012_deploy_update.sql` | Baseline tổng hợp 7 phần phía trước; có cleanup DELETE, DDL auto-commit và prerequisite user 4, không áp dụng chồng lại các phần riêng. |
| `20261013_feedback.sql` | 8 bảng feedback, index/check/unique/FK và singleton publication lock; không có survey demo. |
| `20261018_course_purchases.sql` | catalog_code, published, purchased_at, unique catalog; CANCELLED/EXPIRED, backfill ownership và ngừng bán subscription. Fresh seed chỉ tạo catalog/content, không giả quyền mua. |
| `20261018_refresh_sessions.sql` | Bảng refresh_sessions, expiry index và FK user; không seed session/token. |
| `check-schema.sql` | SELECT verifier sinh từ JPA/native contract; di chuyển sang database/tests và thêm kiểm tra enum/index, không phải SQL init. |
| `chinese_online_learning.sql` | Baseline DDL; đã có phần lớn migration và singleton seed; DROP DATABASE nguy hiểm, chỉ dùng dựng đối chứng riêng. |
| `DataChinese.sql` | Seed cũ: master/content cùng tài khoản, mật khẩu/token và giao dịch/tiến độ demo; chỉ lấy dữ liệu nền/nội dung hợp lệ. |
| `oauth2_migration.sql` | avatar/OAuth accounts/code; đã có trong base. Script không re-runnable, khác nullability/CHAR legacy, không chạy thêm trên base hiện tại. |

Không phát hiện procedure, function, trigger hoặc view được định nghĩa/sử dụng bởi bộ SQL. Không có chuỗi DROP/RENAME COLUMN cần giữ lại trong init; các ALTER hợp lệ đều đã thành cột/default/enum/constraint/index cuối trong CREATE TABLE.

## File bị loại bỏ và cấu trúc cuối

Không hủy nguồn SQL lịch sử: 14 file được chuyển ra khỏi `database/` sang `deployment/legacy-sql/` để còn phục vụ nâng cấp có review và test đối chứng. Các file tracked dùng git mv; hai migration 20261018 vốn chưa tracked được chuyển nguyên file. SHA-256 của cả 14 nguồn không thay đổi, kể cả các chỉnh sửa local đã có trước yêu cầu này. [Inventory/hash](SQL_SOURCE_AUDIT.json).

`database/` chỉ còn đúng hai SQL ở cấp gốc. SQL thứ ba dưới `tests/` chỉ SELECT information_schema, không phải init và được Docker cài ngoài init directory:

```text
database/
  schema.sql
  data.sql
  Dockerfile
  .dockerignore
  my.cnf
  verify-schema.sh
  generate-schema-check.py
  jpa-schema-contract.tsv
  native-schema-contract.tsv
  cloudinary_assets.json
  imports/                         (giữ nguyên)
  README-fresh-schema.md
  README-deploy-update.md
  README-subscriptions.md
  tests/
    check-schema.sql               (read-only verifier)
    private_mysql.py
    fresh_initialization.py
    course_purchase_mysql_regression.py
    fresh-mysql-regression.sh
    test_contract_resources.py
    test_verify_schema.py
deployment/legacy-sql/
  14 nguồn SQL lịch sử + README.md
```

## Schema và seed cuối

56 bảng / 352 cột; 163 index gồm 56 primary key, 30 unique constraint/index và 77 index còn lại; 79 foreign key. InnoDB, utf8mb4_unicode_ci; đúng nullability/default/precision/enum hiện tại. Schema không có business INSERT, DROP TABLE/DATABASE hoặc ALTER lịch sử; không tắt kiểm tra FK. Hai singleton được chuyển hoàn toàn sang data.sql.

| Nhóm seed | Số bản ghi |
|---|---:|
| Role / permission / role-permission | 4 / 14 / 28 |
| Category / tag / badge | 6 / 8 / 4 |
| Authentication settings / feedback lock | 1 / 1 |
| Content owner bị khóa / user-role | 1 / 1 |
| Course / chapter / lesson / course-tag | 2 / 7 / 19 / 3 |
| Vocabulary / sentence pattern | 116 / 36 |
| Quiz / question / answer | 10 / 99 / 393 |
| Subscription plan / học viên / invoice / payment / quyền mua / token / progress | 0 |

Tổng seed: 753 bản ghi. Free giá 0đ, đúng 3 bài published; Premium giá 99.000đ, 16 bài published. Ba bài đầu là preview, những bài sau yêu cầu mua hoặc quyền lịch sử hợp lệ theo CourseAccessService. Bài Sales và 4 bài đọc được đưa vào các chương Premium, giữ nguyên payload học/quiz đã tồn tại sau cleanup. Không phục hồi placeholder/Mini HSK. Không có người dùng trả tiền giả hoặc admin đăng nhập được; content owner dùng email `.invalid`, trạng thái LOCKED và password_hash `!`. Mọi tham chiếu seed được tìm bằng khóa tự nhiên, không phụ thuộc ID production. Chạy lại seed giữ nguyên checksum mọi bảng, không tạo trùng.

## Kiểm chứng thực tế

| Kiểm chứng | Kết quả |
|---|---|
| MySQL native fresh init schema + data | PASS, 8.0.45 |
| Đối chiếu toàn bộ SHOW CREATE TABLE với chuỗi cũ | PASS, kể cả FK/unique/check/default/enum/index; chỉ bỏ bộ đếm AUTO_INCREMENT và biểu diễn charset dư tương đương |
| So sánh toàn bộ payload lesson/vocabulary/pattern/quiz/question/answer còn hợp lệ | PASS |
| Seed price/count/order, mọi FK không orphan, không có dữ liệu cá nhân/giao dịch/token | PASS |
| Seed import lần hai, checksum tất cả bảng không đổi | PASS |
| Guard negative fixture: thiếu CANCELLED/EXPIRED và thiếu Dashboard index | PASS, thực chạy ALTER/drop/restore chỉ trong instance test |
| Docker build + official entrypoint | PASS, MySQL 8.0.46; init directory đúng 01-schema.sql + 02-data.sql, không restart |
| Maven suite `*Test` trên private native MySQL | 283 test: 282 thực chạy, 0 failure/error, 1 browser test skip theo gate |
| FreshCatalogMySqlTest + JpaSchemaContractTest trên Docker MySQL | 5 test, 0 failure/error/skip |
| Spring Boot JAR thật, Hibernate ddl-auto=validate, HTTP /actuator/health | PASS, UP trên Docker MySQL test |
| Payment/course access regressions | PASS trong Maven suite; thêm test quyền preview 3 bài và quyền mua cũ 10 năm vẫn truy cập đủ bài |
| Course-purchase migration hai lần với sentinel giao dịch/quyền cũ | PASS; checksum lịch sử giữ nguyên, ownership backfill đúng |
| Python database tests | 22/22 PASS |
| Docker Compose configuration tests | 5/5 PASS |
| Full deployment Python suite | 20 test, 4 error thuộc 3 test method cũ do CONNECT_SERVER/VERIFY_PUBLIC_HTTPS không còn trong Jenkins trước refactor; phần còn lại đạt |

Spring Boot chỉ tắt health check mail bên ngoài trong harness và dùng SMTP loopback/địa chỉ thử; datasource/JPA validate vẫn hoạt động thật. Lần khởi động đầu thiếu sender mail, lần tiếp theo mail health không có SMTP server; đã sửa cấu hình harness và kiểm chứng lại thành công. Không sửa cấu hình ứng dụng production để vượt test. Browser flow không nằm trong phạm vi SQL và gate chưa được bật.

Bằng chứng: [native result](../../backend/target/consolidated-mysql-f73685a7cb6e493a8a1f53a7463b2205/result.json); [Docker result](../../backend/target/edujar-consolidated-903880ab9d154395b99840ff66acd55f/result.json); [full Maven summary](../../backend/target/consolidated-mysql-8f5c178ef20f4d6999881b4679ece159/maven-summary.json); [Docker JPA + Spring Boot result](../../backend/target/edujar-consolidated-903880ab9d154395b99840ff66acd55f/result.json); [Spring Boot log](../../backend/target/edujar-consolidated-903880ab9d154395b99840ff66acd55f/spring-boot.log); [upgrade regression result](../../backend/target/course-purchase-mysql-05983d5ce23d40e79cf5a6d006786d8f/result.json).

## Docker, CI và references

Dockerfile COPY đúng hai SQL init; checker ở `/usr/local/share/edujar`, verifier ở `/usr/local/bin`. Build kiểm tra có đúng hai init files. `.dockerignore` chỉ cho phép các file image cần, loại archive/seed cũ/assets không liên quan khỏi context. Không sửa Compose, volume, my.cnf hoặc production database configuration trong lượt này.

Jenkins thêm kiểm tra generated contract và stage `Fresh MySQL Initialization`: build/test image UUID, container UUID, tmpfs datadir, JPA/backend validation trước stage push app. Test image không được push/deploy. Đã cập nhật script MySQL course/auth audit, test fixtures và các tài liệu tham chiếu sang archive/checker mới. Python verifier tests được chuyển sang stage Push Docker Hub đang tồn tại, vẫn bắt buộc backend/nginx được push và MySQL không được push khi có/không có receipt cũ. Subscription integration test tự tạo plan fixtures trong transaction rollback, không phụ thuộc seed bán hàng cũ và không thay assertion nghiệp vụ.

## Còn tồn tại / giới hạn nghiệm thu

Trạng thái migration database hiện hữu là **NOT VERIFIED** theo yêu cầu; không cần thông tin kết nối và không suy đoán đã cập nhật. Nếu còn hệ thống cần upgrade, phải giữ archive cho đến khi có migration giới hạn đã review/test trên bản sao. Chưa chạy Jenkins remote end-to-end hoặc deploy/push image. Full deployment suite còn 4 lỗi pre-existing ở các test của workflow đã bỏ; không thay pipeline triển khai/HTTPS ngoài phạm vi để làm xanh chúng. Vì vậy không tuyên bố toàn bộ test repository đều PASS.

## Cách dùng

Database mới: xem [lệnh schema.sql → data.sql và các test cô lập](../../database/README-fresh-schema.md). Database có dữ liệu: xem [quy trình upgrade riêng](../../database/README-deploy-update.md). Bắt buộc backup/restore thử, diff schema và audit dữ liệu trên bản sao, chỉ chạy phần migration còn thiếu đã review, rồi kiểm tra checksum invoice/payment/enrollment/progress và quyền mua. Không dùng hai SQL init làm upgrade; không tự chạy lại baseline cleanup hoặc thay dữ liệu thật bằng seed mới.
