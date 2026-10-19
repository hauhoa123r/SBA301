# SECURITY AUDIT REPORT — learning_platform

> Cập nhật 19/10/2026: đăng nhập Facebook đã được gỡ khỏi frontend, backend và cấu hình triển khai. Hiện chỉ hỗ trợ Google và email/mật khẩu. Các mô tả Facebook bên dưới ghi lại phạm vi audit lịch sử; liên kết tài khoản cũ được giữ để tương thích dữ liệu.

Ngày: 12/10/2026, Asia/Saigon. Scope: monolith tại repository SBA301; backend Spring MVC, service/repository/DTO, cấu hình và automated tests. Không kiểm thử hay deploy production.

Baseline source commit: `5a25feb789d155cc667ff6dd8d161e07e3845cd4`; các evidence “trước sửa” dùng số dòng ở snapshot đó. Source/test hiện tại và JSON matrix ghi vị trí sau sửa. Các thay đổi riêng ở docker-compose.yml và frontend/nginx*.conf trong lúc audit được giữ nguyên.

## A. System Security Overview

Source xác nhận Java 17, Spring Boot 3.5.7, Spring Security/OAuth2 Client, JPA/Hibernate/MySQL, JJWT 0.12.6, Actuator/Prometheus, Lombok, ModelMapper. Có 16 REST controllers với **46 endpoint**, trong đó **34 protected**, **12 public có chủ đích**. Inventory scan toàn bộ source backend; phân tích theo từng controller → service → repository, gồm learning, payment, subscription, admin, user, auth và OAuth.

- Authentication password: AuthServiceImpl trực tiếp đọc user + roles, kiểm tra BCrypt, trạng thái ACTIVE và SupportedRolePolicy, rồi phát JWT. Không có UserDetailsService ứng dụng tự triển khai. Legacy plaintext được migrate sau login đúng; marker OAuth không được chấp nhận.
- OAuth: authorization request/state dùng HttpSession; Google dùng OIDC, Facebook dùng OAuth2 UserInfo. Success phát hành code ngẫu nhiên TTL 60 giây, lưu hash trong DB; exchange consume dưới lock rồi phát access/refresh JWT. API identity sau sửa không được lấy từ session cookie.
- JWT: chữ ký HMAC qua JJWT verifyWith/parseSignedClaims; expiry và access/refresh type được kiểm tra. User ACTIVE và roles lấy lại từ DB ở mỗi authenticated request, không tin role trong JWT. Stamp credential ràng buộc token với password_hash hiện tại.
- Role: chỉ STUDENT và ADMIN được SupportedRolePolicy chấp nhận. Các role legacy như TEACHER/MODERATOR không được tự nâng quyền. Có entity permission trong schema nhưng chưa có authorization theo permission ở REST thực tế.
- Authorization gồm ba tầng: filter xác thực JWT/current DB user; filter + @PreAuthorize bảo vệ chức năng theo role; service bảo vệ owner, entitlement và quan hệ resource/course. Chính sách cuối là denyAll cho route chưa phân loại.
- Password mới: BCrypt, không plaintext. Signing secret vẫn bắt buộc từ env; không thêm secret fallback vào production. Không chép credential từ D:\.env hoặc .env.example vào test/report.
- Error: authentication 401, thiếu role/owner 403, dữ liệu sai 400, rate limit 429. Lỗi backend bất ngờ trả thông báo chung; không gửi stacktrace/SQL/cause ra client.

### Kiểm soát nghiệp vụ được xác nhận đã tồn tại

Admin controllers có @PreAuthorize ADMIN; admin audit actor lấy từ principal. Student management không cho sửa account Admin bằng đường quản lý học viên. Payment sync kiểm tra invoice owner trước gọi provider; creation lấy giá/duration từ plan trong DB. Webhook public phải có HMAC đúng và paid amount khớp; invoice lock xử lý idempotency. Learning lấy userId từ principal, kiểm tra entitlement và resource thuộc course; grading ở server, không tin score/owner trong body. Public catalog chỉ lấy PUBLISHED, không trả video/đáp án đầy đủ; learning quiz response che đáp án trước submit.

## B. Endpoint Security Matrix

Mỗi protected endpoint có test anonymous và malformed JWT trả 401. Toàn bộ 14 admin endpoints có test STUDENT trả 403. Với endpoint learning không áp đặt owner của course: course là nội dung dùng chung, quyền dựa vào subscription/legacy enrollment của người học. Public POST/PATCH không có nghĩa là được sửa tài khoản bất kỳ; chúng dùng password, reset/verify token, OAuth code hoặc chữ ký provider.

