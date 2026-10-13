# SBA301 – Edujar Production Failure Audit

Ngày audit: **13/10/2026, Asia/Saigon (UTC+07:00)**. Repository: `D:\SBA301`, HEAD `be1d0e4`.

Phạm vi: audit source, cấu hình, build/test local và các HTTP HEAD không xác thực. Chỉ tạo báo cáo này; không sửa source/config, commit, push, SSH, deploy, chạy migration hoặc truy cập database ứng dụng. Không đọc/in `.env` production, password, JWT secret hay private key.

Workspace ban đầu có `docker-compose.yml` đã sửa: bỏ Prometheus/Grafana và volume tương ứng. Đây là thay đổi có sẵn, được giữ nguyên. Báo cáo phân tích **working tree hiện tại**, không mặc định nó giống bản trên EC2 hoặc bản Jenkins checkout. SHA256 của Compose được kiểm tra: `89A045B9CD688542A702D4E56097B68A105A25E71E3B30528D06673DD7A0EE3A`.

Các tham chiếu `path:line` bên dưới đều là file thực tế trong working tree. `Confirmed` xác nhận điều được quan sát trong source/local hoặc bằng chứng do người dùng cung cấp; không tự động xác nhận nguyên nhân production. `Likely` là giả thuyết phù hợp bằng chứng nhưng cần đối chiếu EC2. `Unverified` là chưa có bằng chứng runtime.

## Executive Summary

1. **Ưu tiên P0: xác minh đường HTTPS trước.** Bằng chứng EC2 do người dùng cung cấp là TCP tới `16.178.47.5:443` bị từ chối, chưa tới HTTP/controller/MySQL. TLS tới `::1` có lần thất bại sau khi kết nối TCP. Hai kết quả khác nhau không chứng minh cùng listener; phải kiểm tra riêng IPv4/IPv6, SNI, Docker publishing và Nginx.
2. Source hiện tại **đã có HTTPS**: `frontend/nginx.conf:23–27` listen 443 và đọc cert/key; `docker-compose.yml:107–113` publish 80/443, mount toàn bộ `/etc/letsencrypt`. Không có bằng chứng để kết luận source hiện tại thiếu port 443 hoặc sai tên upstream.
3. **Ứng viên API mạnh nhất sau khi HTTPS hoạt động: database production chưa migration.** Jenkins chỉ build/pull/start image, không migrate volume hiện hữu; Hibernate `ddl-auto=none`. Hai luồng đều dùng schema subscription mới. Pull image MySQL mới không cập nhật database trong volume cũ. Chưa lấy được schema/log EC2 để xác nhận việc thiếu bảng/cột.
4. **Lỗi xác nhận được:** `.env.example` thiếu `MYSQL_ROOT_PASSWORD`, lặp `MYSQL_PASSWORD`; Compose chạy với example thất bại. Frontend learning che mất loại lỗi transport/HTTP; subscription retry không retry status; backend generic exception log mất stack/cause; backend/Nginx thiếu healthcheck, Jenkins chưa kiểm tra hai API chức năng.
5. Frontend là **React 19 + Vite 8 + TypeScript, có các module JSX/JS**, backend **Spring Boot 3.5.7 / Java 17 monolith**, MySQL 8, Nginx và Docker Compose. CI/CD thực tế trong repo là **Jenkins**, không tìm thấy GitHub Actions. Không có microservices hoặc API Gateway trong topology đã kiểm tra.
6. Build frontend, compile Java 17 và tests hiện có đạt. Docker daemon local không chạy; không thể thực thi `nginx -t`, image build hay tests MySQL độc lập. Compose syntax/interpolation đạt khi dùng fixture validation có sẵn.

### TOP 5 ứng viên và thứ tự xử lý

| Ưu tiên | Nguyên nhân ứng viên | Bằng chứng | Confidence và điều chưa biết |
|---|---|---|---|
| P0 / 1 | Nginx không chạy/không phục vụ TLS, ví dụ certificate/key thiếu, symlink lỗi hoặc không đọc được | EC2 báo TCP refused; cert bắt buộc tại `frontend/nginx.conf:23–27`; host mount tại `docker-compose.yml:111–113` | **Likely** đối với nhánh HTTPS; nguyên nhân cert cụ thể **Unverified**. Cần state/log/nginx -t/cert metadata |
| P0 / 2 | Container/image/Compose thực chạy khác source hiện tại, port 443 chưa được publish hoặc config cũ | Source hiện tại có 443; `frontend/Dockerfile:18` nhúng Nginx vào image, Jenkins `:129–130,148–158` chuyển Compose rồi pull/start theo tag | **Unverified**. Cần image ID/digest/tag, port mapping, file effective trong container; sửa file host không đổi config đã nhúng |
| P1 / 3 | Volume MySQL cũ thiếu migration subscription/learning | `database/Dockerfile:3–6`; `application.properties:10`; migration `:644,654,675,1027`; Jenkins `:154–160` không có bước migration | Gap trong pipeline **Confirmed**; gây lỗi production **Likely**, chỉ xác nhận bằng schema/SQL error |
| P1 / 4 | Environment EC2/Jenkins thiếu hoặc không khớp database/JWT hiện hữu | Example thiếu root password; Compose yêu cầu biến ở `:11,14,53,58,77–84`; docker profile cố định `chinese_app`; MySQL volume cũ không tạo lại user/password | Example **Confirmed**; runtime thiếu biến/DB credential/JWT sai **Unverified**. Jenkins và EC2 dùng hai `.env` khác nhau |
| P0 kiểm chứng / 5 | Đường public IPv4/DNS/host firewall/SG/NACL hoặc listener IPv4 khác IPv6 | EC2 public-IP refused nhưng `::1` từng kết nối; Nginx chỉ khai báo `listen 443 ssl`, không có `listen [::]:443`; DNS local vẫn là `16.178.47.5` | **Unverified**. Cần địa chỉ public hiện tại của instance và thử public từ máy ngoài. Refused ưu tiên listener/publishing; SG drop thường biểu hiện timeout |

Các hạng 1, 2, 5 là các nhánh cần phân biệt cho **một triệu chứng transport**, không phải ba root cause đã chứng minh. Hạng 3–4 có thể là lỗi độc lập cùng tồn tại. Không gộp lỗi HTTPS với HTTP 500 thành một nguyên nhân đã xác nhận.

## Repository Inventory

| Hạng mục | File thực tế / kết quả |
|---|---|
| Frontend, dependencies, scripts | `frontend/package.json:6–39`, `frontend/vite.config.ts` |
| Router và phân quyền UI | `frontend/src/app/router/AppRouter.tsx:63,105–114`, `RoleRoute.tsx`, `routeAccess.ts` |
| HTTP client, API paths, errors | `frontend/src/shared/api/axiosClient.ts`, `apiPaths.ts`, `apiError.ts` |
| Subscription UI/API | `frontend/src/pages/subscriptions/SubscriptionsPage.tsx`, `frontend/src/features/subscription/api.ts`, `useSubscription.ts` |
| Learning UI/API | `frontend/src/features/learning/pages/StartLearningPage.jsx`, `hooks/useLearningDashboard.js`, `api/learning-profile-api.js`, `api/learning-api.js` |
| Backend build | `backend/pom.xml:8,30`, `backend/Dockerfile` |
| Spring profiles | `backend/src/main/resources/application.properties`, `application-local.properties`, `application-docker.properties`. Không có `application.yml` hoặc `application-prod.yml` trong repo |
| Security | `backend/src/main/java/com/app/config/SecurityConfig.java`, `CorsConfig.java`, `security/jwt/JwtAuthenticationFilter.java`, `JwtService.java` |
| Controllers/services/repositories | `backend/src/main/java/com/app/features/subscriptions/…`, `features/learning/…`, `features/courses/…`, entities trong `features/model/…` |
| Database | `database/Dockerfile`, `my.cnf`, schema/seed và các migration SQL; hướng dẫn `database/README-deploy-update.md` |
| Docker/Nginx | `docker-compose.yml`, `docker-compose.https.yml`, `frontend/Dockerfile`, `frontend/nginx.conf`, `nginx.https.conf`, `proxy_params` |
| Deployment/CI | `Jenkinsfile`; không tìm thấy workflow `.github`, shell/PowerShell deploy script hoặc Terraform trong repo đã quét |
| Monitoring | `monitoring/prometheus.yml`; services monitoring hiện bị bỏ trong working tree nhưng còn ở HEAD |
| Instruction files | Không tìm thấy `AGENTS.md` trong workspace đã quét |

