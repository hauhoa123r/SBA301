# Admin dashboard upgrade — audit and implementation

## Audit (2026-10-22)

| Feature | Existing | Missing | Files affected | Implementation plan |
| --- | --- | --- | --- | --- |
| Users | Student list/search/status/detail, subscription grants, row locks, audit log | Soft delete and session revocation; default exclusion | StudentManagementService/Repository/Controller, StudentManagementPage | Reuse `users.status=DELETED`; lock student, reject ADMIN and self, revoke refresh sessions, retain relational history |
| Courses | Dashboard course list/filter/detail, DECIMAL(15,2) price | Admin price mutation/audit | DashboardController, CoursePriceService, AdminDashboardPage | Narrow PATCH with expected old price, reason, bounds, row lock; preserve status and all invoice snapshots |
| Registrations | Monthly user trend, users.created_at index | Hour/day/month, student scope, source exclusion, previous period, CSV, spike signal | RegistrationAnalyticsService/Controller, RegistrationAnalyticsPage | Aggregate indexed ranges in MySQL, zero fill in Java, Vietnam calendar, exclude known lab accounts by default |
| Learning | lesson_progress watch_seconds/completion, enrollment timestamps, daily activity, threshold settings | Global distinct KPIs, unique enrollment/course completion/start rate, enrollment trend, source filter | LearningAnalyticsService/DTO/Page | Extend existing report and preserve settings/daily/feature views; use lesson evidence and enrolled student cohorts |
| Payments | Invoice and payment snapshots, payOS verified callbacks, refunds | Report/list/detail; reliable paid timestamp | PaymentConverter/Entity, PaymentAnalyticsService/Controller/Page, schema/migration | Payment rows are the reporting unit; SUCCESS only; PROCESSED refunds; UTC paid_at for new confirmations; old unknown dates remain unknown |
| Feedback | Forms, validation, publication states, statistics, concurrency/security tests | No implementation change required | Existing Feedback tests | Preserve all service/UI/API code; run regression suite |
| Overview | KPI, monthly charts, course and plan management | Registration/learning/payment cards and navigation | AdminDashboardPage, ManagementShell, router | Reuse reports/charts and common date controls; retain existing modules |

## Data and business rules

- Current checkout sells PREMIUM subscriptions, not individual courses. Course `price=0` is a catalog price classification, **not** a free-access entitlement. Editing price does not change publication state, subscription access, legacy access or re-enable course checkout. Pending/paid invoice and payment amounts remain snapshots.
- `users.status` already supports DELETED. Deletion is terminal through student management; no physical rows or financial/learning/Feedback history are removed. Audit stores actor, target endpoint, timestamp, reason and state. Personally identifiable data remains restricted to authorized administration and financial retention; no automatic anonymization of invoices. A separate reviewed retention task must assess erasure of profile/avatar/contact data and audit PII after applicable retention obligations, preserving IDs and required financial evidence. This upgrade does not invent a legal retention period.
- Registration counts are historical STUDENT accounts (excluding ADMIN), including later deleted/disabled accounts. Active account counts are separate. Known lab accounts are identified through ADMIN_ACCOUNT_CREATE / ACTIVITY_RUN audits or user_learning_rules. Unmarked seed/bot data cannot be reliably identified and is explicitly disclosed. High hourly volume is a review signal, not an attack verdict.
- Learning totals use DISTINCT user IDs. A lesson start requires watch_seconds > 0 or completion. Course starts are restricted to enrolled students; enrollment alone is not learning. Legacy daily activity remains distinct from lesson evidence. A source toggle permits explicit inclusion of lab data.
- Payment analytics use payments, not invoice+payment totals. SUCCESS amounts are gross revenue; only PROCESSED refund amounts reduce net revenue. Date-filtered amounts use payment confirmation time, refunds use processed_at. Unknown historical dates are disclosed and excluded from dated metrics. Net is unavailable while any successful payment has an unknown confirmation date, or processed refunds lack timestamps or fail reconciliation. Lifetime revenue includes successful payments with unknown dates. A separate list filter exposes those unknown-date successes without inventing dates.
- `paid_at` is UTC DATETIME(6), set at the first verified success observed by the application. It is a confirmation timestamp, not a guessed bank settlement time. No backfill from updated_at. MySQL-generated TIMESTAMP dates use epoch conversion; application-written Instants use UTC wall values, matching the existing Hibernate mapping.