| Method | Endpoint | Authentication | Role/Permission | Ownership | Security Status |
|---|---|---|---|---|---|
| GET | `/api/admin/assignments/submissions` | Access JWT hợp lệ + user ACTIVE trong DB | ADMIN | Quản trị toàn hệ thống theo nghiệp vụ | Guest/JWT lỗi → 401; STUDENT → 403; controller có @PreAuthorize |
| PUT | `/api/admin/assignments/submissions/{id}/grade` | Access JWT hợp lệ + user ACTIVE trong DB | ADMIN | Quản trị toàn hệ thống theo nghiệp vụ | Guest/JWT lỗi → 401; STUDENT → 403; controller có @PreAuthorize |
| GET | `/api/admin/auth-settings` | Access JWT hợp lệ + user ACTIVE trong DB | ADMIN | Quản trị toàn hệ thống theo nghiệp vụ | Guest/JWT lỗi → 401; STUDENT → 403; controller có @PreAuthorize |
| PUT | `/api/admin/auth-settings` | Access JWT hợp lệ + user ACTIVE trong DB | ADMIN | Quản trị toàn hệ thống theo nghiệp vụ | Guest/JWT lỗi → 401; STUDENT → 403; controller có @PreAuthorize |
| GET | `/api/admin/dashboard` | Access JWT hợp lệ + user ACTIVE trong DB | ADMIN | Quản trị toàn hệ thống theo nghiệp vụ | Guest/JWT lỗi → 401; STUDENT → 403; controller có @PreAuthorize |
| GET | `/api/admin/dashboard/courses` | Access JWT hợp lệ + user ACTIVE trong DB | ADMIN | Quản trị toàn hệ thống theo nghiệp vụ | Guest/JWT lỗi → 401; STUDENT → 403; controller có @PreAuthorize |
| GET | `/api/admin/students` | Access JWT hợp lệ + user ACTIVE trong DB | ADMIN | Quản trị toàn hệ thống theo nghiệp vụ | Guest/JWT lỗi → 401; STUDENT → 403; controller có @PreAuthorize |
| GET | `/api/admin/students/{id}` | Access JWT hợp lệ + user ACTIVE trong DB | ADMIN | Quản trị toàn hệ thống theo nghiệp vụ | Guest/JWT lỗi → 401; STUDENT → 403; controller có @PreAuthorize |
| PATCH | `/api/admin/students/{id}/status` | Access JWT hợp lệ + user ACTIVE trong DB | ADMIN | Quản trị toàn hệ thống theo nghiệp vụ | Guest/JWT lỗi → 401; STUDENT → 403; controller có @PreAuthorize |
| POST | `/api/admin/students/{id}/subscription/grant` | Access JWT hợp lệ + user ACTIVE trong DB | ADMIN | Quản trị toàn hệ thống theo nghiệp vụ | Guest/JWT lỗi → 401; STUDENT → 403; controller có @PreAuthorize |
| POST | `/api/admin/students/{id}/subscription/revoke` | Access JWT hợp lệ + user ACTIVE trong DB | ADMIN | Quản trị toàn hệ thống theo nghiệp vụ | Guest/JWT lỗi → 401; STUDENT → 403; controller có @PreAuthorize |
| GET | `/api/admin/subscription-plans` | Access JWT hợp lệ + user ACTIVE trong DB | ADMIN | Quản trị toàn hệ thống theo nghiệp vụ | Guest/JWT lỗi → 401; STUDENT → 403; controller có @PreAuthorize |
| POST | `/api/admin/subscription-plans` | Access JWT hợp lệ + user ACTIVE trong DB | ADMIN | Quản trị toàn hệ thống theo nghiệp vụ | Guest/JWT lỗi → 401; STUDENT → 403; controller có @PreAuthorize |
| PUT | `/api/admin/subscription-plans/{code}` | Access JWT hợp lệ + user ACTIVE trong DB | ADMIN | Quản trị toàn hệ thống theo nghiệp vụ | Guest/JWT lỗi → 401; STUDENT → 403; controller có @PreAuthorize |
| POST | `/api/auth/forgot-password` | Không yêu cầu JWT; xem capability nghiệp vụ | Public | Theo credential/token/HMAC | Public có chủ đích |
| POST | `/api/auth/login` | Không yêu cầu JWT; xem capability nghiệp vụ | Public | Theo credential/token/HMAC | Public có chủ đích |
| GET | `/api/auth/me` | Access JWT hợp lệ + user ACTIVE trong DB | STUDENT hoặc ADMIN | Principal hiện tại | Guest/JWT lỗi → 401; role kiểm tra tại filter |
| POST | `/api/auth/oauth/exchange` | Không yêu cầu JWT; xem capability nghiệp vụ | Public | Theo credential/token/HMAC | Public có chủ đích |
| POST | `/api/auth/refresh` | Không yêu cầu JWT; xem capability nghiệp vụ | Public | Theo credential/token/HMAC | Public có chủ đích |
| POST | `/api/auth/register` | Không yêu cầu JWT; xem capability nghiệp vụ | Public | Theo credential/token/HMAC | Public có chủ đích |
| PATCH | `/api/auth/reset-password` | Không yêu cầu JWT; xem capability nghiệp vụ | Public | Theo credential/token/HMAC | Public có chủ đích |
| POST | `/api/auth/verify-email` | Không yêu cầu JWT; xem capability nghiệp vụ | Public | Theo credential/token/HMAC | Public có chủ đích |
| POST | `/api/auth/verify-token` | Không yêu cầu JWT; xem capability nghiệp vụ | Public | Theo credential/token/HMAC | Public có chủ đích |
| GET | `/api/categories` | Access JWT hợp lệ + user ACTIVE trong DB | STUDENT | Không; dữ liệu dùng chung | Guest/JWT lỗi → 401; role kiểm tra tại filter |
| GET | `/api/coupon/{vourcherCode}` | Access JWT hợp lệ + user ACTIVE trong DB | STUDENT | Không; dữ liệu dùng chung | Guest/JWT lỗi → 401; role kiểm tra tại filter |
| GET | `/api/courses` | Không yêu cầu JWT; xem capability nghiệp vụ | Public | Không; metadata công khai | Public có chủ đích |
| GET | `/api/courses/{id}` | Không yêu cầu JWT; xem capability nghiệp vụ | Public | Không; metadata công khai | Public có chủ đích |
| GET | `/api/learning/activity` | Access JWT hợp lệ + user ACTIVE trong DB | STUDENT | Principal + entitlement; lesson/quiz/assignment phải thuộc course | Guest/JWT lỗi → 401; role kiểm tra tại filter |
| GET | `/api/learning/courses/{courseId}` | Access JWT hợp lệ + user ACTIVE trong DB | STUDENT | Principal + entitlement; lesson/quiz/assignment phải thuộc course | Guest/JWT lỗi → 401; role kiểm tra tại filter |
| PUT | `/api/learning/courses/{courseId}/assignments/{assignmentId}/submission` | Access JWT hợp lệ + user ACTIVE trong DB | STUDENT | Principal + entitlement; lesson/quiz/assignment phải thuộc course | Guest/JWT lỗi → 401; role kiểm tra tại filter |
| PUT | `/api/learning/courses/{courseId}/lessons/{lessonId}/playback` | Access JWT hợp lệ + user ACTIVE trong DB | STUDENT | Principal + entitlement; lesson/quiz/assignment phải thuộc course | Guest/JWT lỗi → 401; role kiểm tra tại filter |
| PUT | `/api/learning/courses/{courseId}/lessons/{lessonId}/progress` | Access JWT hợp lệ + user ACTIVE trong DB | STUDENT | Principal + entitlement; lesson/quiz/assignment phải thuộc course | Guest/JWT lỗi → 401; role kiểm tra tại filter |
| GET | `/api/learning/courses/{courseId}/progress` | Access JWT hợp lệ + user ACTIVE trong DB | STUDENT | Principal + entitlement; lesson/quiz/assignment phải thuộc course | Guest/JWT lỗi → 401; role kiểm tra tại filter |
| POST | `/api/learning/courses/{courseId}/quizzes/{quizId}/submissions` | Access JWT hợp lệ + user ACTIVE trong DB | STUDENT | Principal + entitlement; lesson/quiz/assignment phải thuộc course | Guest/JWT lỗi → 401; role kiểm tra tại filter |
| GET | `/api/learning/stats` | Access JWT hợp lệ + user ACTIVE trong DB | STUDENT | Principal + entitlement; lesson/quiz/assignment phải thuộc course | Guest/JWT lỗi → 401; role kiểm tra tại filter |
| POST | `/api/payments/create` | Access JWT hợp lệ + user ACTIVE trong DB | STUDENT | Principal; sync phải sở hữu invoice | Guest/JWT lỗi → 401; role kiểm tra tại filter |
| POST | `/api/payments/invoices/{invoiceId}/sync` | Access JWT hợp lệ + user ACTIVE trong DB | STUDENT | Principal; sync phải sở hữu invoice | Guest/JWT lỗi → 401; role kiểm tra tại filter |
| POST | `/api/payments/payos-webhook` | Không yêu cầu JWT; xem capability nghiệp vụ | Public | Theo credential/token/HMAC | Public có chủ đích |
| GET | `/api/subscriptions/me` | Access JWT hợp lệ + user ACTIVE trong DB | STUDENT | Principal; không tin userId/plan/expiry trong body | Guest/JWT lỗi → 401; role kiểm tra tại filter |
| GET | `/api/subscriptions/plans` | Không yêu cầu JWT; xem capability nghiệp vụ | Public | Không; metadata công khai | Public có chủ đích |
| POST | `/api/subscriptions/trial` | Access JWT hợp lệ + user ACTIVE trong DB | STUDENT | Principal; không tin userId/plan/expiry trong body | Guest/JWT lỗi → 401; role kiểm tra tại filter |
| GET | `/api/tags` | Access JWT hợp lệ + user ACTIVE trong DB | STUDENT | Không; dữ liệu dùng chung | Guest/JWT lỗi → 401; role kiểm tra tại filter |
| PATCH | `/api/users/change-password` | Access JWT hợp lệ + user ACTIVE trong DB | STUDENT | Bắt buộc self-only tại UserProfileServiceImpl | Guest/JWT lỗi → 401; foreign owner → 403; DB không đổi |
| GET | `/api/users/{id}` | Access JWT hợp lệ + user ACTIVE trong DB | STUDENT | Bắt buộc self-only tại UserProfileServiceImpl | Guest/JWT lỗi → 401; foreign owner → 403; DB không đổi |
| PATCH | `/api/users/{id}` | Access JWT hợp lệ + user ACTIVE trong DB | STUDENT | Bắt buộc self-only tại UserProfileServiceImpl | Guest/JWT lỗi → 401; foreign owner → 403; DB không đổi |
| GET | `/api/users/{id}/orders` | Access JWT hợp lệ + user ACTIVE trong DB | STUDENT | Bắt buộc self-only tại UserProfileServiceImpl | Guest/JWT lỗi → 401; foreign owner → 403; DB không đổi |

