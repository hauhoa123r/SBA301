# Khôi phục catalog ba khóa — 19/10/2026

Đã cập nhật database local `chinese_online_learning` tại `127.0.0.1:3306`, qua migration `deployment/legacy-sql/20261019_restore_three_courses.sql`. API backend đang chạy ở cổng 8081 xác nhận:

- Tiếng Trung tại quán cà phê: 2 bài, 30 phút, ảnh `course-cafe.svg`.
- Tiếng Trung hỏi đường và đi lại: 2 bài, 30 phút, ảnh `course-directions.svg`.
- Tiếng Trung giao tiếp cho Nhân viên Sales (Cơ bản): 6 bài, 1 giờ 25 phút, ảnh nhóm học viên gốc.

Cả ba thuộc danh mục Tiếng Trung giao tiếp, tên giảng viên hiển thị Phạm Linh Chi từ tài khoản nội dung bị khóa đăng nhập. Không sửa tài khoản người học. Hai khóa gộp chuyển sang nháp để giữ tham chiếu lịch sử; không xóa bài nhập môn, hóa đơn hoặc enrollment cũ. Bài/chương gốc giữ nguyên ID. Quyền đã mua Premium cũ được chuyển tiếp cho cả ba khóa. Gói học vẫn Free và Premium 99.000đ/30 ngày.

Đã sao lưu database trước thay đổi vào `backend/target/restore-three-courses-20261019-094423/before.sql`. Bản sao chứa dữ liệu local nên nằm trong thư mục bị Git bỏ qua. Kết quả API và checksum sau cập nhật: `after-verification.json` cùng thư mục; 51 bảng khác giữ nguyên checksum.

Trước khi áp dụng, đã chạy migration hai lần trên bản sao MySQL riêng từ chính backup này: đúng ba khóa 2/2/6 bài, giữ ID và quyền mua, không thay đổi 51 bảng khác, và kiểm tra rollback khi thiếu chương gốc. Bằng chứng tại `backend/target/consolidated-mysql-ae99d7cc418144a2a8d231c4ade204a8/result.json`.
