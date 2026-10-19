# Post-refactor authentication security audit

Ngày kiểm toán: 18/10/2026, Asia/Saigon. Phạm vi: source hiện tại của Spring Boot 3.5.7 monolith, React/TypeScript/Axios và MySQL 8. Không triển khai hoặc thay đổi database đang sử dụng.

## A. Executive Summary

Đã đọc lại code và kiểm chứng độc lập báo cáo `JWT_TOKEN_STORAGE_REFACTOR.md`. Workspace vốn có nhiều thay đổi chưa commit từ lần refactor; audit này bổ sung trên trạng thái đó, không hoàn tác chúng. Danh sách tại phần E chỉ mô tả phần bổ sung của lượt audit này.

Kiến trúc memory access token + HttpOnly refresh cookie đã được triển khai thực tế. Login/refresh/OAuth exchange không serialize refresh token; API nghiệp vụ không nhận danh tính từ refresh cookie hoặc OAuth HttpSession. Rotation dùng transaction và khóa bản ghi; không tìm thấy đường cấp credential từ token cũ trong cửa sổ 5 giây.

Tìm thấy và sửa lỗi logout liên tab, khôi phục phiên sau logout thất bại, request/401 thuộc phiên cũ, lộ credential qua logging lỗi Axios và React snapshot, xử lý lỗi server logout, cùng validation cấu hình CORS. Không phát hiện đường IDOR/BFLA mới có thể khai thác trong các endpoint đã rà soát; kết luận này có giới hạn như phần G, không phải chứng nhận mọi tổ hợp endpoint/input đều an toàn.

Kết luận: **READY WITH CONDITIONS**. Lượt cuối có 256 backend tests PASS, không failures/errors/skips; frontend 61 tests PASS, build/lint PASS; migration trên MySQL cô lập và Chrome lifecycle đã chạy thật. Các điều kiện staging/rollout và rủi ro được ghi tại phần H; các tests này không thay thế nghiệm thu production.

## B. Verified Architecture

1. **Login:** GET `/api/auth/csrf` lấy token CSRF; POST `/api/auth/login` gửi Origin được cho phép và header CSRF. `AuthServiceImpl.login` kiểm tra mật khẩu/status/role. Controller đăng ký refresh session và gửi cookie. JSON chỉ có access token và user. Frontend chỉ giữ access token trong module memory.
2. **API:** Axios lấy Bearer từ memory. `JwtAuthenticationFilter` kiểm tra chữ ký, expiry, type=access, credential stamp, status và roles hiện tại trong DB. JWT role claim không thay thế DB roles. `RequestAttributeSecurityContextRepository` không tải OAuth identity từ HttpSession cho request nghiệp vụ.
3. **Refresh:** POST `/api/auth/refresh` chỉ đọc `refresh_session`. `RefreshSessionService.rotate` xác minh JWT rồi khóa `sid` bằng `PESSIMISTIC_WRITE`. DB chỉ giữ SHA-256 của raw refresh token. Token mới có UUID JTI; SID và thời điểm hết hạn tuyệt đối của phiên giữ nguyên. Response trả access/user và thay refresh cookie.
4. **F5/tab mới:** `AuthProvider` đợi initialization trước khi render children; initialization dùng một Promise ngay cả trong StrictMode. Refresh hợp lệ khôi phục memory. Cookie không hợp lệ dẫn đến anonymous, không refresh vòng lặp. Nếu có ý định logout đã lưu, initialization không tự refresh.
5. **Logout:** frontend ghi metadata logout, xóa memory ngay và thông báo các tab qua storage event. Request cookie được tuần tự hóa bằng Web Locks, hoặc queue trong tab nếu không có Web Locks. Server khóa/thu hồi session rồi xóa cookie. Chỉ HTTP thành công mới xác nhận server logout. Exception thu hồi trả 500 rõ ràng, giữ refresh cookie để retry. Client giữ `pending=true`, thử lại khi mount, online hoặc focus; không tự phục hồi phiên khi F5.
6. **OAuth:** authorization request/state dùng HttpSession. Callback URL mang code exchange ngẫu nhiên dùng một lần, không mang access/refresh JWT. Exchange dùng cùng CSRF/Origin/cookie contract với login. Mã code được hash, khóa khi consume và có TTL 60 giây. OAuth Google/Facebook thật chưa được chạy trong audit này.

### Cookie và browser storage

