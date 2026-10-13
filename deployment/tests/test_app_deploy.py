"""Execute deployment shells with isolated Docker/SSH/HTTPS stubs.

No engine, registry, network or production credentials are used.
"""
import os
from pathlib import Path
import re
import shutil
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[2]
BASH = shutil.which("bash")
if os.name == "nt" and Path("C:/Program Files/Git/bin/bash.exe").exists():
    BASH = "C:/Program Files/Git/bin/bash.exe"


def shell_blocks(stage=None):
    source = (ROOT / "Jenkinsfile").read_text()
    if stage:
        source = source.split(f"stage('{stage}')", 1)[1].split("stage('", 1)[0]
    return [re.sub(r"\\(\\|n|\n)", lambda m: {"\\": "\\", "n": "\n", "\n": ""}[m[1]], block)
            for block in re.findall(r"sh\s+'''(.*?)'''", source, re.S)]


DOCKER_STUB = '''#!/bin/sh
printf '%s\n' "$*" >> "$FIXTURE/calls"
printf '%s\n' "${COMPOSE_FILE:-}" >> "$FIXTURE/compose-files"
case "$*" in
  'inspect chinese-nginx --format '*config_files*)
    printf '%s\n' "$FIXTURE/docker-compose.yml,$FIXTURE/monitoring.yml,$FIXTURE/deployment/releases/21/compose.production.yml" ;;
  inspect*com.docker.compose.project*) echo production-sba301 ;;
  'inspect chinese-backend --format {{.Image}}')
    if [ "$MODE" = wrong_image ]; then echo wrong-image; else echo backend-image-22; fi ;;
  'inspect chinese-backend --format {{.Id}}') echo backend-container ;;
  'inspect chinese-nginx --format {{.Image}}')
    if [ "$MODE" = wrong_nginx ]; then echo wrong-image; else echo nginx-image-22; fi ;;
  inspect*State.Status*) echo running ;;
  ps*service=mysql*) echo mysql-container ;;
  ps*service=prometheus*) echo prometheus-container ;;
  ps*service=grafana*)
    if [ "$MODE" = monitoring_changed ] && [ -f "$FIXTURE/nginx-started" ]; then echo changed; else echo grafana-container; fi ;;
  'image inspect devhoa/chinese-nginx:22 --format {{.Id}}') echo nginx-image-22 ;;
  'image inspect devhoa/chinese-backend:22 --format {{.Id}}') echo backend-image-22 ;;
  'exec -i chinese-mysql sh -c '*)
    cat > "$FIXTURE/checked.sql"
    case "$MODE" in
      missing_column) echo 'Missing column lesson_progress.position_seconds' ;;
      missing_table) echo 'Missing table authentication_settings' ;;
      mysql_error) exit 7 ;;
    esac ;;
  'exec chinese-backend sh -c '*) [ "$MODE" != unhealthy ] ;;
  'exec chinese-nginx sha256sum '*)
    echo 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa  /etc/nginx/conf.d/default.conf' ;;
  'exec chinese-nginx nginx -T')
    echo '# configuration file /etc/nginx/conf.d/default.conf:'
    if [ "$MODE" = no_https ]; then sed 's/listen 443 ssl;/listen 444;/' "$FIXTURE/effective.conf"; else cat "$FIXTURE/effective.conf"; fi ;;
  compose*'config --quiet') exit 0 ;;
  compose*'config --environment')
    test -z "${IMAGE_TAG:-}" && test -z "${MYSQL_IMAGE_TAG:-}" || exit 91
    cat .env ;;
  compose*'config --images')
    echo devhoa/chinese-backend:22
    echo devhoa/chinese-nginx:22
    echo "devhoa/chinese-mysql:$(sed -n 's/^MYSQL_IMAGE_TAG=//p' .env)" ;;
  compose*'pull '*) exit 0 ;;
  compose*'run --rm --no-deps --entrypoint nginx nginx -t') exit 0 ;;
  compose*'run --rm --no-deps --entrypoint sha256sum nginx '* )
    echo 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa  /etc/nginx/conf.d/default.conf' ;;
  compose*'up '*nginx) touch "$FIXTURE/nginx-started" ;;
  compose*'up '*backend|compose*'ps') exit 0 ;;
  *) echo "Unexpected Docker call: $*" >&2; exit 92 ;;
esac
'''

CURL_STUB = '''#!/bin/sh
printf 'curl %s\n' "$*" >> "$FIXTURE/calls"
[ "$MODE" != tls_failure ] || exit 60
case "$*" in
  *http://edujar.site/learning*) printf '301 https://edujar.site/learning' ;;
  *api/actuator/health*)
    case "$*" in
      *--resolve*)
        if [ "$MODE" = api_down ]; then printf '{"status":"DOWN"}\n200'; else printf '{"status":"UP"}\n200'; fi ;;
      *) printf '200 application/json' ;;
    esac ;;
  *api/subscriptions/plans*) printf '200 application/json' ;;
  *) if [ "$MODE" = wrong_type ]; then printf '200 application/json'; else printf '200 text/html'; fi ;;
esac
'''


