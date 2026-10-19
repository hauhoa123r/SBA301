# Audit và refactor JWT token storage

Ngày: 18/10/2026. Phạm vi: Spring Boot 3.5.7 monolith và React/TypeScript/Axios hiện có. Không đổi giao diện nghiệp vụ, đăng ký, xác minh email, quên/đổi mật khẩu hoặc chính sách STUDENT/ADMIN. Thay đổi xóa một dòng trống có sẵn trong `AuthServiceImpl.java` được giữ nguyên.

## A. Root cause và kết quả audit trước sửa

| Câu hỏi | Bằng chứng trong repository trước sửa |
|---|---|
| Token được tạo ở đâu? | `JwtService.createAccessToken/createRefreshToken`; login gọi từ `AuthServiceImpl`, OAuth gọi từ `OAuthTokenExchangeController`, refresh gọi từ `JwtTokenController`. |
| Token được trả về thế nào? | Login, OAuth exchange và refresh đều trả access/refresh token trong JSON. |
| Frontend lưu ở đâu? | `authSession.ts` ghi `token`, `refreshToken`, `user` vào localStorage. `axiosClient.ts` cũng đọc/ghi lại các key này khi refresh. `ViewProfilePage.jsx` ghi thêm user profile. |
| Vì sao thấy cả cookie và localStorage? | JWT nằm trong localStorage. OAuth dùng HttpSession để giữ authorization request/state, nên có thể tạo `JSESSIONID`. Không tìm thấy code ghi JWT bằng `document.cookie`, thư viện Cookies hoặc Set-Cookie trước sửa. Vì vậy chưa có bằng chứng cookie được quan sát trên trình duyệt là cùng JWT; cần xem tên cookie trên môi trường thực tế. |
| API lấy token ở đâu? | Axios request interceptor đọc localStorage key `token`, gắn `Authorization: Bearer`. |
| Refresh có tồn tại không? | Có: POST `/api/auth/refresh` nhận raw refresh token trong JSON và trả cả hai token. Không có bảng phiên refresh, thu hồi hoặc phát hiện reuse. Refresh JWT cũng chưa có ID ngẫu nhiên, nên phát hành trong cùng giây có thể cho cùng giá trị. |
| F5/đóng mở trình duyệt? | Frontend khôi phục user từ localStorage, dùng access token đã lưu; chỉ refresh khi API trả 401. Logout cũ xóa dữ liệu client và OAuth session, không vô hiệu hóa JWT refresh đã sao chép. |

Đã kiểm tra SecurityFilterChain, JWT filter/service, AuthController/AuthService, register/password/email verification, OAuth exchange/callback, CORS, exception handlers, role policy, các protected routes và toàn bộ tham chiếu storage/token trong source. Không tìm thấy đường ghi JWT vào sessionStorage, IndexedDB hoặc URL trong code hiện tại. sessionStorage giữ đường dẫn quay lại OAuth; URL OAuth chứa authorization code dùng một lần. URL xác minh email chứa verification token riêng, không phải JWT access/refresh; tính năng này được giữ nguyên. Không phát hiện lệnh console log JWT trong frontend.

SecurityConfig trước sửa tắt CSRF toàn bộ. API đã dùng security context theo request, kiểm tra user/role hiện tại trong DB và có deny-all cho route không phân loại; các cơ chế này được giữ. CORS trước sửa dùng origin cấu hình cụ thể và credentials; bản sửa bổ sung fail-fast nếu cấu hình origin rỗng, wildcard hoặc `null`.

## B. Files changed

Các đường dẫn dưới đây tương đối với root repository.