| Tên | Nội dung/mục đích | Chính sách xác minh |
|---|---|---|
| `refresh_session` | Refresh JWT; JavaScript không cần đọc | HttpOnly; production Secure=true; Path=`/api/auth`; SameSite=Lax mặc định; host-only, không Domain; Max-Age không vượt thời hạn JWT. Logout xóa đúng tên/path/host-only. |
| `XSRF-TOKEN` | CSRF token ngẫu nhiên, **không phải JWT** | HttpOnly; JavaScript lấy giá trị qua JSON của GET csrf. Path/Secure/SameSite theo auth cookie. Session cookie, không có persistent Max-Age như refresh. |
| `JSESSIONID` | ID HttpSession phục vụ OAuth state, **không phải JWT** | Production HttpOnly/Secure/SameSite=Lax. Logout invalidate session và xóa cookie ở context path. Cookie đơn lẻ không xác thực API nghiệp vụ. |
| `learning-platform.logout` | LocalStorage metadata `{id,pending}`, **không phải cookie/token/user** | Đồng bộ logout và giữ ý định logout sau F5/đóng mở browser. Explicit login thành công xóa marker. |
| `oauthReturnTo` | SessionStorage chứa đường dẫn nội bộ | Không chứa JWT. Redirect helper giới hạn đường dẫn nội bộ và quyền route. |

Source scan toàn bộ `frontend/src`, `backend/src/main/java` và cấu hình không tìm thấy đường ghi access/refresh vào localStorage, sessionStorage hoặc IndexedDB. Các key `token`, `refreshToken`, `user` chỉ còn dùng để xóa dữ liệu legacy trong code runtime. Các giá trị giả được ghi trong unit test không phải persistence của ứng dụng. Không tìm thấy error tracking SDK hoặc redirect chứa JWT.

`TokenResponse.toString()` che credential. Đã loại các lệnh console ghi nguyên lỗi Axios ở learning flows; các console còn lại xử lý lỗi audio/clipboard, không phải response HTTP có Authorization. Access token không còn nằm trong snapshot của React external-store hook; React context chỉ có user, initializing và setter. Điều này không ngăn người có debugger/XSS đọc memory của JavaScript.

### Transaction và cửa sổ reuse 5 giây

`RefreshSessionService.java:44` dùng `@Transactional(noRollbackFor = ResponseStatusException.class)`: `revoked=true` phải commit dù caller nhận 401. `RefreshSessionRepository.findLocked` khóa hàng theo primary key SID. Đây là lock DB, có tác dụng giữa nhiều thread/process; không dựa vào khóa memory của backend.

Nếu hash không trùng và `rotatedAt + 5s > now`, request nhận **409, không access token, không refresh token và không Set-Cookie xóa đè**. Ngoài cửa sổ này, service thu hồi session và trả 401. Cửa sổ tính từ lần rotation gần nhất, không chỉ từ thời điểm token đang bị replay từng còn hợp lệ.

Attacker giữ token đã cũ không thể đổi nó lấy credential trong cửa sổ. Tuy nhiên, người giữ token hiện hành bị đánh cắp có thể thắng cuộc đua refresh; cơ chế bearer không phân biệt attacker với chủ phiên. Rotation liên tục có thể kéo dài thời gian các replay cũ chỉ nhận 409; nó không tạo một token hợp lệ thứ hai. Reuse ngoài cửa sổ có thể bị lợi dụng để gây từ chối dịch vụ cho chính phiên đã bị lộ token.

Trường hợp hợp lệ có thể bị thu hồi nhầm: response rotation bị mất, tab bị treo, browser không có Web Locks, retry đến sau hơn 5 giây với cookie cũ. Trong 5 giây caller nhận 409 và client dừng có kiểm soát; sau 5 giây cùng tình huống có thể thu hồi cả phiên. Audit giữ chính sách này, không thêm grace cấp lại credential. Cần coi đây là trade-off security/availability, không khẳng định multi-tab luôn đúng trên mọi browser.

## C. Vulnerability Findings

Line trong bảng tham chiếu source cuối audit; cột evidence giải thích hành vi trước sửa.

