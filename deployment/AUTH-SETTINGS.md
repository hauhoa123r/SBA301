# Bật/tắt xác minh email đăng ký

Admin vào **Cài đặt đăng ký** (`/admin/auth-settings`), bật/tắt **Yêu cầu học viên xác minh email**, nhập lý do và lưu. Cài đặt lưu trong database và giữ sau khi restart; mỗi thay đổi được ghi vào `audit_logs` cùng Admin thực hiện và giá trị trước/sau.

- **Bật:** đăng ký tạo tài khoản PENDING và gửi email xác minh như trước.
- **Tắt:** đăng ký tạo tài khoản ACTIVE, không tạo token/gửi email xác minh. Thông báo đăng ký hướng dẫn đăng nhập ngay.
- Học viên STUDENT đang PENDING được kích hoạt khi đăng nhập đúng mật khẩu trong lúc tùy chọn tắt. Không kích hoạt hàng loạt, không mở tài khoản DISABLE/LOCKED/BANNED/SUSPENDED/DELETED/INACTIVE hoặc tài khoản có vai trò ADMIN.
- Bật lại chỉ áp dụng cho tài khoản còn PENDING và đăng ký mới; tài khoản đã ACTIVE tiếp tục dùng được.
- Email quên/đặt lại mật khẩu vẫn được gửi. OAuth giữ hành vi hiện tại. Tùy chọn này không phải công tắc tắt toàn bộ email.
- Khi tắt, hệ thống không xác nhận người đăng ký sở hữu địa chỉ email đó. Admin có thể bật lại tại cùng màn hình.

## Database và triển khai

Chạy `database/20261007_auth_settings.sql` **trước khi restart backend mới**. Migration tạo bảng `authentication_settings` và dòng cấu hình duy nhất; mặc định giữ xác minh email **bật**. Chạy lại migration không ghi đè lựa chọn Admin đã lưu.

Migration đã chạy trên MySQL local. Database Docker mới chạy script ở bước init 06; với volume hiện hữu cần chạy migration thủ công, không xóa volume. Build/chạy lại frontend để xuất hiện trang và thông báo đăng ký mới.

Đăng ký giữ khóa đọc cấu hình trong transaction để thao tác bật/tắt của Admin được tuần tự với đăng ký đang xử lý. Kích hoạt học viên PENDING dùng update có điều kiện để không bỏ qua khóa tài khoản đồng thời.

## API

- `GET /api/admin/auth-settings`: `{ "emailVerificationEnabled": true }`, chỉ ADMIN, `Cache-Control: no-store`.
- `PUT /api/admin/auth-settings`: `{ "emailVerificationEnabled": false, "reason": "Tạm dừng email xác minh đăng ký" }`, chỉ ADMIN, lý do bắt buộc.
- `POST /api/auth/register` giữ các trường response cũ và thêm `emailVerificationRequired`. Frontend dùng giá trị server để hiển thị hướng dẫn sau đăng ký.

## Kiểm thử

`AuthenticationSettingsIntegrationTest` dùng MySQL và rollback fixture: lưu cài đặt, đăng ký bật/tắt, kiểm tra không gọi dịch vụ email khi tắt, đăng nhập tài khoản PENDING bằng mật khẩu đúng/sai, bảo vệ tài khoản bị khóa và Admin, bật lại giữ tài khoản đã ACTIVE. `AuthenticationSettingsSecurityTest` kiểm tra 401/403, kiểm tra body và Admin thực hiện.

Kiểm thử dùng mock dịch vụ email, không gửi email thật. Chạy cùng hồi quy `AuthServiceImplTest`, `RegisterConverterTest`, `EmailVerificationAccountStatusTest`, `JwtAuthenticationFilterTest`, `StudentManagement*Test`. MySQL cần DB_URL/DB_USERNAME/DB_PASSWORD và RUN_MYSQL_INTEGRATION_TESTS=true. Không chạy `BackendApplicationTests` có thao tác nhập seed.

Kiểm tra browser thủ công: Admin tắt và lưu; đăng ký tài khoản mới, xác nhận hướng dẫn đăng nhập ngay và đăng nhập được; bật lại, xác nhận đăng ký mới yêu cầu email. Thao tác browser và SMTP thực tế chưa được xác nhận bằng kiểm thử API này.

Kết quả trên workspace: 32 kiểm thử backend được chọn đạt, không bỏ qua; 36 kiểm thử frontend đạt; lint, TypeScript và production build đạt. Migration đã áp dụng MySQL local. Không gửi email thật trong kiểm thử.