## Frontend API Analysis

### `/subscriptions`: trace chính xác

```text
AppRouter.tsx:63 -> SubscriptionsPage
  -> SubscriptionsPage.tsx:23 getSubscriptionPlans()
  -> features/subscription/api.ts:19
  -> axiosClient.get('/api/subscriptions/plans')
  -> trình duyệt cùng origin: https://edujar.site/api/subscriptions/plans
  -> Nginx /api/ -> backend:8081, giữ nguyên /api/subscriptions/plans
  -> SecurityConfig.java:81 permitAll cho GET
  -> SubscriptionController.java:12,17–18
  -> SubscriptionService.java:32–33 listPlans()
  -> SubscriptionPlanRepository.java:9 findByActiveTrueOrderByPriceAsc()
  -> MySQL subscription_plans
```

Khi đã đăng nhập, `useSubscription.ts:11–16` gọi thêm `GET /api/subscriptions/me` -> Security `STUDENT` -> controller `:20–23` -> `SubscriptionService.status()` -> `user_subscriptions` và `course_enrollments`/`courses`. Chưa đăng nhập thì hook không gọi `/me`. `POST /api/subscriptions/trial` chỉ chạy khi chọn học thử; không phải request tải danh sách.

| Kiểm tra | Kết quả |
|---|---|
| Endpoint/method | Frontend GET plans, GET me, POST trial khớp controller và Security |
| JWT cho plans | Không bắt buộc; khách có thể tải gói. Client vẫn gắn token nếu có. Không nên kết luận mọi lỗi plans là JWT |
| Base URL | Axios không cấu hình `baseURL`; caller truyền đường dẫn tuyệt đối theo origin, bắt đầu `/api` |
| Localhost/mixed content | Không có HTTP absolute URL trong hai luồng. `http://localhost:8081` tại `vite.config.ts:12` chỉ là proxy dev |
| `VITE_*` | Không thấy sử dụng để chọn API URL trong `frontend/src`; Dockerfile không có ARG/ENV API URL. Chưa có bằng chứng build production nhúng API host sai |
| Response | Backend trả trực tiếp array entity gồm `code/name/price/durationDays/active`; frontend nhận `.data`, không có mismatch envelope |
| Empty plans | Repository có thể trả `[]`; UI hết loading rồi không có card, chưa có thông báo empty state (`SubscriptionsPage.tsx:72–91`) |
| Error | `getApiErrorMessage()` ưu tiên server body/string rồi native message (`apiError.ts:75–86`); Axios `Network Error` được hiển thị nếu không có response |

`Network Error` trên trang **không chứng minh HTTP 500**. Với 401/403/404/500 có response đọc được, helper thường hiển thị message HTTP/backend. Với TLS, kết nối bị chặn, CORS cross-origin hoặc mất mạng, Axios có thể không có response. Cần Network tab để biết request URL, status hoặc browser error. `/subscriptions` hiển thị `error || statusError` (`:70`), nên phải xác định lỗi thuộc **plans hay me**.

### `/learning`: trace chính xác

```text
AppRouter.tsx:105–114 -> RoleRoute(STUDENT) -> LearningLayout -> StartLearningPage
  -> useLearningDashboard.js:23 -> getLearningStats(selectedCourseId)
  -> learning-profile-api.js:5 -> GET /api/learning/stats[?courseId=...]
  -> SecurityConfig.java:93–96 (STUDENT)
  -> JwtAuthenticationFilter -> LearningController.java:67–70
  -> LearningServiceImpl.getLearningStats(userId, courseId)
  -> IUserRepository + CourseSelector + SubscriptionService.hasActiveAccess
  -> UserSubscriptionRepository / ICourseRepository / ICourseEnrollmentRepository
  -> MySQL users, user_subscriptions, courses, course_enrollments
  -> nếu có course: LearningStatsLoader -> ILearningStatsRepository
```

Sau stats, hook chọn course có quyền và gọi đồng thời (`useLearningDashboard.js:47–49`):

| Request | Backend trace | Database/content |
|---|---|---|
| `GET /api/learning/courses/{courseId}` | `LearningController:73–76` -> `LearningServiceImpl:58–62` -> `CourseAccessService.requireAccess()` -> `LearningDetailLoader:35–48` | courses/chapters/lessons/quizzes/questions/answers/assignments/lesson_documents/vocabularies/sentence_patterns |
| `GET /api/learning/courses/{courseId}/progress` | `LearningController:79–82` -> `LearningProgressServiceImpl:48–51,121–128` -> activity/lesson/chapter repositories + `LearningProgressDetailsLoader:21–36` | lesson_progress, user_chapter_progress, quiz_attempts, student_answers, assignment_submissions, activity-count queries |

Do `Promise.all`, chỉ một trong hai request detail/progress lỗi cũng đưa cả trang tới `StartLearningPage.jsx:30–31` với tiêu đề **“Không thể tải khóa học”**. Tiêu đề này không đủ để biết stats, detail hay progress thất bại; danh sách course có thể đã tải thành công.

`useLearningDashboard.js:59–60` chỉ lấy `response.data.message` hoặc câu chung. Nó không dùng helper chung, không giữ native `Network Error`, status hoặc loại lỗi trong state UI. `console.error` tại `:55` giữ object cho DevTools nhưng chưa phải telemetry phía server. Khi request được chọn course lần đầu, effect có thể chạy lại vì `setSelectedCourseId`; đây là request bổ sung, chưa có bằng chứng nó là nguyên nhân production.

### Build-time và runtime environment

