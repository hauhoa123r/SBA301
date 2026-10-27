# Gói học Free và Premium

Mục Gói học chỉ còn Free miễn phí 3 ngày và Premium 99.000đ/30 ngày. Gói còn hiệu lực mở toàn bộ khóa đã xuất bản. Cà phê, hỏi đường và Sales vẫn là ba khóa riêng, lần lượt 2, 2 và 6 bài học. Standard ngừng bán; hóa đơn và quyền học cũ vẫn được giữ.

Học thử mỗi tài khoản một lần. Mua gói trả phí bắt đầu khi payOS xác nhận; gia hạn cộng thời gian vào gói trả phí còn hiệu lực. Không tự động trừ tiền. Quyền mua khóa cũ theo `legacy_access` vẫn được giữ; lưu tiến độ không tự cấp quyền vĩnh viễn.

Database mới dùng `schema.sql` rồi `data.sql`. Database đang sử dụng chỉ chạy [20261019_free_premium_plans.sql](../database/legacy/20261019_free_premium_plans.sql), rồi khởi động lại ứng dụng để nhận mã mới. Script cập nhật Free/Premium và tắt Standard; không gộp, xóa hoặc chuyển bài học. Không import lại schema/seed lên database đang sử dụng. Không chạy migration course-purchase hoặc restore ba gói cũ. Giá thanh toán lấy từ database, vì vậy database cũ cần migration để áp dụng giá 99.000đ.

Regression test subscription sở hữu fixture plan riêng trong transaction rollback, độc lập với seed bán hàng mới. Chạy bộ kiểm chứng database riêng theo README-fresh-schema.md.
