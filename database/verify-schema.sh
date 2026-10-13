#!/bin/sh
# Read-only check; works during image initialization (socket) and after startup.
# Explicit credentials are provided by the container environment, never printed.
set -eu

violations=$(MYSQL_PWD="${MYSQL_PASSWORD:?MYSQL_PASSWORD is required}" \
    mysql --protocol=SOCKET --user="${MYSQL_USER:-chinese_app}" \
    --database="${MYSQL_DATABASE:-chinese_online_learning}" \
    --batch --raw --skip-column-names < /usr/local/share/edujar/check-schema.sql)

if [ -n "$violations" ]; then
    printf 'Edujar schema verification failed:\n%s\n' "$violations" >&2
    exit 1
fi
printf 'Edujar schema verified: all mapped columns and keys are present and compatible.\n'
