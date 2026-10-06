# Quản lý học viên và gói học

Admin truy cập `/admin/students` và `/admin/subscription-plans` từ Dashboard. Chỉ ADMIN được gọi API quản trị. Danh sách học viên chỉ gồm tài khoản có STUDENT và không có ADMIN; tài khoản Admin được bảo vệ khỏi các thao tác này.

## Chức năng

- Tìm theo tên/email, lọc trạng thái tài khoản và gói, phân trang 20 học viên.
- Xem email, ngày đăng ký, gói hiện tại, ngày bắt đầu/hết hạn, các khóa đã tham gia/hoàn thành và 50 thay đổi quản trị gần nhất.
- Khóa tài khoản ACTIVE thành DISABLE và mở lại tài khoản DISABLE thành ACTIVE. Không bỏ qua xác minh email hoặc mở tài khoản BANNED/DELETED qua màn hình này. JWT được kiểm tra trạng thái mỗi yêu cầu; phiên OAuth được kiểm tra lại và vô hiệu khi khóa. Liên kết xác minh email cũ không thể mở lại tài khoản bị Admin khóa.
- Cấp/gia hạn gói trả phí với số ngày 1–3650. EXTEND cộng vào ngày hết hạn của gói trả phí còn hiệu lực; nếu chưa có gói, hết hạn hoặc đang học thử thì tính từ hiện tại. REPLACE thay thế quyền gói hiện tại và tính từ hiện tại. Gói đã ngừng cung cấp và FREE_TRIAL không được cấp thủ công.
- Thu hồi kết thúc hiệu lực gói ngay, giữ bản ghi subscription để không mở lại quyền học thử. Bài học, quiz, bài nộp và tiến độ không bị xóa. Quyền mua khóa riêng legacy vẫn giữ; thu hồi gói không hoàn tiền. Khi khóa tài khoản, thời gian gói vẫn tiếp tục tính.
- Tạo gói có mã chữ hoa/số/gạch dưới, tên, giá VND nguyên, số ngày và trạng thái. Mã không đổi sau tạo; không xóa gói đã tham chiếu. Gói FREE_TRIAL có giá 0; gói trả phí có giá dương. Ngừng cung cấp chỉ ngừng mua/cấp mới. Subscription và snapshot hóa đơn đã tạo không bị sửa theo giá/thời hạn mới.
- Mỗi thay đổi cần lý do, được ghi trong `audit_logs` cùng Admin thực hiện, giá trị trước/sau, IP và user agent. Ghi lịch sử trong cùng transaction với thay đổi quyền. Cấp thủ công không tạo hóa đơn/doanh thu.

Thao tác quyền khóa cùng hàng user mà thanh toán và học thử sử dụng, sau đó khóa subscription. Ngày hết hạn bị giới hạn trước năm 2038 theo cột TIMESTAMP MySQL hiện có. Thời gian trả về khớp các trường Instant của Hibernate; giao diện hiển thị giờ Việt Nam.

## API

| Method | Path | Chức năng |
| --- | --- | --- |
| GET | `/api/admin/students?search=&status=&subscription=&page=0` | Tìm/lọc học viên; subscription NONE/ACTIVE/EXPIRED/SCHEDULED |
| GET | `/api/admin/students/{id}` | Chi tiết, khóa tham gia, lịch sử |
| PATCH | `/api/admin/students/{id}/status` | `{ "status": "DISABLE", "reason": "Lý do" }`; mở lại dùng ACTIVE |
| POST | `/api/admin/students/{id}/subscription/grant` | `{ "planCode": "STANDARD", "days": 30, "mode": "EXTEND", "reason": "Lý do" }` |
| POST | `/api/admin/students/{id}/subscription/revoke` | `{ "reason": "Lý do" }` |
| GET | `/api/admin/subscription-plans` | Tất cả gói, kể cả ngừng cung cấp |
| POST | `/api/admin/subscription-plans` | `{ "code": "QUARTERLY", "name": "Gói 90 ngày", "price": 1500000, "durationDays": 90, "active": true, "reason": "Lý do" }` |
| PUT | `/api/admin/subscription-plans/{code}` | Body như tạo, code giữ nguyên |

Các response có `Cache-Control: no-store`. Không trả password, token hoặc thông tin xác thực. Lịch sử trên trang học viên là thay đổi quyền của Admin; không thay thế lịch sử thanh toán tại hồ sơ học viên.

## Triển khai và kiểm thử

Không cần migration mới cho tính năng này: dùng `users`, `user_roles`, `subscription_plans`, `user_subscriptions`, `course_enrollments` và `audit_logs` có sẵn. Database cũ vẫn cần các migration subscription và learning đã ghi ở tài liệu trước. Restart backend và build/chạy lại frontend để sử dụng route mới.

Kiểm thử chính: `StudentManagementIntegrationTest` dùng MySQL với fixture rollback; kiểm tra cấp/gia hạn/thay thế/thu hồi, bảo vệ Admin, lọc/pagination, thời hạn gần hết, giữ tiến độ/quyền legacy, ngừng bán và snapshot thanh toán. `StudentManagementSecurityTest` kiểm tra phân quyền và dữ liệu đầu vào. `JwtAuthenticationFilterTest` và `EmailVerificationAccountStatusTest` kiểm tra tài khoản bị khóa không dùng phiên hoặc email token cũ để truy cập.

Chạy backend bằng `mvn "-Dtest=StudentManagement*Test,JwtAuthenticationFilterTest,EmailVerificationAccountStatusTest" test`. MySQL integration cần DB_URL/DB_USERNAME/DB_PASSWORD và RUN_MYSQL_INTEGRATION_TESTS=true. Khi `.env` local dùng MYSQL_USER/MYSQL_PASSWORD, nạp chúng vào hai biến DB tương ứng cho test. Không chạy test seed `BackendApplicationTests`.

Kiểm tra thủ công: đăng nhập ADMIN, tìm học viên, cấp gói rồi kiểm tra tài khoản STUDENT vào học; khóa rồi gửi lại API bằng token cũ; mở khóa; gia hạn; thu hồi rồi kiểm tra mất quyền theo gói nhưng tiến độ còn. Tạo gói, xác nhận xuất hiện ở trang đăng ký, ngừng cung cấp và xác nhận gói biến mất khỏi danh sách bán. Thanh toán PayOS thực tế và toàn bộ tương tác browser chưa được xác nhận qua các kiểm thử API này.

Kết quả xác nhận: 60 kiểm thử backend được chọn đạt, không bỏ qua, gồm 8 MySQL integration cho quản trị mới và hồi quy subscription/thanh toán/học/phân quyền. 36 kiểm thử frontend hiện có đạt; lint, TypeScript và production build đạt. Các màn hình quản trị được tải theo route riêng.
