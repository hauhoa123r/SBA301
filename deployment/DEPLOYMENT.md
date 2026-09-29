# Learning Platform — deployment audit

## A. PROBLEMS FOUND

- JWT_ACCESS_TTL/JWT_REFRESH_TTL có trong `D:\.env` nhưng Compose không truyền vào container. Default ở Java không cứu được placeholder chưa resolve trong application.properties. Default hiện thống nhất PT15M/P30D, giữ thời hạn refresh cũ.
- Datasource mặc định localhost/root và password hard-code; Docker hiện cố định mysql/chinese_app/chinese_online_learning.
- File env được cung cấp thiếu URL frontend OAuth/payment/verify-email và CORS. MYSQL_USER không khớp chinese_app. Không sửa hoặc sao chép secret gốc.
- SMTP host mặc định là `587` (sai loại dữ liệu), username gắn với email cá nhân. Compose trước đây bắt SMTP credentials kể cả khi chọn Resend.
- spring-boot-starter-mail bị pin 4.1.0 trong dự án Boot 3.5.7; đã trả về dependency management của Boot.
- Nginx yêu cầu certificate cũ, đóng kết nối HTTP bằng IP, tự redirect HTTPS trước khi DNS/SSL sẵn sàng.
- CORS, URL payment/OAuth và canonical HTML giả định domain cũ. Frontend API đã dùng đường dẫn tương đối `/api`; không cần VITE_API_URL mới.
- Prometheus thiếu file scrape và endpoint bị quy tắc STUDENT chặn. Nay chỉ health/prometheus được phép đọc nội bộ; Nginx chỉ công khai health, chặn các đường dẫn actuator khác. Health không lộ details.
- Monitoring public trên mọi interface. Nay chỉ bind loopback host, truy cập qua SSH tunnel.
- Jenkins dùng IP cũ, chỉ pull image mà không đồng bộ config. Nay chuyển IP mới, copy config và preflight trước khi khởi chạy. Chưa chạy Jenkins/SSH lên server.
- Không có Docker ignore để loại env khỏi build context. Frontend dùng npm install mặc dù đã có lockfile; nay npm ci, Node 22.
- SQL khởi tạo có DROP DATABASE: chỉ dùng image này cho volume mới; không chạy lại schema trên dữ liệu đang dùng. Không sửa schema.

## B. FILES MODIFIED

Xem `deployment/changes.diff` để có diff tất cả thay đổi cấu hình/source và file mới. Không thay domain model, repository, controller hay quy tắc thanh toán/đăng nhập. Những Java edit chỉ sửa injection và quyền đọc endpoint monitoring.

## C. ENVIRONMENT VARIABLES