## Deployment

1. Back up and restore a copy to isolated MySQL 8; record financial row counts/sums and existing access rights.
2. Review/run `database/migrations/20261022_admin_dashboard.sql` on that copy (then replay it). This is additive; it does not backfill unknown payment dates or touch old amounts.
3. Run schema guards, backend security/analytics/payment/Feedback tests and frontend checks against independent test databases.
4. Apply the reviewed migration before deploying backend/frontend; smoke test login, deletion/session rejection, price changes, pending checkout, callbacks, reports and Feedback.
5. Roll back application images if needed; leave the nullable additive column/index in place. Never import schema.sql/data.sql into an existing environment.

No production migration or production data mutation is authorized by this implementation run.

## Báo cáo triển khai

### Chức năng

- Overview mới tại `/admin/dashboard`: sáu KPI, năm biểu đồ, bộ lọc chung và liên kết tới sáu module quản lý. Màn thống kê gói/danh mục cũ được giữ tại `/admin/catalog-dashboard`; các trang gói học, chấm bài, cài đặt và Activity Lab vẫn tồn tại.
- Học viên: giữ tìm kiếm/lọc/chi tiết/khóa/mở khóa/cấp gói; thêm xóa mềm có dialog, lý do và audit. Không cho tự xóa, xóa ADMIN hoặc tài khoản đồng thời có vai trò ADMIN. Không mở lại DELETED qua thao tác đổi trạng thái. Thu hồi refresh sessions, dừng rule hoạt động; session mới phải khóa dòng user và kiểm tra trạng thái để tránh đăng nhập đồng thời với xóa.
- Khóa học: trang riêng `/admin/courses`, giữ danh sách/tìm kiếm/lọc/chi tiết; thêm sửa giá có hai bước xác nhận, lý do, kiểm tra giá cũ và audit. Hai phiên sửa đồng thời chỉ một phiên lưu thành công, phiên còn lại nhận 409. Tiền dùng BigDecimal/DECIMAL(15,2), giao diện quản trị giữ tối đa hai chữ số thập phân.
- Đăng ký: Hour/Day/Month, date range, tổng và kỳ trước, zero fill, CSV, tooltip và tín hiệu tăng đột biến theo giờ. Hour cộng cùng khung giờ trên khoảng chọn; tín hiệu bất thường vẫn chỉ rõ ngày/giờ thực tế.
- Học tập: tổng enrollment khác học viên duy nhất; KPI bắt đầu học và hoàn thành ≥1 lesson riêng biệt, thống kê từng khóa, tỷ lệ bắt đầu và xu hướng ghi danh ngày/tháng. Giữ báo cáo ngày, mốc phút, danh sách học viên, phân trang, thống kê tính năng và cấu hình mốc cũ. Dùng bộ lọc thời gian chung; tìm kiếm chỉ gửi khi áp dụng.
- Thanh toán: KPI gộp/ròng, biểu đồ thời gian và trạng thái, doanh thu từng sản phẩm COURSE/SUBSCRIPTION, tìm kiếm/lọc ngày/trạng thái/phân trang/chi tiết; có chế độ tra cứu SUCCESS thiếu ngày riêng. Không thêm thao tác hoàn tiền. Callback legacy course cũng kiểm tra số tiền snapshot, thay vì so với giá danh mục mới.
- Feedback: không sửa service, UI, trạng thái, dữ liệu hoặc API; chạy lại kiểm thử integration, security, concurrency và frontend validation.

### API mới và API tái sử dụng