Vite dev proxy chỉ phục vụ khi chạy dev server; production bundle được Nginx phục vụ và dựa vào Nginx reverse proxy. Biến môi trường runtime của container Nginx không tự sửa bundle. Trong repo hiện tại, API path là hằng `/api`, nên không cần thêm `VITE_API_URL` để sửa hai trang này. Nếu tương lai dùng `import.meta.env.VITE_*`, phải truyền ở bước build vì Vite thay giá trị khi build. Xem [Vite Env Variables and Modes](https://vite.dev/guide/env-and-mode).

Docker context frontend loại `.env*` (`frontend/.dockerignore:1–3`); Jenkins copy `.env` ở root không truyền nó vào build frontend. Đây không phải lỗi API URL đã chứng minh với source hiện tại.

## Backend API Analysis

### Security, JWT và status code

- `SecurityConfig.java:81` public GET plans; `:93–103` yêu cầu `ROLE_STUDENT` cho `/learning/**`, subscription me/trial. Controller cũng kiểm tra `STUDENT` bằng `@PreAuthorize`.
- `JwtAuthenticationFilter.java:42–54` parse token, đọc **subject=user ID**, load user với roles từ database, kiểm tra `ACTIVE` và credential stamp. Quyền thực tế lấy từ user/roles hiện tại, không chỉ tin claim roles.
- Expired/wrong-signature/refresh-as-access token không xác thực được (`JwtService.java:41–53`); protected endpoint trả 401. User đã xác thực nhưng chỉ ADMIN không được gọi API STUDENT -> 403. Client refresh một lần khi 401 (`axiosClient.ts:94–118`); refresh thất bại sẽ xóa session và redirect login.
- `CourseAccessService.java:24–30`: khóa chưa PUBLISHED/không tồn tại -> 404; không subscription active hoặc legacy enrollment -> 403.
- `GlobalExceptionHandler.java:42–50` trả 500 chung cho exception ngoài dự kiến. SQL/schema lỗi có thể thành 500, **không có code chuyển mọi 500 thành “Network Error”**. Handler chỉ log class exception, làm mất cause/stack hữu ích.
- 404 upstream/HTML do Nginx và 502 backend unavailable phải tách khỏi 404 domain “course chưa xuất bản”. HEAD không thay thế GET để kiểm tra API: Security rules chỉ mở method GET.

### User/enrollment/course/subscription mapping

| Quan hệ/quy tắc | Bằng chứng |
|---|---|
| Một subscription hiện tại cho mỗi user | `UserSubscriptionEntity.java:9,13–23`, `user_id` primary key; migration `20261012_deploy_update.sql:654–662` |
| Subscription liên kết users và plans trong SQL | Foreign keys tại migration `:660–661`; JPA entity giữ `userId/planCode` scalar |
| Subscription active | `SubscriptionService.java:103–105`: `startedAt <= now < expiresAt` |
| Có subscription active | `CourseSelector.java:27–28` trả tất cả khóa PUBLISHED, kể cả chưa có enrollment |
| Không có active subscription | `CourseSelector.java:29,41–44` chỉ trả enrollment có `legacy_access=true` và course PUBLISHED |
| Enrollment mới phục vụ lưu tiến độ | `CourseAccessService.java:33–37`; native insert `ICourseEnrollmentRepository.java:34–36`; default legacy FALSE (`migration:680`) |
| Danh sách enrollment eager course | `ICourseEnrollmentRepository.java:17–18` EntityGraph course; course content được đọc trong transaction service |
| Dữ liệu rỗng hợp lệ | `LearningServiceImpl.java:46–48`, converter `LearningStatsResponseConverter.java:31–39`, UI `StartLearningPage.jsx:34–44` |

Tên `enrolledCourses` trong response là **courses hiện được phép học**, không phải toàn bộ lịch sử mua/ghi tiến độ. Subscription hết hạn có thể tạo danh sách rỗng hợp lệ; không đủ lý do để gọi là lỗi SQL. Khi bảng/cột bị thiếu, truy vấn fail trước nhánh empty và đó là lỗi khác.

### Queries và schema cần kiểm chứng

- Plans: derived query `active=true ORDER BY price ASC` trên `subscription_plans`, field `duration_days` (`SubscriptionPlanEntity.java:20`).
- Status/stats: lookup `user_subscriptions.user_id`; legacy query cần `course_enrollments.legacy_access`. Thiếu bất kỳ bảng/cột này ảnh hưởng cả subscription status và learning.
- Stats: `ILearningStatsRepository.java:12–21,23–91` dùng cả JPQL lẫn SQL native, join quizzes/lessons/chapters và score/points. Có `COALESCE` cho tổng rỗng. Không thấy endpoint/method hoặc tham số userId sai trong trace.
- Detail đọc quan hệ lồng nhau và vocab/sentence patterns; progress đọc thêm `position_seconds`, quiz answers, submissions. Vì vậy chỉ stats 200 chưa xác nhận learning đã tốt.
- `application.properties:10` là `ddl-auto=none`; backend không tự tạo schema còn thiếu và không có Flyway/Liquibase dependency trong `pom.xml`.
- Entity có schema cố định `chinese_online_learning` (`CourseEnrollmentEntity.java:18` và nhiều entity khác); docker profile `application-docker.properties:3–4` cũng cố định DB/user. Đổi DB_URL/DB_USERNAME trong `.env` không thay topology docker profile hiện tại theo cách tùy ý; phải kiểm tra effective config.

Không chạy native SQL trên MySQL ở audit này. Các unit/H2 tests đạt không chứng minh MySQL schema production đã đủ hoặc native query đã thực thi trên MySQL.

## Docker & Nginx Analysis

| Yêu cầu audit | Kết quả source hiện tại | Điều phải xác minh runtime |
|---|---|---|
| Listen 443 | Có `frontend/nginx.conf:23`, `nginx.https.conf:19` | File effective và listener thật; không có explicit IPv6 listen trong hai file |
| Publish 443 | Có `docker-compose.yml:108–109`; override cũng khai báo `:4` | Compose/port mapping thực chạy, bind address trên host |
| Cert/key mount | `/etc/letsencrypt:/etc/letsencrypt:ro`, `docker-compose.yml:113` | `live/...` symlink và target trong `archive/`, cert/key readable trong container; key không được in |
| ACME mount | `./deployment/acme:/var/www/certbot:ro` (`:112`) | Host path và renewal job; repo không có certbot service/renew script |
| API proxy | `/api/` -> `http://backend:8081`, không có slash URI ở proxy_pass (`nginx.conf:50–52`) | `/api` được giữ nguyên, đúng mapping backend |
| Service/port | Compose `backend`, port 8081, docker profile 8081 | backend process sống và DNS Docker resolve đúng |
| SPA routes | `try_files ... /index.html` (`nginx.conf:68–69`) | `/learning` và `/subscriptions` đều trả HTML, bundle asset tải được |
| Forwarded headers | `proxy_params:2–8` gửi host/proto/port; Spring `application.properties:37` dùng framework | Upstream nhận đúng public origin; không cần đổi proxy_pass sang HTTPS nội bộ |
| Build/runtime | Dockerfile nhúng dist và nginx.conf (`:16–18`) | Thay nginx.conf trên host không đổi base image đã chạy; phải rebuild/recreate hoặc mount có chủ đích |
| Volume override | Base Compose không mount lên `/usr/share/nginx/html`, không ghi đè dist | Override HTTPS mount default.conf (`docker-compose.https.yml:6`); cần host file thực và đúng bản |
| Healthcheck/restart | MySQL có SELECT 1 healthcheck (`Compose:24–33`), cả 3 service restart unless-stopped | Backend/Nginx không có healthcheck; restart loop chưa đủ readiness |
| Startup dependency | Backend đợi MySQL healthy (`:86–88`); Nginx chỉ depends_on backend (`:115–116`) | Nginx có thể phục vụ frontend khi backend chưa ready -> API 502 |

**Thiếu cert với cấu hình SSL đang active:** Nginx sẽ không vượt qua config/startup nếu không đọc được certificate/key; không nên mô tả là “Nginx active đầy đủ, chỉ HTTPS bị tắt”. Nếu image effective chỉ có HTTP hoặc có TLS termination khác thì hành vi khác, cần `nginx -T`/listener. Certificate thiếu, sai chain/key và reload failure là các nhánh cần kiểm tra; không có chứng chỉ EC2 để xác nhận. Xem [Nginx HTTPS configuration](https://nginx.org/en/docs/http/configuring_https_servers.html).

`EXPOSE 80` trong Dockerfile là metadata; nó không ngăn Compose publish 443. Đây không phải root cause của refused.

### MySQL image và volume hiện hữu

`database/Dockerfile:3–6` copy schema, seed, baseline update và feedback vào init directory. Với volume đã có database, init không chạy lại; đổi image hoặc các `MYSQL_*` không tự migration hoặc tạo lại user/password. Điều này được mô tả tại [MySQL Official Image](https://hub.docker.com/_/mysql) và `database/README-deploy-update.md:42`.

Do đó local init sạch có thể đầy đủ bảng nhưng EC2 volume cũ còn schema cũ. Backend mới với `ddl-auto=none` vẫn có thể khởi động và health 200, đến API query mới fail. MySQL SELECT 1 healthcheck cũng không kiểm tra subscription tables.

Không chạy schema gốc lên production: `database/chinese_online_learning.sql:1` có `DROP DATABASE`. Baseline `20261012_deploy_update.sql` cũng có cleanup dữ liệu và prerequisite user 4 (`:13–21`); không mặc định toàn bộ baseline là migration không mất dữ liệu. Hướng dẫn `README-deploy-update.md:19–27` yêu cầu review/backup và lưu ý DDL auto-commit.

### `.env.example` và profile

- `.env.example:4,7` lặp `MYSQL_PASSWORD`, thiếu `MYSQL_ROOT_PASSWORD` được Compose `:11` yêu cầu. **Reproduced:** `docker compose --env-file .env.example ... config --quiet` exit 1 báo biến root password thiếu.
- Example `:26,29–31` còn URL HTTP public-IP theo “HTTP phase”, trong khi Nginx hiện redirect HTTPS và yêu cầu cert. Copy example cho HTTPS production mà không cập nhật sẽ làm callback/email/payment redirect sai scheme/host.
- CORS allowlist cần phù hợp origin nếu dùng cross-origin. Tuy nhiên hai API hiện **same-origin**, `proxy_params` và Spring forwarded header config đúng thì mismatch CORS allowlist không tự chặn các request này. Không xếp CORS làm root cause chắc chắn cho “Network Error”. Chỉ kết luận CORS khi browser request thực khác origin hoặc upstream nhận sai host/proto và OPTIONS/GET có Origin bị reject.
- Profile local có fallback localhost cho DB/public URLs (`application-local.properties:2–6`), docker profile cố định host MySQL, không có fallback public URLs trong base properties. Docker thiếu biến có thể fail startup dù local vẫn chạy với profile local.
- Required-variable validation chỉ xác nhận **có giá trị**, không xác nhận JWT Base64 đủ độ dài, database password đúng hoặc OAuth credential thực dùng được.

## CI/CD Analysis

Cơ chế được tìm thấy là `Jenkinsfile`:

1. Checkout SCM (`:17–20`), image tag `BUILD_NUMBER` (`:11`).
2. Copy env Jenkins từ `/var/lib/jenkins/env/.env` (`:41–43`), validate Compose (`:55–57`).
3. Build mysql/backend/nginx (`:68–70`), push cùng tag (`:95–97`). Backend Docker build dùng `-DskipTests` (`backend/Dockerfile:6`); frontend build có typecheck nhưng không chạy Vitest.
4. SSH/scp Compose và monitoring config (`:116–138`). SSH credential tên `azure-server-ssh` chỉ là tên; không đủ bằng chứng hosting Azure. Target IP là `16.178.47.5` (`:12`).
5. Trên host dùng `.env` **đã tồn tại**, không copy env Jenkins qua (`:150–152`); export đúng IMAGE_TAG (`:148`), pull (`:154`), up `--no-build --wait` (`:156`), `nginx -t` (`:158`), curl local HTTPS health có SNI domain (`:160`).

Đánh giá:

- Có cơ chế tag thống nhất, pull trước start và HTTPS smoke; không có bằng chứng code luôn deploy `latest` hoặc luôn bỏ qua image mới. Compose manual không export IMAGE_TAG thì fallback `latest` (`docker-compose.yml:3,36,97`) và có thể lệch Jenkins.
- Không tìm thấy migration step, schema assertion, functional GET plans hoặc authenticated learning smoke. Cũng không tìm thấy tự động rollback.
- `--wait` đợi running/healthy; với backend/Nginx không có healthcheck, trạng thái running chưa chứng minh API ready. [Docker Compose up](https://docs.docker.com/reference/cli/docker/compose/up/) mô tả điều kiện này.
- Health check local qua `--resolve ...127.0.0.1` kiểm tra TLS/Nginx/backend bên trong host, **không** xác nhận public ingress, DNS hay SG/NACL.
- Nginx `nginx -t` xảy ra **sau khi** recreate. Cert/preflight sai có thể gây outage trước khi pipeline phát hiện.
- Base Compose dùng config đã nhúng trong image. Pipeline không copy `frontend/nginx.https.conf` và không chuyển override HTTPS. Nếu EC2 `.env`/shell đã chọn `COMPOSE_FILE` override từ lần deploy cũ, cần kiểm tra file mount có tồn tại; nếu chỉ base thì không cần host frontend config.
- MySQL image bị pull/recreate cùng release; không cần làm vậy để sửa frontend/TLS. Giữ container/data volume MySQL hiện hữu khi sửa app là phương án hạn chế tác động.

## Root Cause Candidates

### R1 — HTTPS transport failure / Nginx TLS startup

| Field | Nội dung |
|---|---|
| Finding | EC2 public endpoint có lần refused trước HTTP; localhost IPv6 có lần TCP success nhưng TLS fail |
| Severity | Critical |
| File | `frontend/nginx.conf`; `docker-compose.yml` |
| Line | Nginx 23–27; Compose 107–113 |
| Evidence | Bằng chứng curl do người dùng cung cấp; source đòi cert/key host-mounted |
| Local behavior | HEAD HTTPS hai route trong workspace exit 7, chưa TLS; probe HTTP 80 và forced-IP HTTPS cũng fail. Môi trường network bị giới hạn nên không dùng kết quả này để định vị lỗi EC2 |
| Production impact | Khi connection/TLS fail, SPA/API không thể truy cập qua origin này |
| Root cause | Listener/process chưa phục vụ, cert/key lỗi, port mapping hoặc network path; chưa phân biệt được |
| Confidence | Triệu chứng người dùng cung cấp **Confirmed**; giả thuyết Nginx/cert **Likely/Unverified** |
| Recommended fix | EC2 listener/state/mount/nginx -t + SNI IPv4/IPv6 trước; chỉ sửa đúng nhánh đã xác nhận |

### R2 — Runtime deployment khác working tree

| Field | Nội dung |
|---|---|
| Finding | Source có 443 nhưng chưa biết image/Compose active trên EC2 |
| Severity | Critical |
| File | `frontend/Dockerfile`; `Jenkinsfile`; `docker-compose.https.yml` |
| Line | Dockerfile 16–18; Jenkins 129–130,148–158; override 6 |
| Evidence | Config base nằm trong image, override có thể ghi đè từ host; manual fallback tag latest |
| Local behavior | Compose base + override đều validate exit 0 với fixture; không có daemon để xem container |
| Production impact | Image cũ/config host cũ có thể không phục vụ HTTPS hoặc proxy đúng API |
| Root cause | Drift tag/digest/override/file effective; chưa quan sát runtime |
| Confidence | **Unverified** |
| Recommended fix | So sánh Config.Image, image ID/digest, effective nginx config, ports; deploy immutable tag đã kiểm chứng |

### R3 — Không migration database hiện hữu trong pipeline

| Field | Nội dung |
|---|---|
| Finding | Jenkins không migrate/check schema; init scripts chỉ phục vụ volume mới |
| Severity | High |
| File | `Jenkinsfile`; `database/Dockerfile`; `backend/src/main/resources/application.properties`; `database/20261012_deploy_update.sql` |
| Line | Jenkins 154–160; Dockerfile 3–6; properties 10; SQL 644–680,1027 |
| Evidence | Plans cần bảng subscription_plans; stats cần user_subscriptions; legacy cần legacy_access; progress cần position_seconds |
| Local behavior | Compile/H2 tests đạt; H2 tự tạo schema, không kiểm chứng migration MySQL |
| Production impact | GET plans/me/stats/detail/progress có thể 500 vì bảng/cột thiếu, dù actuator health 200 |
| Root cause | Persisted schema cũ không cập nhật khi đổi image |
| Confidence | Gap repository **Confirmed**; thiếu schema production **Likely**, chưa có SQL error/schema snapshot |
| Recommended fix | SELECT information_schema; backup; migration đã review trên bản sao dữ liệu; thêm schema gate trước app rollout |

### R4 — Environment/template và credential hiện hữu

| Field | Nội dung |
|---|---|
| Finding | Example thiếu root-password variable; Jenkins/EC2 env độc lập; docker DB credentials cố định |
| Severity | High |
| File | `.env.example`; `docker-compose.yml`; `Jenkinsfile`; `application-docker.properties`; `security/jwt/JwtService.java` |
| Line | Example 4,7,26–31; Compose 11,14,47–60,77–84; Jenkins 41,150; profile 3–4; JwtService 30–33 |
| Evidence | Example validation exit 1; MySQL volume cũ không reset credential theo env mới |
| Local behavior | Validation fixture đủ biến pass; example fail; Java tests dùng secret/DB H2 riêng |
| Production impact | Compose không start, MySQL health fail hoặc backend restart; JWT đổi secret gây 401/refresh fail. HTTP callback URLs ảnh hưởng luồng auth/payment |
| Root cause | Env thiếu/sai hoặc khác credentials đã lưu trong database; không có actual EC2 env để kiểm chứng |
| Confidence | Template defect **Confirmed**; runtime branch **Unverified** |
| Recommended fix | Sửa example sau audit; kiểm tra presence/format kín; kiểm chứng SELECT 1 bằng user ứng dụng; không reset volume/đổi secret để thử |

### R5 — Public network và IPv4/IPv6

| Field | Nội dung |
|---|---|
| Finding | Public-IP IPv4 và localhost IPv6 có hành vi khác; không có IaC/security group config trong repo |
| Severity | Critical |
| File | `frontend/nginx.conf`; `Jenkinsfile` (chỉ có target IP, không có cấu hình SG) |
| Line | Nginx 6,23; Jenkins 12,160 |
| Evidence | Người dùng cung cấp curl public IPv4 refused, ::1 TCP success; DNS workspace A=16.178.47.5 |
| Local behavior | Probe không nhận HTTP; chưa loại trừ hạn chế egress của môi trường audit |
| Production impact | Local smoke tốt vẫn có thể public inaccessible |
| Root cause | Wrong/stale public IP, publishing/bind, firewall/SG/NACL; chưa xác nhận |
| Confidence | **Unverified** |
| Recommended fix | So sánh public IP/Elastic IP instance với DNS; ss/docker port; thử từ máy ngoài; chỉ đổi rule/listener sau bằng chứng |

## Confirmed Code Defects

Các lỗi dưới đây xác nhận từ code/config; phần lớn làm deploy/khôi phục/chẩn đoán yếu đi, không tự giải thích đầy đủ TCP refused.

| Field | D1 — Env template không hợp lệ |
|---|---|
| Finding | Lặp MYSQL_PASSWORD, thiếu MYSQL_ROOT_PASSWORD |
| Severity | High |
| File | `.env.example`, `docker-compose.yml` |
| Line | Example 4,7; Compose 11 |
| Evidence | Key scan + Compose interpolation exit 1 với example |
| Local behavior | Không thể lấy example làm template đủ key mà chỉ thay giá trị |
| Production impact | Deploy từ template có thể dừng trước create/start containers |
| Root cause | Template không đồng bộ required variables |
| Confidence | **Confirmed**; không biết production có dùng template này không |
| Recommended fix | Đổi dòng key bị lặp thành MYSQL_ROOT_PASSWORD; giữ password ngoài repo; cập nhật example HTTPS |

| Field | D2 — Learning UI mất thông tin loại lỗi |
|---|---|
| Finding | Chỉ giữ response.data.message hoặc fallback; mọi bước dùng cùng error state |
| Severity | Medium |
| File | `frontend/src/features/learning/hooks/useLearningDashboard.js`, `pages/StartLearningPage.jsx` |
| Line | Hook 47–60; page 30–31 |
| Evidence | Network failure không có response bị đổi thành câu “khóa học sở hữu”; detail/progress fail cũng bị gắn tiêu đề tải course |
| Local behavior | Static branch xác định được; frontend tests hiện tại chưa exercise hook qua browser |
| Production impact | Che mất transport/401/403/502 và request cụ thể, khó xác định bước hỏng |
| Root cause | Error normalization/step attribution thiếu |
| Confidence | **Confirmed**, diagnostic defect |
| Recommended fix | Dùng normalizeApiError; giữ status/code và stage stats/detail/progress; UI hữu ích, telemetry không ghi token |

| Field | D3 — Retry subscription không retry status |
|---|---|
| Finding | Nút Thử lại chỉ đổi retry cho plans; hook status chỉ phụ thuộc userId |
| Severity | Medium |
| File | `frontend/src/pages/subscriptions/SubscriptionsPage.tsx`, `frontend/src/features/subscription/useSubscription.ts` |
| Line | Page 29,70,88; hook 13–19 |
| Evidence | Nếu plans thành công và /me lỗi tạm thời, statusError còn, nút retry không xuất hiện khi có plans; buttons bị disabled |
| Local behavior | Cần reload/remount hoặc thay userId mới chạy lại /me |
| Production impact | Người dùng mắc kẹt sau lỗi API tạm thời dù backend đã hồi phục |
| Root cause | Không expose status reload; retry gắn riêng plans |
| Confidence | **Confirmed**, recovery defect |
| Recommended fix | Expose reload/retry status, retry đúng request, không chỉ điều kiện plans.length===0 |

| Field | D4 — Backend log mất exception cause/stack |
|---|---|
| Finding | Generic handler chỉ log ex.getClass().getSimpleName() |
| Severity | Medium |
| File | `backend/src/main/java/com/app/exception/handler/GlobalExceptionHandler.java` |
| Line | 48–50 |
| Evidence | `.error("Unhandled backend error, type={}", ex.getClass().getSimpleName())` không truyền throwable |
| Local behavior | Client nhận 500 chung; log handler không có SQL cause/stack |
| Production impact | Không thể dựa riêng log handler để phân biệt missing schema/DB unavailable/serialization |
| Root cause | Logging thiếu context và throwable |
| Confidence | **Confirmed**, observability defect |
| Recommended fix | Log stack/cause ở kênh nội bộ có kiểm soát và request ID/path; redaction dữ liệu nhạy cảm; giữ response chung |

| Field | D5 — Readiness/functional checks thiếu |
|---|---|
| Finding | Backend/Nginx không healthcheck; pipeline không chạy tests hoặc functional APIs/migrations |
| Severity | High |
| File | `docker-compose.yml`, `backend/Dockerfile`, `Jenkinsfile` |
| Line | Compose 86–93,115–121; Dockerfile 6; Jenkins 154–160 |
| Evidence | Chỉ mysql có healthcheck; Nginx depends_on backend không service_healthy; health endpoint không query schema chức năng |
| Local behavior | Syntax valid; không có daemon để reproduce startup race |
| Production impact | Running/actuator 200 có thể đi kèm API 500/502; thiếu gate trước rollout |
| Root cause | Deployment validation chưa đủ readiness/schema/feature coverage |
| Confidence | **Confirmed** về gap; gây outage cụ thể **Unverified** |
| Recommended fix | Test stage, backend healthcheck, dependency healthy, schema gate, GET plans + learning smoke và rollback app |

`axiosClient.ts:18` đặt timeout 0: request/refresh không có giới hạn thời gian do client. Đây là điểm cần cải thiện resilience, chưa có bằng chứng request treo gây hai lỗi được báo. Không kết luận có endpoint typo, JWT userId sai, CORS blanket failure, thiếu port 443 hoặc microservice routing bug trong source hiện tại.

## Local Verification Results

| Kiểm chứng thực chạy | Kết quả | Giới hạn |
|---|---|---|
| `npm.cmd run build` | PASS: TypeScript noEmit + Vite production, 362 modules | Node local 24.18.0 khác Docker Node 22; không build image |
| `npm.cmd test` | PASS: 8 files, 42 tests | Vitest hiện có, không browser end-to-end của hai route |
| Java 17 `mvn -o -DskipTests compile` với cache workspace | PASS: 324 source files | Maven local 3.9.6 khác Docker 3.9.9; compile không kiểm tra production DB |
| Java 17 `mvn -o test`, `RUN_MYSQL_INTEGRATION_TESTS=false` | PASS: 221 discovered, **195 executed/pass**, 26 skipped, 0 failure/error; SecurityAuditIntegrationTest 73 pass | Tests boot dùng security-test/H2, guard chặn non-memory DB; không chạm MySQL ứng dụng |
| Compose base `config --quiet` | PASS, exit 0 | Dùng `.deployment-check/validation.env` có sẵn; không phải env production |
| Compose base+HTTPS override `config --quiet` | PASS, exit 0 | Chỉ cấu trúc/interpolation; không chứng minh mount/cert/listener tồn tại |
| Compose với `.env.example` | FAIL, exit 1: MYSQL_ROOT_PASSWORD missing | Reproduced template defect |
| `docker version` | Client tồn tại, daemon pipe docker_engine không tồn tại | Có warning không đọc được user Docker config; không escalate hay sửa settings |
| `nginx -t` local / Docker builds | NOT RUN | Không có nginx native và Docker daemon |
| Native MySQL tests/migration | NOT RUN | Không có database thử nghiệm độc lập và không được phép ghi DB hiện hữu |
| DNS + HTTP HEAD public | A=16.178.47.5; HEAD hai HTTPS routes, HTTP learning, forced-IP HTTPS đều exit 7 | Không có HTTP status/TLS handshake; môi trường audit hạn chế network, chưa cô lập egress/production |

26 skipped tests thuộc 6 lớp: DashboardRepositoryIntegrationTest (5), StudentManagementIntegrationTest (8), AuthenticationSettingsIntegrationTest (4), CourseRepositoryIntegrationTest (2), LearningProgressIntegrationTest (5), SubscriptionIntegrationTest (2). Những lớp này yêu cầu `RUN_MYSQL_INTEGRATION_TESTS=true` và MySQL riêng. Không bật flag lên database đang dùng. Hướng dẫn cũ ở `README-subscriptions.md:29` nói smoke tests nhập seed đã không còn đúng với source hiện tại: ba `BackendApplicationTests` dùng H2 + InMemoryDatabaseGuard, được kiểm tra trước khi chạy.

Các command PowerShell đã dùng, có thể chạy lại local:

```powershell
Set-Location D:\SBA301\frontend
npm.cmd run build
npm.cmd test

Set-Location D:\SBA301\backend
$env:JAVA_HOME = 'C:\Program Files\Java\jdk-17'
$env:RUN_MYSQL_INTEGRATION_TESTS = 'false'
mvn.cmd '-Dmaven.repo.local=D:\SBA301\.deployment-check\m2' -o -DskipTests compile
mvn.cmd '-Dmaven.repo.local=D:\SBA301\.deployment-check\m2' -o test

Set-Location D:\SBA301
docker compose --env-file .deployment-check/validation.env -f docker-compose.yml config --quiet
docker compose --env-file .deployment-check/validation.env -f docker-compose.yml -f docker-compose.https.yml config --quiet
docker compose --env-file .env.example -f docker-compose.yml config --quiet
```

Expected: hai Compose fixture pass, example hiện tại fail. Offline Maven dùng cache có sẵn; nếu cache thiếu dependency thì không kết luận source lỗi. Frontend dependencies đã có trong node_modules; audit không chạy npm install hoặc thay lockfile.

## Recommended Fixes

Đây là **đề xuất**, chưa áp dụng.

| Ưu tiên | File/hạng mục cần sửa sau khi xác minh | Nội dung và lý do |
|---|---|---|
| P0 | EC2 cert mount/listener/effective Compose/image | Sửa theo nginx -t/state/ports; nếu file source đúng thì phục hồi runtime/image/mount, không sửa backend để xử lý TCP refused |
| P0 | `Jenkinsfile` | Preflight cert readability/SNI, validate image/config trước rollout; lưu release tag/digest/config và có rollback backend/nginx |
| P1 | `.env.example` | Bổ sung MYSQL_ROOT_PASSWORD, bỏ duplicate; cập nhật hướng dẫn HTTPS/CORS/callback domain đồng bộ deployment hiện tại |
| P1 | `Jenkinsfile`, migration workflow; `database/20261012_deploy_update.sql` chỉ sau review | Thêm schema/version gate cho volume cũ. Test migration trên copy database; tránh tự chạy toàn baseline cleanup với production data |
| P1 | `docker-compose.yml` | Backend healthcheck và Nginx readiness có HTTPS đúng SNI; depends_on service_healthy. Không dùng healthcheck mà fail do endpoint/auth không phù hợp |
| P1 | Environment EC2/Jenkins ngoài repo | Bảo đảm cùng yêu cầu public HTTPS và DB credential hiện hữu; secret ổn định, không tự đổi JWT secret hoặc reset user/volume để thử |
| P2 | `frontend/src/features/learning/hooks/useLearningDashboard.js` | Normalize error, giữ request stage/status/code; hỗ trợ retry rõ ràng. Có thể giữ partial stats khi detail/progress fail nếu UX cho phép |
| P2 | `frontend/src/features/subscription/useSubscription.ts`, `SubscriptionsPage.tsx` | Expose reload status; retry lỗi me khi plans đã tải; thêm empty-state cho plans rỗng |
| P2 | `frontend/src/shared/api/axiosClient.ts` | Timeout hợp lý và AbortController cho các GET; refresh cũng có timeout; tránh tạo retry loop |
| P2 | `backend/src/main/java/com/app/exception/handler/GlobalExceptionHandler.java` | Internal logging có request ID và throwable đã kiểm soát; không đưa SQL/secret/stack ra response |
| P2 | `Jenkinsfile` test/smoke stages | Chạy tests trước build/push; public GET plans và authenticated learning GET sau deploy; actuator không đủ |
| P2 | Cert renewal ngoài repo | Xác minh certbot timer/job và reload Nginx sau renewal; repo chưa chứa cơ chế này |

## EC2 Verification Commands

**Chưa chạy các lệnh EC2 bên dưới.** Chạy tại instance đích, từ deploy path thực tế. `Jenkinsfile:13` cho biết `apps/SBA301` tương đối home của SSH user; nếu operator dùng thư mục khác, chọn thư mục/container label thực. Không `cat .env`, không in `docker inspect` đầy đủ hoặc `docker compose config` không có `--quiet`, không dùng `curl -v` với bearer token.

### 1. State, effective project, image và ports

```bash
cd "$HOME/apps/SBA301"
date -Is
docker compose version
docker compose --env-file .env config --quiet
docker compose --env-file .env ps -a
docker ps -a --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}'
docker inspect chinese-nginx --format 'image={{.Config.Image}} id={{.Image}} state={{.State.Status}} restarts={{.RestartCount}}'
docker inspect chinese-backend --format 'image={{.Config.Image}} id={{.Image}} state={{.State.Status}} restarts={{.RestartCount}}'
docker inspect chinese-mysql --format 'state={{.State.Status}} health={{if .State.Health}}{{.State.Health.Status}}{{end}}'
docker inspect chinese-nginx --format 'ports={{json .NetworkSettings.Ports}}'
docker inspect chinese-nginx --format '{{range .Mounts}}{{println .Source "->" .Destination .Mode}}{{end}}'
docker inspect chinese-nginx --format 'project={{index .Config.Labels "com.docker.compose.project"}} files={{index .Config.Labels "com.docker.compose.project.config_files"}}'
docker image inspect "$(docker inspect chinese-nginx --format '{{.Image}}')" --format 'digests={{json .RepoDigests}}'
sudo ss -lntp '( sport = :80 or sport = :443 )'
```

Expected: nginx/backend running ổn định, mysql healthy; Docker publish 80/443 ra host đúng địa chỉ; image tag khớp Jenkins BUILD_NUMBER/digest của release định deploy. `ss` cần kết hợp Docker port mapping vì iptables publishing không luôn có userland process listener. Nếu nginx restarting/exited, ưu tiên bước cert/log; nếu 443 mapping thiếu, đối chiếu Compose active trước.

### 2. Nginx và cert, không đọc private key

```bash
docker exec chinese-nginx nginx -t
docker exec chinese-nginx nginx -T 2>&1 | grep -nE 'configuration file|listen |server_name |ssl_certificate|location |proxy_pass|root |proxy_set_header (Host|X-Forwarded-Proto|X-Forwarded-Host|X-Forwarded-Port)'
sudo readlink -f /etc/letsencrypt/live/edujar.site/fullchain.pem
sudo readlink -f /etc/letsencrypt/live/edujar.site/privkey.pem
sudo test -r /etc/letsencrypt/live/edujar.site/fullchain.pem && echo CERT_READABLE
sudo test -r /etc/letsencrypt/live/edujar.site/privkey.pem && echo KEY_READABLE
sudo openssl x509 -in /etc/letsencrypt/live/edujar.site/fullchain.pem -noout -subject -issuer -dates -ext subjectAltName
docker exec chinese-nginx sh -c 'test -r /etc/letsencrypt/live/edujar.site/fullchain.pem && test -r /etc/letsencrypt/live/edujar.site/privkey.pem && echo CONTAINER_CERT_KEY_READABLE'
docker logs --tail 150 chinese-nginx 2>&1 | grep -E '\[emerg\]|cannot load certificate|BIO_new_file|Permission denied|host not found in upstream|bind\(\).*failed|SSL_do_handshake'
systemctl list-timers --all | grep -i certbot
```

Expected: `nginx -t` successful, cert SAN có edujar.site, thời hạn còn hiệu lực; target symlink tồn tại trong host và container. Root đọc được key chưa đủ: cần Nginx/container đọc được. Nếu container không running thì docker exec fail là bằng chứng cần xem state/log, không start/recreate ngay trong bước audit. `nginx -t` kiểm tra cert/key/config; không chứng minh SG/public routing.

### 3. Tách IPv4/IPv6/SNI/public path

```bash
getent ahostsv4 edujar.site
getent ahostsv6 edujar.site
curl -4 -I --connect-timeout 5 --max-time 15 http://edujar.site/learning
curl -4 -I --connect-timeout 5 --max-time 15 https://edujar.site/learning
curl -I --connect-timeout 5 --max-time 15 --resolve edujar.site:443:127.0.0.1 https://edujar.site/learning
curl -I --connect-timeout 5 --max-time 15 --resolve 'edujar.site:443:[::1]' https://edujar.site/learning
timeout 15 openssl s_client -connect 127.0.0.1:443 -servername edujar.site -verify_return_error </dev/null
timeout 15 openssl s_client -connect '[::1]:443' -servername edujar.site -verify_return_error </dev/null
sudo ufw status verbose
sudo iptables -S
sudo iptables -t nat -S DOCKER
```

Expected: HTTP 301 tới HTTPS đúng domain, HTTPS với SNI edujar.site 200 HTML. IPv6 chỉ cần pass nếu được chủ đích hỗ trợ; không dùng kết quả `https://localhost` thiếu domain SNI để kết luận cert production hỏng. Local IPv4 pass nhưng public fail -> kiểm tra public ingress/IP/firewall. Không `-k` trong acceptance check; `-k` chỉ dùng riêng để phân biệt verification failure khi cần.

Từ **máy ngoài EC2**, chạy hai lệnh HTTPS/HTTP trên và:

```bash
curl -I --connect-timeout 5 --max-time 15 --resolve edujar.site:443:16.178.47.5 https://edujar.site/learning
```

Đối chiếu AWS Console: public IPv4/Elastic IP của instance phải khớp DNS; SG gắn đúng instance cho inbound TCP 80/443; route Internet Gateway và NACL inbound/outbound đúng. Repo không cung cấp instance ID/VPC/SG ID hoặc AWS credentials nên không đoán lệnh AWS CLI với resource ID. Public refused không đủ để khẳng định SG; timeout thường phù hợp DROP hơn.

### 4. Proxy/backend/API status, dùng GET đúng method

```bash
curl --silent --show-error --connect-timeout 5 --max-time 15 --resolve edujar.site:443:127.0.0.1 https://edujar.site/api/actuator/health
curl --silent --show-error --connect-timeout 5 --max-time 15 -D - https://edujar.site/api/subscriptions/plans
curl --silent --show-error --connect-timeout 5 --max-time 15 -D - https://edujar.site/api/subscriptions/me
curl --silent --show-error --connect-timeout 5 --max-time 15 -D - https://edujar.site/api/learning/stats
docker exec chinese-nginx wget -S -O /dev/null http://backend:8081/actuator/health
docker exec chinese-nginx wget -S -O /dev/null http://backend:8081/api/subscriptions/plans
```

Expected: health 200 `UP`; plans 200 JSON array, đủ gói active theo cấu hình admin; me/stats không bearer phải 401. 502 -> backend/upstream readiness; 500 -> DB/logic; 200 text/html tại API -> routing effective sai; 403 plans với GET -> xem effective Security/origin/token/config khác source. Nếu muốn xác minh CORS cross-origin:

```bash
curl --silent --show-error --max-time 15 -D - -X OPTIONS https://edujar.site/api/subscriptions/me \
  -H 'Origin: https://edujar.site' -H 'Access-Control-Request-Method: GET' \
  -H 'Access-Control-Request-Headers: authorization'
```

OPTIONS 403 không tự chứng minh same-origin GET bị chặn; đối chiếu browser có thực gửi preflight không. Test với Origin bằng origin thật của frontend nếu khác domain.

### 5. Runtime env, chỉ in thông tin không nhạy cảm

```bash
docker exec chinese-backend sh -c '
  printf "profile=%s port=%s db_user=%s\n" "$SPRING_PROFILES_ACTIVE" "$SERVER_PORT" "$DB_USERNAME"
  for name in DB_PASSWORD JWT_SECRET GOOGLE_CLIENT_ID GOOGLE_CLIENT_SECRET FACEBOOK_CLIENT_ID FACEBOOK_CLIENT_SECRET OAUTH2_FRONTEND_REDIRECT_URI CORS_ALLOWED_ORIGINS FRONTEND_VERIFY_EMAIL_URL FRONTEND_PAYMENT_RESULT_URL; do
    if printenv "$name" | grep -q .; then printf "%s=PRESENT\n" "$name"; else printf "%s=MISSING_OR_EMPTY\n" "$name"; fi
  done
  printf "cors=%s\noauth_landing=%s\nverify_url=%s\npayment_url=%s\n" "$CORS_ALLOWED_ORIGINS" "$OAUTH2_FRONTEND_REDIRECT_URI" "$FRONTEND_VERIFY_EMAIL_URL" "$FRONTEND_PAYMENT_RESULT_URL"
'
```

Expected profile docker, port 8081, db_user chinese_app, required keys present; public URLs HTTPS domain chính xác. Không in JWT/password hoặc hash của secret. Presence không xác nhận correctness; DB SELECT 1 tiếp theo kiểm tra credential. Nếu container chưa start, chỉ rà presence `.env` bằng tooling kín trên host; không gửi file hoặc toàn environment vào chat/log.

### 6. Schema/data read-only

```bash
docker exec chinese-mysql sh -c 'MYSQL_PWD="$MYSQL_PASSWORD" mysql -h127.0.0.1 -uchinese_app -Dchinese_online_learning --batch --execute="SELECT 1 AS app_login_ok; SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME IN (\"subscription_plans\",\"user_subscriptions\",\"course_enrollments\",\"lesson_progress\",\"learning_activity_daily\",\"authentication_settings\"); SELECT TABLE_NAME,COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND ((TABLE_NAME=\"course_enrollments\" AND COLUMN_NAME=\"legacy_access\") OR (TABLE_NAME=\"lesson_progress\" AND COLUMN_NAME=\"position_seconds\") OR (TABLE_NAME=\"invoices\" AND COLUMN_NAME IN (\"subscription_plan_code\",\"subscription_duration_days\")));"'
docker exec chinese-mysql sh -c 'MYSQL_PWD="$MYSQL_PASSWORD" mysql -h127.0.0.1 -uchinese_app -Dchinese_online_learning --batch --execute="SET time_zone=\"+00:00\"; SELECT code,price,duration_days,active FROM subscription_plans ORDER BY price; SELECT status,COUNT(*) AS course_count FROM courses GROUP BY status; SELECT COUNT(*) AS legacy_enrollments FROM course_enrollments WHERE legacy_access=1; SELECT COUNT(*) AS active_subscriptions FROM user_subscriptions WHERE started_at<=CURRENT_TIMESTAMP() AND expires_at>CURRENT_TIMESTAMP(); SELECT @@session.time_zone,@@global.time_zone;"'
```

Expected: login ok=1; bảng/cột cần thiết tồn tại; plans active có dữ liệu hợp lệ; courses có PUBLISHED. Lệnh thứ hai đặt timezone **chỉ cho session kiểm tra** về UTC, không đổi cấu hình hoặc dữ liệu; TIMESTAMP và CURRENT_TIMESTAMP được so sánh trong cùng timezone. MySQL config `database/my.cnf` mặc định +07:00; để kiểm chứng hạn cụ thể nên đối chiếu API `/me` và metadata timezone/JDBC, không tự sửa expiry theo suy đoán. Count tổng chỉ hỗ trợ chẩn đoán, không chứng minh user cụ thể có quyền. Nếu app user không login được, dùng MySQL client `-p` prompt với tài khoản quản trị hiện hữu để kiểm tra grants; không đổi credentials để “test”.

Để kiểm tra user cụ thể, mở MySQL interactive với password prompt, đặt `@audit_user_id` bằng ID của tài khoản STUDENT đang gặp lỗi rồi chỉ SELECT subscription dates/plan, enrollment legacy và status course. Không cần xuất email/password/token. Xác minh JWT subject khớp user bằng server authenticated identity/API session; không gửi JWT lên dịch vụ decode bên ngoài.

### 7. Logs và bằng chứng còn thiếu

```bash
docker logs --since 30m --tail 300 chinese-backend 2>&1 | grep -E 'Unhandled backend error|SQLGrammarException|InvalidDataAccess|Unknown column|doesn.t exist|Access denied for user|Communications link failure|Could not resolve placeholder|WeakKeyException|DecodingException'
```

Review log cục bộ và redact trước khi chia sẻ; logging hiện tại có thể chỉ có exception class (D4), không thấy SQL string không đủ loại trừ schema lỗi.

Cần bổ sung: timestamp/release Jenkins của lỗi; nginx/backend state/restart count; image tag/digest và effective ports/mount/config; cert dates/SAN/readability; actual Compose selection; schema/column presence và SQL exception; public-IP/SG/NACL evidence; Browser Network URL/status/error cho **plans, me, stats, detail, progress**, response content-type và Console TLS/CORS messages. HAR phải bỏ Authorization/cookie/refresh token/body chứa thông tin cá nhân. Không thể xác nhận root cause production trước các bằng chứng này.

## Safe Deployment Plan

**Kế hoạch đề xuất cho operator sau khi xác minh và phê duyệt thay đổi; audit không thực thi.** Giữ nguyên MySQL data volume và credentials hiện hữu. Không chạy `down -v`, `volume rm`, schema/seed gốc hay reset MySQL.

1. Lưu inventory release hiện tại: Compose effective file names/project, nginx/backend image tag+digest, mount MySQL data volume; lưu config/nginx cert metadata, không đưa secret vào báo cáo. Chuẩn bị bản app cũ đã kiểm chứng để rollback. Giữ project name và mapping volume vì đổi project có thể tạo volume rỗng khác.
2. Xác nhận nhánh lỗi HTTPS với read-only commands. Nếu chỉ Nginx/cert/port, sửa riêng nhánh đó; không migrate DB hoặc recreate MySQL để sửa HTTPS.
3. Trước **bất kỳ migration**, tạo backup DB được kiểm tra restore trên database riêng. Ví dụ operator chạy command sau (password prompt, không đưa password lên command line):

   ```bash
   backup_stamp=$(date -u +%Y%m%dT%H%M%SZ)
   docker exec -it chinese-mysql sh -c 'umask 077; set -C; mysqldump -uroot -p --single-transaction --routines --events --triggers --databases chinese_online_learning > "$1"' sh "/tmp/edujar-$backup_stamp.sql"
   umask 077
   mkdir -p backups
   test ! -e "backups/edujar-$backup_stamp.sql"
   docker cp "chinese-mysql:/tmp/edujar-$backup_stamp.sql" "backups/edujar-$backup_stamp.sql"
   chmod 600 "backups/edujar-$backup_stamp.sql"
   test -s "backups/edujar-$backup_stamp.sql"
   ```

   Chạy từng lệnh và dừng nếu exit code khác 0; tên backup theo timestamp và `set -C` tránh ghi đè dump trong container. Không ghi đè backup cũ. Không đọc dump trong terminal/chat; dump có thông tin nhạy cảm. `test -s` chỉ xác nhận file không rỗng, không thay thế restore test. Kiểm tra exit code dump/copy và bảo quản backup theo chính sách vận hành.
4. Nếu schema thiếu: test migration trên copy dữ liệu và review cleanup trong `database/20261012_deploy_update.sql`. Baseline có deletes và DDL auto-commit, không đảm bảo nguyên vẹn toàn bộ dữ liệu; nếu yêu cầu giữ mọi dữ liệu production, chuẩn bị migration giới hạn subscription/learning không cleanup, với quyền legacy/backfill rõ ràng. Không tự chạy baseline chỉ vì build có file đó. Nếu baseline đã áp dụng chỉ bổ sung migration còn thiếu, như feedback theo `README-deploy-update.md:46`. Tạm dừng ghi app theo maintenance window khi operator thực hiện migration; kiểm tra schema/row counts/legacy entitlement trước mở lại. DDL partial failure phải được xử lý, không giả định ROLLBACK hoàn tác tất cả.
5. Build/test app trên CI với Java 17, Node 22 đúng Docker; tag immutable cho backend/nginx, chạy Nginx config preflight với cert mount thật, validate env presence kín. Stage functional/schema checks trước rollout. Không cập nhật MySQL image nếu sửa app không yêu cầu.
6. Deploy backend/nginx cùng release đã kiểm chứng, **giữ MySQL container/volume**. Ví dụ chỉ sau schema/env/cert gates, trong đúng project/deploy directory:

   ```bash
   export IMAGE_TAG='<JENKINS_BUILD_NUMBER_DA_KIEM_CHUNG>'
   docker compose --env-file .env config --quiet
   docker compose --env-file .env pull backend nginx
   docker compose --env-file .env up -d --no-build --no-deps backend nginx
   docker exec chinese-nginx nginx -t
   ```

   Placeholder tag phải được thay bằng tag thực. Không thực hiện cùng thời điểm database migration hoặc cập nhật mysql image ngoài phạm vi. Vì `--no-deps` và source chưa có backend healthcheck, operator phải xác nhận MySQL đã healthy và backend ready trước kiểm tra Nginx/public. Chỉ đổi source config sau audit theo change đã review; không gán rằng `up -d` tự sửa cert/DB.
7. Kiểm tra local SNI HTTPS, public HTTPS từ máy ngoài, GET plans, user `/me`, stats, course detail/progress. Theo dõi restart/error rates. Nếu app fails, rollback **backend/nginx** về tag/config đã lưu; schema phải tương thích bản cũ. Không tự rollback DB bằng script DROP/seed; restore DB là thao tác riêng cần kế hoạch vì có thể mất ghi phát sinh.
8. Xác minh renewal cert: timer/job, expiration, reload Nginx sau renew. Không phát hành chứng chỉ thử hoặc thay firewall/SG khi chưa xác định lỗi.

### Acceptance sau deploy: cả hai trang

| Kịch bản | Expected |
|---|---|
| Public `/subscriptions`, chưa login | TLS hợp lệ, 200 SPA, assets 200; GET `/api/subscriptions/plans` 200 array và có card gói active theo dữ liệu admin; không cần JWT |
| `/subscriptions`, STUDENT hợp lệ | GET `/me` 200; trạng thái subscription/expiry đúng; không còn Network Error; reload trang và retry khôi phục được sau lỗi tạm |
| `/learning`, không login | UI điều hướng login; protected API không auth 401 |
| `/learning`, STUDENT có subscription active | stats 200 trả courses PUBLISHED; detail/progress của course chọn đều 200; không chỉ actuator/stats pass |
| `/learning`, legacy enrollment | Chỉ khóa legacy và PUBLISHED được phép; mở được detail/progress |
| `/learning`, không có quyền hoặc subscription hết hạn | stats 200 empty state hợp lệ nếu không legacy; direct course access 403 với thông báo đúng, không diễn giải là lỗi mạng |
| Wrong/non-PUBLISHED course | 404 domain đúng; không HTML fallback trên `/api` |
| Access token expired, refresh còn hợp lệ | Refresh 200 rồi retry protected GET thành công; refresh invalid -> login, không retry vô hạn |
| Public network | Kiểm tra từ ngoài EC2; IPv4 HTTPS tốt, IPv6 nếu có AAAA/chủ đích hỗ trợ phải đúng listener/cert; browser không mixed-content/CORS lỗi |

Dùng tài khoản test và entitlement đã có để kiểm tra GET. Kích hoạt trial/thanh toán/save progress là thao tác ghi; chỉ chạy trong acceptance riêng đã được operator cho phép. Audit hiện tại không thực hiện chúng.
