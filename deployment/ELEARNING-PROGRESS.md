# Luồng học và tiến độ e-learning

## Phạm vi hoàn thiện

Tái sử dụng React/Vite, Spring Boot 3.5.7/Java 17, MySQL 8 và JWT/OAuth hiện có. Quyền đăng nhập vẫn là STUDENT và ADMIN. Các bảng `lesson_progress`, `quiz_attempts`, `student_answers`, `assignment_submissions`, `user_chapter_progress`, `course_enrollments` giữ vai trò nguồn dữ liệu. Không dùng bảng tiến độ trùng lặp `user_lesson_progress`/`user_quiz_attempts` để ghi mới.

- Học viên đánh dấu bài học hoàn thành hoặc chưa hoàn thành; trạng thái được lưu và khôi phục khi tải lại.
- Video lưu vị trí xem, tổng thời gian xem thực tế khi tab hiển thị, mỗi khoảng 15 giây và khi tạm dừng/chuyển bài. Xem hết video tự đánh dấu bài học hoàn thành. Thời gian không tăng theo khoảng tua video.
- Quiz được chấm ở server theo điểm của từng câu và ngưỡng đạt của quiz. Hỗ trợ một/nhiều đáp án, nghe chọn đáp án, điền nội dung, ghép cặp và luyện câu nói qua nội dung văn bản. Không nhận điểm do client gửi. Đáp án đúng và giải thích chỉ trả trong kết quả sau khi nộp.
- Lượt làm quiz và câu trả lời được lưu; có thể xem giải thích, làm lại. Đã đạt ở một lượt trước thì lượt làm lại không đạt không xóa thành tích đó.
- Bài tập lưu nội dung, thời điểm nộp, trạng thái, điểm và nhận xét. Học viên được cập nhật bài chưa chấm hoặc bài yêu cầu sửa; bài đã chấm được bảo vệ khỏi sửa nội dung.
- Admin xem danh sách bài nộp có phân trang, lọc trạng thái, chấm điểm 0–100 hoặc yêu cầu sửa với nhận xét. Học viên thấy kết quả khi tải lại. Admin vẫn chấm được sau khi gói học viên hết hạn.
- Khóa học của tôi, lọc/tìm chương, lộ trình, luyện kiểm tra, hồ sơ, biểu đồ hoạt động và nút tiếp tục học dùng dữ liệu thật. Đã bỏ số cúp, tiến độ, tên học viên, ngày học và điểm phát âm ngẫu nhiên.
- Thống kê Admin ghi nhận người xem video, làm quiz hoặc nộp bài là đang học nếu chưa hoàn thành khóa.
- Sửa thời điểm kích hoạt gói học theo độ chính xác giây của MySQL để gói vừa kích hoạt không bị làm tròn thành thời điểm tương lai.

## Quy tắc hoàn thành thống nhất

Mỗi bài học, quiz và bài tập là một hoạt động. Phần trăm = `floor(100 × hoạt động hoàn thành / tổng hoạt động)`. Khóa không có hoạt động có tiến độ 0 và chưa hoàn thành.

- Bài học: `lesson_progress.is_completed = true`.
- Quiz: có ít nhất một lượt `is_passed = true`.
- Bài tập: có bài nộp và trạng thái khác `NEEDS_REVISION`. Nộp bài được tính vào tiến độ trước khi chấm. Yêu cầu sửa đưa hoạt động về chưa hoàn thành cho đến khi nộp lại.
- Chương/khóa: toàn bộ hoạt động bên trong hoàn thành. `completed_at` được xóa khi một hoạt động trở lại chưa hoàn thành. Thời gian xem video vẫn được giữ khi bỏ đánh dấu bài học.

Các thay đổi tiến độ và bài nộp được ghi trong transaction. Enrollment là khóa đồng bộ giữa cập nhật của học viên và chấm bài. API xác định học viên từ principal JWT/OAuth, kiểm tra quyền và quyền truy cập khóa học; không lấy `userId` do client cung cấp.

## Database và triển khai