| API | Loại | Hành vi |
| --- | --- | --- |
| `DELETE /api/admin/students/{id}` | Mới | Body `{reason}`; xóa mềm, thu hồi session và audit trong một transaction |
| `PATCH /api/admin/dashboard/courses/{id}/price` | Mới | Body `{price, expectedPrice, reason}`; khóa dòng, kiểm tra ghi đè, chỉ sửa giá |
| `GET /api/admin/registration-analytics` | Mới | `from,to,mode=hour/day/month,includeLab=false`; tối đa 731 ngày |
| `GET /api/admin/payments` | Mới | `from,to,mode,search,status,page,size,unknownOnly=false`; số liệu tổng hợp và trang giao dịch; unknownOnly chỉ đổi phạm vi danh sách |
| `GET /api/admin/payments/{id}` | Mới | Chi tiết từ snapshot giao dịch/hóa đơn, số hoàn tiền PROCESSED |
| `GET /api/admin/learning-analytics` | Mở rộng API cũ | Thêm summary, enrollmentTrend, uniqueStudents/courseCompletionCount/startRate và includeLab; giữ dữ liệu cũ, tối đa 93 ngày |
| `/api/admin/students`, `/{id}`, `/status`, `/subscription/*` | Tái sử dụng | Mặc định danh sách bỏ DELETED, lọc DELETED để xem lịch sử; giữ chức năng cũ |
| `/api/admin/dashboard`, `/courses` | Tái sử dụng | Giữ contract; doanh thu sửa sang payments SUCCESS, thời gian dùng paid_at |
| `/api/admin/subscription-plans`, `/api/admin/feedback/**` | Tái sử dụng | Giữ nghiệp vụ/contract |

Mọi endpoint quản trị được bảo vệ bởi SecurityConfig và `@PreAuthorize`, trả `Cache-Control: no-store`. Actor lấy từ principal, không nhận actor ID từ request body.

### File tạo/sửa

Đường dẫn tương đối từ root repository:

- Backend mới: `features/admin/service/{AnalyticsRange,AnalyticsScope,CoursePriceService,RegistrationAnalyticsService,PaymentAnalyticsService}.java` và `features/admin/controller/{RegistrationAnalyticsController,PaymentAnalyticsController}.java` dưới `backend/src/main/java/com/app/`.
- Backend sửa: `features/admin/controller/{DashboardController,LearningAnalyticsController,StudentManagementController}.java`, `features/admin/dto/LearningAnalytics.java`, `features/admin/repository/{DashboardRepository,StudentManagementRepository}.java`, `features/admin/service/{LearningAnalyticsService,StudentManagementService}.java`, `features/auth/repository/{UserRepository,RefreshSessionRepository}.java`, `features/auth/service/RefreshSessionService.java`, `features/model/PaymentEntity.java`, `features/payments/converter/PaymentConverter.java`, `features/payments/service/impl/PaymentCallbackServiceImpl.java`.
- Frontend mới: `frontend/src/features/admin-dashboard/{analytics.tsx,analyticsModel.ts}`, `frontend/src/pages/admin-dashboard/{OverviewDashboardPage,RegistrationAnalyticsPage,PaymentAnalyticsPage}.tsx`.
- Frontend sửa: `frontend/src/app/router/AppRouter.tsx`, `frontend/src/features/admin-dashboard/{management.ts,format.ts}`, `frontend/src/pages/admin-dashboard/{AdminDashboardPage,LearningAnalyticsPage,StudentManagementPage,ManagementShell}.tsx`, `frontend/src/pages/admin-dashboard/adminDashboard.css`.
- Schema/migration: `database/schema.sql`, `database/migrations/20261022_admin_dashboard.sql`, `database/jpa-schema-contract.tsv`, `database/generate-schema-check.py`, `database/tests/check-schema.sql`, `backend/src/test/resources/schema/jpa-schema-contract.tsv`. Migration thêm nullable paid_at và hai index; không thay đổi số tiền hoặc backfill ngày lịch sử. Không cần migration trạng thái user vì DELETED đã có.
- Test mới: `backend/src/test/java/com/app/features/admin/{AdminUpgradeMySqlTest,AnalyticsRangeTest,AnalyticsSecurityTest}.java`, `database/tests/admin_dashboard_mysql_regression.py`, `frontend/tests/run-admin-browser-audit.mjs`.
- Test sửa để kiểm tra nguồn doanh thu mới: `DashboardRepositoryIntegrationTest`, `DashboardSecurityTest`, `PaymentCallbackServiceImplTest`. `database/tests/fresh_initialization.py` được mở rộng tùy chọn tái sử dụng JVM và áp dụng migration mới khi so sánh chain cũ.

### Giới hạn dữ liệu và vận hành