Ngoài MVC controllers:

| Method | Endpoint | Authentication | Role/Permission | Ownership | Security Status |
|---|---|---|---|---|---|
| GET | /api/oauth2/authorization/google; /facebook | Public khởi tạo handshake | N/A | OAuth state gắn session | Auth IP limit; handshake test pass |
| GET (provider flow) | /login/oauth2/code/google; /facebook | OAuth provider code + state | Theo current DB user | Provider identity và session state | RequestAttribute context; success/failure handler |
| POST | /api/auth/logout | Filter logout | N/A | Session hiện tại | 204; GET không logout; JWT không có revoke-on-logout |
| GET | /actuator/health | Public | N/A | N/A | Health details never |
| GET | /actuator/prometheus | Public trong backend network | N/A | N/A | Nginx chặn ra Internet; Compose backend không publish host port |

Không có DELETE mapping trong các REST controller hiện tại. OPTIONS được phép cho preflight; CORS không phải cơ chế chặn Postman/cURL.

## C. Vulnerabilities

Red regression trước sửa: 79 cases, **9 failures**, 0 errors trên H2. Các failure chứng minh IDOR, OAuth marker login, password plaintext, false success, service ownership và cookie-only API mutation. Số case regression được điều chỉnh sau đó để bỏ các parameterized case không thực hiện assertion, bổ sung attack cases thật và coverage toàn bộ protected API.

