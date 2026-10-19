FROM mysql:8.0

COPY schema.sql /docker-entrypoint-initdb.d/01-schema.sql
COPY data.sql /docker-entrypoint-initdb.d/02-data.sql
COPY verify-schema.sh /usr/local/bin/verify-edujar-schema
COPY tests/check-schema.sql /usr/local/share/edujar/check-schema.sql

# Init is SQL-only. Run the standalone verifier after final MySQL startup.
RUN chmod 755 /usr/local/bin/verify-edujar-schema \
    && test "$(find /docker-entrypoint-initdb.d -type f | wc -l)" -eq 2 \
    && test -z "$(find /docker-entrypoint-initdb.d -name '*.sh' -print -quit)"

COPY my.cnf /etc/mysql/conf.d/my.cnf
