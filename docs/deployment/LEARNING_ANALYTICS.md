# Dashboard học tập và điều phối hoạt động

## URL và cách dùng

- `/admin/learning-analytics`: dashboard học theo ngày, chỉnh các mốc 5, 10, 15 phút hoặc thêm mốc; lọc học viên theo tên/email, thời gian học và khoảng ngày; xem số user đã bắt đầu/hoàn thành ít nhất một bài trong từng khóa; thống kê truy cập tính năng.
- `/admin/activity-lab`: trang chỉ mở bằng URL, không có link trong menu. Frontend và toàn bộ API `/api/admin/activity-lab/**` đều yêu cầu ADMIN. Biết URL không cấp quyền truy cập.

Trên trang điều phối: tạo tài khoản hoặc chọn học viên ACTIVE → nhập lý do → cấp subscription → chọn khóa đã xuất bản, số phút học, số bài mới hoàn thành/ngày và tính năng truy cập → lưu cài đặt → chạy hôm nay hoặc bật tự chạy. Mỗi user chỉ chạy thành công một lần/ngày theo `Asia/Ho_Chi_Minh`; bấm lại không cộng thêm. Muốn đổi cài đặt cho hôm nay phải lưu trước lần chạy đầu. Nút chạy thủ công sử dụng **cài đặt đã lưu**, kể cả khi lịch tự động đang tắt.

Tài khoản có role STUDENT, trạng thái ACTIVE và mật khẩu BCrypt, đăng nhập vào app chính bình thường. Không thêm cột/cờ phân loại tài khoản. Các thao tác dùng `users`, `user_roles`, `user_subscriptions`, `course_enrollments`, `lesson_progress`, `user_chapter_progress`, `learning_activity_daily`, `user_feature_usage`, `feedback_visits`, `feedback_submissions`, `feedback_answers`, `feedback_answer_options` và `audit_logs` theo nghiệp vụ. Chỉ tạo bản ghi phù hợp thao tác; không chèn dữ liệu rỗng vào mọi bảng. Cấp subscription qua admin không tạo invoice/payment PAID. Trang hiển thị subscription, tính năng đã truy cập, phản hồi và nhật ký thao tác của user.

Phản hồi được nhập trên biểu mẫu đang mở của app, dùng cùng validation và giới hạn gửi như người dùng; không tự sinh câu trả lời. Việc đánh dấu hoàn thành bài không tự làm quiz/bài tập hoặc tạo chứng chỉ. Các tính năng chọn trong cài đặt là lượt sử dụng được ghi nhận, không phải quyền mới để vượt qua subscription hoặc phân quyền.

## Database hiện hữu: chạy trước backend mới

File mới: `database/migrations/20261019_learning_analytics.sql`. Script thêm ba bảng `learning_analytics_settings`, `user_learning_rules`, `user_feature_usage` và index ngày học; chạy lại giữ nguyên cấu hình. Yêu cầu schema hiện tại của dự án đã có learning, subscription, feedback, auth và audit. MySQL DDL tự commit.

Tại thư mục Compose trên server, sau khi sao lưu database và đưa file migration lên server:

```bash
docker exec chinese-mysql sh -c 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysqldump -uroot --single-transaction --routines --triggers chinese_online_learning' > before-learning-analytics.sql

docker exec -i chinese-mysql sh -c 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql -uroot --default-character-set=utf8mb4 chinese_online_learning' < database/migrations/20261019_learning_analytics.sql

sh deployment/verify-mysql-schema.sh database/tests/check-schema.sql
```

Đặt bản backup ở nơi hạn chế truy cập. Không import `schema.sql`/`data.sql` vào database hiện hữu. Không xóa volume. Database mới dùng `database/schema.sql` và `database/data.sql` đã cập nhật; image MySQL mới không tự migrate volume cũ.

## Các file cấu hình cần sửa/cập nhật