### SEC-01 — OAuth marker được chấp nhận như mật khẩu

- Severity: **Critical**.
- Evidence trước sửa: `backend/src/main/java/com/app/features/auth/service/impl/AuthServiceImpl.java:76`; `backend/src/main/java/com/app/features/oauth/converter/OAuthAccountConverter.java:26`.
- Nguyên nhân/khả năng khai thác: Login fallback so sánh plaintext, trong khi OAuth user có password_hash cố định {oauth}. Người biết email của tài khoản OAuth có thể yêu cầu token bằng marker này; không cần đi qua Google/Facebook. Áp dụng cho tài khoản còn ACTIVE và có role được hỗ trợ.
- HTTP/local reproducer: POST /api/auth/login — {"email":"alice@example.test","password":"{oauth}"}
- Giải pháp: PasswordHashing từ chối marker và định dạng encoded không hỗ trợ. Login sai trả 401. Legacy plaintext hợp lệ được chuyển thành BCrypt sau login thành công.
- Trạng thái: **Đã sửa**, trong phạm vi nêu trên.
- Test chứng minh: `oauthMarkerCannotBeUsedAsLoginPassword; legacyPasswordIsMigratedAfterSuccessfulLogin`.
### SEC-02 — IDOR ở hồ sơ và lịch sử đơn hàng

- Severity: **High**.
- Evidence trước sửa: `backend/src/main/java/com/app/features/users/service/impl/UserProfileServiceImpl.java:29`; `backend/src/main/java/com/app/features/users/service/impl/UserProfileServiceImpl.java:99`.
- Nguyên nhân/khả năng khai thác: Service dùng id từ URL để đọc/cập nhật User và đọc invoices, không so sánh với principal. Access token STUDENT hợp lệ có thể đọc thông tin riêng hoặc đổi tên người khác, bao gồm tài khoản Admin.
- HTTP/local reproducer: GET /api/users/<bob-id>; GET /api/users/<bob-id>/orders; PATCH /api/users/<bob-id> — {"fullName":"Hijacked"} với bearer của Alice.
- Giải pháp: findUser thực hiện self-only check trước query/write. Role STUDENT được kiểm tra tại filter và controller. Admin dùng các endpoint quản trị đã có, không thêm quyền override mới.
- Trạng thái: **Đã sửa**, trong phạm vi nêu trên.
- Test chứng minh: `foreignProfileReadAndOrdersAreDenied; foreignProfileUpdateDoesNotChangeDatabase; serviceAlsoDeniesForeignOwner; ownProfileUpdateIgnoresSensitiveFields`.
### SEC-03 — Đổi mật khẩu tin email trong body và báo thành công sai

