# Feedback: triển khai và vận hành

Đã tích hợp vào React/TypeScript + Spring Boot 3.5/JPA + MySQL 8 của dự án. Frontend dùng router, JWT/refresh token, axios client và giao diện quản trị hiện có. Backend giữ cơ chế xác thực, phân quyền và xử lý lỗi hiện có; không thêm dependency hay dịch vụ ngoài.

## Luồng sử dụng

1. Admin mở **Feedback** trong thanh điều hướng hoặc `/admin/feedback`.
2. Tạo đợt, nhập tiêu đề/mô tả, thêm câu hỏi và phương án. Các nút ↑/↓ sắp xếp câu hỏi/phương án; có nhân bản câu hỏi và xem trước tương tác.
3. Lưu nháp rồi xuất bản. Có thể đặt thời gian bắt đầu/kết thúc và chọn gửi một lần hoặc nhiều lần.
4. Trang chủ hiển thị banner khi đợt đang nhận phản hồi. Nút **Tham gia khảo sát** mở trực tiếp `/feedback`. Khách đăng nhập rồi trở lại biểu mẫu.
5. Học viên gửi phản hồi; với đợt một lần, lần truy cập sau hiển thị **Bạn đã hoàn thành khảo sát**.
6. Admin mở `/admin/feedback/statistics`; mặc định chọn đợt đang nhận phản hồi, nếu không có thì chọn đợt gần nhất. Danh sách chọn và phân trang lịch sử nằm trong khu vực admin.

Trang và API dành cho người dùng chỉ lấy đợt hiện hành. Lịch sử, thống kê và câu trả lời văn bản được bảo vệ bằng quyền ADMIN ở cả filter và method security.

## Database và quy tắc nhất quán

Migration bổ sung: `database/20261013_feedback.sql`. Tám bảng:

| Bảng | Mục đích |
| --- | --- |
| `feedback_forms` | Đợt, trạng thái, thời gian, số lần gửi, phiên bản |
| `feedback_questions` | Câu hỏi theo thứ tự, loại và giới hạn validation |
| `feedback_options` | Phương án / nhãn Likert theo thứ tự |
| `feedback_submissions` | Lượt gửi và tài khoản lấy từ phiên xác thực |
| `feedback_answers` | Văn bản hoặc giá trị số theo từng câu hỏi |
| `feedback_answer_options` | Từng phương án đã chọn; lưu chọn nhiều bằng quan hệ, không nối chuỗi |
| `feedback_visits` | Người đã mở biểu mẫu sau khi đăng nhập |
| `feedback_publication_lock` | Một hàng khóa để tuần tự hóa xuất bản trên nhiều backend instance |

- `UNIQUE(active_slot)` và CHECK trạng thái/slot bảo đảm chỉ một hàng PUBLISHED mang slot `1`. Các trạng thái khác mang NULL.
- Đợt đã đặt lịch cũng giữ slot xuất bản. Admin phải tạm dừng hoặc đóng đợt này trước khi xuất bản đợt khác.
- Đợt hết giờ kết thúc ngừng nhận ngay. Khi xuất bản đợt mới, backend đóng đợt hết hạn và giải phóng slot trong cùng transaction.
- Khóa bi quan trên hàng biểu mẫu tuần tự hóa gửi, bắt đầu, sửa và thay đổi trạng thái. Xuất bản còn lấy khóa singleton trước khóa biểu mẫu.
- `UNIQUE(form_id, single_user_id)` chống gửi trùng tại database. Đợt nhiều lần lưu `single_user_id = NULL`; đợt một lần lưu ID của chính người gửi.
- Submission, answers, phương án đã chọn và visit được lưu trong cùng transaction. Validation hoàn tất trước khi ghi lượt gửi.
- Mỗi request ghi phải kèm `revision`. Form đã thay đổi, tạm dừng, hết hạn hoặc đã gửi một lần trả lỗi 409.
- Có thể sửa cấu trúc khi DRAFT/PAUSED và chưa có submission. Sau submission đầu tiên, cấu trúc câu hỏi/phương án/thứ tự và `onePerUser` được khóa. Khi tạm dừng vẫn sửa được tiêu đề, mô tả và lịch; câu trả lời cũ giữ nguyên.
- CLOSED là trạng thái kết thúc. Tạo đợt mới cho khảo sát tiếp theo; thao tác này không xóa dữ liệu lịch sử.