| Thành phần | File | Thay đổi |
|---|---|---|
| Biến môi trường | `.env` trên server | Thêm hai biến bên dưới; file thật không bị sửa trong checkout này. Mẫu có trong `.env.example`. |
| Spring | `backend/src/main/resources/application.properties` | Đã thêm `app.activity-lab.enabled` và `app.activity-lab.cron`. Không đổi JDBC, JWT, OAuth hay `ddl-auto`. Hai profile local/docker kế thừa cấu hình này. |
| Compose | `docker-compose.yml`, mục `services.backend.environment` | Đã truyền `ACTIVITY_LAB_ENABLED` và `ACTIVITY_LAB_CRON`. Phải cập nhật bản Compose đang dùng trên server, gồm override nếu có. |
| Docker frontend | `frontend/Dockerfile` | Build chạy `npm test` rồi `npm run build`. UI mới nằm trong image `chinese-nginx`. |
| Docker backend | `backend/Dockerfile` | Không cần đổi Dockerfile; build lại image để chứa service/API/metrics mới. |
| Docker database | `database/Dockerfile` | Không cần sửa; đã COPY schema/data được cập nhật cho database mới. Database đang chạy chỉ cần migration. |
| Jenkins | `Jenkinsfile`, stage `Deploy EC2` | Đã thêm schema guard chỉ đọc trước pull/up. Stage Fresh MySQL chạy các test mới. Docker frontend tự chạy test khi build. |
| Nginx | `frontend/nginx.conf`, `frontend/nginx.https.conf` nếu dùng override | Không cần thêm location: `/api/` đã proxy backend, `try_files ... /index.html` đã hỗ trợ URL mới. Giữ nguyên chặn `/actuator` và `/api/actuator`. Không bảo vệ API chỉ bằng URL ẩn. |
| Prometheus | `monitoring/prometheus.yml` | Cấu hình hiện tại đã scrape `backend:8081/actuator/prometheus`; không cần thay đổi. Prometheus phải ở cùng network với backend. |
| Grafana | `monitoring/learning-dashboard.json` | Import JSON này vào Grafana hiện có, chọn datasource Prometheus. Không cần mở metrics ra Internet. |

Thêm vào `.env` của server nếu muốn bật trang điều phối và lịch:

```dotenv
ACTIVITY_LAB_ENABLED=true
ACTIVITY_LAB_CRON="0 */15 * * * *"
```

Giá trị mặc định là `false`; dashboard học tập vẫn dùng được khi trang điều phối tắt. `ACTIVITY_LAB_ENABLED=false` chặn thao tác ghi trên trang điều phối và không đăng ký lịch; các dữ liệu đã tạo vẫn giữ nguyên. Sau khi đổi `.env` phải recreate backend. Cron Spring có **6 trường**, múi giờ Việt Nam. Ví dụ `"0 0 8 * * *"` chạy 08:00 mỗi ngày. Mặc định kiểm tra mỗi 15 phút, xử lý tối đa 100 rule/lượt, xoay vòng để rule lỗi không chặn các rule phía sau. Tài khoản bị khóa, khóa học chưa xuất bản hoặc gói hết hạn sẽ không tạo tiến độ; lỗi được ghi vào log backend. Không chạy bù ngày trước khi server tắt.

## Thứ tự triển khai

1. Đưa migration, schema guard, `deployment/verify-mysql-schema.sh`, Compose và tài liệu từ commit này lên đúng `DEPLOY_PATH` của server. Pipeline hiện tại chỉ pull image, **không git pull/copy cấu hình từ workspace Jenkins sang EC2**.
2. Sao lưu, chạy migration và schema guard ở trên. Có thể làm khi backend cũ còn chạy vì migration chỉ thêm bảng/index.
3. Thêm biến `.env`, cập nhật Compose. `IMAGE_TAG` là bản backend/nginx cần deploy; giữ nguyên `MYSQL_IMAGE_TAG` đang pin khi database đã có dữ liệu.
4. Chạy pipeline Jenkins hoặc build/deploy thủ công. Jenkins build/push hai image app và kiểm tra schema trước deploy. Các giá trị `SERVER_IP`, `DEPLOY_PATH`, credentials Jenkins giữ theo server thực tế của bạn.