| Variable | Required? | Default | Used by | Description |
|---|---|---|---|---|
| SERVER_PORT | No | 8081 (fixed in Docker) | Backend | `server.port` |
| DB_URL | Yes | Docker: jdbc:mysql://mysql:3306/chinese_online_learning | Backend | `spring.datasource.url` |
| DB_USERNAME | Yes | Docker: chinese_app | Backend | `spring.datasource.username` |
| DB_PASSWORD | Yes | MYSQL_PASSWORD (Compose) | Backend | `spring.datasource.password` |
| PAYOS_CLIENT_ID | Yes | ? | Backend | `payos.client-id` |
| PAYOS_API_KEY | Yes | ? | Backend | `payos.api-key` |
| PAYOS_CHECKSUM_KEY | Yes | ? | Backend | `payos.checksum-key` |
| PAYOS_CREATE_PAYMENT_URL | No | https://api-merchant.payos.vn/v2/payment-requests | Backend | `payos.create-payment-url` |
| PAYOS_PAYMENT_REQUEST_URL | No | https://api-merchant.payos.vn/v2/payment-requests | Backend | `payos.payment-request-url` |
| FRONTEND_PAYMENT_RESULT_URL | Yes | ? | Backend | `app.frontend.payment-result-url` |
| FRONTEND_VERIFY_EMAIL_URL | Yes | ? | Backend | `app.frontend.verify-email-url` |
| MAIL_PROVIDER | No | smtp | Backend | `mail.provider` |
| RESEND_API_KEY | Resend | ? | Backend | `resend.api.key` |
| RESEND_FROM_EMAIL | Resend | ? | Backend | `resend.from.email` |
| RESEND_BASE_URL | No | https://api.resend.com | Backend | `resend.base-url` |
| SMTP_HOST | SMTP (credentials when AUTH=true) | smtp.gmail.com | Backend | `spring.mail.host` |
| SMTP_PORT | No | 587 | Backend | `spring.mail.port` |
| SMTP_USERNAME | SMTP (credentials when AUTH=true) | ? | Backend | `spring.mail.username` |
| SMTP_PASSWORD | SMTP (credentials when AUTH=true) | ? | Backend | `spring.mail.password` |
| SMTP_AUTH | No | true | Backend | `spring.mail.properties.mail.smtp.auth` |
| SMTP_STARTTLS_ENABLE | No | true | Backend | `spring.mail.properties.mail.smtp.starttls.enable` |
| CORS_ALLOWED_ORIGINS | Yes | ? | Backend | `app.cors.allowed-origins` |
| JWT_SECRET | Yes | ? | Backend | `app.jwt.secret` |
| JWT_ACCESS_TTL | No | PT15M | Backend | `app.jwt.access-ttl` |
| JWT_REFRESH_TTL | No | P30D | Backend | `app.jwt.refresh-ttl` |
| GOOGLE_CLIENT_ID | Yes | ? | Backend | `spring.security.oauth2.client.registration.google.client-id` |
| GOOGLE_CLIENT_SECRET | Yes | ? | Backend | `spring.security.oauth2.client.registration.google.client-secret` |
| FACEBOOK_CLIENT_ID | Yes | ? | Backend | `spring.security.oauth2.client.registration.facebook.client-id` |
| FACEBOOK_CLIENT_SECRET | Yes | ? | Backend | `spring.security.oauth2.client.registration.facebook.client-secret` |
| MAIL_FROM_EMAIL | SMTP (credentials when AUTH=true) | SMTP_USERNAME | Backend | `mail.from.email` |
| MAIL_FROM_NAME | No | Chinese Online Learning | Backend | `mail.from.name` |
| CLIENT_ID | No | ? | PayOS | Legacy fallback for PAYOS_CLIENT_ID; not passed by Compose |
| API_BANK_KEY | No | ? | PayOS | Legacy fallback for PAYOS_API_KEY; not passed by Compose |
| CHECKSUM_KEY | No | ? | PayOS | Legacy fallback for PAYOS_CHECKSUM_KEY; not passed by Compose |
| APP_CORS_ALLOWED_METHODS | No | GET,POST,PUT,PATCH,DELETE,OPTIONS | Spring binding | Standard relaxed binding override; not passed by Compose |
| SPRING_PROFILES_ACTIVE | Yes in Compose | docker | Spring | Select fixed Docker topology |
| RUN_MYSQL_INTEGRATION_TESTS | No | unset | Tests only | true enables integration tests |
| TZ | No | Asia/Ho_Chi_Minh | Containers | OS timezone |
| MYSQL_ROOT_PASSWORD | Yes | ? | MySQL | Administration only |
| MYSQL_DATABASE | Fixed | chinese_online_learning | MySQL | Must match seed schema |
| MYSQL_USER | Fixed | chinese_app | MySQL | Application account |
| MYSQL_PASSWORD | Yes | ? | MySQL/backend | Application credential |
| IMAGE_TAG | No | latest | Compose/Jenkins | Application image tag |
| GF_SECURITY_ADMIN_USER | No | admin | Grafana | Initial administrator |
| GF_SECURITY_ADMIN_PASSWORD | Yes | ? | Grafana | Initial administrator password |
| COMPOSE_FILE | No | docker-compose.yml | Compose | Opt in HTTPS on Ubuntu using colon-separated file list |

Danh sách explicit từ source nằm trong `env-audit.json`; các alias PayOS cũ `CLIENT_ID`, `API_BANK_KEY`, `CHECKSUM_KEY` vẫn tồn tại trong fallback System.getenv/readDotEnv, nhưng deployment chỉ truyền tên PAYOS_* chuẩn. Không cần thêm alias vào Compose.

Phân loại trước sửa:

- REQUIRED: DB credentials, JWT_SECRET, Google/Facebook credentials; production yêu cầu thêm PayOS credentials và URL frontend/CORS rõ ràng.
- OPTIONAL/HAS DEFAULT: JWT TTL, SERVER_PORT, endpoint PayOS/Resend, mail transport settings; credential mail bắt buộc theo provider được chọn.
- MISSING FROM COMPOSE: JWT_ACCESS_TTL, JWT_REFRESH_TTL, FRONTEND_VERIFY_EMAIL_URL, PAYOS_CREATE_PAYMENT_URL, PAYOS_PAYMENT_REQUEST_URL, RESEND_BASE_URL. mail.from.email/name và app.cors là các property chưa có mapping env rõ ràng; đã thêm MAIL_FROM_EMAIL/NAME và CORS_ALLOWED_ORIGINS.
- MISSING FROM SUPPLIED ENV: CORS_ALLOWED_ORIGINS, FRONTEND_PAYMENT_RESULT_URL, FRONTEND_VERIFY_EMAIL_URL, OAUTH2_FRONTEND_REDIRECT_URI là các mục phải điền. SMTP_AUTH, MAIL_FROM_EMAIL/NAME, PAYOS_CREATE_PAYMENT_URL/PAYOS_PAYMENT_REQUEST_URL, RESEND_BASE_URL có default. DB_USERNAME/DB_PASSWORD do Compose tạo, không cần nhân bản trong .env. GF_SECURITY_ADMIN_USER và IMAGE_TAG có default.
- DUPLICATED: không thấy key trùng trong file env cung cấp. JWT TTL default từng rải ở Java và properties; nay tập trung tại properties, Compose dùng cùng default. DB credentials không khai báo secret hai lần.
- UNUSED/IGNORED trong Compose: DB_URL từ file env không được dùng, vì Compose tự đặt URL Docker. MYSQL_DATABASE/MYSQL_USER/SERVER_PORT trong env là giá trị tài liệu/kiểm tra; topology Docker cố định. Các credential của mail provider không được chọn không được service sử dụng. Không thấy biến frontend VITE_API_URL/REACT_APP_API_URL được đọc.
- NAMING MISMATCH: PAYOS_CLIENT_ID ↔ CLIENT_ID; PAYOS_API_KEY ↔ API_BANK_KEY; PAYOS_CHECKSUM_KEY ↔ CHECKSUM_KEY là alias legacy, không phải biến mới bắt buộc. MYSQL_PASSWORD được map sang DB_PASSWORD có chủ đích. MYSQL_USER trong env cung cấp chưa đúng giá trị yêu cầu.
- Spring relaxed binding cũng cho phép `APP_CORS_ALLOWED_METHODS`, `MAIL_FROM_EMAIL`, `MAIL_FROM_NAME` từ các property tương ứng. Danh mục explicit không liệt kê vô hạn các override Spring/JVM tiêu chuẩn. `RUN_MYSQL_INTEGRATION_TESTS` chỉ phục vụ test, không truyền production.

## D. FINAL BACKEND ENVIRONMENT