## Loại câu hỏi và validation

Hỗ trợ `SHORT_TEXT`, `LONG_TEXT`, `NUMBER`, `SINGLE_CHOICE`, `MULTIPLE_CHOICE`, `DROPDOWN`, `LIKERT`, `RATING`, `YES_NO`.

Mọi loại có tiêu đề, mô tả, thứ tự và cờ bắt buộc. Validation thực hiện ở frontend để phản hồi sớm và backend để bảo vệ dữ liệu:

- Văn bản: trim, tối đa 255 ký tự ngắn / 10.000 ký tự dài; admin đặt giới hạn thấp hơn.
- Số: cận nhỏ/lớn tùy chọn; tối đa 14 chữ số phần nguyên và 4 chữ số thập phân theo DECIMAL(18,4).
- Chọn một/dropdown/có-không: đúng một ID thuộc câu hỏi đó. Có-không có hai nhãn tùy chỉnh.
- Chọn nhiều: ID thuộc câu hỏi, không trùng, giới hạn số phương án tối thiểu/tối đa tùy chọn.
- Likert: số nguyên 1–5, đủ năm nhãn tùy chỉnh.
- Rating: cận nguyên cấu hình trong 0–20, giá trị gửi phải là số nguyên trong phạm vi.
- Câu hỏi/phương án không thuộc form, câu hỏi bị lặp, kiểu giá trị sai, hoặc toàn bộ form không có câu trả lời đều bị từ chối.

Tối đa 100 câu hỏi/đợt và 100 phương án/câu hỏi. Một câu hỏi không bắt buộc có thể bỏ qua; nếu trả lời thì vẫn phải đúng validation.

## API

Các response trả DTO; lỗi theo `GlobalExceptionHandler` hiện có. GET biểu mẫu và dữ liệu quản trị dùng `Cache-Control: no-store`.

| Method | Đường dẫn | Quyền / chức năng |
| --- | --- | --- |
| GET | `/api/feedback/current` | Công khai: schema đợt đang mở; có trạng thái gửi của chính user nếu xác thực |
| GET | `/api/feedback/current/participation` | STUDENT/ADMIN: form hiện hành và trạng thái tham gia |
| POST | `/api/feedback/current/start` | STUDENT/ADMIN: ghi nhận mở form; `{formId, revision}` |
| POST | `/api/feedback/current/submissions` | STUDENT/ADMIN: lưu câu trả lời; trả 201 và receipt |
| GET | `/api/admin/feedback?page=0` | ADMIN: lịch sử, 50 đợt/trang; đợt xuất bản ưu tiên trước |
| GET | `/api/admin/feedback/{id}` | ADMIN: schema, trạng thái và cờ khóa cấu trúc |
| POST | `/api/admin/feedback` | ADMIN: tạo DRAFT; trả 201 |
| PUT | `/api/admin/feedback/{id}` | ADMIN: lưu metadata và toàn bộ schema có thứ tự |
| POST | `/api/admin/feedback/{id}/state` | ADMIN: `{revision, action: PUBLISH/PAUSE/CLOSE}` |
| GET | `/api/admin/feedback/{id}/statistics` | ADMIN: tổng quan và thống kê từng câu hỏi |
| GET | `/api/admin/feedback/{id}/questions/{questionId}/text-answers?page=0` | ADMIN: văn bản, 20 câu trả lời/trang |

Khi chưa có đợt mở, current trả 200 không có body; frontend hiển thị trạng thái trống và ẩn banner.

