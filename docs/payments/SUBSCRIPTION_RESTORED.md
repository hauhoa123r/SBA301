> Superseded by [FREE_PREMIUM_PLANS.md](FREE_PREMIUM_PLANS.md): Free 3 days and Premium 99,000 VND / 30 days, with three separate courses. The following is historical.

# Đã khôi phục luồng thanh toán subscription — 19/10/2026

Đã hoàn tác đợt chuyển sang Free/Premium 99.000đ trong backend, frontend và các kiểm thử nghiệp vụ. Tạo payment lại nhận `planCode`; trang `/subscriptions`, luồng học thử, mua/gia hạn và quyền học theo thời hạn được khôi phục. Toàn bộ 17 kiểm thử payment ban đầu đã chạy lại và đạt.

Các gói đang bán trở lại:

- Free Trial: miễn phí 3 ngày, mỗi tài khoản một lần.
- Standard: 699.000đ / 30 ngày.
- Premium: 899.000đ / 30 ngày; quyền học hiện giống Standard.

Không còn API/UI mua khóa Premium 99.000đ, preview theo ba lesson, resource controller riêng hay CTA mua vĩnh viễn mới. Quyền mua khóa lịch sử theo `legacy_access` vẫn được giữ như trước đợt refactor.

Đã giữ các thay đổi xác thực và công việc hợp nhất SQL có trước/yêu cầu khác: kiểm tra SHA-256 xác nhận 14 tệp xác thực/hạ tầng trọng yếu không đổi so với trước hoàn tác. Cách tổ chức `database/schema.sql` + `data.sql`, nội dung hợp nhất và nguồn SQL archive được giữ; seed bổ sung lại ba plan. Các cột mở rộng trong schema và enum EXPIRED được giữ để không làm mất hoặc không đọc được dữ liệu đã phát sinh. Không reset, xóa hoặc chạy migration trên database đang sử dụng.

Nếu `20261018_course_purchases.sql` từng được áp dụng và tắt plan, file `deployment/legacy-sql/20261019_restore_subscription_sales.sql` bật lại ba gói và thêm gói còn thiếu. File không ghi đè giá/thời hạn đã chỉnh và không xóa hóa đơn/giao dịch. Chưa tự chạy file này trên database đang sử dụng. Không chạy lại schema/data để sửa database hiện hữu.

Lỗi thiếu `refresh_sessions` thuộc thay đổi xác thực riêng, không được sửa bằng hoàn tác payment. Migration tương ứng vẫn nằm ở `deployment/legacy-sql/20261018_refresh_sessions.sql`.

Kết quả kiểm tra sau khôi phục:

- Backend: phát hiện 254 bài; **223 đạt**, 0 thất bại, 31 bài có điều kiện môi trường bị skip.
- Payment: **17/17 đạt**; CourseAccessService và JPA schema contract đạt.
- Frontend: production build/TypeScript đạt; **61/61 Vitest đạt**.
- MySQL 8 riêng: schema/seed hợp nhất chạy thành công; 3 plan đang bán; seed chạy lại không thay dữ liệu.
- Script bật lại plan chạy hai lần trên MySQL riêng: đạt; giữ giá plan tùy chỉnh và checksum invoice/payment/enrollment/subscription không đổi. Bằng chứng: `backend/target/consolidated-mysql-e7ec1004d150428ea2b44937323e3dd7/subscription-restore-result.json`.
- Schema guard generator `--check` và Compose YAML parse đạt.
- Không thực hiện thanh toán thật hoặc triển khai lên production.

Log backend: `backend/target/subscription-payment-rollback/backend-tests.log`.
Kết quả fresh MySQL: `backend/target/consolidated-mysql-64e75f6b3b12422fba160dd88fc56183/result.json`.

Bản sao trước hoàn tác: `backend/target/subscription-payment-rollback/before-rollback.zip`. Danh sách tệp đã khôi phục và hash tệp được giữ nằm cùng thư mục. Bản sao chứa trạng thái source trước hoàn tác, không phải bản sao database.
