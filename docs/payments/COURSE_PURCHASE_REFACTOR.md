# Báo cáo chuyển đổi thanh toán và quyền học Free / Premium

> ĐỢT THAY ĐỔI NÀY ĐÃ ĐƯỢC HOÀN TÁC THEO YÊU CẦU NGƯỜI DÙNG. Luồng hiện tại bán lại Free Trial / Standard / Premium theo thời hạn. Nội dung dưới đây chỉ là lịch sử, không dùng làm hướng dẫn triển khai hiện tại. Xem [README subscriptions](../../database/README-subscriptions.md).

Ngày bàn giao: 19/10/2026. Thay đổi trực tiếp trong monolith Spring Boot + React; không thêm service hay API Gateway. Các thay đổi xác thực đang có sẵn trong workspace được giữ nguyên.

Danh sách tệp: [FILES_CHANGED.md](FILES_CHANGED.md). Kết quả pass/fail và giới hạn kiểm chứng: [VALIDATION.md](VALIDATION.md).

## 1. Trước và sau chuyển đổi

Trước đây, `SubscriptionService` mở toàn bộ khóa đã xuất bản theo ngày hết hạn. Enrollment vừa lưu tiến độ, vừa giữ cờ `legacy_access` cho các khóa mua trước khi chuyển sang subscription. Payment có hai nhánh callback: kích hoạt subscription hoặc cấp quyền mua khóa cũ.

Bản này tái sử dụng `courses`, `lessons`, `course_enrollments`, `invoices`, `payments`, payOS, webhook, API sync và các màn hình học hiện có. Không tạo bảng purchase hoặc hệ thống thanh toán thứ hai.

| Khóa mới | Giá | Nội dung/quyền học |
|---|---:|---|
| FREE | 0đ | Đúng 3 lesson đã xuất bản trong seed; người đăng nhập học miễn phí, không hết hạn |
| PREMIUM | 99.000đ | Seed 6 lesson dạng bài đọc; học thử 3 lesson đầu, mua một lần mở toàn bộ vĩnh viễn |

`courses.catalog_code` là định danh ổn định `FREE` / `PREMIUM`, có unique constraint. Logic nghiệp vụ không dùng ID khóa cố định. Catalog công khai chỉ lấy hai mã này. Khóa cũ giữ nguyên bản ghi, trạng thái, nội dung và lịch sử; chỉ không còn nằm trong catalog mới.

## 2. Database và bảo toàn quyền cũ

Migration: `deployment/legacy-sql/20261018_course_purchases.sql`, MySQL 8, chạy sau các migration hiện có và trước backend mới.

- Bổ sung `courses.catalog_code`, `lessons.published`, `course_enrollments.purchased_at`.
- Mở rộng enum trạng thái invoice/payment để lưu `EXPIRED`.
- Tận dụng unique `(user_id, course_id)` hiện có; khai báo lại tương ứng trong JPA để môi trường test cũng thực thi ràng buộc.
- Backfill quyền mua từ hóa đơn khóa học `PAID`, kể cả trường hợp callback cũ thiếu enrollment.
- Ngừng kích hoạt để bán ba plan cũ; không xóa plan, subscription, coupon, hóa đơn, payment hay tiến độ.
- Subscription đang còn hiệu lực tiếp tục cấp quyền đến thời hạn đã trả tiền. Callback cho hóa đơn subscription đã tạo trước chuyển đổi vẫn được xử lý theo dữ liệu snapshot cũ.
- Enrollment chỉ có tiến độ không tự trở thành quyền sở hữu. Khóa mua mới có `purchased_at`; quyền mua cũ có `legacy_access` vẫn vĩnh viễn.
- Seed dùng unique catalog code và thứ tự chương/bài; chạy lặp không tạo trùng. Chọn giảng viên từ dữ liệu hiện có, không hardcode ID. Nếu chưa có user, migration dừng để yêu cầu seed user trước.
- Không có `DROP TABLE`, `DELETE` khóa thật hoặc reset database trong migration mới.

Fresh install đã được cập nhật schema và Docker init chain; schema contract và bản đóng gói trong test resources được đồng bộ.

Database đã cập nhật các bản trước chỉ chạy migration mới; không chạy lại baseline cũ có thao tác dọn dữ liệu:

```bash
docker compose cp ./deployment/legacy-sql/20261018_course_purchases.sql mysql:/tmp/20261018_course_purchases.sql
docker compose exec mysql mysql --default-character-set=utf8mb4 -u root -p --execute="SOURCE /tmp/20261018_course_purchases.sql" chinese_online_learning
```