Payload tạo/sửa gồm `revision` (null khi tạo), `title`, `description`, `onePerUser`, `startsAt`, `endsAt`, `questions`. Mỗi question có `id`, `title`, `description`, `type`, `required`, `minValue`, `maxValue`, `maxLength`, `minSelections`, `maxSelections`, `options: [{id,label}]`. Thứ tự array là thứ tự hiển thị. Trường cấu hình không dùng đặt null; options không dùng là array rỗng. Backend trả IDs sau khi lưu. Khi chưa có submission, lưu schema thay các câu hỏi/phương án và cấp IDs mới; luôn dùng bản response mới để gửi.

Payload gửi:

```json
{
  "formId": 1,
  "revision": 1,
  "answers": [
    { "questionId": 10, "text": "Góp ý", "number": null, "optionIds": [] },
    { "questionId": 11, "text": null, "number": 4, "optionIds": [] },
    { "questionId": 12, "text": null, "number": null, "optionIds": [20, 22] }
  ]
}
```

IDs ở ví dụ là minh họa cấu trúc request. API thực dùng IDs do backend trả về. Backend lấy user ID từ `SecurityUtils`, không nhận quyền sở hữu từ payload.

## Thống kê

Số liệu lấy từ các hàng trong database của đợt được chọn:

- Tổng submission, số user gửi duy nhất, số user đã mở, số câu hỏi và số answer hợp lệ.
- Tỷ lệ hoàn thành = user gửi duy nhất / user đã mở sau đăng nhập × 100%. Gửi trực tiếp API cũng ghi visit; gửi nhiều lần không làm tăng số user trong tỷ lệ.
- Phân bố chọn một/nhiều: count theo phương án; tỷ lệ trên số lượt trả lời **câu hỏi đó**. Chọn nhiều có thể cộng vượt 100%.
- Likert/rating: phân bố đủ các mức, trung bình, trung vị, min/max. Numeric: trung bình, trung vị, min/max. Khi chưa có dữ liệu, các chỉ số numeric là null.
- Aggregate và phân bố được tính ở database; trung vị chỉ tải một/hai giá trị ở vị trí giữa, không tải toàn bộ answers.
- Văn bản có phân trang, xuống dòng được giữ và React escape nội dung. Không cung cấp danh tính hoặc câu trả lời cá nhân qua public API.
- Lịch hiển thị: xuất bản lần đầu, bắt đầu, kết thúc theo lịch, thời điểm đóng; báo cáo dùng giờ Việt Nam.

## Áp dụng migration và chạy

Database hiện có cần hoàn tất baseline/migration cũ của dự án. Áp dụng file feedback **trước khi deploy backend mới**; `ddl-auto=none` giữ nguyên.

Từ thư mục gốc, với Docker Compose:

```bash
docker compose cp ./database/20261013_feedback.sql mysql:/tmp/20261013_feedback.sql
docker compose exec mysql mysql --default-character-set=utf8mb4 -u root -p --execute="SOURCE /tmp/20261013_feedback.sql" chinese_online_learning
```

Với MySQL client ngoài Docker:

```bash
mysql --default-character-set=utf8mb4 -u root -p --execute="SOURCE P:/Project/SBA301/database/20261013_feedback.sql" chinese_online_learning
```

Chạy trên database `chinese_online_learning` hiện có. File chỉ bổ sung bảng, khóa và singleton; chạy lại giữ dữ liệu đã thu thập. Theo quy trình deploy hiện có, sao lưu và dừng backend trong lúc cập nhật; DDL MySQL tự commit. Dockerfile database đã thêm bước `04-feedback.sql` sau schema, data và file deploy 20261012 cho volume mới. Không chạy lại schema gốc trên database hiện hữu.

Chạy ứng dụng với biến môi trường hiện có:

```bash
cd backend
mvn test
mvn package -DskipTests
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

```bash
cd frontend
npm run dev
# Kiểm tra production frontend:
npm run build
npm test
npm run lint
```

Máy kiểm tra có `npm` shim hỏng và Maven không nằm trong PATH: đã dùng npm CLI tại `C:/DevTool/NodeJs/node_modules/npm/bin/npm-cli.js` và Maven đi kèm IntelliJ. H2 cùng dependency đóng gói thiếu đã được tải; không sửa package.json/pom.xml hay phiên bản framework.

## Kết quả kiểm tra ngày 13/10/2026

- Frontend: production build/typecheck thành công; lint đạt; **42/42 test** đạt, gồm 6 test validation feedback.
- Backend: `mvn test` thành công, **221 test được tìm thấy, 195 chạy đạt, 26 bỏ qua** do các integration test MySQL cũ yêu cầu biến môi trường riêng. Toàn bộ **22 test feedback mới** chạy đạt: 14 persistence/validation/statistics, 5 security, 3 concurrent transactions.
- Backend: `mvn package -DskipTests` thành công, tạo executable Spring Boot jar.
- MySQL 8.0.46 tạm riêng: migration chạy lại nhiều lần; **10 kiểm tra constraint/migration** đạt (single slot, slot/state CHECK, lịch, unique submission, FK, giữ dữ liệu khi chạy lại).
- Backend chạy thật trên MySQL tạm: **39 kiểm tra HTTP/API** đạt, bao gồm phân quyền, trùng lượt gửi, revision cũ, validation, schema đã khóa, tạm dừng/mở lại/đóng/chuyển đợt, số liệu chọn nhiều, gửi nhiều lần và báo cáo lịch sử.
- Kiểm tra trình duyệt: admin tạo ba câu hỏi (văn bản dài, Likert, chọn nhiều), xem trước, lưu và xuất bản; học viên thấy banner, chuyển thẳng sang form, nhận lỗi khi bỏ câu bắt buộc, gửi thành công, trang chủ hiện trạng thái hoàn thành. Bản ghi MySQL xác nhận 1 submission, 3 answers và hai lựa chọn; API statistics và giao diện báo cáo lịch sử trả đúng số liệu này. Đã lưu ảnh kiểm tra giao diện quản trị từ database tạm.

Các test tự động dùng H2 in-memory có guard chống trỏ nhầm database. MySQL/HTTP/browser sử dụng instance riêng port 33317 và schema `feedback_verify`; dữ liệu thử nghiệm không được seed vào migration/production. Không áp dụng migration lên database ứng dụng đang dùng.

## File thay đổi

Backend mới dưới `backend/src/main/java/com/app/features/feedback/`:

- `controller/FeedbackController.java`, `controller/AdminFeedbackController.java`
- `dto/FeedbackDto.java`
- `model/FeedbackForm.java`, `FeedbackQuestion.java`, `FeedbackOption.java`, `FeedbackSubmission.java`, `FeedbackAnswer.java`, `FeedbackVisit.java`, `FeedbackPublicationLock.java`
- `repository/FeedbackFormRepository.java`
- `service/FeedbackService.java`

Backend bổ sung rule trong `backend/src/main/java/com/app/config/SecurityConfig.java`. Test mới dưới `backend/src/test/java/com/app/features/feedback/`: `FeedbackIntegrationTest.java`, `FeedbackSecurityTest.java`, `FeedbackConcurrencyTest.java`.

Frontend mới:

- `frontend/src/features/feedback/model.ts`, `model.test.ts`, `FeedbackFields.tsx`, `FeedbackBanner.tsx`, `feedback.css`
- `frontend/src/pages/feedback/FeedbackPage.tsx`
- `frontend/src/pages/admin-dashboard/FeedbackManagementPage.tsx`, `FeedbackStatisticsPage.tsx`, `feedbackAdmin.css`

Frontend tích hợp trong `frontend/src/app/router/AppRouter.tsx`, `frontend/src/pages/home/ui/HomePage.tsx`, `frontend/src/pages/admin-dashboard/ManagementShell.tsx`, `AdminDashboardPage.tsx`, `AssignmentReviewPage.tsx`.

Database/tài liệu: `database/20261013_feedback.sql`, `database/Dockerfile`, `database/README-deploy-update.md`, tài liệu này.
