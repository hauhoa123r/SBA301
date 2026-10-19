#!/bin/sh
# Run from the EXISTING EC2 Compose directory. Tags come only from its .env.
set -efu
services=${1:-backend nginx}
case "$services" in 'backend nginx'|nginx) ;; *) echo 'usage: deploy-app.sh ["backend nginx"|nginx]' >&2; exit 1 ;; esac
test -s .env
unset IMAGE_TAG MYSQL_IMAGE_TAG BACKEND_IMAGE_TAG NGINX_IMAGE_TAG
unset BACKEND_IMAGE_REF NGINX_IMAGE_REF MYSQL_IMAGE_REF COMPOSE_FILE

project=$(docker inspect chinese-mysql --format '{{index .Config.Labels "com.docker.compose.project"}}')
test -n "$project"
for container in chinese-backend chinese-nginx; do
    test "$(docker inspect "$container" --format '{{index .Config.Labels "com.docker.compose.project"}}')" = "$project"
done

# Keep the active base/monitoring/custom overrides. Drop only the discontinued
# release image override; do not overwrite EC2 Compose or monitoring files.
files=$(docker inspect chinese-nginx --format '{{index .Config.Labels "com.docker.compose.project.config_files"}}')
test -n "$files"
saved_ifs=$IFS
IFS=,
for file in $files; do
    case "$file" in
        */deployment/releases/*/compose.production.yml|*/deployment/compose.production.yml) continue ;;
    esac
    test -f "$file"
    COMPOSE_FILE=${COMPOSE_FILE:+$COMPOSE_FILE:}$file
done
IFS=$saved_ifs
test -n "${COMPOSE_FILE:-}"
export COMPOSE_FILE COMPOSE_PATH_SEPARATOR=:
compose() { docker compose --env-file .env --project-name "$project" "$@"; }

compose config --quiet
# Print/filter only the two non-secret tag keys, never the full configuration.
tags=$(compose config --environment | grep -E '^(IMAGE_TAG|MYSQL_IMAGE_TAG)=')
IMAGE_TAG=$(printf '%s\n' "$tags" | sed -n 's/^IMAGE_TAG=//p')
MYSQL_IMAGE_TAG=$(printf '%s\n' "$tags" | sed -n 's/^MYSQL_IMAGE_TAG=//p')
for tag in "$IMAGE_TAG" "$MYSQL_IMAGE_TAG"; do
    case "$tag" in ''|latest|*[!A-Za-z0-9_.-]*) echo 'Explicit non-latest IMAGE_TAG and MYSQL_IMAGE_TAG are required in EC2 .env' >&2; exit 1 ;; esac
done
export IMAGE_TAG MYSQL_IMAGE_TAG
# Compatibility with an older EC2 base file; still use the manually chosen tag.
export BACKEND_IMAGE_TAG="$IMAGE_TAG" NGINX_IMAGE_TAG="$IMAGE_TAG"
backend_ref="devhoa/chinese-backend:$IMAGE_TAG"
nginx_ref="devhoa/chinese-nginx:$IMAGE_TAG"
mysql_ref="devhoa/chinese-mysql:$MYSQL_IMAGE_TAG"
images=$(compose config --images)
for ref in "$backend_ref" "$nginx_ref" "$mysql_ref"; do
    printf '%s\n' "$images" | grep -Fx "$ref" >/dev/null || {
        printf 'Effective Compose configuration does not select %s; check EC2 .env and active overrides\n' "$ref" >&2
        exit 1
    }
done
printf 'EC2 app tag=%s; MySQL configured tag=%s (not deployed)\n' "$IMAGE_TAG" "$MYSQL_IMAGE_TAG"
printf '%s\n' "$images"

protected_ids() {
    for service in mysql prometheus grafana; do
        docker ps -aq --filter "label=com.docker.compose.project=$project" --filter "label=com.docker.compose.service=$service"
    done
    if [ "$services" = nginx ]; then docker inspect chinese-backend --format '{{.Id}}'; fi
}
protected_before=$(protected_ids)
if [ "$services" = 'backend nginx' ]; then
    sh deployment/verify-mysql-schema.sh database/tests/check-schema.sql
fi
compose pull $services
nginx_id=$(docker image inspect "$nginx_ref" --format '{{.Id}}')
if [ "$services" = 'backend nginx' ]; then backend_id=$(docker image inspect "$backend_ref" --format '{{.Id}}'); fi
compose run --rm --no-deps --entrypoint nginx nginx -t
nginx_sha=$(compose run --rm --no-deps --entrypoint sha256sum nginx /etc/nginx/conf.d/default.conf)
nginx_sha=${nginx_sha%% *}
if [ "$services" = 'backend nginx' ]; then
    compose up -d --no-build --no-deps --force-recreate --wait --wait-timeout 180 backend
    test "$(docker inspect chinese-backend --format '{{.Image}}')" = "$backend_id" || {
        echo 'Running backend image differs from the pulled EC2 .env image' >&2
        exit 1
    }
    # Older EC2 base files may lack a declared healthcheck. Check real readiness
    # without overwriting their Compose/environment/monitoring configuration.
    attempts=0
    until docker exec chinese-backend sh -c 'wget -T 5 -q -O- http://127.0.0.1:8081/actuator/health | grep -q '\''"status":"UP"'\'''; do
        attempts=$((attempts + 1))
        test "$attempts" -lt 30
        test "$(docker inspect chinese-backend --format '{{.State.Status}}')" = running
        sleep 2
    done
fi
compose up -d --no-build --no-deps --force-recreate --wait --wait-timeout 180 nginx
test "$(docker inspect chinese-nginx --format '{{.State.Status}}')" = running
sh deployment/verify-nginx-https.sh "$nginx_ref" "$nginx_id" "$nginx_sha"
test "$(protected_ids)" = "$protected_before" || {
    echo 'A protected database/monitoring/backend container changed unexpectedly' >&2
    exit 1
}
compose config --images
compose ps