Chạy `database/20261006_learning_progress.sql` trên database hiện hữu **trước khi khởi động backend mới**. Migration đã được chạy và chạy lại thành công trên MySQL local của workspace này.

Migration thêm `lesson_progress.position_seconds`, bảng `learning_activity_daily` với unique `(user_id, activity_date)` và index lượt làm quiz. Đồng thời bỏ cờ hoàn thành cũ dựa trên bài học nếu quiz/bài tập bắt buộc còn thiếu; không xóa bài học, câu trả lời hay bài nộp. Không tạo lịch sử hoạt động giả cho thời gian trước khi bật tính năng.

`database/Dockerfile` đã thêm migration vào bước khởi tạo. Với volume MySQL đang có dữ liệu, các script init sẽ không tự chạy lại: cần chạy migration bằng SQL client/MySQL CLI. Không xóa volume hoặc nhập lại seed để nâng cấp.

Truy vấn hoàn thành dùng `UNION ALL` các loại hoạt động rồi `COUNT/SUM/EXISTS` trong database. Quiz chỉ lấy lượt nộp gần nhất để hiển thị và lấy tập quiz đã từng đạt để tính tiến độ. Câu trả lời các lượt mới nhất được tải theo batch. Hoạt động theo ngày dùng upsert tăng bộ đếm; biểu đồ trả 84 ngày theo giờ Việt Nam, ngày chưa có dữ liệu bằng 0.

Sau migration, restart backend, chạy frontend và truy cập:

- STUDENT: `/learning`, `/learning/courses/{courseId}/lessons/{lessonId}`, `/learning/courses/{courseId}/quizzes/{quizId}`, `/learning/courses/{courseId}/assignments/{assignmentId}`. Cần gói còn hiệu lực hoặc quyền khóa học legacy; tiến độ vẫn giữ khi gói hết hạn.
- ADMIN: `/admin/dashboard`, `/admin/assignments`. Dashboard có liên kết chấm bài trên desktop và mobile.

Xem `deployment/ADMIN-DASHBOARD.md` và `.env.example` để nạp biến môi trường/khởi động. Không đưa mật khẩu, JWT hoặc OAuth secret vào source/tài liệu.

## API

| Method | Path | Body / chức năng |
| --- | --- | --- |
| GET | `/api/learning/courses/{courseId}/progress` | Lesson/chapter hoàn thành, quiz đã đạt, bài nộp, vị trí video, kết quả và phần trăm |
| PUT | `/api/learning/courses/{courseId}/lessons/{lessonId}/progress` | `{ "completed": true }` hoặc `false` |
| PUT | `/api/learning/courses/{courseId}/lessons/{lessonId}/playback` | `{ "positionSeconds": 85, "watchedSeconds": 15 }`, delta từ 0 đến 30 giây |
| POST | `/api/learning/courses/{courseId}/quizzes/{quizId}/submissions` | `{ "answers": [{ "questionId": 1, "answerIds": [2] }] }`; câu văn bản dùng `text`, ghép cặp dùng `matches` |
| PUT | `/api/learning/courses/{courseId}/assignments/{assignmentId}/submission` | `{ "text": "Nội dung bài làm" }`, tối đa 20.000 ký tự |
| GET | `/api/learning/activity` | 84 ngày, thời gian video và số thao tác học đã lưu |
| GET | `/api/admin/assignments/submissions?status=SUBMITTED&page=0` | Danh sách bài nộp, 20 mục/trang; status rỗng = tất cả |
| PUT | `/api/admin/assignments/submissions/{id}/grade` | `{ "status": "GRADED", "score": 80, "feedback": "Nhận xét" }` hoặc `NEEDS_REVISION` với nhận xét bắt buộc |

Các API ghi hoạt động trả trạng thái đã lưu, chỉ cập nhật giao diện sau khi server xác nhận thành công. Giữ tương thích các field `lesson.quiz`/`chapter.assignment` và route bài tập cũ, đồng thời bổ sung mảng để không bỏ sót nhiều quiz/bài tập.

## File chính