@unittest.skipUnless(BASH, "Bash required")
class JenkinsDeploymentTest(unittest.TestCase):
    def run_workflow(self, mode="ok", services="backend nginx", env_contents=None,
                     connect=False, real_https=False, public=False):
        with tempfile.TemporaryDirectory(prefix="compose-deploy-") as directory:
            directory = Path(directory)
            def write(name, content):
                path = directory / name
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text(content, newline="\n")
                path.chmod(0o755)
            original_env = env_contents if env_contents is not None else "IMAGE_TAG=22\nMYSQL_IMAGE_TAG=21\nSECRET=fixture-secret\n"
            write(".env", original_env)
            write("docker-compose.yml", "# existing EC2 base\n")
            write("monitoring.yml", "# existing monitoring override\n")
            write("docker", DOCKER_STUB)
            write("curl", CURL_STUB)
            write("effective.conf", (ROOT / "frontend/nginx.conf").read_text())
            write("sleep", "#!/bin/sh\nexit 0\n")
            write("ssh", '#!/bin/sh\nprintf "ssh %s\\n" "$*" >> "$FIXTURE/calls"\n')
            write("scp", '#!/bin/sh\nprintf "scp %s\\n" "$*" >> "$FIXTURE/calls"\n')
            for name in ("deploy-app.sh", "verify-mysql-schema.sh"):
                write("deployment/" + name, (ROOT / "deployment" / name).read_text())
            write("deployment/check-schema.sql", (ROOT / "database/check-schema.sql").read_text())
            write("deployment/verify-nginx-https.sh", (ROOT / "deployment/verify-nginx-https.sh").read_text() if real_https else '''#!/bin/sh
printf 'https %s\n' "$*" >> "$FIXTURE/calls"
test "$MODE" != https_error
''')
            write("case.sh", shell_blocks("VERIFY_PUBLIC_HTTPS")[0] if public else shell_blocks("CONNECT_SERVER")[0] if connect else
                  'exec sh deployment/deploy-app.sh "$APP_SERVICES"\n')
            bootstrap = '''
if command -v cygpath >/dev/null 2>&1; then FIXTURE=$(cygpath -u "$1"); else FIXTURE=$1; fi
export FIXTURE
export PATH="$FIXTURE:/usr/bin:/bin"
for client in docker ssh scp sleep curl; do
    test "$(command -v "$client")" = "$FIXTURE/$client" || exit 97
done
cd "$FIXTURE"
exec sh "$FIXTURE/case.sh"
'''
            env = os.environ.copy()
            env.update(MODE=mode, APP_SERVICES=services, IMAGE_TAG="999", MYSQL_IMAGE_TAG="888",
                       DEPLOY_PATH="apps/SBA301", WORKSPACE=directory.as_posix(), SSH_KEY="fixture-key",
                       SSH_USER="fixture", SERVER_IP="fixture.invalid")
            result = subprocess.run([BASH, "--noprofile", "--norc", "-c", bootstrap,
                                     "deploy-fixture", directory.as_posix()], env=env,
                                    text=True, capture_output=True, timeout=20)
            calls = (directory / "calls").read_text() if (directory / "calls").exists() else ""
            files = (directory / "compose-files").read_text() if (directory / "compose-files").exists() else ""
            self.assertEqual(original_env, (directory / ".env").read_text())
            self.assertEqual("# existing EC2 base\n", (directory / "docker-compose.yml").read_text())
            self.assertEqual("# existing monitoring override\n", (directory / "monitoring.yml").read_text())
            self.assertNotIn("fixture-secret", result.stdout + result.stderr)
            self.assertNotIn("pull mysql", calls)
            self.assertNotRegex(calls, r"up .*\b(mysql|grafana|prometheus)\b")
            self.assertNotIn("rollback", calls)
            return result, calls, files

    def test_manual_app_tag_22_mysql_21_and_custom_overrides(self):
        result, calls, files = self.run_workflow()
        self.assertEqual(0, result.returncode, result.stderr)
        self.assertIn("EC2 app tag=22; MySQL configured tag=21", result.stdout)
        self.assertIn("pull backend nginx", calls)
        self.assertIn("--no-build --no-deps --force-recreate --wait --wait-timeout 180 backend", calls)
        self.assertLess(calls.index("exec -i chinese-mysql"), calls.index("pull backend nginx"))
        self.assertIn("https devhoa/chinese-nginx:22 nginx-image-22", calls)
        self.assertIn("monitoring.yml", files)
        self.assertNotIn("compose.production.yml", files)

    def test_nginx_only_does_not_touch_backend_or_database(self):
        result, calls, _ = self.run_workflow(services="nginx")
        self.assertEqual(0, result.returncode, result.stderr)
        self.assertIn("pull nginx", calls)
        self.assertNotIn("exec -i chinese-mysql", calls)
        self.assertNotRegex(calls, r"up .* backend")

    def test_missing_table_or_column_blocks_deploy(self):
        for mode in ("missing_table", "missing_column"):
            with self.subTest(mode=mode):
                result, calls, _ = self.run_workflow(mode=mode)
                self.assertNotEqual(0, result.returncode)
                self.assertIn("incompatible", result.stderr)
                self.assertNotIn("pull backend", calls)
                self.assertNotIn("up -d", calls)

    def test_mysql_cli_error_blocks_deploy(self):
        result, calls, _ = self.run_workflow(mode="mysql_error")
        self.assertEqual(7, result.returncode)
        self.assertNotIn("up -d", calls)

    def test_bad_tags_block_deploy(self):
        for value in ("IMAGE_TAG=latest\nMYSQL_IMAGE_TAG=21\n", "IMAGE_TAG=22\n", ""):
            with self.subTest(value=value):
                result, calls, _ = self.run_workflow(env_contents=value)
                self.assertNotEqual(0, result.returncode)
                self.assertNotIn("up -d", calls)

    def test_wrong_backend_image_fails_before_nginx(self):
        result, calls, _ = self.run_workflow(mode="wrong_image")
        self.assertNotEqual(0, result.returncode)
        self.assertNotRegex(calls, r"up .* nginx")

    def test_backend_health_failure_fails_before_nginx(self):
        result, calls, _ = self.run_workflow(mode="unhealthy")
        self.assertNotEqual(0, result.returncode)
        self.assertNotRegex(calls, r"up .* nginx")

    def test_https_failure_is_not_hidden(self):
        result, calls, _ = self.run_workflow(mode="https_error")
        self.assertNotEqual(0, result.returncode)
        self.assertIn("https devhoa/chinese-nginx:22", calls)

    def test_monitoring_recreation_is_detected(self):
        result, _, _ = self.run_workflow(mode="monitoring_changed")
        self.assertNotEqual(0, result.returncode)

    def test_jenkins_uploads_only_checks_and_scripts(self):
        result, calls, _ = self.run_workflow(connect=True)
        self.assertEqual(0, result.returncode, result.stderr)
        self.assertIn("sh deployment/deploy-app.sh 'backend nginx'", calls)
        scp = next(line for line in calls.splitlines() if line.startswith("scp "))
        self.assertIn("database/check-schema.sql", scp)
        self.assertNotIn(".env", scp)
        self.assertNotIn("docker-compose", scp)
        self.assertNotIn("release.py", calls)
        self.assertNotIn("IMAGE_TAG=", calls)

    def test_real_https_verifier_accepts_effective_config_and_tls_responses(self):
        result, calls, _ = self.run_workflow(real_https=True)
        self.assertEqual(0, result.returncode, result.stderr)
        self.assertIn("HTTPS verified", result.stdout)
        self.assertIn("--resolve edujar.site:443:127.0.0.1", calls)
        self.assertNotIn("--insecure", calls)

    def test_real_https_verifier_rejects_listener_image_tls_and_api_failures(self):
        for mode in ("no_https", "wrong_nginx", "tls_failure", "api_down", "wrong_type"):
            with self.subTest(mode=mode):
                result, _, _ = self.run_workflow(mode=mode, real_https=True)
                self.assertNotEqual(0, result.returncode)

    def test_public_https_smoke_accepts_correct_routes(self):
        result, calls, _ = self.run_workflow(public=True)
        self.assertEqual(0, result.returncode, result.stderr)
        self.assertEqual(4, calls.count("curl "))

    def test_public_https_smoke_rejects_tls_and_wrong_content(self):
        for mode in ("tls_failure", "wrong_type"):
            with self.subTest(mode=mode):
                result, _, _ = self.run_workflow(mode=mode, public=True)
                self.assertNotEqual(0, result.returncode)

    def test_shell_syntax(self):
        scripts = shell_blocks() + [(ROOT / name).read_text() for name in (
            "deployment/deploy-app.sh", "deployment/verify-mysql-schema.sh",
            "deployment/verify-nginx-https.sh", "database/verify-schema.sh",
            "database/tests/fresh-mysql-regression.sh")]
        for number, script in enumerate(scripts):
            with self.subTest(script=number):
                result = subprocess.run([BASH, "--noprofile", "--norc", "-n"], input=script,
                                        capture_output=True, text=True, timeout=10)
                self.assertEqual(0, result.returncode, result.stderr)
