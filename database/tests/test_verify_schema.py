"""Portable shell regressions; real fresh-container tests run in Jenkins.

Run from the repo root: python -m unittest discover -s database/tests -v
Requires Bash (Git Bash on Windows). mysql/docker are stubbed; no DB is touched.
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
if os.name == "nt":
    git_bash = Path("C:/Program Files/Git/bin/bash.exe")
    if git_bash.exists():
        BASH = str(git_bash)


@unittest.skipUnless(BASH, "Bash is required")
class VerifierRegressionTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(prefix="schema-shell-")
        self.addCleanup(self.tmp.cleanup)
        self.fixture = Path(self.tmp.name)
        # Only replace the installed SQL path in the test copy. The real script
        # and its control flow run unchanged; no system-installed files needed.
        self.verifier = (ROOT / "database/verify-schema.sh").read_text()
        self.write("verify.sh", self.verifier.replace(
            "/usr/local/share/edujar/check-schema.sql", '"$FIXTURE/check-schema.sql"'))
        shutil.copyfile(ROOT / "database/tests/check-schema.sql", self.fixture / "check-schema.sql")
        self.write("mysql", """#!/bin/sh
cat >/dev/null
case "${MYSQL_TEST_CASE:-valid}" in
  valid) ;;
  table) printf 'column mismatch: authentication_settings.id\\n' ;;
  column) printf 'column mismatch: lesson_progress.position_seconds\\n' ;;
  cli_error) echo 'simulated connection failure' >&2; exit 7 ;;
esac
""")
        self.write("docker", """#!/bin/sh
printf '%s\\n' "$*" >> "$FIXTURE/docker-calls"
case "$1 $2" in
  'image inspect') printf '%s\\n' "${DOCKER_TEST_IMAGE_ID:-sha256:validated}" ;;
  login) cat >/dev/null ;;
