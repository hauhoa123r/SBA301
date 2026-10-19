# Kết quả kiểm chứng thực tế — 19/10/2026

> Kết quả lịch sử của đợt thanh toán từng khóa đã hoàn tác. Kết quả sau khôi phục nằm trong `SUBSCRIPTION_RESTORED.md`.

| Nhóm | Kết quả cuối |
|---|---|
| Backend, `-Dtest=*Test,*IntegrationTest` | **253 đạt**, 0 thất bại, 0 lỗi; 30 bài có điều kiện bị bỏ qua; tổng được phát hiện 283 |
| Payment unit tests | **21/21 đạt**: giữ bốn nhóm cũ, điều chỉnh nghiệp vụ tạo payment và bổ sung 4 ca mới |
| CoursePurchaseIntegrationTest | **21/21 đạt**, HTTP qua MockMvc với filter chain, service và database H2; không skip |
| LearningResourceServiceTest | **5/5 đạt**, gồm đọc tệp riêng tư, từ chối quyền, traversal, cấu hình thiếu và URL công khai |
| Frontend Vitest | **61/61 đạt**, 10 tệp test |
| Frontend ESLint | Đạt |
| Frontend production build + TypeScript | Đạt |
| Migration trên MySQL 8 riêng | Đạt, chạy **2 lần**, không trùng seed, không mất lịch sử, backfill quyền cũ đúng |
| Schema contract generator `--check` | Đạt |
| Compose `config --no-interpolate --quiet` | Parse thành công; CLI cảnh báo không đọc được cấu hình Docker cá nhân trong sandbox, không ảnh hưởng parse YAML |
| `git diff --check` | Đạt; chỉ có cảnh báo chuẩn hóa LF/CRLF của Git |

Log backend cuối: `backend/target/course-purchase-all-tests.log`. Báo cáo JUnit của hai nhóm mới nằm tại `backend/target/surefire-reports/com.app.features.payments.CoursePurchaseIntegrationTest.txt` và `com.app.features.payments.LearningResourceServiceTest.txt`.

Bằng chứng MySQL cuối: `backend/target/course-purchase-mysql-2b27cedafd0e4c348c09e5ef1ee89c19/result.json`. Instance riêng đã dừng; database đang dùng không bị chạy migration hoặc reset. Regression kiểm tra cả dữ liệu trước/sau chạy lặp, giá 0/99.000đ, số bài 3/6, enum CANCELLED/EXPIRED và schema contract đầy đủ.

## Các mục chưa đạt hoặc chưa thực hiện

- **Python database regression có sẵn:** chạy `python -m unittest discover -s database/tests -p 'test_*.py'` phát hiện 22 bài: **18 đạt, 4 lỗi**. Bốn lỗi nằm trong `test_verify_schema.py`, hàm `push_script()` cố tìm `stage('PUSH_IMAGE')` không tồn tại trong Jenkinsfile hiện tại nên phát sinh `IndexError`. `Jenkinsfile` và `database/tests/test_verify_schema.py` không bị chỉnh sửa trong tác vụ này. Không coi cả bộ Python là đã xanh.
- **30 backend tests bị skip** theo điều kiện môi trường: các nhóm MySQL của dashboard, quản lý học viên, auth settings, course repository, learning progress, subscriptions, fresh schema, refresh sessions; một bài browser audit. Những bài này không được tính vào 253 bài đã thực thi.
- **Browser UI smoke:** đã thử Chrome headless với profile riêng, nhưng Chrome/CDP đóng kết nối hoặc timeout `Page.enable` trước khi mở trang. Không có kết quả smoke test giao diện hoặc ảnh chụp được xác nhận. Build/lint không thay thế kiểm thử trực quan.
- **payOS thật:** không chuyển tiền, không có bằng chứng webhook từ gateway thực. Test dùng mock network payOS và chạy xác minh HMAC thật với khóa thử nghiệm.
- **Production:** chưa triển khai ứng dụng, chưa chạy migration trên database đang sử dụng, chưa thay đổi quyền truy cập Cloudinary bên ngoài.

## Phạm vi các kiểm thử bắt buộc

Các ca trong yêu cầu được kiểm tra bằng các nhóm payment unit test hiện có và `CoursePurchaseIntegrationTest`: Free không trả tiền; ba preview theo thứ tự backend; lesson thứ tư bị khóa; gọi API trực tiếp; giả mạo course/lesson ID; PENDING; thanh toán đúng 99.000đ; webhook hợp lệ/lặp/giả; thiếu hoặc sai tiền; quyền vĩnh viễn; từ chối mua lại; unique enrollment; persist CANCELLED/EXPIRED; invoice người khác; không lộ nội dung; giữ phân quyền quản trị; xử lý invoice/subscription lịch sử; đồng thời webhook/sync. Có ca lưu và đọc lại tiến độ Free.

Các test subscription unit giữ lại kiểm chứng tương thích cho giao dịch đã tồn tại, không đồng nghĩa API còn bán subscription mới. Nhóm tạo payment cũ có ba ca được chuyển assertion từ plan sang course vì nghiệp vụ đã thay đổi; không bỏ qua test cũ để làm xanh.
