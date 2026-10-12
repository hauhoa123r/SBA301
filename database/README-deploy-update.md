# Cập nhật database

Baseline dùng để cập nhật database hiện hữu: **`20261012_deploy_update.sql`**. File chứa SQL trực tiếp, không dùng `SOURCE` để phụ thuộc các file migration khác. Tính năng Feedback có migration bổ sung `20261013_feedback.sql`, xem hướng dẫn bên dưới.

## Nội dung và thứ tự

1. `20260928_remove_mini_hsk_localize_data.sql`: xóa khóa demo Mini HSK đúng ID/tên/giá và Việt hóa các giá trị seed còn khớp.
2. `20260928_remove_placeholder_courses.sql`: dọn các khóa/bài/tài liệu mẫu và cập nhật mô tả khóa Sales.
3. `20260928_subscription_plans.sql`: cấu trúc gói học, subscription, quyền khóa học legacy và snapshot hóa đơn.
4. `20260928_add_reading_courses.sql`: hai khóa đọc, từ vựng, mẫu câu và quiz.
5. `20261003_admin_dashboard_indexes.sql`: index Dashboard.
6. `20261006_learning_progress.sql`: vị trí video, hoạt động theo ngày, index quiz và điều chỉnh cờ hoàn thành cũ.
7. `20261007_auth_settings.sql`: cấu hình bật/tắt xác minh email.

Phần Việt hóa chạy trước cập nhật mô tả Sales để chuyển từ dữ liệu seed không dấu trong cùng một lần chạy. Các file gốc vẫn giữ để đối chiếu; khi deploy dùng file gộp, không cần chạy chúng thêm lần nữa.

## Điều chỉnh khi gộp

- Dọn khóa placeholder yêu cầu **cả ID lẫn tên seed gốc** và không có video thực tế. Tránh xóa nhầm khóa đọc được MySQL cấp ID 2–8 hoặc khóa đã đổi tên. Bài mẫu ID 6 cũng kiểm tra tên seed.
- Gói mặc định chỉ thêm khi thiếu. Không ghi đè tên, giá, số ngày hoặc trạng thái mà Admin đã chỉnh.
- Cấu hình xác minh email đang tắt vẫn được giữ khi chạy lại.
- Kiểm tra user ID 4 (người phụ trách hai khóa đọc theo script gốc) trước mọi thao tác xóa/cập nhật lâu dài. Nếu thiếu, lỗi `chk_deploy_reading_teacher_exists` dừng file; cần điều chỉnh người phụ trách trong phần thêm khóa trước khi chạy.
- Giữ các transaction của script dữ liệu gốc. **Không phải một transaction duy nhất**: DDL MySQL tự commit, nên lỗi ở phần sau không rollback các phần đã commit trước đó.

## Deploy database đang dùng

Sao lưu database trước khi chạy: file có thao tác xóa khóa mẫu cùng dữ liệu liên quan, gồm tiến độ/giao dịch của các khóa khớp điều kiện. Dừng backend trong lúc cập nhật để tránh ghi đồng thời.

Nếu dùng Docker Compose của dự án, từ thư mục gốc:

```bash
docker compose cp ./database/20261012_deploy_update.sql mysql:/tmp/20261012_deploy_update.sql
docker compose exec mysql mysql --default-character-set=utf8mb4 -u root -p --execute="SOURCE /tmp/20261012_deploy_update.sql" chinese_online_learning
```

Nhập mật khẩu MySQL khi được hỏi. `--execute` chạy file qua `SOURCE` rồi thoát; chế độ này dừng khi có lỗi và tắt `--force`. Hành vi dừng khi kiểm tra điều kiện đầu file thất bại đã được xác nhận với MySQL client 8.0.

Với MySQL client ngoài Docker, dùng cùng tùy chọn `--default-character-set=utf8mb4` và `--execute="SOURCE đường/dẫn/20261012_deploy_update.sql"`. Với SQL editor, chọn chế độ dừng ngay khi có lỗi. **Không dùng `--force`** hoặc chế độ bỏ qua lỗi. Nếu lỗi, xem phần lỗi, sửa nguyên nhân rồi chạy lại; transaction đang mở bị rollback khi kết nối CLI đóng, nhưng các phần DDL/transaction đã commit vẫn giữ.

Cuối file có kết quả `deploy_update_complete`, số khóa đọc (dự kiến 2), số gói và trạng thái xác minh email. Chỉ coi cập nhật thành công khi toàn bộ quá trình không có lỗi. Sau đó deploy/khởi động backend và frontend mới.

Không chạy lại `chinese_online_learning.sql` hoặc `DataChinese.sql` trên database đang dùng. File schema gốc xóa/tạo lại database. Không xóa volume MySQL để cập nhật. Docker init chỉ tự chạy khi volume trống.

## Feedback (13/10/2026)

Sau baseline `20261012_deploy_update.sql`, chạy thêm **`20261013_feedback.sql`** trước khi deploy backend có feedback. Migration này tạo các bảng feedback và khóa cho một đợt công khai, không chứa dữ liệu khảo sát mẫu và giữ dữ liệu khi chạy lại.

```bash
docker compose cp ./database/20261013_feedback.sql mysql:/tmp/20261013_feedback.sql
docker compose exec mysql mysql --default-character-set=utf8mb4 -u root -p --execute="SOURCE /tmp/20261013_feedback.sql" chinese_online_learning
```

Database đã chạy baseline chỉ cần migration feedback. Chi tiết API, cách dùng, quy tắc bảo toàn dữ liệu và kết quả kiểm thử: [docs/feedback/IMPLEMENTATION.md](../docs/feedback/IMPLEMENTATION.md).

## Khởi tạo database mới

`database/Dockerfile` chạy theo thứ tự: schema → `DataChinese.sql` → `20261012_deploy_update.sql` → `20261013_feedback.sql`. File gộp thay các bước migration riêng trước đây, đồng thời dọn dữ liệu mẫu khớp điều kiện.

## Kiểm tra

Đã đạt 56 kiểm tra trên MySQL tạm: cấu trúc mới/cũ, seed demo còn sót, khởi tạo sạch có ID 2–3 được cấp cho khóa đọc, chạy lại không tạo trùng, giữ nội dung tùy chỉnh/giá gói/cài đặt email, quyền legacy và điều kiện đầu file. Cũng chạy file bằng MySQL CLI `--execute=SOURCE` và xác nhận dừng khi lỗi. Các database tạm đã xóa; không chạy file gộp lên database ứng dụng trong quá trình kiểm tra này.