- Severity: **High**.
- Evidence trước sửa: `backend/src/main/java/com/app/features/users/service/impl/UserProfileServiceImpl.java:80`; `backend/src/main/java/com/app/features/users/controller/UserController.java:45`.
- Nguyên nhân/khả năng khai thác: Service chọn tài khoản theo email do client gửi. Nếu biết plaintext đang lưu của nạn nhân, người đang đăng nhập bằng tài khoản khác có thể đổi mật khẩu tài khoản đó. Với BCrypt cũ, việc so sánh trực tiếp còn biến hash thành giá trị có thể dùng thay mật khẩu nếu hash bị lộ. Controller bỏ qua chuỗi lỗi nên trả 200 cả khi kiểm tra thất bại.
- HTTP/local reproducer: PATCH /api/users/change-password — {"email":"bob@example.test","current_password":"Password1","new_password":"NewPassword1","confirm_password":"NewPassword1"} với bearer Alice; fixture Bob có password legacy.
- Giải pháp: Chọn user bằng principal. Email cũ được giữ để tương thích client nhưng phải khớp user hiện tại. Sai owner → 403; sai current password/validation → 400, không write DB. So sánh và lưu BCrypt.
- Trạng thái: **Đã sửa**, trong phạm vi nêu trên.
- Test chứng minh: `passwordChangeCannotTargetBodyEmail; passwordChangeRejectsWrongPasswordAndHashesAcceptedPassword`.
### SEC-04 — Lưu mật khẩu dạng rõ

- Severity: **High**.
- Evidence trước sửa: `backend/src/main/java/com/app/features/auth/converter/RegisterConverter.java:21`; `backend/src/main/java/com/app/features/auth/service/impl/PasswordServiceImpl.java:74`.
- Nguyên nhân/khả năng khai thác: Register, reset và change password lưu plaintext vào password_hash. Lộ DB/backup làm lộ ngay credential, ảnh hưởng cả tài khoản dùng lại mật khẩu ở hệ thống khác.
- HTTP/local reproducer: Trong H2 test, đăng ký/reset/change rồi đọc lại password_hash. Trước sửa bằng đúng plaintext gửi lên; sau sửa là BCrypt và matches() đúng.
- Giải pháp: Thống nhất PasswordHashing; BCrypt cost 10, salt do encoder sinh. Từ chối mật khẩu mới quá 72 UTF-8 bytes. Password cũ dạng rõ chỉ được hỗ trợ để migrate sau xác thực thành công; không tự chạy migration dữ liệu thật.
- Trạng thái: **Đã sửa**, trong phạm vi nêu trên.
- Test chứng minh: `registrationHashesPasswordAndCannotAssignAdmin; resetHashesPasswordAndTokenCannotBeReused; passwordChangeRejectsWrongPasswordAndHashesAcceptedPassword`.
### SEC-05 — Session cookie còn cấp quyền API khi CSRF bị tắt

- Severity: **High**.
- Evidence trước sửa: `backend/src/main/java/com/app/config/SecurityConfig.java:50`; `backend/src/main/java/com/app/security/jwt/JwtAuthenticationFilter.java:61`.
- Nguyên nhân/khả năng khai thác: OAuth login có thể lưu SecurityContext trong HttpSession. Filter chấp nhận session principal khi không có bearer, trong khi CSRF bị tắt. H2/MockMvc đã chứng minh session-only mutation được trả 200 trước sửa. SameSite=Lax và JSON/CORS giảm một số đường khai thác cross-site, nhưng không thay thế kiểm soát credential/CSRF, đặc biệt ở same-site origin.
- HTTP/local reproducer: PATCH /api/users/<alice-id> với session SecurityContext của Alice, không Authorization, body {"fullName":"CSRF change"}.
- Giải pháp: Dùng RequestAttributeSecurityContextRepository: không load/persist API identity từ HttpSession. Session vẫn chứa authorization request/state cho OAuth; API yêu cầu access JWT. Logout chỉ nhận POST. CSRF tắt áp dụng cho mô hình bearer API này.
- Trạng thái: **Đã sửa**, trong phạm vi nêu trên.
- Test chứng minh: `sessionCookieAloneCannotAuthorizeApiMutation; oauthHandshakeRetainsStateWithoutAuthorizingApiByCookie; logoutRequiresPost`.
### SEC-06 — Reset OTP sáu chữ số không có attempt budget

- Severity: **High**.
- Evidence trước sửa: `backend/src/main/java/com/app/features/auth/service/impl/PasswordServiceImpl.java:44`; `backend/src/main/java/com/app/features/auth/service/impl/VerificationTokenServiceImpl.java:51`.
- Nguyên nhân/khả năng khai thác: OTP có TTL 15 phút nhưng không hạn chế lần đoán và endpoint public. Không gửi email thật hay brute-force dữ liệu thật trong audit. Khả năng dò mã được đánh giá từ không gian mã và vòng kiểm tra trong source.
- HTTP/local reproducer: Trên fixture OTP trong H2: gửi năm reset sai cho cùng email, request thứ sáu phải 429; password_hash không đổi.
- Giải pháp: Giới hạn theo account: login 10/phút, forgot 3/15 phút, verify/reset dùng chung 5/15 phút. Filter giới hạn auth theo IP 60/phút, trả Retry-After. Map bounded 10.000 keys, synchronized, fail-closed khi đầy. Token query có pessimistic lock để serialize consume/reset.
- Trạng thái: **Đã sửa**, trong phạm vi nêu trên.
- Test chứng minh: `guessingResetCodeIsLimitedAndDoesNotChangePassword; AuthenticationAttemptLimiterTest; AuthenticationRateLimitFilterTest`.
### SEC-07 — JWT vẫn dùng được sau đổi/reset mật khẩu

