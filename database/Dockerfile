FROM mysql:8.0

COPY chinese_online_learning.sql /docker-entrypoint-initdb.d/01-schema.sql
COPY DataChinese.sql /docker-entrypoint-initdb.d/02-data.sql
COPY 20261012_deploy_update.sql /docker-entrypoint-initdb.d/03-deploy-update.sql
COPY 20261013_feedback.sql /docker-entrypoint-initdb.d/04-feedback.sql
COPY verify-schema.sh /docker-entrypoint-initdb.d/05-verify-schema.sh
COPY verify-schema.sh /usr/local/bin/verify-edujar-schema
COPY check-schema.sql /usr/local/share/edujar/check-schema.sql

RUN chmod 644 /docker-entrypoint-initdb.d/05-verify-schema.sh \
    && chmod 755 /usr/local/bin/verify-edujar-schema

COPY my.cnf /etc/mysql/conf.d/my.cnf
