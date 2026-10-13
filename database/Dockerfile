FROM mysql:8.0

COPY chinese_online_learning.sql /docker-entrypoint-initdb.d/01-schema.sql
COPY DataChinese.sql /docker-entrypoint-initdb.d/02-data.sql
COPY 20261012_deploy_update.sql /docker-entrypoint-initdb.d/03-deploy-update.sql
COPY 20261013_feedback.sql /docker-entrypoint-initdb.d/04-feedback.sql
COPY verify-schema.sh /usr/local/bin/verify-edujar-schema
COPY check-schema.sql /usr/local/share/edujar/check-schema.sql

# Init is SQL-only. Run the standalone verifier after final MySQL startup.
RUN chmod 755 /usr/local/bin/verify-edujar-schema \
    && test -z "$(find /docker-entrypoint-initdb.d -name '*.sh' -print -quit)"

COPY my.cnf /etc/mysql/conf.d/my.cnf