esac
""")

    def write(self, name, content):
        path = self.fixture / name
        path.write_text(content, encoding="utf-8", newline="\n")
        path.chmod(0o755)

    def run_shell(self, script, **env):
        self.write("case.sh", script)
        # Git Bash can prepend system paths to PATH. Set it inside Bash and
        # assert stub resolution so tests cannot accidentally use real clients.
        bootstrap = r'''
if command -v cygpath >/dev/null 2>&1; then
    FIXTURE=$(cygpath -u "$1")
else
    FIXTURE=$1
fi
export FIXTURE
export PATH="$FIXTURE:/usr/bin:/bin"
test "$(command -v mysql)" = "$FIXTURE/mysql" || exit 97
test "$(command -v docker)" = "$FIXTURE/docker" || exit 97
exec bash "$FIXTURE/case.sh"
'''
        run_env = os.environ.copy()
        run_env.update(MYSQL_PASSWORD="disposable-fixture-secret", WORKSPACE=self.fixture.as_posix(),
                       IMAGE_TAG="test-build", BUILD_MYSQL_IMAGE="true", APP_SERVICES="nginx",
                       DOCKER_TOKEN="fixture-token", DOCKER_USERNAME="fixture-user")
        run_env.update(env)
        return subprocess.run([BASH, "--noprofile", "--norc", "-c", bootstrap,
                               "schema-test", self.fixture.as_posix()],
                              env=run_env, text=True, capture_output=True, timeout=15)

    def test_valid_schema_passes(self):
        result = self.run_shell('sh "$FIXTURE/verify.sh"')
        self.assertEqual(0, result.returncode, result.stderr)
        self.assertIn("Edujar schema verified", result.stdout)

    def test_missing_table_fails(self):
        result = self.run_shell('sh "$FIXTURE/verify.sh"', MYSQL_TEST_CASE="table")
        self.assertNotEqual(0, result.returncode)
        self.assertIn("authentication_settings.id", result.stderr)

    def test_missing_column_fails(self):
        result = self.run_shell('sh "$FIXTURE/verify.sh"', MYSQL_TEST_CASE="column")
        self.assertNotEqual(0, result.returncode)
        self.assertIn("lesson_progress.position_seconds", result.stderr)

    def test_mysql_cli_error_fails(self):
        result = self.run_shell('sh "$FIXTURE/verify.sh"', MYSQL_TEST_CASE="cli_error")
        self.assertEqual(7, result.returncode, result.stderr)
        self.assertNotIn("Edujar schema verified", result.stdout)

    def test_missing_password_fails(self):
        result = self.run_shell('unset MYSQL_PASSWORD; sh "$FIXTURE/verify.sh"')
        self.assertNotEqual(0, result.returncode)
        self.assertNotIn("Edujar schema verified", result.stdout)

    def test_sourcing_preserves_entrypoint_state(self):
        result = self.run_shell('''
set -eo pipefail
unset MYSQL_ONETIME_PASSWORD
violations=entrypoint-value
before_options=$-
before_shellopts=$SHELLOPTS
before_ifs=$IFS
trap ':' TERM
before_traps=$(trap -p)
. "$FIXTURE/verify.sh"
test "$-" = "$before_options"
test "$SHELLOPTS" = "$before_shellopts"
test "$IFS" = "$before_ifs"
test "$(trap -p)" = "$before_traps"
test "$violations" = entrypoint-value
# The same optional expansion that failed in mysql_expire_root_user.
if [ -n "$MYSQL_ONETIME_PASSWORD" ]; then exit 98; fi
echo entrypoint-continues
''')
        self.assertEqual(0, result.returncode, result.stderr)
        self.assertIn("entrypoint-continues", result.stdout)

    def test_sourcing_preserves_existing_nounset(self):
        result = self.run_shell('''
set -eu
before_options=$-
. "$FIXTURE/verify.sh"
test "$-" = "$before_options"
''')
        self.assertEqual(0, result.returncode, result.stderr)

    def test_sourced_failure_does_not_exit_or_mutate_caller(self):
        result = self.run_shell('''
set +eu
before_options=$-
. "$FIXTURE/verify.sh"
status=$?
test "$status" -ne 0 || exit 98
test "$-" = "$before_options" || exit 99
echo caller-continues
''', MYSQL_TEST_CASE="column")
        self.assertEqual(0, result.returncode, result.stderr)
        self.assertIn("caller-continues", result.stdout)

    def test_cli_error_fails_when_sourced_inside_condition(self):
        # errexit can be suppressed in an if condition; failures must still
        # propagate explicitly instead of treating empty CLI output as success.
        result = self.run_shell('''
if . "$FIXTURE/verify.sh"; then
    exit 98
else
    status=$?
fi
test "$status" -eq 7
''', MYSQL_TEST_CASE="cli_error")
        self.assertEqual(0, result.returncode, result.stderr)
        self.assertNotIn("Edujar schema verified", result.stdout)

    def test_original_nounset_leak_reproduces_reported_failure(self):
        self.write("old-init.sh", "set -eu\necho 'Edujar schema verified'\n")
        result = self.run_shell('''
set -eo pipefail
unset MYSQL_ONETIME_PASSWORD
. "$FIXTURE/old-init.sh"
if [ -n "$MYSQL_ONETIME_PASSWORD" ]; then :; fi
''')
        self.assertNotEqual(0, result.returncode)
        self.assertIn("MYSQL_ONETIME_PASSWORD: unbound variable", result.stderr)
        self.assertIn("Edujar schema verified", result.stdout)

    def push_script(self):
        source = (ROOT / "Jenkinsfile").read_text()
        stage = source.split("stage('Push Docker Hub')", 1)[1].split("stage('Deploy EC2')", 1)[0]
        block = re.search(r"sh\s+'''(.*?)'''", stage, re.S).group(1)
        # Decode the Groovy escapes used by these shell blocks.
        return re.sub(r"\\(\\|n|\n)", lambda m: {"\\": "\\", "n": "\n", "\n": ""}[m[1]], block)

    def assert_mysql_not_pushed(self):
        calls = (self.fixture / "docker-calls").read_text()
        self.assertNotRegex(calls, r"(?m)^.*\bpush\b.*mysql")
        self.assertIn("push devhoa/chinese-backend:test-build", calls)
        self.assertIn("push devhoa/chinese-nginx:test-build", calls)

    def test_application_push_without_mysql_receipt_never_publishes_mysql(self):
        result = self.run_shell(self.push_script())
        self.assertEqual(0, result.returncode, result.stderr)
        self.assert_mysql_not_pushed()

    def test_application_push_with_stale_mysql_receipt_never_publishes_mysql(self):
        self.write(".mysql-schema-verified", "sha256:old-image\n")
        result = self.run_shell(self.push_script())
        self.assertEqual(0, result.returncode, result.stderr)
        self.assert_mysql_not_pushed()

    def test_application_push_with_mysql_receipt_never_publishes_mysql(self):
        self.write(".mysql-schema-verified", "sha256:validated\n")
        result = self.run_shell(self.push_script())
        self.assertEqual(0, result.returncode, result.stderr)
        self.assert_mysql_not_pushed()

    def test_mysql_disabled_does_not_require_receipt_or_push_mysql(self):
        result = self.run_shell(self.push_script(), BUILD_MYSQL_IMAGE="false")
        self.assertEqual(0, result.returncode, result.stderr)
        self.assert_mysql_not_pushed()

    def fresh_container_fixture(self):
        self.write("fresh.sh", (ROOT / "database/tests/fresh-mysql-regression.sh").read_text())
        self.write("docker", """#!/bin/sh