Ví dụ deploy từ image đã push, tại thư mục Compose server:

```bash
docker compose --env-file .env config --quiet
docker compose --env-file .env pull backend nginx
docker compose --env-file .env up -d --no-deps --force-recreate backend nginx
docker compose --env-file .env ps backend nginx
docker compose --env-file .env logs --tail=100 backend
docker exec chinese-nginx nginx -t
```

Nếu tự build trên máy deploy, dùng `docker compose --env-file .env build backend nginx` trước lệnh `up`; không cần rebuild/recreate MySQL hiện hữu. Khi khởi tạo một môi trường mới, build/push image database từ thư mục `database/` với `MYSQL_IMAGE_TAG` riêng rồi mới tạo volume mới.

Kiểm tra bằng tài khoản ADMIN: mở `/admin/learning-analytics`, mở trực tiếp `/admin/activity-lab`, tạo user, cấp gói, lưu rule 5 phút/1 bài, chạy, bấm chạy lại; dashboard phải tăng 1 user ở mốc 5 phút và lần chạy thứ hai không tăng nữa. Đăng nhập bằng user vừa tạo để xem gói và tiến độ. Thử URL/API bằng STUDENT phải bị chặn. Kiểm tra feedback bằng một đợt khảo sát đang mở.

## Metric

Metric nội bộ có cache tổng hợp 30 giây, không gắn email/user ID vào label:

| Prometheus | Ý nghĩa |
|---|---|
| `learning_daily_active_users` | User có thời gian xem hoặc hoạt động trong ngày Việt Nam hiện tại. |
| `learning_daily_threshold_users{minutes="5"}` | User đạt ít nhất 5 phút trong ngày. Có thêm series 10 và 15 phút. |
| `learning_daily_watch_seconds` | Tổng giây xem trong ngày. |
| `learning_course_started_users` | Số user duy nhất đã xem >0 giây hoặc hoàn thành ít nhất một bài trên toàn hệ thống. |

Mốc tùy chỉnh được áp dụng trên dashboard app; metric Prometheus giữ ba mốc 5/10/15 cố định để truy vấn và dashboard giám sát ổn định. Số user từng khóa và người hoàn thành ≥1 bài nằm trên dashboard app. Không dùng `rate()` cho các gauge này. Khi backend có nhiều replica, dùng `max(...)`, không cộng các replica vì cùng đọc một database. Thời gian học phản ánh heartbeat do ứng dụng ghi nhận, không chứng minh người dùng tập trung liên tục. Truy cập tính năng ghi nhận các API thành công của STUDENT từ thời điểm triển khai; không backfill lịch sử không tồn tại.

## Kiểm thử

```bash
cd frontend
npm ci
npm test
npm run lint
npm run build
cd ..
python database/generate-schema-check.py --check
python database/tests/learning_analytics_mysql_regression.py
python database/tests/fresh_initialization.py --backend --backend-tests 'LearningAnalyticsMySqlTest,LearningAnalyticsSecurityTest,StudentManagementIntegrationTest,LearningProgressIntegrationTest,DashboardRepositoryIntegrationTest'
```

Hai lệnh MySQL cuối dùng datadir và cổng kiểm thử riêng, không dùng database hiện hữu. Cần MySQL 8 local, Maven, JDK 17+ hoặc dùng script fresh initialization với `--docker`. `MYSQL_BIN`, `JAVA_HOME`, `PATH` được đặt theo máy chạy test. Không có thay đổi triển khai nào được thực thi lên server thật trong lượt sửa mã này.