```yaml
backend:
  environment:
    TZ: Asia/Ho_Chi_Minh
    DB_URL: jdbc:mysql://mysql:3306/chinese_online_learning
    DB_USERNAME: chinese_app
    DB_PASSWORD: ${MYSQL_PASSWORD:?MYSQL_PASSWORD is required}

    JWT_ACCESS_TTL: ${JWT_ACCESS_TTL:-PT15M}
    JWT_REFRESH_TTL: ${JWT_REFRESH_TTL:-P30D}
    JWT_SECRET: ${JWT_SECRET:?JWT_SECRET is required}
    GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID:?GOOGLE_CLIENT_ID is required}
    GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET:?GOOGLE_CLIENT_SECRET is required}
    FACEBOOK_CLIENT_ID: ${FACEBOOK_CLIENT_ID:?FACEBOOK_CLIENT_ID is required}
    FACEBOOK_CLIENT_SECRET: ${FACEBOOK_CLIENT_SECRET:?FACEBOOK_CLIENT_SECRET is required}
    OAUTH2_FRONTEND_REDIRECT_URI: ${OAUTH2_FRONTEND_REDIRECT_URI:?OAUTH2_FRONTEND_REDIRECT_URI is required}
    SERVER_PORT: "8081"
    SPRING_PROFILES_ACTIVE: docker

    PAYOS_CLIENT_ID: ${PAYOS_CLIENT_ID:?PAYOS_CLIENT_ID is required}
    PAYOS_API_KEY: ${PAYOS_API_KEY:?PAYOS_API_KEY is required}
    PAYOS_CHECKSUM_KEY: ${PAYOS_CHECKSUM_KEY:?PAYOS_CHECKSUM_KEY is required}

    RESEND_API_KEY: ${RESEND_API_KEY:-}
    RESEND_FROM_EMAIL: ${RESEND_FROM_EMAIL:-}
    MAIL_PROVIDER: ${MAIL_PROVIDER:-smtp}

    SMTP_HOST: ${SMTP_HOST:-smtp.gmail.com}
    SMTP_PORT: ${SMTP_PORT:-587}
    SMTP_AUTH: ${SMTP_AUTH:-true}
    SMTP_STARTTLS_ENABLE: ${SMTP_STARTTLS_ENABLE:-true}
    SMTP_USERNAME: ${SMTP_USERNAME:-}
    SMTP_PASSWORD: ${SMTP_PASSWORD:-}

    CORS_ALLOWED_ORIGINS: ${CORS_ALLOWED_ORIGINS:?CORS_ALLOWED_ORIGINS is required}
    FRONTEND_VERIFY_EMAIL_URL: ${FRONTEND_VERIFY_EMAIL_URL:?FRONTEND_VERIFY_EMAIL_URL is required}
    MAIL_FROM_EMAIL: ${MAIL_FROM_EMAIL:-${SMTP_USERNAME:-}}
    MAIL_FROM_NAME: ${MAIL_FROM_NAME:-Chinese Online Learning}
    RESEND_BASE_URL: ${RESEND_BASE_URL:-https://api.resend.com}
    PAYOS_CREATE_PAYMENT_URL: ${PAYOS_CREATE_PAYMENT_URL:-https://api-merchant.payos.vn/v2/payment-requests}
    PAYOS_PAYMENT_REQUEST_URL: ${PAYOS_PAYMENT_REQUEST_URL:-https://api-merchant.payos.vn/v2/payment-requests}
    FRONTEND_PAYMENT_RESULT_URL: ${FRONTEND_PAYMENT_RESULT_URL:?FRONTEND_PAYMENT_RESULT_URL is required}
```

## E. FINAL .ENV.EXAMPLE

```dotenv
# HTTP phase. Copy to .env and fill secrets. Do not source this file in a shell.
IMAGE_TAG=latest
# Fixed Docker topology (validated; do not use root).
MYSQL_ROOT_PASSWORD=
MYSQL_DATABASE=chinese_online_learning
MYSQL_USER=chinese_app
MYSQL_PASSWORD=
SERVER_PORT=8081

# JWT_SECRET must be Base64 of at least 32 random bytes: openssl rand -base64 32
JWT_SECRET=
JWT_ACCESS_TTL=PT15M
# Preserve the existing JwtService default of 30 days.
JWT_REFRESH_TTL=P30D

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=
# Required explicit choice. Set https://edujar.site/oauth/callback only in phase 2.
# This is the FRONTEND landing page, NOT the provider callback.
# OAuth is not a supported public-IP HTTP test.
OAUTH2_FRONTEND_REDIRECT_URI=

CORS_ALLOWED_ORIGINS=http://16.178.47.5
FRONTEND_VERIFY_EMAIL_URL=http://16.178.47.5/verify-email
FRONTEND_PAYMENT_RESULT_URL=http://16.178.47.5/payment/result
PAYOS_CLIENT_ID=
PAYOS_API_KEY=
PAYOS_CHECKSUM_KEY=
PAYOS_CREATE_PAYMENT_URL=https://api-merchant.payos.vn/v2/payment-requests
PAYOS_PAYMENT_REQUEST_URL=https://api-merchant.payos.vn/v2/payment-requests

MAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_AUTH=true
SMTP_STARTTLS_ENABLE=true
SMTP_USERNAME=
SMTP_PASSWORD=
# Empty MAIL_FROM_EMAIL falls back to SMTP_USERNAME in Compose.
MAIL_FROM_EMAIL=
MAIL_FROM_NAME=Chinese Online Learning
RESEND_API_KEY=
RESEND_FROM_EMAIL=
RESEND_BASE_URL=https://api.resend.com

GF_SECURITY_ADMIN_USER=admin
GF_SECURITY_ADMIN_PASSWORD=
# Phase 2 on Ubuntu only, after certificate issuance:
# COMPOSE_FILE=docker-compose.yml:docker-compose.https.yml
```

## F. LOCALHOST / OLD DOMAIN FINDINGS

`original-host-findings.txt` liệt kê đầy đủ 20 dòng khớp ban đầu, kèm file và số dòng.

