# Khởi tạo MySQL mới

Từ 19/10/2026, Docker chỉ chạy hai SQL theo thứ tự:

1. `schema.sql` → `/docker-entrypoint-initdb.d/01-schema.sql`: cấu trúc cuối cùng, không DROP, INSERT hay ALTER lịch sử.
2. `data.sql` → `/docker-entrypoint-initdb.d/02-data.sql`: seed sạch, không chứa học viên/giao dịch/token mẫu.

MySQL 8, InnoDB, utf8mb4_unicode_ci. Mọi khóa và index nằm trong CREATE TABLE; FK được tạo theo thứ tự phụ thuộc, không tắt kiểm tra FK. Schema guard kiểm tra cấu trúc tương ứng với source code hiện tại.

Gói học chỉ còn Free miễn phí 3 ngày và Premium 99.000đ/30 ngày. Quyền học dựa trên gói còn hiệu lực hoặc quyền mua khóa cũ. Ba khóa Sales, cà phê và hỏi đường được giữ riêng: 5 chương, 10 bài gốc (6/2/2), 116 từ vựng, 36 mẫu câu, 10 quiz, 99 câu hỏi và 393 đáp án. Các cột catalog/published/purchased_at được giữ để tương thích schema/dữ liệu đã tồn tại.

4 role, 14 permission, 28 role-permission, 6 category, 8 tag, 4 badge được giữ. Chỉ có một content owner `catalog-instructor@seed.invalid`, trạng thái LOCKED, password_hash không hợp lệ để đăng nhập. Mọi FK dùng biến lấy ID theo khóa tự nhiên; không phụ thuộc user production. Không tạo admin đăng nhập được. Seed bổ sung hai subscription plan; không seed invoice, payment, enrollment hoặc lịch sử học.

## Khởi tạo thủ công

Chỉ chạy trên MySQL instance/database mới được dành riêng cho việc khởi tạo. Client dừng khi lỗi, không dùng `--force`:

```bash
mysql --default-character-set=utf8mb4 -h NEW_MYSQL_HOST -u root -p --execute="SOURCE database/schema.sql"
mysql --default-character-set=utf8mb4 -h NEW_MYSQL_HOST -u root -p --execute="SOURCE database/data.sql"
```

`data.sql` chạy lại không tạo bản ghi trùng và không ghi đè nội dung đã sửa; điều này không biến nó thành migration cho production. `schema.sql` sẽ dừng ở bảng đã tồn tại. Docker entrypoint chỉ tự chạy khi data directory chưa khởi tạo. Image mới không nâng cấp volume cũ. Không cần thay Compose, MYSQL_IMAGE_TAG hay volume hiện hữu để refactor nguồn SQL.

## Kiểm chứng riêng biệt

```bash
python database/generate-schema-check.py --check
python database/tests/fresh_initialization.py --compare-legacy
python database/tests/fresh_initialization.py --compare-legacy --backend
python database/tests/fresh_initialization.py --docker
```

Native Windows: MySQL 8 bin được lấy từ MYSQL_BIN hoặc đường dẫn cài đặt mặc định; Java 17 và Maven. Có thể đặt MAVEN_TEST_CACHE cho cache offline. Backend tests chỉ dùng cổng test 33087 sau khi xác nhận cổng chưa có process và datadir thực tế đúng thư mục UUID mới. Docker test dùng image/container UUID, tmpfs cho datadir, cổng loopback riêng; không dùng named volume và không truy cập database cũ. Artifacts nằm trong `backend/target`. Test tự dừng process/container do chính nó tạo; không xóa datadir native để còn bằng chứng.

Jenkins cần Python 3, Docker, Java 17 và Maven; thêm bước build/init/seed/JPA/backend trên container riêng trước khi build/push app. MySQL image test không được push hoặc deploy. Refresh-session concurrency test dùng guard datadir native nên chỉ chạy ở native mode; Docker backend run vẫn chạy schema/JPA và các integration tests khác. Browser tests có gate riêng. Chi tiết kết quả và các lỗi deployment test sẵn có nằm trong báo cáo kiểm chứng.

`tests/check-schema.sql` là SQL SELECT chỉ đọc, không phải SQL init. Nó được sinh từ hai contract TSV, kiểm tra mapping, khóa, giá trị enum và index quan trọng. Docker cài nó ngoài init ở `/usr/local/share/edujar/check-schema.sql`. Verifier `verify-schema.sh` giữ subshell để không làm thay đổi shell state của entrypoint/caller.

Nguồn SQL lịch sử được bảo toàn ở [database/legacy](legacy/README.md), bị loại khỏi Docker build context. Không xóa nguồn upgrade khi chưa kiểm chứng migration trên bản sao database thật. Xem [hướng dẫn nâng cấp](README-deploy-update.md).