| ID | Severity | Vulnerability / root cause | Evidence | Status |
|---|---|---|---|---|
| AUTH-01 | High | Logout lỗi mạng/server không giữ ý định logout; F5 tự refresh cookie còn hiệu lực và khôi phục phiên | `authApi.logout`, `axiosClient.initializeAuth`; regression `logoutSecurity.test.ts` tái hiện marker thiếu và reload authenticated trước sửa. Bản sửa tại `authMemory.ts:51`, `authApi.ts:38`, `AuthProvider.ts:16`. | FIXED; regression và browser offline/F5 kiểm chứng |
| AUTH-02 | Medium | Tab khác tiếp tục giữ access/user sau logout; chỉ có Web Locks, không có thông báo logout | Trước sửa không có storage/BroadcastChannel listener. Test storage event vẫn thấy old access. `authMemory.ts:77` nay xóa memory/version ở tab nhận; Web Locks ngăn response cookie vượt logout. | FIXED; unit + 3 tab Chrome |
| AUTH-03 | Medium | 401 đến muộn có thể replay request của phiên cũ bằng Bearer của login mới; retry 401 còn xóa login mới | `axiosClient.ts:51,70`; regression trước sửa thấy `another-login` bị xóa. Request mang `_authVersion`; interceptor từ chối xử lý phiên khác trước retry/clear. | FIXED; Axios regressions |
| AUTH-04 | Medium | Console ghi nguyên AxiosError có thể lộ `config.headers.Authorization` | `useLearningDashboard.js:54` catch; `LearnCourseLayout.jsx:91,184` hai catch fetch/progress. Đã bỏ cả ba raw error console; UI error handling giữ nguyên. | FIXED; source evidence, build/lint |
| AUTH-05 | Low | Access token nằm trong React external-store snapshot, có thể xuất hiện trong hook debugging | `AuthProvider` trước dùng `getAuthState` chứa accessToken. Nay dùng `getAuthViewState` tại `AuthProvider.tsx:12`, chỉ trả user/initializing. | FIXED; snapshot assertion + browser provider |
| AUTH-06 | Medium | Login/OAuth đã queue có thể bắt đầu gửi sau logout; request auth không có timeout, có thể giữ cookie lock vô hạn | `authApi.ts:18,28`; regression trước sửa xác nhận login đã gửi dù logout xảy ra trước khi lock được cấp. Nay kiểm tra version bên trong lock, kiểm tra lại response và timeout 15 giây. | FIXED; queued-login regression |
| AUTH-07 | Low | Exception trong logout handler bị error dispatch đổi 500 thành 401, làm sai contract khi thu hồi không hoàn tất | HTTP regression đầu tiên `failedServerLogoutDoesNotReportSuccessAndCanBeRetried`: expected 500, actual 401. `SecurityConfig.java:90,100` nay giữ cookie, trả 500 rõ ràng, retry được. | FIXED; HTTP regression |
| AUTH-08 | Low | CORS validation chỉ loại wildcard/null literal, vẫn nhận origin rỗng/path/query/userinfo và ném NPE cho null entry | `AuthCorsConfigurationTest`: 10/14 failures trước sửa. `CorsConfig.java:39` nay chỉ nhận HTTP(S) origin có host, không path/query/fragment/userinfo, port hợp lệ. Đây là lỗi cấu hình/availability; không chứng minh bypass allowlist. | FIXED; 14 configuration cases |

Đã làm thêm hai chốt chặn trong cùng scope: migration browser storage không làm văng logout khi browser cấm storage; callback UI logout không xóa user/điều hướng đè một login mới. Không thay đổi business rules STUDENT/ADMIN, giới hạn CSRF hay cấu trúc monolith.

### Authorization thực tế, bao gồm tầng Service

| Nhóm API | Biên quyền và object ownership đã đọc | Bằng chứng thực thi / giới hạn |
|---|---|---|
| Public | GET courses/detail chỉ PUBLISHED; converter public không trả video/documents/câu hỏi-đáp án nội dung học. GET plans/current feedback công khai theo code. | `SecurityAuditIntegrationTest.publicReadApisWorkAndUnknownRoutesAreDenied`, repository/catalog tests, feedback security tests. |
| Student profile | GET/PATCH `/api/users/{id}`, orders, change-password: controller STUDENT; `UserProfileServiceImpl.findUser` so ID với SecurityUtils. Password không lấy owner từ email body. DTO profile chỉ cho fullName. | Foreign read/orders/update 403; service gọi trực tiếp cũng từ chối owner khác; overposting không đổi roles/status/password. |
| Learning | Controller lấy userId từ principal; `CourseAccessService.requireAccess` kiểm tra published và quyền subscription/legacy. Lesson/quiz/assignment lookup ràng buộc course; progress/submission lookup ràng buộc user. | Learning MVC + service + MySQL progress suites; không coi JWT hợp lệ là đủ quyền học. Không thử mọi tổ hợp ID trên mọi activity. |
| Payments/subscriptions | Controller lấy userId từ SecurityUtils. `PaymentStatusServiceImpl.syncPayment` so invoice owner; create tính user/giá/gói từ DB. Webhook public xác minh checksum/gateway amount. | Foreign invoice sync 403 và DB không đổi; trial bỏ qua spoofed userId; webhook giả không cấp quyền; payment service unit tests. Không giao dịch PayOS thật. |
| Admin | Toàn bộ `/api/admin/**` yêu cầu ADMIN; controller có method security. Đã đọc student management, assignment review, dashboard, authentication settings và feedback service. `lockStudent` không cho quản lý admin như student; grading ràng buộc enrollment. | STUDENT bị 403 ở GET/POST/PUT/PATCH admin trong security suites. Các admin service chủ yếu tin controller caller, không có role annotation trên mọi method; chưa tìm thấy route student gọi vòng qua biên này. Đây là lưu ý khi tái sử dụng service. |
| Feedback | Principal cung cấp userId; service kiểm tra form state/revision, question thuộc form, option thuộc question và giới hạn submit. Admin text answers ràng buộc question/form. | Security, integration và concurrency suites. |
| Auth/OAuth | Cookie mutations có CSRF + exact Origin; me có Bearer; register ép STUDENT; đổi/reset mật khẩu làm mất hiệu lực credential stamp. | Token storage, HTTP, security audit, auth-service tests. OAuth code exchange/handshake dùng MockMvc; provider thật chưa chạy. |
| File upload | Không tìm thấy controller MultipartFile/RequestPart/upload trong source hiện tại | NOT RUN / không áp dụng. URL document/attachment tồn tại không đồng nghĩa có upload endpoint. |

