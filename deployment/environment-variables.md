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