| File | Mục đích |
|---|---|
| `backend/src/main/java/com/app/config/SecurityConfig.java` | Bật CSRF cho các thao tác thiết lập/sử dụng cookie; Origin filter; thu hồi refresh session khi logout. |
| `backend/src/main/java/com/app/config/CorsConfig.java` | Từ chối origin wildcard/rỗng/null khi bật credentials. |
| `backend/src/main/java/com/app/security/jwt/AuthCookieRequestMatcher.java` | Xác định POST login, OAuth exchange, refresh, logout cần CSRF. |
| `backend/src/main/java/com/app/security/jwt/AuthOriginFilter.java` | Yêu cầu Origin nằm chính xác trong allowlist cho bốn endpoint trên. |
| `backend/src/main/java/com/app/security/jwt/RefreshCookie.java` | Tạo/xóa host-only HttpOnly cookie với cùng tên/path và chính sách Secure/SameSite. |
| `backend/src/main/java/com/app/security/jwt/JwtService.java` | Refresh JWT có session ID, ID ngẫu nhiên từng token và expiry tuyệt đối. |
| `backend/src/main/java/com/app/features/model/RefreshSessionEntity.java` | Lưu user, hash token hiện tại, expiry, thời điểm rotation và trạng thái thu hồi. |
| `backend/src/main/java/com/app/features/auth/repository/RefreshSessionRepository.java` | Khóa bản ghi phiên bằng PESSIMISTIC_WRITE. |
| `backend/src/main/java/com/app/features/auth/service/RefreshSessionService.java` | Đăng ký, rotation, kiểm tra credential/account, thu hồi và xử lý reuse. |
| `backend/src/main/java/com/app/features/auth/controller/AuthController.java` | Đăng ký phiên server và set cookie khi login. |
| `backend/src/main/java/com/app/features/auth/controller/JwtTokenController.java` | GET csrf; refresh chỉ đọc cookie và xóa cookie khi phiên không hợp lệ. |
| `backend/src/main/java/com/app/features/auth/dto/response/TokenResponse.java` | Không serialize refresh token; không đưa credential vào toString. |
| `backend/src/main/java/com/app/features/oauth/controller/OAuthTokenExchangeController.java` | Dùng cùng contract/cookie/refresh-session với login thường. |
| `backend/src/main/java/com/app/features/oauth/dto/response/OAuthTokenExchangeResponse.java` | Xóa DTO trùng chức năng và từng trả refresh token trong JSON. |
| `backend/src/main/resources/application.properties` | Cookie production mặc định Secure, SameSite cấu hình được. |
| `backend/src/main/resources/application-local.properties` | Chỉ profile local cho phép cookie trên HTTP. |
| `backend/src/test/resources/application-security-test.properties` | HTTP cookie cho test cô lập. |
| `backend/src/test/java/com/app/security/TokenStorageIntegrationTest.java` | Test cookie, CSRF thật, rotation, expiry, reuse commit, logout, RBAC, cạnh tranh refresh. |
| `backend/src/test/java/com/app/security/SecurityAuditIntegrationTest.java` | Dùng endpoint CSRF thật cho các auth request; giữ các assertion bảo mật trước đây. |
| `backend/src/test/java/com/app/features/admin/AuthenticationSettingsSecurityTest.java` | Mock các dependency mới của SecurityConfig trong MVC slice. |
| `backend/src/test/java/com/app/features/admin/DashboardSecurityTest.java` | Tương tự; giữ kiểm tra phân quyền dashboard. |
| `backend/src/test/java/com/app/features/admin/StudentManagementSecurityTest.java` | Tương tự; giữ kiểm tra phân quyền quản lý. |
| `backend/src/test/java/com/app/features/feedback/FeedbackSecurityTest.java` | Tương tự; giữ kiểm tra phân quyền feedback. |
| `backend/src/test/java/com/app/features/learning/LearningSecurityTest.java` | Tương tự; giữ kiểm tra phân quyền học tập. |
| `deployment/legacy-sql/20261018_refresh_sessions.sql` | Migration additive, chạy lặp được cho DB hiện hữu. |
| `deployment/legacy-sql/chinese_online_learning.sql`, `database/Dockerfile` | Tạo bảng cho DB mới và đưa migration vào init chain. |
| `database/jpa-schema-contract.tsv`, `database/tests/check-schema.sql`, `backend/src/test/resources/schema/jpa-schema-contract.tsv` | Đồng bộ contract và schema guard với entity mới. |
| `frontend/src/shared/api/authMemory.ts` | Access token/user chỉ trong memory, subscription và hàng đợi khóa thao tác cookie. |
| `frontend/src/shared/api/axiosClient.ts` | Bearer từ memory, CSRF bootstrap, credentialed refresh, single-flight và retry tối đa một lần. |
| `frontend/src/shared/api/axiosClient.test.ts` | Test reload, 12 request 401 đồng thời, retry giới hạn, hết phiên và logout trong lúc refresh. |
| `frontend/src/features/auth/model/authSession.ts` | Migration chỉ xóa key auth cũ; parse/persist vào memory. |
| `frontend/src/features/auth/model/authSession.test.ts` | Kiểm tra migration, memory-only và bảo toàn theme/language. |
| `frontend/src/features/auth/model/auth.types.ts` | Bỏ refresh token khỏi client contract; thêm initializing. |
| `frontend/src/features/auth/model/AuthProvider.tsx` | Khôi phục phiên từ cookie trước khi render ứng dụng và đồng bộ store với Context. |
| `frontend/src/features/auth/api/authApi.ts` | Tuần tự hóa login/OAuth/logout; chặn phản hồi auth cũ sau khi phiên đã đổi. |
| `frontend/src/features/auth/ui/OAuthCallbackView.tsx` | Không giữ response token trong cache sau exchange hoặc áp dụng session sau unmount. |
| `frontend/src/app/router/ProtectedRoute.tsx`, `frontend/src/app/router/RoleRoute.tsx` | Đợi initialization trước khi redirect. |
| `frontend/src/features/user/pages/ViewProfilePage.jsx` | Bỏ ghi user vào localStorage. |
| `frontend/src/features/auth/ui/UserProfileMenu.tsx`, `frontend/src/widgets/header/ui/Header.tsx` | Báo rõ nếu server logout thất bại. |
| `docker-compose.yml` | Truyền AUTH_COOKIE_SAME_SITE, mặc định Lax. |
| `.env.example`, `.gitignore` | Loại giá trị credential khỏi file mẫu đang có trong workspace, dùng URL HTTPS mẫu và cho phép Git theo dõi bản đã làm sạch. File mẫu trước đó bị ignore; audit này không xác nhận credential đã từng được commit/chia sẻ. |
| `docs/security/JWT_TOKEN_STORAGE_REFACTOR.md` | Báo cáo này. |

