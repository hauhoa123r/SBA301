#!/bin/sh
# Verify the deployed release, effective Nginx config, and real TLS requests.
# This script does not create/restart containers or modify database/volumes.
set -eu

fail() {
    printf 'HTTPS verification failed: %s\n' "$*" >&2
    exit 1
}

[ "$#" -eq 3 ] || fail 'usage: verify-nginx-https.sh IMAGE_REF EXPECTED_IMAGE_ID EXPECTED_CONFIG_SHA256'
image_ref=$1
expected_image_id=$2
expected_config_sha=$3

actual_image_id=$(docker image inspect "$image_ref" --format '{{.Id}}')
[ "$actual_image_id" = "$expected_image_id" ] || fail 'pulled image ID differs from the image built by Jenkins'
running_image_id=$(docker inspect chinese-nginx --format '{{.Image}}')
[ "$running_image_id" = "$expected_image_id" ] || fail 'running Nginx container uses a different image'

actual_config_sha=$(docker exec chinese-nginx sha256sum /etc/nginx/conf.d/default.conf)
actual_config_sha=${actual_config_sha%% *}
[ "$actual_config_sha" = "$expected_config_sha" ] || fail 'container default.conf differs from frontend/nginx.conf in this release'

config_dump=$(mktemp)
trap 'rm -f "$config_dump"' EXIT
trap 'exit 1' HUP INT TERM
docker exec chinese-nginx nginx -T >"$config_dump" 2>&1 || fail 'nginx -T failed'

require_config() {
    grep -Eq "$1" "$config_dump" || fail "$2"
}

require_config '^# configuration file /etc/nginx/conf.d/default.conf:' 'default.conf is not included in the effective configuration'
require_config 'listen[[:space:]]+80[[:space:]]+default_server[[:space:]]*;' 'HTTP listener missing'
require_config 'listen[[:space:]]+443[[:space:]]+ssl[[:space:]]*;' 'HTTPS listener missing (nginx -t alone is insufficient)'
require_config 'return[[:space:]]+301[[:space:]]+https://edujar[.]site\$request_uri[[:space:]]*;' 'HTTP to HTTPS redirect missing'
require_config 'ssl_certificate[[:space:]]+/etc/letsencrypt/live/edujar[.]site/fullchain[.]pem[[:space:]]*;' 'Edujar certificate missing'
require_config 'ssl_certificate_key[[:space:]]+/etc/letsencrypt/live/edujar[.]site/privkey[.]pem[[:space:]]*;' 'Edujar private-key path missing'
require_config 'location[[:space:]]+/api/[[:space:]]*\{' 'API location missing'
require_config 'proxy_pass[[:space:]]+http://backend:8081[[:space:]]*;' 'backend upstream missing'
require_config 'try_files[[:space:]]+\$uri[[:space:]]+\$uri/[[:space:]]+/index[.]html[[:space:]]*;' 'React SPA fallback missing'

redirect=$(curl --silent --show-error --noproxy '*' --connect-timeout 5 --max-time 15 \
    --retry 5 --retry-connrefused --retry-delay 2 --retry-max-time 45 \
    --resolve edujar.site:80:127.0.0.1 --output /dev/null \
    --write-out '%{http_code} %{redirect_url}' http://edujar.site/learning)
[ "$redirect" = '301 https://edujar.site/learning' ] || fail "unexpected HTTP redirect: $redirect"

for route in learning subscriptions; do
    result=$(curl --fail --silent --show-error --noproxy '*' --connect-timeout 5 --max-time 15 \
        --retry 5 --retry-connrefused --retry-delay 2 --retry-max-time 45 \
        --resolve edujar.site:443:127.0.0.1 --output /dev/null \
        --write-out '%{http_code} %{content_type}' "https://edujar.site/$route")
    case "$result" in
        '200 text/html'|'200 text/html;'*) ;;
        *) fail "HTTPS /$route did not return the React SPA: $result" ;;
    esac
done

health=$(curl --fail --silent --show-error --noproxy '*' --connect-timeout 5 --max-time 15 \
    --retry 5 --retry-connrefused --retry-delay 2 --retry-max-time 45 \
    --resolve edujar.site:443:127.0.0.1 --write-out '\n%{http_code}' https://edujar.site/api/actuator/health)
health_status=$(printf '%s\n' "$health" | tail -n 1)
[ "$health_status" = 200 ] || fail "HTTPS backend health returned HTTP $health_status"
printf '%s\n' "$health" | grep -Eq '"status"[[:space:]]*:[[:space:]]*"UP"' \
    || fail 'HTTPS backend health is not UP'

printf 'HTTPS verified: image=%s config_sha256=%s; HTTP redirect, both SPA routes and API health passed.\n' \
    "$running_image_id" "$actual_config_sha"