- application.properties: localhost DB và ba frontend URL; CORS gồm domain cũ và localhost. Đã bỏ fallback production, chuyển local URL sang profile local.
- EmailVerificationServiceImpl/PayOSServiceImpl: fallback localhost ở @Value đã bỏ.
- Compose: OAuth/payment default domain cũ đã bỏ; healthcheck localhost chỉ là kết nối trong chính container MySQL, hợp lệ. Healthcheck mới dùng 127.0.0.1 + tài khoản ứng dụng + SELECT 1 để xác minh credentials thật.
- frontend/nginx.conf: hai cặp certificate, server_name và HTTPS redirect cũ đã chuyển sang nginx.https.conf opt-in.
- frontend/index.html: bỏ canonical domain cũ; đặt lại canonical khi xác nhận domain chính thức nếu cần SEO.
- frontend/vite.config.ts: localhost:8081 chỉ thuộc dev server, giữ nguyên.
- Jenkinsfile: IP 18.143.179.208 đổi thành 16.178.47.5.
- Không thấy hard-code 0.0.0.0 hoặc IP cũ khác trong các file tracked đã quét. Các domain CDN/Unsplash/QR, Google/Meta và API PayOS/Resend là dịch vụ ngoài, không thay bằng IP server.

## G. DEPLOYMENT PHASES

### Chuẩn bị

Cần Ubuntu có Docker Engine + Compose v2, python3, curl, openssl, certbot và quyền chạy Docker. Làm trong thư mục repo cố định, ví dụ `/home/deploy`; giữ nguyên tên Compose project khi tái sử dụng volume cũ. Không chạy `down -v`.

```bash
cd /home/deploy
cp .env.example .env
chmod 600 .env
mkdir -p deployment/acme
# Điền secret thật bằng editor. Không source .env vào shell.
openssl rand -base64 32
python3 deployment/validate_env.py --env-file .env
docker compose config --quiet
```

`docker compose config` đầy đủ cũng chạy được nhưng sẽ in secret; chỉ dùng tại terminal riêng. Script preflight báo tên biến, không in giá trị. Nếu dùng env từ máy cũ: giữ secret hợp lệ, sửa MYSQL_USER, thêm bốn URL/CORS còn thiếu, bỏ DB_URL dư thừa. JWT secret phải là Base64 ≥32 byte sau decode. Không cần thay secret JWT hiện có nếu hợp lệ.

Phase 1 có thể đặt frontend landing URL rõ ràng thành `http://16.178.47.5/oauth/callback` chỉ để bean khởi tạo; đây KHÔNG phải provider callback và không khiến OAuth qua IP được hỗ trợ. Đây là lựa chọn vận hành thủ công, không tự động thay callback provider. Bỏ qua nút OAuth cho tới phase 2, không dùng credentials thật để thử đăng nhập qua HTTP công cộng.

### 1. MySQL

Với volume mới:

```bash
docker compose build mysql
docker compose up -d mysql
docker compose ps
docker compose logs --tail=100 mysql
docker compose exec mysql sh -c 'MYSQL_PWD="$MYSQL_PASSWORD" mysql -h 127.0.0.1 -u chinese_app -D chinese_online_learning -e "SELECT CURRENT_USER(), DATABASE();"'
```

Phải thấy healthy. Nếu dùng volume cũ, MYSQL_* không tự tạo lại user/đổi password. Sao lưu trước; DBA cần tạo/đổi `chinese_app`@`%`, cấp quyền chỉ trên `chinese_online_learning` và khớp MYSQL_PASSWORD. Thực hiện bằng phiên MySQL root tương tác (`docker compose exec mysql mysql -uroot -p`), tránh đưa secret vào command history. Không reinitialize volume. MySQL init SQL đã chứa schema/subscription mới; migration dữ liệu cũ theo `database/README-subscriptions.md`, có backup trước.

### 2. Backend

```bash
docker compose up -d --build --force-recreate backend
docker compose logs --tail=200 backend
docker compose exec backend getent hosts mysql
```

Phải thấy `Tomcat started on port 8081`, `Started BackendApplication`, không có `Could not resolve placeholder`. Không publish 8081 hoặc 3306 ra host. Nếu image không có getent, dùng `docker compose exec backend sh -c 'nslookup mysql'` hoặc container chẩn đoán trên cùng network.

### 3. Nginx HTTP

