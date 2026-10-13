#!/bin/sh
# Run only on the disposable, freshly initialized Jenkins schema-test container.
# Negative fixtures intentionally alter that private DB; Jenkins removes it next.
set -eu
set +x

container=${1:?fresh test container required}
test_id=${2:?schema-test owner token required}
test "$container" = "edujar-schema-$test_id"
owner=$(docker inspect "$container" --format '{{index .Config.Labels "com.edujar.schema-test"}}')
test "$owner" = "$test_id"

assert_healthy() {
    test "$(docker inspect "$container" --format '{{.State.Status}}')" = running
    test "$(docker inspect "$container" --format '{{.State.Health.Status}}')" = healthy
    test "$(docker inspect "$container" --format '{{.RestartCount}}')" = 0
}

assert_healthy
logs=$(docker logs "$container" 2>&1)
printf '%s\n' "$logs" | grep -F 'MySQL init process done. Ready for start up.' >/dev/null
if printf '%s\n' "$logs" | grep -F 'unbound variable' >/dev/null; then
    echo 'Fresh initialization leaked nounset into the entrypoint.' >&2
    exit 1
fi
docker exec "$container" sh -c 'test -z "$(find /docker-entrypoint-initdb.d -name "*.sh" -print -quit)"'
docker exec "$container" sh /usr/local/bin/verify-edujar-schema

test_sql() {
    docker exec "$container" sh -c 'MYSQL_PWD="$MYSQL_PASSWORD" mysql --protocol=SOCKET --user="$MYSQL_USER" --database="$MYSQL_DATABASE" --execute="$1"' sh "$1"
}

expect_schema_failure() {
    if output=$(docker exec "$container" sh /usr/local/bin/verify-edujar-schema 2>&1); then
        echo "Verifier unexpectedly accepted missing $1" >&2
        exit 1
    else
        status=$?
    fi
    test "$status" -ne 0
    # Require the actual schema diagnostic, rather than accepting a CLI failure.
    printf '%s\n' "$output" | grep -F "column mismatch: $1" >/dev/null
    echo "PASS: missing $1 rejected (exit $status)"
}

# authentication_settings has no inbound foreign keys; restore before next case.
test_sql 'RENAME TABLE authentication_settings TO schema_test_missing_authentication_settings;'
expect_schema_failure authentication_settings.id
test_sql 'RENAME TABLE schema_test_missing_authentication_settings TO authentication_settings;'
docker exec "$container" sh /usr/local/bin/verify-edujar-schema

# Last fixture may remain invalid: this container is disposed of by Jenkins.
test_sql 'ALTER TABLE lesson_progress DROP CHECK chk_lp_position_nonnegative, DROP COLUMN position_seconds;'
expect_schema_failure lesson_progress.position_seconds
assert_healthy
echo 'PASS: fresh MySQL initialization, healthy state, and verifier negative cases'