Thực hiện trong thời gian bảo trì, sao lưu và dừng phiên bản ứng dụng cũ trước khi đổi schema. Không dùng `--force`. MySQL DDL tự commit, nên lỗi ở phần sau không rollback DDL đã hoàn thành. Chưa chạy migration lên database đang sử dụng của người dùng.

## 3. API

| API | Thay đổi |
|---|---|
| `GET /api/courses` | Chỉ catalog Free/Premium |
| `GET /api/courses/{id}` | Đề cương đã lọc lesson chưa xuất bản; có `locked`, `preview`, `owned`; không trả video, tài liệu hay câu hỏi quiz |
| `POST /api/payments/create` | Body mới `{ "courseId": ... }`; không nhận `planCode` làm sản phẩm; coupon bị từ chối |
| `POST /api/payments/payos-webhook` | Giữ URL; xác minh chữ ký, orderCode, invoice/payment và số tiền; cấp quyền khóa học |
| `POST /api/payments/invoices/{invoiceId}/sync` | Giữ URL; kiểm tra chủ sở hữu; persist CANCELLED/EXPIRED; cùng khóa invoice với webhook |
| `GET /api/learning/courses/{courseId}/access` | Mới: quyền sở hữu, quyền học đầy đủ và ID ba lesson học thử |
| `POST /api/learning/courses/{courseId}/enroll` | Mới: đăng ký Free hoặc học thử Premium để lưu trong My Learning; không tạo hóa đơn |
| `GET /api/learning/courses/{courseId}/lessons/{lessonId}` | Mới: đọc từng lesson sau authorization; bài khóa trả 403, bài không thuộc khóa/chưa xuất bản trả 404 |
| `GET /api/learning/courses/{courseId}/resources/{kind}/{resourceId}` | Mới: tải học liệu riêng tư sau kiểm tra lesson/quiz và quan hệ với khóa |
| `GET /api/learning/courses/{courseId}` | Giữ URL; chỉ trả metadata của lesson bị khóa, không trả nội dung/tài nguyên/quiz/bài tập của lesson đó |
| Các API progress, playback, quiz, assignment | Giữ URL; bổ sung authorization từng lesson hoặc quiz trước xử lý |
| `GET /api/subscriptions/plans` | Không bán plan; trả `[]` để tương thích client cũ |
| `POST /api/subscriptions/trial` | Ngừng sử dụng: HTTP 410 |
| `GET /api/subscriptions/me` | Giữ để đọc quyền lịch sử |
| `/subscriptions` trên frontend | Chuyển về `/courses` |

API quản trị, kiểm tra vai trò và luồng xác thực hiện có được giữ. Chính sách hiện tại chỉ hỗ trợ đăng nhập STUDENT/ADMIN; tài khoản chỉ có INSTRUCTOR vốn chưa được hỗ trợ đăng nhập, bản này không mở thêm quyền đó. Admin vẫn sử dụng API quản trị hợp lệ và không được dùng API học dành riêng cho STUDENT.

## 4. Luồng payOS mới

1. Student chọn Premium. Backend đọc khóa PUBLISHED và kiểm tra mã PREMIUM, giá database chính xác 99.000đ.
2. Khóa user trong transaction; từ chối người đã sở hữu vĩnh viễn. Nếu có checkout PENDING của khóa này, tái sử dụng thay vì tạo thêm.
3. Tạo invoice liên kết trực tiếp course; số tiền VND nguyên, không coupon và không thời hạn subscription.
4. Gọi payOS qua HTTPS, ký HMAC-SHA256. HTTP client có timeout. Credentials tiếp tục lấy từ cấu hình/environment.
5. Lưu payment CREATED và checkout để khôi phục khi người dùng thử lại; frontend hiển thị tên khóa, số tiền, QR và thông tin chuyển khoản.
6. Webhook được kiểm tra chữ ký bằng so sánh constant-time. Tìm payment theo provider/orderCode, khóa invoice, refresh dữ liệu và đối chiếu số tiền của invoice/payment.
7. Trong cùng transaction, chuyển payment SUCCESS, invoice PAID và insert/update quyền khóa học. Unique enrollment, cập nhật thời điểm mua bằng COALESCE và bỏ qua invoice đã PAID ngăn cấp trùng.
8. Sync gọi payOS từ backend, kiểm tra orderCode và tiền, dùng cùng cơ chế khóa/cấp quyền với webhook. Trạng thái hủy/hết hạn được lưu cả hai bảng.
9. Frontend chỉ báo thành công khi backend trả `paid=true`, phát sự kiện làm mới quyền học và đưa người dùng về khóa học. Có trạng thái chờ, timeout, thất bại, hủy và hết hạn.

