#!/bin/sh
# Read-only guard for the existing database; no migrations or init scripts.
set -eu
[ "$#" -eq 1 ] || { echo 'usage: verify-mysql-schema.sh CHECK_SCHEMA_SQL' >&2; exit 1; }
test -r "$1"
violations=$(docker exec -i chinese-mysql sh -c \
    'MYSQL_PWD="${MYSQL_PASSWORD:?MYSQL_PASSWORD is required}" mysql --protocol=SOCKET --user="${MYSQL_USER:-chinese_app}" --database="${MYSQL_DATABASE:-chinese_online_learning}" --batch --raw --skip-column-names' \
    < "$1") || exit "$?"
if [ -n "$violations" ]; then
    printf 'Existing MySQL schema is incompatible:\n%s\n' "$violations" >&2
    exit 1
fi
echo 'Existing MySQL schema verified (read-only)'
