# Gói học và nội dung mới — 28/09/2026

Standard: 699.000đ/30 ngày. Premium: 899.000đ/30 ngày, hiện có cùng quyền học; tính năng bổ sung sẽ cập nhật sau. Free Trial đang cấu hình 3 ngày, mỗi tài khoản một lần. Cả ba gói mở mọi khóa đã xuất bản trong thời hạn gói.

## Database đang có dữ liệu

Sao lưu trước khi chạy. Chạy bằng MySQL với UTF-8 theo thứ tự:

1. `20260928_subscription_plans.sql`
2. `20260928_add_reading_courses.sql`
3. Khởi động lại backend và frontend.

Hai script có thể chạy lại mà không tạo trùng. Không chạy `chinese_online_learning.sql` trên database đang sử dụng: file này xóa và tạo lại database.

## Khởi tạo mới

Dockerfile tự chạy schema, `DataChinese.sql` rồi `20260928_add_reading_courses.sql`. Nếu khởi tạo thủ công, chạy cùng thứ tự đó. Schema mới đã có các bảng/cột đăng ký.

## Quyền học

- Quyền mua khóa học trước lần chuyển đổi được giữ bằng `course_enrollments.legacy_access`.
- Bản ghi tiến độ mới có `legacy_access = FALSE`, nên lưu tiến độ không kéo dài quyền truy cập sau khi gói hết hạn.
- Gói trả phí bắt đầu khi payOS xác nhận. Gia hạn gói trả phí cộng 30 ngày từ ngày hết hạn nếu còn hiệu lực. Chuyển từ dùng thử sang trả phí tính 30 ngày từ lúc thanh toán.
- Hóa đơn lưu mã gói, giá và số ngày lúc mua. Callback lặp không cấp thêm ngày. Không tự động trừ tiền gia hạn.
- Chỉ API học có kiểm tra quyền mới trả video, tài liệu, bài đọc và câu hỏi. API chi tiết khóa công khai chỉ trả đề cương.

## Hai khóa bổ sung

“Tiếng Trung tại quán cà phê” và “Tiếng Trung hỏi đường và đi lại”: mỗi khóa có 2 bài đọc, 12 từ vựng, 6 mẫu câu, 6 câu hỏi có giải thích. Thời lượng 30 phút/khóa là thời gian tự học dự kiến, không phải thời lượng video.

## Kiểm thử

Chạy Maven với `-Dtest=*Test test` để chạy các bài kiểm thử đơn vị. Đặt `RUN_MYSQL_INTEGRATION_TESTS=true` để chạy thêm kiểm thử MySQL; các fixture trong các lớp `*IntegrationTest` được rollback.

Không chạy toàn bộ `mvn test` trên database đang dùng: dự án có các lớp cũ tên `BackendApplicationTests` chứa thao tác nhập lại seed.