- Severity: **Medium**.
- Evidence trước sửa: `backend/src/main/java/com/app/security/jwt/JwtService.java:51`; `backend/src/main/java/com/app/features/auth/controller/JwtTokenController.java:33`.
- Nguyên nhân/khả năng khai thác: JWT chỉ ràng buộc id/role/type/expiry. Token bị lấy trước đổi mật khẩu có thể tiếp tục gọi API hoặc refresh khi user vẫn ACTIVE.
- HTTP/local reproducer: Phát hành access/refresh của Alice, đổi/reset mật khẩu, dùng lại token cũ trên /api/auth/me và /api/auth/refresh.
- Giải pháp: JWT mới mang pwd = HMAC(signing key, user id + current password hash), không đưa password/hash vào payload. Kiểm tra stamp với user hiện tại cho access và refresh. Password đổi làm token cũ bị từ chối 401, không cần đổi schema.
- Trạng thái: **Đã sửa**, trong phạm vi nêu trên.
- Test chứng minh: `passwordChangeRejectsWrongPasswordAndHashesAcceptedPassword; resetHashesPasswordAndTokenCannotBeReused; tokenWithoutExpirationOrCredentialStampIsRejected`.
### SEC-08 — Test mặc định chạy DROP DATABASE/schema/seed trên datasource cấu hình

- Severity: **High**.
- Evidence trước sửa: `backend/src/test/java/com/app/BackendApplicationTests.java:22`; `deployment/legacy-sql/chinese_online_learning.sql:1`.
- Nguyên nhân/khả năng khai thác: SpringBootTest cũ tự chạy script schema có DROP DATABASE và seed. Nếu cấu hình datasource thật để chạy suite, dữ liệu thật có thể bị xóa. Baseline thất bại ở bootstrap nên script này KHÔNG được chạy trong audit.
- HTTP/local reproducer: Static review importDataChineseSql và script schema; không tái hiện hành động phá hoại.
- Giải pháp: Gỡ importer khỏi automated smoke test. Ba smoke test dùng security-test profile H2. InMemoryDatabaseGuard dừng bootstrap nếu host environment override URL thành database ngoài bộ nhớ. Schema/seed production giữ nguyên.
- Trạng thái: **Đã sửa**, trong phạm vi nêu trên.
- Test chứng minh: `Ba BackendApplicationTests.contextLoads pass với H2; InMemoryDatabaseGuard; toàn bộ verify pass`.


### Hardening bổ sung

- Public course matcher chuyển sang MVC request matcher theo HTTP method thay vì tự phụ thuộc servletPath. Guest đọc catalog được xác nhận 200.
- JWT thiếu expiration/credential stamp bị từ chối, thay vì có thể gây lỗi null hoặc dùng token đời cũ.
- Login sai email và sai password cùng thông báo 401. Forgot-password trả response chung cả email không tồn tại; chưa khẳng định đã loại bỏ mọi timing side-channel.
- JSON role/status/passwordHash/id không nằm trong DTO không được mass assign; test self-profile và register đọc lại DB để xác nhận.
- Rate limiter không đọc trực tiếp X-Forwarded-For do client gửi. Deployment Nginx hiện ghi đè forwarding headers; backend phải giữ network nội bộ theo Compose.

### Additional audit coverage

- **SQL Injection:** static review repository/JPA/native SQL dùng named parameters và setParameter cho id, search, status; các đoạn nối SQL là cấu trúc cố định, không nối trực tiếp input client. Chưa xác nhận runtime fuzzing với MySQL thật.
- **Mass assignment:** REST không bind request body trực tiếp vào entity. Các DTO profile/register không nhận role, permission, passwordHash hoặc ownerId; test đọc lại DB chứng minh các field giả mạo không làm thay đổi quyền. Grade/status/plan DTO nhạy cảm chỉ đi qua ADMIN gate.
- **Sensitive data:** catalog chỉ trả metadata PUBLISHED; video/quiz answer đầy đủ không nằm trong public catalog. Profile response không có password_hash; đơn hàng và tiến độ được scope theo user. Generic exception response không trả SQL/stacktrace.
- **CORS:** origins lấy từ env, methods cấu hình cụ thể, allowCredentials=true; authorization vẫn do JWT/role/ownership thực hiện. CORS không chặn Postman.
- **CSRF/session:** cookie-only mutation test từ 200 chuyển thành 401. OAuth authorization request/state vẫn dùng session; API identity không được persist/load từ session. Kiểm thử bao gồm thứ tự rate-limit filter trước OAuth redirect để không bị short-circuit bypass.
- **File upload:** không thấy MultipartFile hay upload endpoint trong backend hiện tại; các document/attachment/video URL là metadata. Không kết luận cơ chế upload của dịch vụ bên ngoài đã được audit.
- **Actuator:** chỉ health/prometheus được expose; health details=never, Nginx chặn actuator public ngoài health; backend không publish host port trong Compose hiện tại. Chưa kiểm tra firewall/cấu hình runtime trên server.
- **Diff validation:** git diff --check -- backend docs pass. Các thay đổi Nginx/Compose độc lập của người dùng không thuộc bản sửa audit này.
## D. Changes Made