## C. Authentication flow sau sửa

1. **Login:** frontend GET `/api/auth/csrf` với credentials, nhận CSRF token trong JSON và cookie CSRF HttpOnly. POST login gửi `X-XSRF-TOKEN`; trình duyệt tự gửi Origin. Backend kiểm tra mật khẩu/status/role bằng logic cũ, tạo access JWT và refresh JWT, lưu SHA-256 của refresh vào DB. JSON chỉ có `accessToken` và `user`; Set-Cookie chứa refresh. Frontend giữ access/user trong memory.
2. **Authenticated request:** Axios đọc access từ memory và gắn Bearer. JWT filter vẫn xác minh signature, expiry, credential stamp, status và quyền hiện tại trong DB. Cookie refresh không xác thực API nghiệp vụ. Thiếu token nhận 401; thiếu quyền nhận 403.
3. **Refresh:** một Promise dùng chung cho các 401 đồng thời. Frontend lấy CSRF token mới, POST refresh với credentials và body rỗng. Backend xác minh JWT và phiên DB, khóa phiên, thay hash bằng token mới có ID ngẫu nhiên; giữ expiry tuyệt đối của phiên. Trả access/user và set cookie mới. Mỗi request cũ chỉ được retry một lần; 403 không kích hoạt refresh. Request 401 đến trễ dùng access đã được request khác refresh nếu có.
4. **Page reload:** memory bắt đầu rỗng. AuthProvider hiển thị initializing, gọi refresh một lần kể cả React StrictMode. Refresh thành công khôi phục user/access; không hợp lệ thì chuyển sang trạng thái anonymous, sau đó protected route mới quyết định redirect. Cookie có Max-Age nên đóng/mở lại trình duyệt vẫn khôi phục được trong thời hạn phiên.
5. **Logout:** frontend xóa memory ngay để gỡ dữ liệu nhạy cảm khỏi UI. Request logout được tuần tự hóa với refresh để cookie từ một response cũ không xuất hiện sau response logout. Backend thu hồi phiên, xóa refresh cookie đúng path, xóa CSRF/OAuth session theo Spring Security. Frontend reset store và chuyển login; refresh đang chạy không được ghi credentials lại vào memory.

OAuth vẫn dùng authorization code một lần qua callback URL rồi POST exchange; JWT không được đưa vào URL. Header/protected-page state được tháo khi user trở thành anonymous. Không có QueryClient hoặc cache IndexedDB để cần xóa toàn bộ. Cache response OAuth được giải phóng sau exchange. Migration xóa đúng `token`, `refreshToken`, `user` khỏi localStorage/sessionStorage; không đọc hoặc tái sử dụng token cũ, không xóa theme/language/preferences. Không thêm thao tác xóa cookie tùy tiện vì audit không tìm thấy cookie JWT legacy trong source.

## D. Security improvements, deployment và giới hạn

### Chính sách phiên/cookie