`SecurityAuditIntegrationTest` có matrix 34 protected method/path cho guest và malformed token, cùng admin subset cho STUDENT. Các suite khác bổ sung feedback và activity/admin cases. Expired/wrong-signature/refresh-as-access/disabled-user được kiểm tra ở filter/API đại diện; **không** tuyên bố đã chạy mọi tổ hợp token × endpoint. Các endpoint/method chưa được phân loại bị deny-all, bao gồm DELETE route không tồn tại. Chưa sử dụng Postman GUI; HTTP trực tiếp và MockMvc không phải Postman.

Origin/CORS không phải authorization cho Postman hoặc client ngoài browser: các client đó có thể tự đặt Origin. Việc chặn truy cập dữ liệu/quyền nằm ở JWT verification, role checks và owner checks trên server, không ở việc request đi qua frontend.

## D. Test Evidence

Định nghĩa: **PASS** đã chạy thành công; **FAIL** đã chạy và assertion/lệnh thất bại; **NOT RUN** chưa chạy; **BLOCKED** thiếu điều kiện cần thiết.

### Lệnh và artifact

```powershell
# Từ frontend
npm.cmd test
npm.cmd run build
npm.cmd run lint

# Từ root: tạo mới datadir, xác minh @@datadir, migration và full Maven suites
python backend/tests/run_auth_mysql_audit.py --with-browser

# Schema source contract; không kết nối DB
python database/generate-schema-check.py --check
git diff --check
```

`npm.cmd` tránh ExecutionPolicy của PowerShell; không thay đổi policy hệ thống. Maven dùng cache offline sẵn có `.deployment-check/m2` vì default cache `C:\.m2\repository` không ghi được. Runner dùng Java 17 và MySQL native 8.0.45; Docker daemon không khả dụng. `--with-browser` gọi Chrome headless với profile riêng, Vite riêng và backend H2 trên loopback/random port, không dùng browser session/credential của người dùng.

Chrome trong sandbox Windows ban đầu không khởi tạo được GPU/renderer/CDP. Đã chạy lại bằng quyền thực thi ngoài sandbox cho môi trường test riêng; không tắt Spring Security/CSRF hoặc Chrome sandbox. Harness dùng `--disable-gpu --in-process-gpu` và CDP; không cài thêm Playwright/Cypress. Browser xác minh là Chrome 155.0.8059.80.

