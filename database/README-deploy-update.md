# Database đang có dữ liệu

Bản dashboard học tập và trang điều phối admin cần migration bổ sung `database/migrations/20261019_learning_analytics.sql` trước backend mới. Xem [hướng dẫn cấu hình và triển khai](../docs/deployment/LEARNING_ANALYTICS.md) cho Jenkins, Docker, Compose, `.env`, Spring và Nginx.

`schema.sql` và `data.sql` chỉ dùng để khởi tạo database mới. Không import chúng để nâng cấp database chứa học viên, invoice, payment, enrollment hoặc progress. Không reset database/volume. Thay image MySQL không tự chạy SQL init trên volume cũ.

Nguồn migration trước refactor được giữ nguyên nội dung trong [deployment/legacy-sql](../deployment/legacy-sql/README.md). Không còn được Docker COPY vào thư mục init. Baseline `20261012_deploy_update.sql` có DELETE và prerequisite user ID 4; không được coi đó là migration production an toàn mặc định. `oauth2_migration.sql` không re-runnable và trùng các đối tượng đã có trong schema mới.

## Kiểm tra chỉ đọc

Từ checkout hiện tại, với Docker daemon truy cập được và container `chinese-mysql` đang chạy:

```bash
sh deployment/verify-mysql-schema.sh database/tests/check-schema.sql
```

Lệnh chỉ truy vấn information_schema. Output nêu cột/constraint/enum/index còn thiếu; exit 0 chỉ chứng minh contract tương thích, không chứng minh toàn bộ migration dữ liệu đã được chạy. Không có migration ledger trong repository. Cần kiểm tra thêm dữ liệu nghiệp vụ trên bản sao/qua truy vấn chỉ đọc được review: quyền học cũ, invoice PAID, plan đã ngừng bán, cấu hình singleton và danh mục khóa học.

Trạng thái migration của database hiện hữu: **NOT VERIFIED** theo phạm vi yêu cầu. Không kết nối database đang sử dụng để xác minh trong lượt này, không cần cung cấp thông tin kết nối và không mặc định các migration đã áp dụng đầy đủ.

## Nâng cấp an toàn

1. Sao lưu nhất quán database thật, gồm schema/routines/triggers; khôi phục và kiểm tra được trên MySQL 8 riêng.
2. Chạy schema guard trên bản sao và lập diff information_schema với schema mới. Ghi lại số lượng/checksum invoice, payment, enrollment, progress, subscription và quyền mua trước thay đổi.
3. Tạo migration giới hạn đúng phần thiếu. OAuth2, learning, auth settings, feedback, refresh_sessions và course-purchase chỉ áp dụng khi cần. Tránh các bước cleanup demo và phụ thuộc user ID 4 của baseline; không đổi ID/user/quyền đã thanh toán. MySQL DDL auto-commit nên cần kế hoạch phục hồi được kiểm chứng.
4. Gói học hiện tại chỉ còn Free 3 ngày và Premium 99.000đ/30 ngày: dùng `deployment/legacy-sql/20261019_free_premium_plans.sql`; không chạy course-purchase hoặc restore ba gói cũ. Nếu catalog vẫn là hai khóa gộp, dùng `deployment/legacy-sql/20261019_restore_three_courses.sql` để đưa các chương gốc về ba khóa cà phê, hỏi đường và Sales. Script giữ ID bài/chương, hóa đơn và enrollment cũ; chuyển quyền mua Premium đã có sang ba khóa. Nếu thiếu `refresh_sessions`, vẫn cần migration xác thực riêng.
5. Chỉ triển khai migration đã review và kiểm chứng cho trạng thái database cụ thể, trước backend mới. Sau đó chạy lại guard, kiểm tra thanh toán, quyền học và resume. Không tự chạy toàn bộ archive hoặc dùng schema/data làm upgrade.

Test sentinel cho migration course-purchase vẫn được giữ và chạy trên datadir MySQL hoàn toàn mới:

```bash
python database/tests/course_purchase_mysql_regression.py
```

Nguồn archive chưa bị xóa; chỉ cân nhắc xóa sau khi mọi hệ thống cần upgrade đã có phương án đã kiểm chứng.