- Không đoán ngày thanh toán cũ từ updated_at. `paid_at` là ngày ứng dụng xác nhận, chưa có nguồn bank settlement timestamp chuẩn hóa. Dữ liệu cũ cần đối soát riêng nếu muốn phân bổ vào ngày/tháng.
- Chỉ báo cáo trạng thái đã lưu; mở màn analytics không tự gọi payOS để đồng bộ từng giao dịch. Giao dịch chưa được webhook/sync xác nhận có thể vẫn mang trạng thái CREATED.
- Không thể phân biệt seed/bot không có marker đáng tin cậy. Activity Lab được loại bằng dấu vết hiện có và có tùy chọn bao gồm lại; không sửa/xóa dữ liệu Lab hoặc Feedback.
- Chưa tự động ẩn danh/xóa PII khỏi lịch sử. Phương án retention cần được thống nhất riêng trước thao tác dữ liệu cá nhân; bản nâng cấp chỉ chặn truy cập và giữ dữ liệu phục vụ đối soát.
- Chưa chạy trên production, chưa chạy Docker daemon hoặc gọi payOS thật. Kiểm thử dùng MySQL 8 native riêng/H2; browser dùng API fixtures riêng và không ghi tới backend thật.

### Kết quả kiểm thử cuối

| Kiểm tra | Kết quả |
| --- | --- |
| Toàn bộ backend trên MySQL 8.0.45 riêng và H2 | 278 tests: **277 passed, 0 failures, 0 errors, 1 skipped** |
| Kiểm thử bị skip | `PostRefactorAuthHttpTest.chromeSessionLifecycleWithThreeRealTabs`: kiểm thử browser xác thực tùy chọn, chưa bật `RUN_AUTH_BROWSER_TESTS`; các kiểm thử xác thực HTTP/MySQL vẫn chạy |
| Admin upgrade MySQL | 9/9 passed: quyền/tài khoản ADMIN, token/session sau xóa, chống tạo session trễ sau xóa, lịch sử tài chính/học tập, giá snapshot và hai phiên sửa đồng thời, timezone, source, zero fill, distinct, refund, search/pagination |
| Feedback backend regression | 22/22 passed: 14 integration + 5 security + 3 concurrency; không sửa mã Feedback |
| Frontend Vitest | 61/61 passed, gồm Feedback validation |
| Frontend lint và production build/TypeScript | Passed |
| Database Python unit tests | 26/26 passed |
| Migration từ schema trước nâng cấp và chạy lại | Passed; sentinel invoice/payment giữ nguyên số tiền, ngày cũ vẫn NULL, ngày đã xác nhận giữ nguyên khi replay |
| Fresh schema so với chain SQL cũ + migration mới | Passed: 59 bảng, schema/keys/checks/defaults và nội dung học tập khớp; seed replay không đổi dữ liệu |
| Backend artifact thực tế | Package thành công; Hibernate validate và HTTP health UP trên MySQL riêng |
| Chrome UI audit với API fixtures | Passed: 6 KPI/5 charts; không tràn trang ở 1440/820/390px; 24 bucket giờ; tooltip bàn phím; lỗi/retry; xác nhận giá và xóa; chi tiết thanh toán; màn Learning và Feedback không có uncaught JS error |
| Schema contract generator và `git diff --check` | Passed |

Artifacts backend cuối: `backend/target/consolidated-mysql-48871aa055c445bbb67d577326335095/` (`admin-upgrade-result.json`, `maven-summary.json`, `maven.log`, `package.log`, `spring-boot.log`). Kết quả so sánh chain: `backend/target/consolidated-mysql-6bd3ab45dc8545cf9aba942eb24d0bb7/result.json`. Browser: `backend/target/admin-browser/browser-summary.txt` và `overview-{1440,820,390}.png`. Đây là artifacts local trong thư mục build, không chứa dữ liệu production.

Lệnh tái lập từ root (PowerShell/Windows; cần JDK, Maven cache, MySQL native và Chrome như môi trường hiện tại):

```powershell
python database/tests/admin_dashboard_mysql_regression.py --all
python database/tests/fresh_initialization.py --compare-legacy
python -m unittest discover -s database/tests -p 'test_*.py'
python database/generate-schema-check.py --check
npm.cmd --prefix frontend run lint
npm.cmd --prefix frontend test
npm.cmd --prefix frontend run build
node frontend/tests/run-admin-browser-audit.mjs
```

Không có lỗi kiểm thử còn mở trong phạm vi đã chạy. Production rollout vẫn cần backup/restore, đối soát dữ liệu thật, review và áp dụng migration trước backend theo các bước Deployment phía trên.