| Check | Kết quả thực thi |
|---|---|
| Baseline frontend trước audit | PASS 49 tests. |
| Regression trước sửa | FAIL có chủ đích: stale retry 401 xóa login mới; logout tests phát hiện không sync/không giữ ý định/queued login vẫn gửi; CORS 10/14 failures; HTTP server-logout lỗi 401 thay vì 500. |
| Frontend cuối | PASS 61 tests / 10 files; build PASS; lint PASS. |
| Maven + MySQL + Chrome cuối | **PASS: 256 tests, failures=0, errors=0, skipped=0**, Java 17, `reuseForks=false`; kết thúc 22:25:46 ngày 18/10/2026 Asia/Saigon. |
| MySQL migration | PASS: schema trước khi có refresh table, seed data, migration hai lần, giữ checksum users/courses/enrollments/progress và refresh sentinel qua lần hai; SQL schema guard. |
| MySQL refresh service | Hai thread InnoDB: một 200, một 409; reuse revocation commit; logout bằng token trước rotation thu hồi token hiện hành. |
| Real HTTP | Java HttpClient → Tomcat → security filters → service/DB: CSRF/Origin/form/preflight/cookie-only deny; token sửa/hết hạn/revoked/password change/disable; logout hết access/refresh; concurrent rotation/logout; lỗi thu hồi và retry. |
| Chrome | AuthProvider/ProtectedRoute thật trong test harness; login/F5, HttpOnly tại path khớp, 12 HTTP 401 dùng một refresh, ba tab/Web Locks, delayed refresh response sau logout, offline/retry, F5 sau logout và browser reopen. Đây không phải toàn bộ UI dashboard/course/payment E2E. |
| Schema contract / diff whitespace | `generate-schema-check.py --check` và `git diff --check`: PASS. |
| Postman GUI, OAuth provider thật, production HTTPS | NOT RUN / BLOCKED theo phần G. |

Một lượt shared-JVM Maven sau bổ sung test đã FAIL 8 assertions HTTP và 6 lỗi JPA metadata (SubscriptionIntegrationTest/JpaSchemaContractTest). HTTP trả 401 ngay ở csrf; JPA báo UserEntity không thuộc persistence unit. Chạy HTTP riêng cho phép xác minh ứng dụng; runner cuối đặt `-DreuseForks=false` để mỗi test class có JVM riêng. Đây là giới hạn/hướng xử lý cô lập test; chưa chứng minh root cause sâu hơn của lỗi shared-JVM và không sửa CI/CD ngoài scope. Không gọi lượt FAIL này là PASS.

Một lượt cô lập tiếp theo có 255 tests pass và một browser-harness failure: assertion chạy trên document cũ trước khi F5 hoàn tất. Harness đã được sửa để chờ document ID mới, và dùng cổng CDP riêng để tránh file-lock `DevToolsActivePort` trên Windows khi mở lại Chrome. HTTP/Chrome suite sau sửa đã chạy riêng 8/8 PASS. Các lỗi harness này không được tính là lỗ hổng production hoặc che bằng cách bỏ assertion.

### Refresh matrix

| ID | Kết quả và phạm vi |
|---|---|
| RT01 | PASS: token cookie hợp lệ trả access mới/refresh cookie mới qua HTTP. |
| RT02 | PASS: signed refresh quá hạn trả 401. |
| RT03 | PASS: sửa chữ ký refresh trả 401. |
| RT04 | PASS: DB revoked trả 401. |
| RT05 | PASS: token cũ nhận 409 trong cửa sổ, 401 ngoài cửa sổ; không cấp credential. |
| RT06 | PASS trong service H2, HTTP H2 và service MySQL: chỉ một winner cho cùng token. |
| RT07 | PASS: 12 simultaneous 401, một refresh trong Axios tests và HTTP thật từ Chrome. |
| RT08 | PASS ở adapter test: refresh 500 kết thúc, không retry vô hạn. Không giả nhận đây là lỗi server 500 trong browser. |
| RT09 | PASS: backend HTTP 409 không trả Set-Cookie; frontend adapter xử lý một failure rồi dừng. |
| RT10 | PASS: refresh token trước/sau rotation không cấp access sau logout. |
| RT11 | PASS với 3 tab Chrome có Web Locks; fallback browser không Web Locks chưa có E2E. |
| RT12 | PASS: unit epoch test và Chrome giữ response refresh bằng CDP tới sau logout intent; không phục hồi memory, logout xử lý sau response cookie. |

### Logout và session lifecycle matrix

| Scenario | Status / bằng chứng |
|---|---|
| Normal logout; expired access; expired refresh; revoked token | PASS qua HTTP; cookie clear đúng scope; 401 khi refresh lại. |
| Server revocation exception | PASS qua HTTP: 500, không 204; request retry thành công và token cũ bị từ chối. Frontend mock 500 giữ pending intent. |
| Network offline/online | PASS adapter + Chrome network emulation; harness phát online event sau khi nối lại để kiểm tra handler retry. Không khẳng định đã mô phỏng mọi cơ chế phát online event của OS. |
| Logout cùng refresh; tab A logout/tab B,C mở; stale response | PASS HTTP concurrency + unit + Chrome CDP response hold/storage events/Web Locks. |
| Login/F5; F5 ngay sau logout; đóng/mở Chrome cùng profile | PASS: harness chờ document ID mới sau F5; browser được đóng/mở lại với cùng profile test. |
| Access bị từ chối trong lúc học; concurrent 401 | PASS transport; không chạy toàn bộ giao diện/bài học/video E2E. |
| Password change/admin disable | PASS backend next-request access/refresh checks. UI không có push revocation; cập nhật khi gọi API. Không chạy admin UI khóa user trong browser. |
| Refresh cookie bị xóa | PASS HTTP không cookie → 401 và initialization adapter test. Không thêm browser cookie-deletion E2E. |
| Backend restart giữ phiên | NOT RUN dưới dạng restart process thật. Source dùng DB session và secret ngoài process; đây là nhận xét kiến trúc, không phải kết quả thực thi. |
| OAuth login/callback | PASS MockMvc exchange một lần/state handshake/error callback; BLOCKED provider E2E thật. |
| Storage bị browser chặn | PASS unit: logout vẫn clear memory; không đảm bảo metadata tồn tại qua reload nếu browser không cho lưu. |