Ownership ở service; DTO contract giữ tương thích (email change-password cũ chỉ được khớp principal). Password helper và legacy migration, rate limits, JWT credential stamp, request-scoped SecurityContext, deny-by-default và exception semantics. Không đổi production schema, không tạo role/permission mới, không ẩn API bằng frontend, không thay payment amount/grading rules.

Các file backend/test đã thay đổi:

- `backend/pom.xml`: thêm H2 test-scope; dependency production không đổi.
- `backend/src/main/java/com/app/config/SecurityConfig.java`: context theo request, role/path/method gate, default deny và logout POST.
- `backend/src/main/java/com/app/exception/handler/GlobalExceptionHandler.java`: chuẩn hóa 401/403/400/429 và che chi tiết lỗi backend.
- `backend/src/main/java/com/app/features/auth/controller/JwtTokenController.java`: ràng buộc và kiểm tra credential stamp cho access/refresh.
- `backend/src/main/java/com/app/features/auth/converter/RegisterConverter.java`: BCrypt, giới hạn 72 UTF-8 bytes, chặn OAuth marker.
- `backend/src/main/java/com/app/features/auth/dto/ResetPasswordDto.java`: giữ nguyên byte/ký tự password; chỉ normalize email/token.
- `backend/src/main/java/com/app/features/auth/exception/InvalidLoginException.java`: chuẩn hóa 401/403/400/429 và che chi tiết lỗi backend.
- `backend/src/main/java/com/app/features/auth/repository/VerificationTokenRepository.java`: attempt budget OTP và lock khi kiểm tra/consume token.
- `backend/src/main/java/com/app/features/auth/service/impl/AuthServiceImpl.java`: chặn marker, account throttle, normalize email và migrate legacy hash sau login thành công.
- `backend/src/main/java/com/app/features/auth/service/impl/PasswordServiceImpl.java`: reset BCrypt, hạn chế yêu cầu OTP và response không phân biệt account tồn tại.
- `backend/src/main/java/com/app/features/auth/service/impl/VerificationTokenServiceImpl.java`: attempt budget OTP và lock khi kiểm tra/consume token.
- `backend/src/main/java/com/app/features/users/controller/UserController.java`: role guard, authenticated principal, self-only ownership và password change đúng ngữ nghĩa.
- `backend/src/main/java/com/app/features/users/service/impl/UserProfileServiceImpl.java`: role guard, authenticated principal, self-only ownership và password change đúng ngữ nghĩa.
- `backend/src/main/java/com/app/security/jwt/JwtAuthenticationFilter.java`: ràng buộc và kiểm tra credential stamp cho access/refresh.
- `backend/src/main/java/com/app/security/jwt/JwtService.java`: ràng buộc và kiểm tra credential stamp cho access/refresh.
- `backend/src/main/java/com/app/security/password/PasswordHashing.java`: BCrypt, giới hạn 72 UTF-8 bytes, chặn OAuth marker.
- `backend/src/main/java/com/app/security/ratelimit/AuthenticationAttemptLimiter.java`: bounded thread-safe quota theo IP/account.
- `backend/src/main/java/com/app/security/ratelimit/AuthenticationRateLimitFilter.java`: bounded thread-safe quota theo IP/account.
- `backend/src/main/java/com/app/utils/SecurityUtils.java`: role guard, authenticated principal, self-only ownership và password change đúng ngữ nghĩa.
- `backend/src/test/java/com/app/application/BackendApplicationTests.java`: smoke test trên H2, bỏ importer schema/seed thật.
- `backend/src/test/java/com/app/backend/BackendApplicationTests.java`: smoke test trên H2, bỏ importer schema/seed thật.
- `backend/src/test/java/com/app/BackendApplicationTests.java`: smoke test trên H2, bỏ importer schema/seed thật.
- `backend/src/test/java/com/app/features/auth/AuthenticationSettingsIntegrationTest.java`: đưa limiter vào test fixture, giữ các kiểm tra role/status cũ.
- `backend/src/test/java/com/app/features/auth/converter/RegisterConverterTest.java`: kiểm chứng BCrypt và role STUDENT sau đăng ký.
- `backend/src/test/java/com/app/features/auth/service/impl/AuthServiceImplTest.java`: đưa limiter vào test fixture, giữ các kiểm tra role/status cũ.
- `backend/src/test/java/com/app/security/ratelimit/AuthenticationAttemptLimiterTest.java`: kiểm chứng quota, concurrency, expiry và dừng request trước controller.
- `backend/src/test/java/com/app/security/ratelimit/AuthenticationRateLimitFilterTest.java`: kiểm chứng quota, concurrency, expiry và dừng request trước controller.
- `backend/src/test/java/com/app/security/SecurityAuditIntegrationTest.java`: MockMvc + database assertion cho authentication, role, ownership và mass assignment.
- `backend/src/test/java/com/app/security/support/InMemoryDatabaseGuard.java`: cấu hình fake credential và chặn datasource ngoài bộ nhớ.
- `backend/src/test/resources/application-security-test.properties`: cấu hình fake credential và chặn datasource ngoài bộ nhớ.

