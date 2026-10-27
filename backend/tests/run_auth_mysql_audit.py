"""Run auth/schema regressions against a NEW native MySQL datadir, never an existing DB.

Windows prerequisites: MySQL 8, Java 17, Maven and the existing offline Maven cache.
Artifacts and the stopped datadir remain under backend/target for review.
"""
import argparse
import json
import os
from pathlib import Path
import re
import socket
import subprocess
import time
import uuid
import xml.etree.ElementTree as ET


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--mysql-bin", default="C:/Program Files/MySQL/MySQL Server 8.0/bin")
    parser.add_argument("--java-home", default="C:/Program Files/Java/jdk-17")
    parser.add_argument("--maven-cache", default=str(Path.home() / ".m2" / "repository"))
    parser.add_argument("--with-browser", action="store_true", help="Also run isolated Chrome + H2 session lifecycle suite")
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[2]
    target = root / "backend/target" / ("post-auth-mysql-" + uuid.uuid4().hex)
    data = target / "data"
    data.mkdir(parents=True, exist_ok=False)
    assert data.resolve().is_relative_to((root / "backend/target").resolve())
    # Refuse to connect to any pre-existing process at the dedicated test port.
    with socket.socket() as probe:
        probe.bind(("127.0.0.1", 33087))
    mysql = Path(args.mysql_bin)
    env = os.environ.copy()
    env.update(JAVA_HOME=args.java_home, MYSQL_PWD="", RUN_FRESH_SCHEMA_TESTS="true",
               RUN_AUTH_BROWSER_TESTS=str(args.with_browser).lower(), POST_AUTH_MYSQL_DATADIR=str(data.resolve()),
               RUN_MYSQL_INTEGRATION_TESTS="true", FRESH_SCHEMA_USER="root", FRESH_SCHEMA_PASSWORD="",
               FRESH_SCHEMA_JDBC_URL="jdbc:mysql://127.0.0.1:33087/chinese_online_learning?serverTimezone=UTC",
               DB_URL="jdbc:mysql://127.0.0.1:33087/chinese_online_learning?serverTimezone=UTC",
               DB_USERNAME="root", DB_PASSWORD="", JWT_SECRET="AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
               FRONTEND_VERIFY_EMAIL_URL="http://localhost:5173/verify-email",
               FRONTEND_PAYMENT_RESULT_URL="http://localhost:5173/payment/result",
               OAUTH2_FRONTEND_REDIRECT_URI="http://localhost:5173/oauth/callback",
               CORS_ALLOWED_ORIGINS="http://localhost:5173", GOOGLE_CLIENT_ID="audit-test",
               GOOGLE_CLIENT_SECRET="audit-test")
    env["PATH"] = args.java_home + "/bin;" + env["PATH"]
    server_args = [str(mysql / "mysqld.exe"), "--no-defaults", "--datadir=" + data.as_posix(),
                   "--port=33087", "--bind-address=127.0.0.1", "--mysqlx=OFF", "--skip-log-bin",
                   "--default-time-zone=+00:00", "--console"]
    client = [str(mysql / "mysql.exe"), "--no-defaults", "--protocol=TCP", "--host=127.0.0.1",
              "--port=33087", "--user=root", "--default-character-set=utf8mb4", "--batch", "--raw", "--skip-column-names"]

    def run(command, **kwargs):
        return subprocess.run(command, env=env, capture_output=True, check=True, timeout=120, **kwargs)

    def query(sql):
        return run(client, input=sql + ";\n", text=True).stdout.strip()

    def verify():
        assert Path(query("SELECT @@datadir")).resolve() == data.resolve(), "Not the private datadir"

    run(server_args + ["--initialize-insecure"])
    ready = False
    with (target / "mysql.log").open("wb") as log:
        server = subprocess.Popen(server_args, env=env, stdout=log, stderr=subprocess.STDOUT,
                                  creationflags=subprocess.CREATE_NO_WINDOW)
        try:
            for _ in range(60):
                if server.poll() is not None:
                    raise RuntimeError("Private MySQL exited; see " + str(target / "mysql.log"))
                try:
                    verify()
                    ready = True
                    break
                except subprocess.CalledProcessError:
                    time.sleep(0.5)
            assert ready, "Private MySQL did not start"
            base, count = re.subn(r"CREATE TABLE IF NOT EXISTS refresh_sessions \(.*?\) ENGINE=InnoDB;", "",
                                 (root / "database/legacy/chinese_online_learning.sql").read_text(encoding="utf-8"), flags=re.S)
            assert count == 1
            run(client, input=base.encode("utf-8"))
            for name in ("DataChinese.sql", "20261012_deploy_update.sql", "20261013_feedback.sql"):
                run(client, input=(root / "database/legacy" / name).read_bytes())
            assert query("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='chinese_online_learning' AND table_name='refresh_sessions'") == "0"
            checksum = "USE chinese_online_learning; CHECKSUM TABLE users,courses,course_enrollments,lesson_progress;"
            before = query(checksum)
            migration = (root / "database/legacy/20261018_refresh_sessions.sql").read_bytes()
            run(client, input=migration)
            sentinel = str(uuid.uuid4())
            query("USE chinese_online_learning; INSERT INTO refresh_sessions(id,user_id,token_hash,expires_at) "
                  f"SELECT '{sentinel}',MIN(id),REPEAT('0',64),'2030-01-01' FROM users;")
            run(client, input=migration)
            assert query(checksum) == before, "Existing learning/user data changed"
            assert query(f"SELECT COUNT(*) FROM chinese_online_learning.refresh_sessions WHERE id='{sentinel}'") == "1"
            query(f"DELETE FROM chinese_online_learning.refresh_sessions WHERE id='{sentinel}'")
            guard = query("USE chinese_online_learning;\n" + (root / "database/tests/check-schema.sql").read_text(encoding="utf-8"))
            assert not guard, "Schema guard found defects: " + guard
            print("PASS: additive migration twice on pre-refactor schema; existing users/learning checksums and refresh row preserved", flush=True)
            print("Private MySQL:", query("SELECT VERSION(),@@transaction_isolation"), flush=True)
            with (target / "maven.log").open("w", encoding="utf-8") as stream:
                result = subprocess.run(["mvn.cmd", "-o", "-Dmaven.repo.local=" + args.maven_cache,
                                         "-Dsurefire.reportNameSuffix=post-auth-mysql",
                                         "-DreuseForks=false",
                                         "-Dlogging.level.org.springframework=WARN", "-Dlogging.level.org.hibernate=WARN", "test"],
                                        cwd=root / "backend", env=env, stdout=stream, stderr=subprocess.STDOUT, timeout=900)
            reports = [ET.parse(p).getroot() for p in (root / "backend/target/surefire-reports").glob("TEST-*-post-auth-mysql.xml")]
            summary = {key: sum(int(report.get(key, 0)) for report in reports) for key in ("tests", "failures", "errors", "skipped")}
            (target / "summary.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")
            print(json.dumps(summary), flush=True)
            print("Evidence:", target, flush=True)
            assert reports and result.returncode == 0 and summary["failures"] == summary["errors"] == 0
        finally:
            if ready:
                verify()
                run([str(mysql / "mysqladmin.exe"), "--no-defaults", "--protocol=TCP", "--host=127.0.0.1", "--port=33087", "--user=root", "shutdown"])
            else:
                server.terminate()
            server.wait(timeout=30)
            print("Private MySQL stopped; no existing database/volume touched", flush=True)


if __name__ == "__main__":
    main()