## E. Code Changes

| File / method | Thay đổi trong audit này |
|---|---|
| `backend/.../config/SecurityConfig.java`, logout handlers | Trả lỗi thu hồi chính xác; giữ refresh cookie khi revoke thất bại, chỉ clear khi thành công. |
| `backend/.../config/CorsConfig.java`, `validOrigin` | Validation origin literal đầy đủ; không nới CORS credentials. |
| `frontend/src/shared/api/authMemory.ts` | Public React snapshot; token-free logout intent; sync storage event; explicit login clear marker; Promise-safe Web Locks callback. |
| `frontend/src/shared/api/axiosClient.ts`, interceptors/refresh | Request epoch, không retry/xóa phiên mới từ 401 cũ; chặn refresh sau logout intent. |
| `frontend/src/features/auth/api/authApi.ts` | Kiểm tra epoch lúc được cấp lock; timeout cookie mutations; single-flight retry/confirm logout. |
| `frontend/src/features/auth/model/AuthProvider.tsx` | Subscribe snapshot không token; retry pending logout trên mount/online/focus. |
| `frontend/src/features/auth/model/authSession.ts` | Legacy cleanup chịu được storage bị cấm; không ghi credential. |
| `UserProfileMenu.tsx`, `Header.tsx` | Thông báo local logout khác server-confirmed; callback cũ không ghi đè login mới. |
| `useLearningDashboard.js`, `LearnCourseLayout.jsx` | Bỏ console ghi nguyên lỗi HTTP có Bearer config. |
| `axiosClient.test.ts`, `logoutSecurity.test.ts` | Regression epoch, 409/500, multi-tab event, failed logout/reload/retry, queued login, storage denied, React snapshot. |
| `AuthCorsConfigurationTest.java` | 14 positive/negative config cases. |
| `PostRefactorAuthHttpTest.java` | Real socket HTTP + controlled logout store failure + optional real Chrome lifecycle. H2 guard trước schema writes. |
| `RefreshSessionMySqlTest.java` | Locking/reuse/logout trên MySQL; xác minh JDBC URL và @@datadir trước fixture writes. |
| `backend/tests/run_auth_mysql_audit.py` | Private datadir runner, migration preservation, SQL guard, Java 17/Maven evidence, shutdown chỉ instance đã xác minh. |
| `frontend/tests/auth-audit*`, `run-auth-browser-audit.mjs` | Harness test-only, production auth components/modules, browser riêng; không đưa test globals vào production build entry. |
| Báo cáo này | Kết quả, evidence và giới hạn của audit lần 2. |

Không sửa migration/entity/role rules trong lượt audit này; đã đối chiếu các file refactor có sẵn. Không migration/reset/drop DB đang sử dụng, không xóa Docker volume, không sửa secret hoặc publish/deploy.

## F. Database Readiness

Đã kiểm tra `RefreshSessionEntity` ↔ `20261018_refresh_sessions.sql`: `id VARCHAR(36)` là primary key unique theo SID; `user_id BIGINT NOT NULL` tham chiếu `users(id)` và ON DELETE CASCADE; `token_hash VARCHAR(64)` đủ SHA-256 hex; `expires_at DATETIME(6) NOT NULL`, `rotated_at DATETIME(6)` nullable; `revoked BIT NOT NULL DEFAULT 0`; expiry index tồn tại. Không có unique index riêng cho token hash; tính duy nhất phiên nằm ở SID, mỗi JWT gắn SID, hash được so sánh trong hàng đã khóa. Không cần lưu raw token.