Report này là `docs/security/SECURITY_AUDIT_REPORT.md`. `docs/security/endpoint-security-matrix.json` ghi inventory với source path/line để đối chiếu.

## E. Test Results

Verification trên bản sao sạch, dùng dependency cache và JDK 17:

- Baseline cũ: 123 tests, 0 failures, **4 bootstrap errors**, 26 skips, vì smoke tests yêu cầu external env/datasource; phát hiện importer phá hoại trước khi cấp datasource.
- Red security regression: 79 cases, **9 failures**, 0 errors; không có production request.
- Sau sửa: **199 tests tổng, 173 passed, 0 failures, 0 errors, 26 skipped**.
- `mvn verify`: **BUILD SUCCESS**, Spring Boot executable JAR được đóng gói.
- 73 integration cases trong SecurityAuditIntegrationTest trên **H2 DB thật trong bộ nhớ**, không mock user/payment/subscription repositories. Đọc lại DB sau denied request để xác nhận profile, password, role, invoice, payment, subscription, audit rows không bị sửa trái phép.
- Các test bổ sung: 3 account-rate-limit cases (gồm đồng thời và clock expiry), 1 IP filter case, guest/invalid JWT cho 34 protected APIs, STUDENT deny cho 14 admin APIs, 2xx của self-profile/admin hợp lệ, OAuth code one-time, handshake state/cookie, refresh-vs-access, expired/wrong signature, forged roles, account disable, password-change token invalidation, plaintext migration, invalid webhook, invoice owner, trial spoofed userId.
- Test dùng fake keys/client ids, MailService mock; không gửi email, không gọi PayOS để tạo thanh toán, không dùng session Google/Facebook của người thật.

Chạy lại:

```powershell
Set-Location D:\SBA301\backend
$env:RUN_MYSQL_INTEGRATION_TESTS = 'false'
mvn verify
```

### Chưa thực hiện và rủi ro còn lại

1. **26 MySQL integration cases chưa chạy**: chưa có MySQL test riêng. H2 không thay thế kiểm chứng native MySQL functions, transaction isolation, lock/concurrency trên MySQL. Không bật RUN_MYSQL_INTEGRATION_TESTS với DB thật.
2. **Medium — refresh rotation/revoke-on-logout chưa có**: refresh token vẫn có thể replay đến expiry nếu credential/status không đổi. Logout chỉ xóa session; frontend phải xóa token. Password change/reset hoặc account disable hiện làm token cũ không dùng được. Persistent token-family/revocation storage cần thiết kế riêng; chưa đổi schema cho chức năng mới.
3. **Medium — plaintext legacy còn lại ở DB cũ** cho tới khi user login/migrate hoặc reset password. Audit không tự đọc/chuyển/rotate dữ liệu thật. Bản deploy mới bảo vệ mọi credential mới.
4. Rate limiter trong bộ nhớ reset khi restart, hoạt động theo instance; nếu chạy nhiều replica cần shared limiter. Budget theo account có thể bị dùng để làm chậm login/reset của một account. TTL/window và giới hạn IP là giá trị ban đầu cần quan sát vận hành.
5. Backend tin forwarding headers khi đi sau Nginx. Nếu publish trực tiếp backend ra Internet, client có thể làm sai remote address/protocol của forwarding filter; không bỏ network boundary hiện có.
6. Cookie OAuth HttpOnly/SameSite=Lax đã có; production phải chạy HTTPS, kiểm tra Secure cookie và đúng callback provider. Không kiểm thử DNS/certificate/dashboard Google/Facebook thật. Không đổi env/domain của server trong audit.
7. .env.example local đang chứa giá trị secret không phải placeholder; file hiện không nằm trong git tracked/build context được quét. Không xác nhận có leak công khai. Giữ credential ngoài template, hạn chế quyền file; nếu từng public/push thì phải rotate ở provider. Report không chứa các giá trị đó.
8. Không chạy external dependency-CVE scan hoặc penetration test trên server; phiên bản dependency được xác nhận từ POM/cache, không kết luận mọi dependency hết CVE. Log nội bộ còn email/PII, cần policy retention/access; không thấy log trực tiếp password/JWT/reset OTP.

**Lưu ý rollout:** token cũ không có claim pwd sẽ trả 401 sau deploy; người dùng cần login lại. Thông báo sai login chuyển từ 400 sang 401. Change-password sai không còn giả báo 200. Sau change/reset password, access và refresh token cũ đều bị vô hiệu theo credential stamp.

## References

- [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html): deny-by-default và kiểm tra permission trên từng request.
- [OWASP Business Logic Security](https://cheatsheetseries.owasp.org/cheatsheets/Business_Logic_Security_Cheat_Sheet.html): ownership và business permission ở service.
- [Spring Security persistence](https://docs.spring.io/spring-security/reference/servlet/authentication/persistence.html): security context repository và phạm vi session/request.
- [Spring Security CSRF](https://docs.spring.io/spring-security/reference/servlet/exploits/csrf.html): cookie/session credential cần xem xét CSRF; CORS không thay authorization.
