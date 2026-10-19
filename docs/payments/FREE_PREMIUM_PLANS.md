# Gói học hiện tại

Yêu cầu đã xác nhận: mục **Gói học** còn Free và Premium 99.000đ; **Khóa học** giữ riêng cà phê, hỏi đường và Sales.

- Free: 0đ, học thử 3 ngày, một lần/tài khoản.
- Premium: 99.000đ, truy cập 30 ngày; payOS và cách gia hạn hiện có.
- API danh sách gói chỉ trả Free/Premium đang hoạt động. Không tạo thanh toán Standard mới. Hóa đơn và gói Standard cũ vẫn được xử lý theo giá/thời hạn đã ghi nhận.
- Seed mới có ba khóa riêng với 10 bài gốc; các bài đọc bổ sung trong thử nghiệm gộp khóa không còn được đưa vào database mới. Các file SQL cũ được lưu trong kho lịch sử.

Với database đang chạy, áp dụng `deployment/legacy-sql/20261019_free_premium_plans.sql`. Script chỉ đổi bảng `subscription_plans`, không thay đổi dữ liệu khóa học, hóa đơn hoặc quyền học. Mã nguồn không tự chạy migration này. Database mới dùng hai file trong `database/`.

Các tài liệu `SUBSCRIPTION_RESTORED.md`, `COURSE_PURCHASE_REFACTOR.md` và `VALIDATION.md` ghi lại những trạng thái trước yêu cầu này.

Kiểm chứng ngày 19/10/2026:

- Backend: 97 test qua; 2 test MySQL được chạy tiếp cùng test seed trên MySQL 8.0.45 riêng, cả 3 đều qua. Giá gửi đến gateway là 99.000đ, thời hạn hóa đơn 30 ngày; Standard mới bị từ chối, hóa đơn Standard cũ vẫn kích hoạt/gia hạn.
- Frontend: build TypeScript/Vite thành công, 61 test qua; ESLint các file giao diện thay đổi qua.
- Seed chạy lại không đổi dữ liệu; nội dung 10 bài gốc khớp toàn bộ với nguồn trước thử nghiệm course-purchase. Migration hai gói chạy hai lần, giữ nguyên checksum của 55 bảng khác, gồm khóa học, hóa đơn và quyền học.
- Backend đóng gói và khởi động thành công với Hibernate validate, health HTTP 200/UP. Không tạo giao dịch payOS thật và không thay đổi database đang dùng.

Bằng chứng nằm trong `backend/target/two-subscription-plans/` và các thư mục `consolidated-mysql-1eb812b4d61c49459fe0a3f20d979207`, `consolidated-mysql-bb222124c82948198ffb0739eb5eaac1`, `consolidated-mysql-1389a1eeb26c4d40a6f493467cbb852d` dưới `backend/target/`. Các MySQL test riêng đã được dừng.