MySQL thử nghiệm dùng InnoDB, isolation thực tế `REPEATABLE-READ`, port loopback 33087. Runner từ chối nếu port đã có process, tạo datadir UUID dưới `backend/target`, kiểm tra `@@datadir` trước import và shutdown. Base schema được bỏ duy nhất CREATE refresh table trong memory để mô phỏng DB trước refactor; import seed/migration cũ vào instance mới, sau đó áp dụng refresh migration hai lần. Checksum user/learning và sentinel refresh row được so trước/sau; SQL schema guard và Hibernate schema validation/SELECT entity chạy qua suite.

`CREATE TABLE IF NOT EXISTS` chạy lại an toàn khi bảng đúng schema; nó **không tự sửa** bảng tồn tại nhưng sai column/index/FK. Vì thế schema guard vẫn là điều kiện triển khai. Production `ddl-auto=none`; create-drop chỉ trong H2 test. MySQL test timezone là UTC; Docker MySQL đang cấu hình +07:00. Cần xác minh JDBC/server timezone nhất quán trên staging trước rollout, chưa kiểm thử mọi biến thể timezone.

DB local/production của bạn chưa được kiểm tra trạng thái migration và chưa bị sửa. Trước deployment, người vận hành cần backup, xác minh đúng host/schema, rồi chạy **chỉ** migration additive theo quy trình được phép. Ví dụ trong MySQL client đã chọn đúng database/credential bằng login-path an toàn:

```sql
SELECT DATABASE(), @@hostname, @@port;
SOURCE D:/SBA301/deployment/legacy-sql/20261018_refresh_sessions.sql;
SOURCE D:/SBA301/database/tests/check-schema.sql;
```

Đây là hướng dẫn bàn giao, **chưa được thực thi trên DB người dùng**. Không import lại `chinese_online_learning.sql`, không reset schema/volume. Deploy frontend/backend tương thích cùng đợt; refresh JWT legacy không có SID/session không dùng được, người dùng cũ cần login lại.

## G. Remaining Risks

- Access JWT đã sao chép trước logout vẫn có thể hợp lệ đến TTL mặc định 15 phút. Audit không thêm access blacklist. Logout thu hồi khả năng refresh, không làm mọi access JWT biến mất ngay trên server. Password/status/roles được kiểm tra lại ở DB cho mỗi API request.
- XSS trong origin có thể hành động bằng phiên và lấy access mới; HttpOnly chỉ ngăn đọc refresh cookie trực tiếp. Chưa làm audit XSS toàn bộ ứng dụng/CSP hoặc pentest toàn diện nội dung học tập.
- Logout offline chỉ là local logout cho tới khi server xác nhận retry. Nếu đóng browser mãi, retry chưa xảy ra; marker không thay thế server revocation. Xóa/không cho browser storage có thể làm mất marker. Client/browser khác giữ token không chịu ảnh hưởng metadata của origin này.
- Browser không có Web Locks vẫn chỉ được queue trong một tab; rotation giữa tab có thể 409 hoặc false-positive reuse sau 5 giây. Chưa chạy Safari/Firefox hoặc fallback E2E.
- OAuth provider thật và PayOS thật: BLOCKED do audit không dùng tài khoản/provider credentials thật. Chỉ kiểm chứng handshake/code exchange/checksum bằng automated tests.
- Production HTTPS/reverse proxy/Secure cookie enforcement, exact deployed CORS/callback và clock/timezone: NOT RUN trên staging/production. Test HTTP dùng Secure=false riêng; production header Secure có test constructor/config, không thay cho TLS E2E.
- Full dashboard/course/payment browser E2E, browser admin-disable/password-change và restart backend thật: NOT RUN. Harness browser dùng auth components thật cùng backend thật nhưng không thay thế toàn bộ journey nghiệp vụ.
- Default shared-JVM full suite từng FAIL như phần D. Runner cô lập JVM phục vụ xác minh; nguyên nhân metadata/shared-context sâu hơn chưa được xác định. Không sửa Jenkins/CI/CD không liên quan.
- Refresh sessions chưa có scheduled cleanup cho row hết hạn/revoked; cần chính sách retention/maintenance phù hợp. Đây là rủi ro vận hành, không có bằng chứng nó cấp lại token hết hạn.