- Refresh cookie: `refresh_session`, HttpOnly, host-only (không Domain), Path `/api/auth`, SameSite Lax mặc định, Max-Age theo expiry của JWT. Production luôn Secure qua cấu hình mặc định. `SameSite=None` chỉ chấp nhận cùng Secure; không dùng trừ deployment cross-site thật sự cần.
- CSRF cookie `XSRF-TOKEN` cũng HttpOnly, cùng phạm vi path và chính sách Secure/SameSite. JavaScript lấy CSRF token qua GET `/api/auth/csrf`, không đọc refresh cookie. Spring response mặc định có Cache-Control no-store.
- Access TTL lấy từ `JWT_ACCESS_TTL`, mặc định PT15M. Refresh TTL từ `JWT_REFRESH_TTL`, mặc định P30D, tính từ login, không được kéo dài vô hạn bởi rotation. Secret chỉ từ cấu hình bên ngoài.
- Replay trong vòng 5 giây sau rotation nhận 409, không được cấp access token, không thu hồi phiên thắng và không gửi cookie xóa đè cookie mới. Ngoài khoảng này, reuse thu hồi toàn bộ phiên và trả 401. Thao tác thu hồi commit dù response là 401. Logout bằng bất kỳ token còn hạn của phiên cũng thu hồi phiên đó.
- Web Locks tuần tự hóa thao tác cookie giữa các tab cùng origin nếu trình duyệt hỗ trợ; fallback Promise queue đảm bảo trong một tab. Nhiều tab trên trình duyệt không hỗ trợ Web Locks hoặc retry sau response bị mất có thể nhận 409 và phải khôi phục/đăng nhập lại. Không có grace period cấp lại credential cho token cũ.

### Triển khai

1. Với database hiện hữu, áp dụng **chỉ** `deployment/legacy-sql/20261018_refresh_sessions.sql` theo quy trình migration/backup đang dùng, trước backend mới. Không import base schema hoặc xóa volume trên DB cần giữ dữ liệu. Agent chỉ chạy migration trên MySQL thử nghiệm cô lập.
2. Chạy `python database/generate-schema-check.py --check` và schema guard của pipeline. Hibernate production vẫn không tự ALTER database. Với DB mới, schema và Docker init chain đã có bảng mới.
3. Cung cấp JWT secret ngẫu nhiên ngoài repository; điền lại credential thật vào secret store/environment. Nếu các giá trị cũ trong file mẫu là credential thật đã từng chia sẻ, cần thay chúng tại nhà cung cấp. Việc xóa khỏi file không thu hồi credential đã bị lộ.
4. Production phục vụ HTTPS; đặt `CORS_ALLOWED_ORIGINS` chính xác bằng origin frontend có scheme/host/port, không thêm dấu `/` cuối. Các URL callback/verify/payment dùng URL public HTTPS tương ứng. Proxy hiện tại giữ Origin. AUTH_COOKIE_SAME_SITE=Lax phù hợp topology reverse proxy cùng site đang có.
5. Local: dùng Spring profile `local`, frontend `http://localhost:5173`, API `http://localhost:8081` qua Vite proxy hiện có; origin allowlist là localhost:5173. Chỉ profile local/test đặt Secure=false. Không dùng profile local trên production.
6. Triển khai frontend/backend cùng đợt: client cũ gửi refresh trong JSON sẽ bị từ chối. Legacy refresh JWT không có phiên/sid không thể dùng với endpoint mới. Người dùng cũ cần đăng nhập lại lần đầu; không đưa JWT legacy từ storage vào cookie để nâng cấp tự động.

### Rủi ro/giới hạn còn lại

- HttpOnly ngăn JavaScript đọc refresh token; XSS đang chạy trong origin vẫn có thể thực hiện hành động hoặc lấy access token mới. Vẫn cần kiểm soát XSS và nội dung không tin cậy. Không tuyên bố việc đổi storage loại bỏ XSS.
- Access JWT đã bị sao chép trước logout có thể còn hiệu lực đến TTL; không thêm blacklist access token. Password/credential thay đổi và tài khoản khóa vẫn bị kiểm tra bằng cơ chế hiện có. Refresh token của phiên logout không thể cấp thêm access.
- Nếu backend/mạng hỏng khi logout, frontend vẫn xóa memory nhưng không thể xóa HttpOnly cookie hoặc cam kết server đã thu hồi. UI hiện thông báo tải lại khi có mạng rồi đăng xuất lại. Sau F5 cookie còn hợp lệ có thể khôi phục phiên trong tình huống này.
- Phiên hết hạn được từ chối ngay nhưng chưa có job dọn bản ghi tự động. Có thể dọn các hàng `expires_at` đã qua bằng quy trình bảo trì DB; không cần giữ plaintext token.
- Chưa kiểm tra trên browser người dùng hoặc production thực tế. Trạng thái cookie từ phiên cũ ngoài code repository cần được xác nhận qua DevTools; không suy đoán hoặc xóa các cookie không rõ nguồn.