- Backend: `features/learning/service/LearningActivityService.java`, `QuizGrader.java`, `service/impl/LearningProgressServiceImpl.java`, `loader/LearningProgressDetailsLoader.java`, các DTO/repository học mới và `LearningController.java`.
- Admin: `features/admin/controller/AssignmentReviewController.java`, `service/AssignmentReviewService.java`, truy vấn `DashboardRepository.java`.
- Frontend: `LearnCourseLayout.jsx`, `LearnCoursePage.jsx`, `LessonPanel.jsx`, `TrackedVideo.jsx`, `LessonQuizPanel.jsx`, `ChapterAssignmentPanel.jsx`, `learning-api.js`, `learnCourseUtils.js` và các màn hình tổng quan/hồ sơ/lộ trình học.
- Màn hình chấm bài: `frontend/src/pages/admin-dashboard/AssignmentReviewPage.tsx`, router và liên kết Dashboard.
- Database: migration ở trên và `database/Dockerfile`. Các entity vị trí video/hoạt động theo ngày, bài nộp được cập nhật tương ứng.

## Kiểm tra

```powershell
cd frontend
npm test
npm run lint
npm run build
```

Backend chạy `mvn "-Dtest=*Test" test`. Không chạy `mvn test` không chọn lớp: các lớp cũ `BackendApplicationTests` có thao tác nhập lại seed. Để kiểm thử MySQL, nạp DB_URL/DB_USERNAME/DB_PASSWORD và đặt `RUN_MYSQL_INTEGRATION_TESTS=true`; database cần migration trên. Fixture integration test được rollback.

Các kiểm thử mới kiểm tra đổi trạng thái bài học, điểm có trọng số ở server, câu trả lời sai phạm vi, nhiều quiz/bài tập trong một chương, khôi phục dữ liệu sau reload, lịch sử đạt quiz, vị trí/thời lượng video, cache hoạt động, yêu cầu sửa/chấm bài, thống kê Admin và phân quyền API. Các unit test auth/payment/subscription hiện có tiếp tục được kiểm tra.

Kết quả xác nhận trên workspace: 36 kiểm thử frontend đạt; lint, TypeScript và production build đạt. Tổng 95 kiểm thử backend của các lần chạy hiện tại đều đạt sau khi chạy hồi quy và chạy lại các nhóm bị ảnh hưởng, bao gồm MySQL integration và phân quyền; không có test bỏ qua trong các lần chạy này. Migration local đã chạy lại để kiểm tra tính idempotent. Vite còn cảnh báo bundle chính lớn hơn 500 kB, không làm build thất bại.

Kiểm tra thủ công với STUDENT: đánh dấu bài rồi reload; bỏ đánh dấu; tạm dừng video rồi mở lại; nộp quiz và xem lời giải; nộp bài rồi reload. Với ADMIN: yêu cầu sửa bài, kiểm tra học viên thấy nhận xét và tiến độ giảm, nộp lại, chấm điểm, kiểm tra bài đã chấm không sửa được. Kiểm tra màn hình rộng và mobile. Luồng browser end-to-end chưa được tự động hóa trong lần triển khai này.

## Giới hạn hiện tại

- Ghi âm luyện nói chỉ phục vụ nghe lại trên thiết bị. Chưa có dịch vụ đánh giá phát âm hoặc lưu file âm thanh; không hiển thị điểm phát âm giả.
- Bài tập hỗ trợ nội dung văn bản; chưa bổ sung hạ tầng upload file hoặc cấp chứng chỉ PDF.
- Thời lượng quiz và số ngày bài tập là hướng dẫn luyện tập; chưa triển khai bài thi có timer/proctoring hoặc cưỡng chế deadline.
- Theo dõi thời gian là telemetry từ trình duyệt, không phải chứng nhận chống gian lận. Khi đóng trình duyệt đột ngột có thể chưa lưu vài giây cuối. Hoạt động đọc được ghi qua thao tác đánh dấu, không được quy đổi thành thời gian video.
- Chưa mở thêm vai trò TEACHER vì mô hình đăng nhập đang chỉ hỗ trợ STUDENT/ADMIN. Không thay chính sách role, hệ thống thanh toán hoặc triển khai lên production trong thay đổi này.