```bash
docker compose up -d --build nginx
docker compose exec nginx nginx -t
docker compose exec nginx nslookup backend
docker compose exec nginx wget -qO- http://backend:8081/actuator/health
curl -I http://16.178.47.5
curl -fsS http://16.178.47.5/api/actuator/health
curl -fsS http://16.178.47.5/api/courses
curl -I http://16.178.47.5/actuator/prometheus
curl -I http://16.178.47.5/api/actuator/prometheus
```

Hai request metrics cuối phải trả 404. SPA `/oauth/callback`, `/payment/result`, `/verify-email` đều fallback index.html. `/api/...` giữ nguyên prefix khi chuyển tới backend:8081. `/login/oauth2/...` được proxy tới backend; không trả SPA cho provider callback.

### 4. DNS

Đặt A record edujar.site và www.edujar.site về 16.178.47.5. Xóa/sửa AAAA sai nếu không có IPv6 phục vụ server này. Mở inbound 80/443 trong firewall và security group của máy chủ. Kiểm tra từ mạng ngoài:

```bash
dig +short A edujar.site
dig +short A www.edujar.site
dig +short AAAA edujar.site
dig +short AAAA www.edujar.site
curl -I http://edujar.site
curl -I http://www.edujar.site
```

Không bật phase 2 trước khi xác minh cả hai hostname thực sự đến server mới.

### 5. SSL

Nginx HTTP đã phục vụ webroot challenge; Certbot không cần chiếm cổng 80:

```bash
sudo certbot certonly --webroot -w /home/deploy/deployment/acme \
  --cert-name edujar.site -d edujar.site -d www.edujar.site
sudo test -s /etc/letsencrypt/live/edujar.site/fullchain.pem
sudo test -s /etc/letsencrypt/live/edujar.site/privkey.pem
```

Nhập email quản trị/đồng ý điều khoản trong Certbot. Lệnh chỉ thực hiện khi DNS đúng; không khẳng định certificate hiện đã tồn tại.

### 6. HTTPS, OAuth và PayOS

Sửa `.env` trên Ubuntu:

```dotenv
COMPOSE_FILE=docker-compose.yml:docker-compose.https.yml
CORS_ALLOWED_ORIGINS=https://edujar.site,https://www.edujar.site
OAUTH2_FRONTEND_REDIRECT_URI=https://edujar.site/oauth/callback
FRONTEND_PAYMENT_RESULT_URL=https://edujar.site/payment/result
FRONTEND_VERIFY_EMAIL_URL=https://edujar.site/verify-email
```

```bash
python3 deployment/validate_env.py --env-file .env
docker compose config --quiet
docker compose run --rm --no-deps nginx nginx -t
docker compose up -d --force-recreate backend nginx
curl -I http://edujar.site
curl -I https://edujar.site
curl -fsS https://edujar.site/api/actuator/health
```

HTTP chuyển HTTPS. COMPOSE_FILE lưu trong .env giúp các lần Jenkins/pull/up sau vẫn giữ HTTPS. Nếu rollback HTTP, bỏ COMPOSE_FILE rồi recreate nginx; không xóa volume.

Provider backend callbacks phải đăng ký chính xác:

- Google: `https://edujar.site/login/oauth2/code/google`
- Facebook: `https://edujar.site/login/oauth2/code/facebook`
- URL bắt đầu đăng nhập: `/api/oauth2/authorization/google` hoặc `/api/oauth2/authorization/facebook`.
- Frontend landing sau thành công/thất bại: `https://edujar.site/oauth/callback` — không đăng ký URL này làm provider callback.
- Nếu cho phép bắt đầu OAuth ở www, đăng ký thêm hai callback www tương ứng, hoặc chỉ cho người dùng bắt đầu tại apex. Spring dựng backend callback từ request đã nhận forwarded headers của Nginx.
- JSESSIONID HttpOnly, SameSite=Lax; forwarded scheme HTTPS giúp container xác định request secure. JWT vẫn theo logic/storage hiện tại; không thay quy tắc auth.
- Google web OAuth yêu cầu HTTPS và không chấp nhận public raw IP redirect URI (ngoại lệ localhost chỉ dành development). [Google validation rules](https://developers.google.com/identity/protocols/oauth2/web-server#uri-validation).
- Facebook production cần cấu hình Valid OAuth Redirect URIs/HTTPS và app permissions/review phù hợp; không coi IP HTTP là bài kiểm tra hợp lệ. Trang Meta trả HTTP 429 khi kiểm chứng trong audit này; cần đối chiếu trực tiếp dashboard trước go-live.
- PayOS returnUrl và cancelUrl cùng lấy FRONTEND_PAYMENT_RESULT_URL; service tự thêm invoiceId/invoiceCode và cancel=true. Không thêm query vào biến này.
- Webhook khai báo tại dashboard PayOS: `https://edujar.site/api/payments/payos-webhook`; source không đọc biến PAYOS_WEBHOOK_URL, nên không tạo biến giả. Cần test xác minh chữ ký và nhận callback thực tế. [PayOS API](https://payos.vn/docs/api/), [webhook](https://payos.vn/docs/du-lieu-tra-ve/webhook/).
- IP HTTP test được frontend, API công khai, DB connectivity và health. SMTP/Resend là kết nối outbound, không phụ thuộc domain website, nhưng email sender phải hợp lệ/đã xác minh. Payment UI có thể mở bằng IP; chỉ xác nhận giao dịch hoàn chỉnh khi provider chấp nhận return/cancel/webhook và test thực tế. Không khẳng định PayOS bắt buộc domain ở mọi trường hợp nếu tài liệu không nêu.

Renew certificate:

```bash
sudo certbot renew --dry-run
```

Cài executable deploy hook trong `/etc/letsencrypt/renewal-hooks/deploy/reload-learning-nginx` với nội dung:

```sh
#!/bin/sh
set -eu
cd /home/deploy
docker compose exec -T nginx nginx -t
docker compose exec -T nginx nginx -s reload
```

Kiểm tra `systemctl status certbot.timer`. Giữ webroot challenge port 80 phục vụ được sau khi bật HTTPS.

### 7. Monitoring

```bash
docker compose up -d prometheus grafana
docker compose exec prometheus promtool check config /etc/prometheus/prometheus.yml
docker compose exec prometheus wget -qO- http://backend:8081/actuator/prometheus
curl -fsS 'http://127.0.0.1:9090/api/v1/query?query=up'
docker compose ps
```

`up{job="backend"}` phải bằng 1; wget thực tế đồng thời xác minh DNS backend từ Prometheus. Từ máy quản trị:

```bash
ssh -L 3000:127.0.0.1:3000 -L 9090:127.0.0.1:9090 deploy@16.178.47.5
```

Grafana datasource URL là `http://prometheus:9090` (không phải localhost). GF_SECURITY_ADMIN_* chỉ khởi tạo admin cho volume Grafana mới; đổi password trên volume cũ qua quản trị Grafana. Không mở 3000/9090 ra Internet.

### 8. Jenkins

Cập nhật credential ID `azure-server-ssh` bằng key/user server mới (tên ID giữ tương thích pipeline), `dockerhub-credentials`, file `/var/lib/jenkins/env/.env`. Server phải có `/home/deploy/.env` độc lập đã điền, python3, quyền Docker và quyền pull image private nếu có. Jenkins không tự ghi đè server secrets.

Pipeline build/push ba image ứng dụng, đồng bộ Compose + HTTPS config + Prometheus + validator rồi pull/up. Server .env quyết định HTTP hay HTTPS. Host key nên được đối chiếu trước lần SSH đầu. Phải kiểm tra log backend, health và Prometheus target sau pipeline; `up -d`/`ps` đơn thuần không chứng minh app ready.

### Giới hạn xác nhận

Audit chạy trên Windows workspace, không có Docker daemon hoạt động hay phiên SSH được cấu hình tới Ubuntu. Không tuyên bố năm container đã chạy hoặc domain/certificate/OAuth/PayOS đã hoạt động. Compose được validate bằng env giả không có secret; unit test và frontend production build được chạy riêng. File env thật chưa đủ cấu hình, validator liệt kê tất cả tên bắt buộc còn thiếu. Chỉ kết luận runtime thành công sau khi thực hiện các lệnh trên server và thấy đúng log/health/provider callback.

K?t qu? local: Compose HTTP/HTTPS PASS v?i env gi?; 32/32 explicit backend variables c? mapping; 62 unit tests c? PASS, 4 MySQL integration tests SKIP; 2 regression tests c?u h?nh JWT/mail PASS; frontend `npm run build` PASS (c?nh b?o bundle >500 kB); `git diff --check` PASS.