Các request `price`, `isPaid`, `isPreview` do client tự thêm không được dùng để tính tiền hay quyết định quyền. Free Course không gọi payOS. Việc đăng ký học thử chỉ tạo enrollment tiến độ, không cấp quyền vĩnh viễn Premium.

## 5. Authorization lesson và học liệu

`CourseAccessService` là nơi quyết định quyền. Ba lesson đầu được lấy từ lesson PUBLISHED, sắp theo thứ tự chương, ID chương, thứ tự lesson, ID lesson trên backend. Ẩn lesson sẽ loại nó khỏi cả đề cương lẫn danh sách xét học thử.

- Chưa đăng nhập không nhận nội dung học; Spring Security vẫn bảo vệ API.
- Student học Free và ba lesson đầu Premium; từ lesson thứ tư cần quyền mua hoặc subscription lịch sử còn hạn.
- Kiểm tra lesson thuộc đúng course trước cấp nội dung, ghi tiến độ, playback và nộp bài tập.
- Quiz gắn lesson theo quyền lesson; quiz cấp chương/khóa yêu cầu quyền đầy đủ để không lộ nội dung phần trả phí qua quiz tổng hợp.
- Bulk response loại nội dung, video, tài liệu, từ vựng, mẫu câu, quiz và bài tập của lesson bị khóa.
- Kết quả quiz và bài nộp trong progress cũng được lọc lại theo quyền hiện tại để không lộ giải thích/đáp án qua API gián tiếp.

Tệp mới có thể lưu bằng URI `private:relative/path.mp4` hoặc `private:relative/document.pdf` trong các cột URL hiện có. Backend đọc dưới `LEARNING_PRIVATE_MEDIA_ROOT`, kiểm tra đường dẫn thật nằm trong root và từ chối traversal/symlink thoát root. Không fetch URL do client gửi, không redirect tới URL công khai. Response có `no-store`, `nosniff`, CSP sandbox và không tiết lộ đường dẫn lưu trữ.

Compose mount `LEARNING_PRIVATE_MEDIA_DIR` vào `/var/lib/edujar-media` ở chế độ read-only. Không mount thư mục này vào Nginx hoặc `frontend/public`. React tải học liệu riêng tư bằng axios có bearer token, dùng blob URL và thu hồi khi rời nội dung.

**Giới hạn storage:** phần trả phí của Premium không xuất URL Cloudinary/static công khai. Học liệu công khai gắn vào các bài này sẽ không được trả cho đến khi chuyển vào kho riêng tư. Những URL Cloudinary công khai đã tồn tại bên ngoài ứng dụng cần chủ tài khoản storage chuyển quyền truy cập/xóa bản công khai; sửa backend không thể thu hồi URL trên dịch vụ bên ngoài. Seed mới là bài đọc, không sao chép các video công khai cũ làm nội dung trả phí.

## 6. Frontend

Giữ design system, cập nhật catalog, giá và CTA. Đề cương và sidebar có nhãn học thử/biểu tượng khóa. Lesson Player hiển thị lời mời mua khi khóa, không dựng nội dung lesson chưa được backend cấp. Người sở hữu không có CTA thanh toán lại. My Learning hiển thị enrollment đã đăng ký/mua và tiếp tục lưu tiến độ. Lịch sử hóa đơn vẫn hiển thị cả giao dịch course lẫn subscription cũ.

## 7. Kiểm thử và bằng chứng

Các lệnh đã dùng:

```powershell
cd backend
mvn -o "-Dmaven.repo.local=D:/SBA301/.deployment-check/m2" "-Dtest=*Test,*IntegrationTest" test
cd ../frontend
npm.cmd run lint
npm.cmd run build
npm.cmd test
cd ..
python database/tests/course_purchase_mysql_regression.py
python database/generate-schema-check.py --check
docker compose --env-file .env.example config --no-interpolate --quiet
```

Chi tiết kết quả cuối được ghi trong `VALIDATION.md` cùng thư mục. Không chạy lớp nhập lại seed `BackendApplicationTests` trên database đang dùng.