Thiết kế tham chiếu [Spring Security CSRF cho SPA](https://docs.spring.io/spring-security/reference/7.0/servlet/exploits/csrf.html), [OWASP HTML5 storage](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html), và [OWASP OAuth2 refresh-token rotation](https://cheatsheetseries.owasp.org/cheatsheets/OAuth2_Cheat_Sheet.html). API cụ thể đã được compile/test trên phiên bản Spring Boot của repository.

## E. Test results

| Bộ kiểm tra | Kết quả cuối cùng |
|---|---|
| Maven toàn bộ, Java 17, bật MySQL integration và fresh-schema tests trên MySQL 8 cô lập | **232 PASS, 0 failure, 0 error, 0 skip**. |
| Frontend `npm.cmd test` | **49 PASS**, 9 file test. |
| Frontend `npm.cmd run build` | PASS: TypeScript và Vite production build. |
| Frontend `npm.cmd run lint` | PASS. |
| `python database/generate-schema-check.py --check` | PASS. |
| MySQL fresh schema + full init chain + migration refresh chạy hai lần + SQL guard | PASS trên datadir mới cô lập trong workspace. |
| `git diff --check` | PASS. |
| Compose config tests | **5/5 PASS**; không cần Docker daemon. |
| Toàn bộ `python -m unittest discover -s deployment/tests -v` | **17/20 test method PASS, 3 test method lỗi với 4 error/subcase**. Các lỗi là IndexError khi test tìm stage `CONNECT_SERVER`/`VERIFY_PUBLIC_HTTPS` không có trong Jenkinsfile hiện tại; Jenkinsfile và các test này không bị thay trong bản sửa auth. Không sửa cấu trúc pipeline ngoài phạm vi nhiệm vụ. |
| Chrome DevTools, OAuth thật tại Google/Facebook, HTTPS production end-to-end | Chưa chạy: không có browser session/provider credentials/production session được dùng cho nhiệm vụ này. Có automated OAuth exchange và handshake regression tests. |

Maven mặc định ban đầu không ghi được cache ở `C:\\.m2\\repository`; dùng cache sẵn tại `.deployment-check/m2` trong workspace để chạy offline. Lượt Maven mặc định sau khi cập nhật MVC test dependencies pass; các MySQL test được skip theo environment gate. Lượt xác nhận cuối bật cả hai gate dưới đây, không còn skip. Docker daemon không khả dụng nên dùng MySQL 8 native và Java 17 đã cài, không cần tải dependency hoặc chạy container production.

Lệnh kiểm chứng chính, chạy từ `backend`:

```powershell
mvn.cmd -q -o '-Dmaven.repo.local=D:\SBA301\.deployment-check\m2' test
```

Để chạy cả MySQL suites, đặt `RUN_MYSQL_INTEGRATION_TESTS=true`, `RUN_FRESH_SCHEMA_TESTS=true`, `DB_URL` và `FRESH_SCHEMA_JDBC_URL` trỏ đến **MySQL test cô lập** tại cổng `127.0.0.1:33087` (cổng guard dự án cho phép), cùng test credential và application placeholders. Không trỏ các gate này vào production. Lượt chạy dùng thêm `-Dsurefire.reportNameSuffix=jwt-native` để tách report cũ; XML bằng chứng ở `backend/target/surefire-reports/TEST-*-jwt-native.xml`, log tổng ở `backend/target/jwt-mysql-d43454a0851e418d900c341804fc72ca/maven.log`. Các artifact target không được commit.

Runner kiểm chứng đã xác nhận `@@datadir` khớp đường dẫn DB tạm trước khi import schema và trước khi shutdown. MySQL tạm đã dừng; không chạy migration trên database người dùng hoặc triển khai production. Lượt cấu hình thử đầu tiên dùng cổng ngẫu nhiên bị fresh-schema test guard từ chối; lượt cuối dùng đúng cổng 33087 và pass. Lượt generate contract đầu tiên phát hiện classpath resource cũ, đã đồng bộ và các contract tests cuối đều pass.

| Luồng yêu cầu | Bằng chứng automated |
|---|---|
| Login và access trong memory | Backend login/cookie test; authSession memory test. |
| Không JWT trong localStorage/sessionStorage; giữ preferences | Migration/authSession test; source scan không còn ghi token/user vào storage. |
| Refresh chỉ HttpOnly cookie, không JSON | TokenStorageIntegrationTest kiểm tra HttpOnly/path/SameSite/expiry và JSON không có refreshToken. |
| JavaScript không đọc được refresh cookie | Kiểm tra thuộc tính HttpOnly; cần xác minh enforcement trong Chrome theo mục F. |
| F5 và refresh hết hạn | Axios initialization tests kiểm tra đợi refresh, StrictMode không gọi lặp, expired cookie thành anonymous. |
| Access hết hạn, retry một lần | Axios test 12 request 401 cùng lúc chỉ tạo một refresh; test retry vẫn 401 không lặp. |
| Logout và token cũ | Cookie rotation/logout test; replay ngoài khoảng cạnh tranh thu hồi và commit qua transaction thật. |
| 401/403 và giữ RBAC | SecurityAuditIntegrationTest cùng các MVC security suites hiện có. |
| Refresh đồng thời | Backend test hai thread chỉ một thành công, một 409; frontend single-flight/queue. Backend cạnh tranh chạy trên H2; MySQL schema và các integration tests hiện có được kiểm chứng riêng. |
| CSRF | Dùng GET csrf thật; thiếu token, token sai, thiếu Origin, Origin lạ đều bị chặn. Không dùng mock csrf để thay thế assertion này. |
| Token cũ sau migration | Storage legacy bị xóa và không restore user; endpoint từ chối body refresh legacy. |

## F. Manual verification bằng Chrome DevTools

1. **Application → Local Storage / Session Storage:** trước khi load bản mới có thể đặt giá trị giả vào key `token`, `refreshToken`, `user` và theme/language giả. Load lại: key auth bị xóa, preferences còn. Login/refresh không tạo key token mới. sessionStorage `oauthReturnTo` chỉ chứa đường dẫn điều hướng.
2. **Network → csrf và login:** csrf GET trả JSON token và Set-Cookie XSRF-TOKEN; login POST có X-XSRF-TOKEN/Origin. Login JSON chỉ có accessToken và user; không có refreshToken. Không copy token thật vào báo cáo hoặc console.
3. **Application → Cookies:** refresh_session có HttpOnly, Path=/api/auth, Max-Age; production có Secure và SameSite=Lax. Có thể còn JSESSIONID do OAuth, và có XSRF-TOKEN riêng. DevTools cho phép người vận hành xem cookie HttpOnly, điều này không có nghĩa JavaScript đọc được cookie.
4. **JavaScript access:** kiểm tra thuộc tính HttpOnly trong Application; nếu kiểm tra qua Console, chỉ đánh giá boolean `document.cookie.split(';').some(c => c.trim().startsWith('refresh_session='))`. Kết quả phải false; không in document.cookie hoặc token ra console.
5. **Network → refresh:** F5 trên protected page; thấy loading rồi refresh POST có credentials/cookie và X-XSRF-TOKEN. Response đổi refresh cookie và trả access mới. Có thể cấu hình TTL ngắn ở môi trường thử nghiệm, chờ access hết hạn rồi gọi nhiều API để xác nhận chỉ một refresh và mỗi API retry tối đa một lần.
6. **Refresh hết hạn:** xóa cookie chỉ ở browser thử nghiệm, F5; protected route chuyển login sau initialization, không lặp request. Dùng mock cookie/token không hợp lệ trên môi trường test để kiểm tra 401; không tái sử dụng production token trong công cụ ngoài.
7. **Network → logout:** POST có CSRF header; 204 và Set-Cookie refresh_session Max-Age=0 cùng Path. Cookie biến mất, user/menu/cache trang riêng bị reset. F5 không restore. Xác minh revoked-token bằng automated test thay vì lưu token thật thủ công.
8. **CSRF/RBAC:** trong môi trường test, bỏ X-XSRF-TOKEN hoặc đổi Origin ở request refresh/logout phải 403. Cookie refresh đơn lẻ gọi protected API phải 401; student gọi admin API phải 403. Thử mạng offline khi logout để xem thông báo chưa thu hồi server, sau đó online và đăng xuất lại.

Các bước browser này là checklist bàn giao, chưa được thực hiện bằng một Chrome session trong lượt audit này.
