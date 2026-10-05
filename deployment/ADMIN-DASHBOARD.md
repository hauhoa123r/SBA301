# Admin Dashboard

Đường dẫn frontend: `/admin/dashboard`. Tất cả số liệu lấy từ MySQL hiện tại, không có mock hoặc seed mới.

## Phân tích source trước khi triển khai

- Frontend: React 19, TypeScript, Vite 8, Tailwind 4; tổ chức `app`, `pages`, `features`, `entities`, `shared`, `widgets`. Axios dùng bearer token và tự refresh; router đã có `RoleRoute`. Không có thư viện chart, nên biểu đồ dùng SVG/CSS responsive, có nhãn và bảng số liệu mở rộng. Tái sử dụng màu brand, icon Lucide, formatter VND và hook modal có quản lý focus/Escape.
- Backend: Spring Boot 3.5.7, Java 17, JPA/Hibernate, Spring Security; feature controller → service → repository. MySQL 8, `ddl-auto=none`; schema và các migration nằm trong `database`.
- `UserEntity`/`users`: roles qua `user_roles`, trạng thái và `created_at`; đếm tất cả người dùng, không chỉ học viên.
- `SubscriptionPlanEntity`/`subscription_plans`: mã, tên, giá VND, số ngày, trạng thái cung cấp. `UserSubscriptionEntity`/`user_subscriptions`: một gói hiện tại mỗi người; started/expires xác định hiệu lực, bao gồm Free Trial. Không tự tạo các gói Free/Basic/Pro như ví dụ của yêu cầu.
- `CourseEntity`/`courses`: giá, trạng thái DRAFT/PENDING/PUBLISHED/HIDDEN. `CourseEnrollmentEntity`/`course_enrollments`: unique user/course, ngày đăng ký, ngày hoàn thành, legacy access. `lesson_progress` là nguồn tiến độ hiện tại được service học ghi.
- `InvoiceEntity`/`invoices`: giá thực tế sau giảm giá, trạng thái, khóa hoặc mã gói, thời điểm cập nhật. `PaymentEntity` và `RefundEntity` tồn tại; hóa đơn PAID là nguồn doanh thu để không nhân số tiền theo số payment retry hoặc số enrollment.
- JWT và OAuth đã có; `SupportedRolePolicy` cũ chỉ cho STUDENT. Role ADMIN đã có trong schema/seed. Thay đổi cho phép ADMIN đăng nhập/refresh/OAuth và đọc Dashboard, không cấp role STUDENT cho Admin. TEACHER/MODERATOR vẫn không được mở đăng nhập qua thay đổi này. API học, thanh toán và profile giữ quyền STUDENT hiện có.
- Course API hiện tại chỉ có GET catalog/detail; không có CRUD course để tái sử dụng. Dashboard cung cấp danh sách mọi trạng thái, tìm kiếm, lọc, phân trang, thống kê và modal chi tiết; khóa PUBLISHED có liên kết giới thiệu công khai.

## API mới

| Method / endpoint | Tham số | Nội dung |
| --- | --- | --- |
| `GET /api/admin/dashboard` | `period=all\|7d\|30d\|3m\|1y`, `limit=5\|10` | overview, subscriptions, 12 monthly trends, popularCourses, generatedAt, currency, timezone |
| `GET /api/admin/dashboard/courses` | `search`, `status=DRAFT\|PENDING\|PUBLISHED\|HIDDEN` hoặc rỗng, `page=0`, `size=10` | content, totalElements, page, size, totalPages |

`period` chỉ áp dụng xếp hạng khóa phổ biến. Overview/bảng gói là toàn bộ thời gian; biểu đồ luôn có 12 tháng đến tháng hiện tại. Khoảng 7/30 ngày là cửa sổ liên tục; 3 tháng/1 năm theo lịch. Top 5/10 lấy từ SQL, không hard-code khóa học.

Cả SecurityFilterChain và controller `@PreAuthorize("hasRole('ADMIN')")` bảo vệ API. Chưa đăng nhập → 401; có role khác → 403. Response có `Cache-Control: no-store`. Backend đọc lại role từ database khi xác thực bearer, không tin role tự khai ở frontend. `/api/auth/me` được phép với ADMIN/STUDENT.

Tìm kiếm là substring tên khóa học, escape `%`, `_`, `!`; query dùng bind parameters. Page bắt đầu từ 0, size 1–100, search tối đa 200 ký tự; tham số không hợp lệ trả 400.

## Cách tính và query mới

`DashboardRepository` chỉ trả scalar/DTO, không tải entity graph để cộng/trừ trong Java:

1. Overview: COUNT users, COUNT theo ngày/tháng; SUM invoices.amount WHERE status=PAID; COUNT gói started_at ≤ now < expires_at; tổng và SUM điều kiện trạng thái courses.
2. Bảng gói: LEFT JOIN subscription_plans với COUNT active subscriptions GROUP BY plan_code và SUM hóa đơn PAID GROUP BY subscription_plan_code. Giá hiển thị là giá hiện tại; doanh thu là hóa đơn thực tế, không phải giá × số người hiện có.
3. Biểu đồ: 12 bucket tháng được tạo từ lịch Asia/Ho_Chi_Minh; COUNT user và SUM hóa đơn trong `[start, end)` tại database, trả cả tháng bằng 0.
4. Popular: JOIN courses/enrollments, GROUP BY course, ORDER BY COUNT DESC rồi ID ASC, SQL limit 5/10 và filter enrolled_at.
5. Danh sách khóa: count query + page query. Enrollment và hóa đơn được aggregate riêng trước JOIN, tránh nhân lượt đăng ký/doanh thu. Hoàn thành dùng completed_at; đang học dùng EXISTS tiến độ bài học có watch_seconds > 0 hoặc is_completed, nhưng enrollment chưa hoàn thành. Tỷ lệ = completed/students × 100, bằng 0 khi chưa có học viên.

Một lần mở Dashboard dùng hai HTTP request song song: tổng hợp và course page. Request tổng hợp thực hiện 4 SQL statement; course page thực hiện 2. Số query cố định, không phụ thuộc số user/course, không có N+1. Truy vấn tháng dùng các range subquery có thể dùng index.

Ngày subscription/enrollment do Hibernate ghi dùng bind Instant cùng convention service hiện tại. Ngày user/invoice do MySQL tạo dùng epoch boundary + FROM_UNIXTIME theo session MySQL. Cách này đã được kiểm thử với MySQL local ở timezone SYSTEM (+07:00), bao gồm ranh giới tháng Việt Nam và thời điểm hết hạn.

Migration tùy chọn `database/20261003_admin_dashboard_indexes.sql` thêm index cho users.created_at, invoices(status, updated_at/plan/course, amount), enrollments(enrolled_at, course_id). Có kiểm tra information_schema để chạy lại được. Không thêm bảng, cột hoặc role. Chưa áp dụng migration vào database hiện tại; không bắt buộc để chạy Dashboard. Docker khởi tạo volume mới sẽ chạy sau schema/data/reading courses.

## Những phần dữ liệu/chức năng chưa có

- Chưa có `paid_at`/lịch sử chuyển trạng thái hóa đơn. Doanh thu tháng dùng updated_at của hóa đơn đang PAID; sửa hóa đơn có thể chuyển số liệu giữa tháng. Giao diện nêu rõ giới hạn này.
- Doanh thu ở đây là tổng hóa đơn PAID sau giảm giá, chưa trừ hoàn tiền từng phần. Hóa đơn REFUNDED/PENDING/FAILED/CANCELLED không được tính. Đây không phải báo cáo doanh thu ròng kế toán.
- Không phân bổ tiền gói cho từng khóa; course revenue chỉ gồm hóa đơn mua khóa riêng. Một học viên dùng gói sẽ tạo enrollment khi bắt đầu học/lưu tiến độ, không tạo enrollment cho mọi khóa được mở quyền.
- Subscription chỉ lưu gói hiện tại; chưa thể vẽ lịch sử phân bố gói, churn hoặc so sánh số người từng dùng gói theo tháng. Free Trial hết hạn được xếp “Không có gói hiệu lực”, không tạo gói Free giả.
- Không tạo/sửa/ẩn/xóa course vì chưa có CRUD/permission API tương ứng. Modal của khóa chưa xuất bản chỉ xem thống kê, không mở nội dung học được bảo vệ.

## Đăng nhập và tài khoản kiểm tra

Dùng tài khoản `ACTIVE` có role `ADMIN` trong `users`/`user_roles`. Seed khai báo `admin@chineselearning.vn`, mật khẩu `123456`; dữ liệu database thực tế có thể đã đổi, nên không coi seed là tài khoản đã xác minh đăng nhập. Không tạo tài khoản, cấp thêm role hoặc đổi mật khẩu trong lần triển khai này.

Đã sửa tương thích đăng nhập cần thiết: login form chỉ yêu cầu mật khẩu không rỗng, để backend xác thực credential cũ; registration/reset vẫn yêu cầu mật khẩu mới theo quy tắc hiện tại. Backend hỗ trợ BCrypt `$2a/$2b/$2y` và giữ tương thích các mật khẩu plaintext do luồng đăng ký/reset cũ ghi. Chưa chuyển đổi toàn bộ cơ chế lưu mật khẩu; những luồng ghi đó cần được xử lý trong công việc auth riêng.

Đối chiếu quyền: anonymous vào Dashboard được chuyển login; STUDENT/TEACHER/MODERATOR không được đọc Dashboard; ADMIN chỉ đọc Dashboard và auth/me, không tự nhận quyền API học viên. Người có cả ADMIN và STUDENT giữ cả hai quyền. Register vẫn chỉ gán STUDENT.

## Chạy local và kiểm thử

Backend cần các biến môi trường trong `.env.example`. `.env` không tự được Spring Boot đọc. Nếu dùng `.env` hiện tại với MYSQL_USER/MYSQL_PASSWORD, ánh xạ thành DB_USERNAME/DB_PASSWORD như docker-compose. Ví dụ PowerShell, chạy từ root project:

```powershell
$ErrorActionPreference = 'Stop'
foreach ($line in [IO.File]::ReadAllLines((Join-Path (Get-Location) '.env'))) {
  if ($line -match '^([A-Z][A-Z0-9_]*)=(.*)$') {
    [Environment]::SetEnvironmentVariable($Matches[1], $Matches[2].Trim().Trim('"').Trim("'"), 'Process')
  }
}
$env:DB_USERNAME = $env:MYSQL_USER
$env:DB_PASSWORD = $env:MYSQL_PASSWORD
$env:SPRING_PROFILES_ACTIVE = 'local'
Set-Location backend
mvn spring-boot:run
```

Terminal khác: `cd frontend`, `npm ci`, `npm run dev`; mở `http://localhost:5173/admin/dashboard`. Proxy Vite chuyển `/api` đến backend port 8081. Nếu Maven chưa có trong PATH, máy này có `C:/DevTool/IntelliJ IDEA 2026.1/plugins/maven/lib/maven3/bin/mvn.cmd`.

Kiểm thử frontend: `npm test`, `npm run lint`, `npm run build`.

Kiểm thử backend an toàn: `mvn "-Dtest=*Test" test`. Các integration test chỉ chạy khi RUN_MYSQL_INTEGRATION_TESTS=true. Không chạy `mvn test` không chọn lớp: các lớp cũ `BackendApplicationTests` chứa thao tác nhập lại seed.

Sau khi nạp DB_* như trên: `$env:RUN_MYSQL_INTEGRATION_TESTS='true'`, chạy `mvn "-Dtest=DashboardRepositoryIntegrationTest" test`. Các fixture và cập nhật timestamp rollback; không chạy migration/schema/seed.

Kiểm tra API bằng bearer token của Admin: gọi hai endpoint trên; đổi token sang STUDENT để xác nhận 403, bỏ token để xác nhận 401. Có thể dùng Swagger hoặc Network tab. Kiểm tra filter, pagination, bảng gói, tháng không có dữ liệu, Top 5/10 và modal. Người dùng chọn hoàn tất với kiểm thử API, nên chưa xác minh màn hình Dashboard sau đăng nhập trên browser bằng tài khoản Admin thật.

Kết quả cuối: frontend 31/31 tests, lint và production build thành công. Backend `-Dtest=*Test`: 79 trường hợp, 70 passed, 9 integration cases skipped theo cờ môi trường; không lỗi. Riêng DashboardRepositoryIntegrationTest trên MySQL thật: 5/5 passed, gồm overview, active subscription/giá hóa đơn, course progress nhiều bài học, search/filter/page và timezone/popularity. `git diff --check` thành công. Index migration chưa chạy trên database hiện tại.

## File tạo mới

- `backend/src/main/java/com/app/features/admin/controller/DashboardController.java`
- `backend/src/main/java/com/app/features/admin/service/DashboardService.java`
- `backend/src/main/java/com/app/features/admin/repository/DashboardRepository.java`
- `backend/src/main/java/com/app/features/admin/dto/DashboardResponse.java`
- `backend/src/test/java/com/app/features/admin/DashboardSecurityTest.java`
- `backend/src/test/java/com/app/features/admin/DashboardServiceTest.java`
- `backend/src/test/java/com/app/features/admin/DashboardRepositoryIntegrationTest.java`
- `frontend/src/features/admin-dashboard/api.ts`, `useDashboard.ts`, `charts.tsx`, `format.ts`
- `frontend/src/pages/admin-dashboard/AdminDashboardPage.tsx`, `adminDashboard.css`
- `database/20261003_admin_dashboard_indexes.sql`
- `deployment/ADMIN-DASHBOARD.md`

## File sửa

- Backend: `config/SecurityConfig.java`, `security/role/SupportedRolePolicy.java`, `security/jwt/JwtAuthenticationFilter.java`, `utils/ApiPath.java`; `features/auth/exception/UnsupportedAccountRoleException.java`, `features/auth/service/impl/AuthServiceImpl.java`; `features/oauth/service/impl/OAuthAccountServiceImpl.java`, `OAuthAuthorizationCodeServiceImpl.java`.
- Backend tests: `features/auth/service/impl/AuthServiceImplTest.java`, `security/jwt/JwtServiceTest.java`, `security/role/SupportedRolePolicyTest.java`.
- Frontend: `app/router/AppRouter.tsx`, `routeAccess.test.ts`; `entities/user/index.ts`, `model/user.types.ts`, `roles.ts`, `roles.test.ts`; `features/auth/model/AuthProvider.tsx`, `auth.types.ts`, `authRedirect.ts`, `authRedirect.test.ts`, `authSession.ts`, `authSession.test.ts`, `validation.ts`, `validation.test.ts`; `features/auth/ui/LoginView.tsx`, `OAuthCallbackView.tsx`, `UserProfileMenu.tsx`; `shared/api/apiPaths.ts`; `widgets/header/ui/Header.tsx`, `MobileMenu.tsx`.
- Database build: `database/Dockerfile`.
