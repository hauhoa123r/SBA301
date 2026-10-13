"""Execute the Jenkins SSH shell workflow with isolated network/CLI stubs."""
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


@unittest.skipUnless(BASH, "Bash required")
class JenkinsDeploymentTest(unittest.TestCase):
    def run_workflow(self, **settings):
        with tempfile.TemporaryDirectory(prefix="jenkins-deploy-") as directory:
            directory = Path(directory)
            def write(name, content):
                path = directory / name
                path.write_text(content, newline="\n")
                path.chmod(0o755)
            write("ssh", '''#!/bin/sh
for argument; do remote=$argument; done
exec sh -c "$remote"
''')
            write("scp", '#!/bin/sh\nexit 0\n')
            write("python3", '''#!/bin/sh
printf '%s\\n' "$*" >> "$FIXTURE/python-calls"
case "$2" in
  smoke-public) exit "${STUB_SMOKE_STATUS:-0}" ;;
  deploy) exit "${STUB_DEPLOY_STATUS:-0}" ;;
esac
''')
            stage = (ROOT / "Jenkinsfile").read_text().split("stage('CONNECT_SERVER')", 1)[1]
            block = re.search(r"sh\s+'''(.*?)'''", stage, re.S)[1]
            block = re.sub(r"\\(\\|n|\n)", lambda m: {"\\": "\\", "n": "\n", "\n": ""}[m[1]], block)
            write("case.sh", block)
            bootstrap = '''
if command -v cygpath >/dev/null 2>&1; then FIXTURE=$(cygpath -u "$1"); else FIXTURE=$1; fi
export FIXTURE
export PATH="$FIXTURE:/usr/bin:/bin"
for client in ssh scp python3; do
    test "$(command -v "$client")" = "$FIXTURE/$client" || exit 97
done
cd "$FIXTURE"
exec sh "$FIXTURE/case.sh"
'''
            env = os.environ.copy()
            env.update(IMAGE_TAG="22", DEPLOY_PATH="apps/SBA301", WORKSPACE=directory.as_posix(),
                       SSH_KEY="fixture-key", SSH_USER="fixture", SERVER_IP="fixture.invalid",
                       DEPLOY_MYSQL_IMAGE="false", NGINX_ONLY="false")
            env.update(settings)
            result = subprocess.run([BASH, "--noprofile", "--norc", "-c", bootstrap,
                                     "jenkins-fixture", directory.as_posix()],
                                    env=env, text=True, capture_output=True, timeout=15)
            calls = (directory / "python-calls").read_text()
            return result, calls

    def test_normal_release_never_invokes_database_deployment(self):
        result, calls = self.run_workflow()
        self.assertEqual(0, result.returncode, result.stderr)
        self.assertIn("release.py deploy --root", calls)
        self.assertNotIn("deploy-database", calls)
        self.assertNotIn("rollback", calls)

    def test_public_smoke_failure_rolls_back_only_nginx_when_requested(self):
        result, calls = self.run_workflow(STUB_SMOKE_STATUS="1", NGINX_ONLY="true")
        self.assertEqual(1, result.returncode, result.stderr)
        self.assertIn("rollback --root", calls)
        rollback = next(line for line in calls.splitlines() if "rollback" in line)
        self.assertIn("--expected-tag 22 --nginx-only", rollback)
        self.assertNotIn("deploy-database", calls)

    def test_remote_failure_does_not_trigger_second_external_rollback(self):
        result, calls = self.run_workflow(STUB_DEPLOY_STATUS="1")
        self.assertEqual(1, result.returncode, result.stderr)
        self.assertNotIn("smoke-public", calls)
        self.assertNotIn("rollback", calls)


if __name__ == "__main__":
    unittest.main()