Tài liệu nền để đối chiếu cơ chế, không dùng thay cho evidence repository: [Spring Security CSRF](https://docs.spring.io/spring-security/reference/servlet/exploits/csrf.html), [MySQL InnoDB locking reads](https://dev.mysql.com/doc/refman/8.0/en/innodb-locking-reads.html), [MDN storage event](https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event).

## H. Production Readiness

**READY WITH CONDITIONS** cho bản sửa trong workspace, chưa phải xác nhận đã sẵn sàng deploy trên môi trường đang chạy.

Bằng chứng cuối: 256/256 Maven tests PASS, không skip, bao gồm HTTP/Tomcat thật, MySQL/schema/locking và Chrome; 61/61 frontend tests PASS, build và lint PASS. Không còn finding High/Critical chưa sửa trong phạm vi kiểm chứng. Lượt cuối dùng JVM riêng cho từng test class; default shared-JVM suite chưa được xác nhận đã hết lỗi.

Điều kiện trước rollout:

1. Backup và áp dụng migration additive đúng database theo quy trình được phép; schema guard phải không có defect. Audit chưa migration DB của bạn.
2. Xác minh trên staging HTTPS: Secure/SameSite/path/domain, exact CORS, OAuth callback và luồng PayOS/OAuth thật; kiểm tra clock/timezone. Không dùng kết quả HTTP local thay cho TLS E2E.
3. Dùng chế độ cô lập JVM đã kiểm chứng cho security/schema suites, hoặc xử lý và chạy lại lỗi shared-JVM trước khi dựa vào pipeline mặc định. Runner audit đã cung cấp cấu hình tái lập; Jenkins/CI không bị đổi trong lượt này.
4. Chấp nhận rõ thời gian hiệu lực còn lại của access JWT sau logout, giới hạn storage/Web Locks và trade-off reuse 5 giây. Nếu sản phẩm yêu cầu thu hồi access tức thì trên mọi client/browser, kiến trúc hiện tại chưa đáp ứng yêu cầu đó.

Artifacts cuối (không commit vì nằm dưới target):

- `backend/target/post-auth-mysql-35f7534a4ef04785a0e7d1dbddb993f8/summary.json`: tests=256, failures=0, errors=0, skipped=0.
- `backend/target/post-auth-mysql-35f7534a4ef04785a0e7d1dbddb993f8/maven.log`: BUILD SUCCESS, thời gian 04:22.
- `backend/target/surefire-reports/TEST-*-post-auth-mysql.xml`: JUnit evidence từng suite; chỉ dùng suffix của lượt audit, không cộng report lịch sử khác.
- `backend/target/post-auth-browser/browser.log` và `browser-summary.txt`: 9 nhóm assertions PASS, Chrome 155.0.8059.80, gồm browser reopen sau logout.

Private MySQL đã dừng sau khi xác minh lại `@@datadir`; Vite test đã dừng. Không thay đổi dữ liệu production/local hiện hữu hoặc Docker volume.

## I. Đối chiếu production sau phản hồi của người dùng

Ngày 18/10/2026, người dùng xác nhận quan sát token trong browser storage của **https://edujar.site**, không phải môi trường local được audit. Đã kiểm tra chỉ các tài nguyên công khai, không đăng nhập, không sử dụng token của người dùng và không thay đổi server/database.

- HTML production đang tải `/assets/index-tk5t2Nxh.js`.
- Bundle này vẫn chứa các lệnh `localStorage.setItem(nr.accessToken,e.accessToken)` và `localStorage.setItem(nr.refreshToken,e.refreshToken)`, cùng ghi user. Đây là bằng chứng code runtime đang phục vụ còn dùng persistence cũ; không chỉ là suy đoán từ dữ liệu browser tồn đọng.
- Bundle production không có `/api/auth/csrf` hoặc marker `learning-platform.logout` của bản mới. GET công khai `/api/auth/csrf` trả 401; localhost:5173 và localhost:8081 trả 200 với contract CSRF mới (chỉ kiểm tra kiểu/thuộc tính, không ghi giá trị token).
- Refresh JWT được người dùng đưa ra có định dạng legacy thiếu SID/JTI. Không xác minh chữ ký hay dùng JWT đó để gọi API, không lưu giá trị vào báo cáo.
- JAR local trước đối chiếu có timestamp 20:34:36 và chưa chứa RefreshSessionService/RefreshCookie. Đã chạy Maven offline `-DskipTests package` thành công để tạo JAR mới có hai class này. Java local 8081 chạy từ IntelliJ/target classes, không chạy JAR cũ đó.

Kết luận: **production đang phục vụ bản cũ và chưa đạt yêu cầu refactor**. Kết luận READY WITH CONDITIONS ở phần H áp dụng cho source/bản sửa đã kiểm thử trong workspace, không phải bản đang chạy trên edujar.site. Chưa deploy frontend/backend hoặc chạy migration production trong lượt này. Cần rollout đồng bộ bản mới, migration additive có backup/đúng DB, rồi kiểm chứng lại trên domain; xóa storage đơn thuần không sửa được bundle cũ tiếp tục ghi token sau login.