printf '%s\\n' "$*" >> "$FIXTURE/docker-calls"
case "$1" in
  inspect)
    case "$4" in
      *Labels*) echo "${TEST_OWNER:-fixture}" ;;
      *Health*) echo "${TEST_HEALTH:-healthy}" ;;
      *RestartCount*) echo 0 ;;
      *Status*) echo running ;;
    esac ;;
  logs) echo 'MySQL init process done. Ready for start up.' ;;
  exec)
    if [ "$4" = /usr/local/bin/verify-edujar-schema ]; then
      state=$(cat "$FIXTURE/schema-state" 2>/dev/null || echo valid)
      case "$state" in
        valid) echo 'Edujar schema verified' ;;
        table) echo 'column mismatch: authentication_settings.id' >&2; exit 1 ;;
        column) echo 'column mismatch: lesson_progress.position_seconds' >&2; exit 1 ;;
      esac
    else
      case "${7:-}" in
        'RENAME TABLE authentication_settings '*) echo table > "$FIXTURE/schema-state" ;;
        'RENAME TABLE schema_test_missing_authentication_settings '*) echo valid > "$FIXTURE/schema-state" ;;
        'ALTER TABLE lesson_progress '*) echo column > "$FIXTURE/schema-state" ;;
      esac
    fi ;;
esac
""")

    def test_fresh_container_regression_checks_complete_sequence(self):
        self.fresh_container_fixture()
        result = self.run_shell('sh "$FIXTURE/fresh.sh" edujar-schema-fixture fixture')
        self.assertEqual(0, result.returncode, result.stderr)
        self.assertIn("missing authentication_settings.id rejected (exit 1)", result.stdout)
        self.assertIn("missing lesson_progress.position_seconds rejected (exit 1)", result.stdout)
        self.assertIn("fresh MySQL initialization, healthy state", result.stdout)

    def test_fresh_container_regression_rejects_wrong_owner_before_mutation(self):
        self.fresh_container_fixture()
        result = self.run_shell('sh "$FIXTURE/fresh.sh" edujar-schema-fixture fixture', TEST_OWNER="someone-else")
        self.assertNotEqual(0, result.returncode)
        self.assertNotIn("exec", (self.fixture / "docker-calls").read_text())

    def test_fresh_container_regression_rejects_unhealthy_before_mutation(self):
        self.fresh_container_fixture()
        result = self.run_shell('sh "$FIXTURE/fresh.sh" edujar-schema-fixture fixture', TEST_HEALTH="unhealthy")
        self.assertNotEqual(0, result.returncode)
        self.assertNotIn("exec", (self.fixture / "docker-calls").read_text())


if __name__ == "__main__":
    unittest.main()