`CoursePurchaseIntegrationTest` kiểm tra qua MockMvc với filter chain, service, transaction và H2 thật; chỉ mock network payOS, còn xác minh chữ ký HMAC chạy thật. Bao phủ Free, thứ tự preview, bài 4 bị khóa, gọi API trực tiếp, tráo ID, bài ẩn, PENDING, đúng/sai tiền, webhook giả/lặp, quyền vĩnh viễn, chống mua lại, tái sử dụng checkout, CANCELLED/EXPIRED, invoice người khác, chống lộ nội dung, học liệu riêng tư, quiz/bài tập, tương thích quyền cũ, phân quyền quản trị và webhook/sync đồng thời. Có thêm kiểm thử lưu/đọc tiến độ Free.

Các nhóm payment unit test cũ vẫn được chạy đầy đủ: nhóm tạo thanh toán đổi từ bán plan sang course; các assertion callback subscription cũ được giữ để kiểm tra tương thích, chỉ bổ sung số tiền hợp lệ trong fixture theo yêu cầu xác minh mới. `LearningResourceServiceTest` kiểm tra tải tệp thật trong thư mục test, chống traversal, từ chối truy cập và không lộ URL công khai.

Regression MySQL khởi tạo một mysqld riêng với datadir mới dưới `backend/target`, kiểm tra `@@datadir` trước khi import. Chạy migration hai lần, so sánh dữ liệu lịch sử, kiểm tra backfill, hai khóa/giá/số lesson, enum và schema contract, sau đó tắt instance riêng. Không dùng database sản xuất.

## 8. Kiểm thử thủ công trước triển khai

1. Trên database thử nghiệm đã migration, đăng ký/xác minh email nếu cấu hình yêu cầu; đăng nhập Student mới.
2. Xem `/courses`: chỉ Free và Premium; không thấy các plan theo tháng. Khách chưa đăng nhập chỉ xem đề cương.
3. Vào Free, bấm Vào học; đọc đủ ba lesson, đánh dấu hoàn thành và tải lại trang để kiểm tra tiến độ.
4. Vào Premium, học thử ba lesson đầu; bài 4 hiện khóa và nút mua 99.000đ. Kiểm tra network response không có nội dung bài khóa.
5. Dùng token Student gọi trực tiếp API lesson 4, progress/playback, quiz, assignment và resource tương ứng: bị từ chối. Thử thay courseId bằng Free: không vượt quyền.
6. Bấm mua: request chỉ có courseId. Checkout hiện đúng tên khóa và 99.000đ. Khi chưa trả tiền, quyền vẫn chưa mở.
7. Thanh toán bằng tài khoản payOS đã cấu hình, kiểm tra webhook công khai. Sau PAID, quay về khóa và đọc bài 4; tải lại trang vẫn mở. Tài khoản đã mua không được tạo payment mới.
8. Thử hủy/hết hạn trên tài khoản thử nghiệm: kiểm tra UI và cả bảng invoice/payment. Kiểm tra invoice của tài khoản khác trả 403.
9. Replay webhook hợp lệ, rồi chạy sync: vẫn một enrollment và cùng thời điểm mua. Webhook sai chữ ký/sai tiền không mở quyền.
10. Kiểm tra tài khoản mua khóa cũ và subscription còn hạn; kiểm tra Admin vẫn quản trị như trước. Với subscription hết hạn, chỉ quyền mua vĩnh viễn được giữ.
11. Với video/tài liệu trả phí, đặt tệp trong root riêng tư và lưu URI `private:`; kiểm tra phát/tải có token, từ chối khi thiếu quyền và không truy cập được bằng static URL.

## 9. Những việc chưa xác minh trên production

- Chưa phát sinh giao dịch ngân hàng/payOS thật; cần đủ PAYOS_CLIENT_ID, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY, return URL và webhook HTTPS để kiểm tra thực tế.
- Chưa triển khai hoặc migration lên database đang sử dụng.
- Chưa xác minh giao diện bằng Chrome trong môi trường này do Chrome/CDP đóng kết nối hoặc timeout trước khi mở trang; không coi build/lint là kiểm thử trực quan.
- Private media hiện tải thành blob trên trình duyệt, phù hợp file vừa/nhỏ; video lớn cần bổ sung streaming có authorization trước khi mở rộng vận hành.
- Không tự thêm chức năng hoàn tiền hay job đối soát; vẫn sử dụng webhook và sync hiện có.
- Có lỗi regression Jenkins có sẵn trong nhóm Python ngoài nghiệp vụ này; xem `VALIDATION.md`. Không sửa Jenkins để làm xanh bài kiểm thử thanh toán.
