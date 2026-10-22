"""Real MySQL 8 validation in a new private instance. Never accepts a database URL.

python database/tests/fresh_initialization.py [--docker] [--backend] [--compare-legacy]
Native mode needs MYSQL_BIN; Docker mode builds the real image and tests its entrypoint.
Artifacts remain in backend/target; no existing database or named volume is used.
"""
import argparse
import difflib
from contextlib import contextmanager
from pathlib import Path
import hashlib
import json
import os
import re
import socket
import subprocess
import time
import urllib.request
import uuid
import xml.etree.ElementTree as ET

from private_mysql import private_mysql, ROOT

DB = ROOT / "database"
LEGACY_DIR = ROOT / "deployment/legacy-sql"
LEGACY_CHAIN = ("chinese_online_learning.sql", "DataChinese.sql", "20261012_deploy_update.sql",
                "20261013_feedback.sql", "20261018_refresh_sessions.sql")


def normalized_ddl(value):
    value = re.sub(r" CHARACTER SET utf8mb4(?= COLLATE utf8mb4_)", "", value)
    return re.sub(r" AUTO_INCREMENT=\d+", "", value.replace("\r\n", "\n")).rstrip(";")


def expected_schema():
    return {name: normalized_ddl(ddl) for ddl, name in re.findall(
        r"(CREATE TABLE `([^`]+)` \(.*?\) ENGINE=.*?);", (DB / "schema.sql").read_text(encoding="utf-8"), re.S)}


def snapshot(sql):
    tables = sql("USE chinese_online_learning; SHOW TABLES;").splitlines()
    return {t: normalized_ddl(sql(f"USE chinese_online_learning; SHOW CREATE TABLE `{t}`;").split("\t", 1)[1]) for t in tables}


def content_snapshot(sql):
    """Compare all surviving learning payloads, excluding regenerated relational IDs/timestamps."""
    result = {}
    for table in ("lessons", "vocabularies", "sentence_patterns", "lesson_documents", "quizzes", "questions", "answers", "assignments"):
        columns = sql(f"SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='chinese_online_learning' AND TABLE_NAME='{table}' ORDER BY ORDINAL_POSITION;").splitlines()
        columns = [c for c in columns if c != "id" and not c.endswith("_id") and c not in ("created_at", "updated_at")]
        expression = ",".join("'"+c+"',`"+c+"`" for c in columns)
        result[table] = sorted(sql(f"SELECT JSON_OBJECT({expression}) FROM chinese_online_learning.`{table}`;").splitlines())
    return result


@contextmanager
def docker_mysql(port):
    with socket.socket() as probe:
        probe.bind(("127.0.0.1", port))
        port = probe.getsockname()[1]
    token = uuid.uuid4().hex
    container, image = "edujar-consolidated-" + token, "edujar-consolidated-test:" + token
    target = ROOT / "backend/target" / container
    target.mkdir(parents=True)
    password = uuid.uuid4().hex

    def run(command, **kwargs):
        result = subprocess.run([str(a) for a in command], capture_output=True, timeout=300, **kwargs)
        if result.returncode:
            raise RuntimeError(result.stderr.decode("utf-8", errors="replace"))
        return result

    client = ["docker", "exec", "-i", "--env", "MYSQL_PWD=" + password, container, "mysql", "--user=root",
              "--default-character-set=utf8mb4", "--batch", "--raw", "--skip-column-names"]

    def sql(statement):
        return run(client, input=statement.encode("utf-8")).stdout.decode("utf-8").strip()

    def verify():
        actual = run(["docker", "inspect", container, "--format", '{{index .Config.Labels "com.edujar.consolidation-test"}}']).stdout.decode().strip()
        assert actual == token, "Not the owned disposable container"

    created = False
    try:
        result = run(["docker", "build", "--tag", image, str(DB)])
        (target / "build.log").write_bytes(result.stdout + result.stderr)
        run(["docker", "create", "--name", container, "--label", "com.edujar.consolidation-test=" + token,
             "--tmpfs", "/var/lib/mysql:rw", "--publish", f"127.0.0.1:{port}:3306",
             "--env", "MYSQL_ROOT_PASSWORD=" + password, "--env", "MYSQL_DATABASE=chinese_online_learning",
             "--env", "MYSQL_USER=chinese_app", "--env", "MYSQL_PASSWORD=" + password, image])
        created = True
        run(["docker", "start", container])
        ready = False
        for _ in range(180):
            logs = run(["docker", "logs", container]).stdout.decode("utf-8", errors="replace")
            if "MySQL init process done. Ready for start up." in logs:
                try:
                    sql("SELECT 1;")
                    ready = True
                    break
                except RuntimeError:
                    pass
            time.sleep(1)
        assert ready, "Official MySQL entrypoint did not complete initialization"
        verify()
        files = run(["docker", "exec", container, "sh", "-c", "ls -1 /docker-entrypoint-initdb.d"]).stdout.decode().splitlines()
        assert files == ["01-schema.sql", "02-data.sql"], files
        run(["docker", "exec", container, "sh", "/usr/local/bin/verify-edujar-schema"])
        assert run(["docker", "inspect", container, "--format", "{{.RestartCount}}|{{.State.Running}}"] ).stdout.decode().strip() == "0|true"
        yield sql, run, client, target, port, verify, password
    finally:
        if created:
            verify()
            logs = subprocess.run(["docker", "logs", container], capture_output=True)
            (target / "mysql.log").write_bytes(logs.stdout + logs.stderr)
            run(["docker", "rm", "--force", container])
        # Only the image created above; no named volumes or existing images are removed.
        subprocess.run(["docker", "image", "rm", image], capture_output=True)


def validate(sql, run, client):
    def query(statement): return sql("USE chinese_online_learning;\n" + statement)
    expected = expected_schema()
    actual = snapshot(sql)
    if actual != expected:
        raise AssertionError("Final DDL differs:\n" + "\n".join(difflib.unified_diff(
            expected[next(t for t in expected if actual.get(t) != expected[t])].splitlines(),
            actual[next(t for t in expected if actual.get(t) != expected[t])].splitlines(), lineterm="")))
    assert len(actual) == 59
    guard = run(client + ["chinese_online_learning"], input=(DB / "tests/check-schema.sql").read_bytes()).stdout.decode().strip()
    assert not guard, guard
    counts = {t:int(query(f"SELECT COUNT(*) FROM `{t}`;")) for t in actual}
    assert counts["courses"] == 3
    catalog = query("""SELECT c.title,COUNT(l.id),SUM(l.published)
        FROM courses c JOIN chapters ch ON ch.course_id=c.id JOIN lessons l ON l.chapter_id=ch.id
        GROUP BY c.id ORDER BY c.title;""")
    assert set(catalog.splitlines()) == {
        "Tiếng Trung giao tiếp cho Nhân viên Sales (Cơ bản)\t6\t6",
        "Tiếng Trung tại quán cà phê\t2\t2",
        "Tiếng Trung hỏi đường và đi lại\t2\t2"}, catalog
    assert counts["chapters"] == 5 and counts["lessons"] == 10
    assert query("""SELECT COUNT(*) FROM quizzes q JOIN lessons l ON l.id=q.lesson_id
        JOIN chapters ch ON ch.id=l.chapter_id WHERE q.course_id IS NOT NULL AND q.course_id<>ch.course_id;""") == "0"
    assert query("SELECT code,price,duration_days FROM subscription_plans WHERE active=TRUE ORDER BY price;").splitlines() == [
        "FREE_TRIAL\t0.00\t3", "PREMIUM\t99000.00\t30"]
    assert query("SELECT COUNT(*) FROM users WHERE email='catalog-instructor@seed.invalid' AND status='LOCKED' AND password_hash='!';") == "1"
    assert counts["users"] == 1
    for table in ("invoices", "payments", "refunds", "course_enrollments", "user_subscriptions", "verification_tokens",
                  "oauth_accounts", "oauth_authorization_codes", "refresh_sessions", "lesson_progress", "learning_activity_daily",
                  "assignment_submissions", "quiz_attempts", "student_answers", "user_badges", "course_reviews", "lesson_qa",
                  "user_streaks", "user_lesson_progress", "user_chapter_progress", "user_quiz_attempts", "referrals",
                  "notifications", "reports", "audit_logs", "coupons", "feedback_forms", "feedback_submissions"):
        assert counts[table] == 0, "Unexpected transactional/personal seed: " + table
    assert counts["user_learning_rules"] == counts["user_feature_usage"] == 0
    assert query("SELECT id,minute_thresholds FROM learning_analytics_settings;") == "1\t5,10,15"
    for table, parent in (("chapters", "course_id"), ("lessons", "chapter_id")):
        assert not query(f"SELECT `{parent}` FROM `{table}` GROUP BY `{parent}` HAVING MIN(order_index)<>1 OR MAX(order_index)<>COUNT(*) OR COUNT(DISTINCT order_index)<>COUNT(*);")
    assert query("SELECT COUNT(*) FROM lessons WHERE video_url LIKE 'https://cdn.chineselearning.vn/%';") == "0"
    assert query("SELECT id,email_verification_enabled FROM authentication_settings;") == "1\t1"
    assert query("SELECT id FROM feedback_publication_lock;") == "1"
    fks = query("""SELECT TABLE_NAME,COLUMN_NAME,REFERENCED_TABLE_NAME,REFERENCED_COLUMN_NAME
        FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA=DATABASE() AND REFERENCED_TABLE_NAME IS NOT NULL;""")
    for row in fks.splitlines():
        t,c,p,pc = row.split("\t")
        assert query(f"SELECT COUNT(*) FROM `{t}` c LEFT JOIN `{p}` p ON c.`{c}`=p.`{pc}` WHERE c.`{c}` IS NOT NULL AND p.`{pc}` IS NULL;") == "0", row
    # Check complete data bytes, not only row counts, after a second seed import.
    before = query("CHECKSUM TABLE " + ",".join("`"+t+"`" for t in actual) + ";")
    run(client, input=(DB / "data.sql").read_bytes())
    after = query("CHECKSUM TABLE " + ",".join("`"+t+"`" for t in actual) + ";")
    assert before == after, "Seed replay changed data"
    def guard_output():
        return run(client + ["chinese_online_learning"], input=(DB / "tests/check-schema.sql").read_bytes()).stdout.decode()
    # Real negative fixtures ensure the read-only upgrade audit detects newer enums and indexes.
    query("ALTER TABLE payments MODIFY status ENUM('CREATED','SUCCESS','FAILED') NOT NULL;")
    try:
        defects = guard_output()
        assert "payments.status missing CANCELLED" in defects and "payments.status missing EXPIRED" in defects, defects
    finally:
        query("ALTER TABLE payments MODIFY status ENUM('CREATED','SUCCESS','FAILED','CANCELLED','EXPIRED') NOT NULL;")
    query("DROP INDEX idx_dashboard_users_created ON users;")
    try:
        assert "index mismatch: users.idx_dashboard_users_created" in guard_output()
    finally:
        query("CREATE INDEX idx_dashboard_users_created ON users(created_at);")
    assert not guard_output().strip()
    index_count = int(query("SELECT COUNT(*) FROM (SELECT DISTINCT TABLE_NAME,INDEX_NAME FROM information_schema.STATISTICS WHERE TABLE_SCHEMA=DATABASE()) x;"))
    unique_count = int(query("SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS WHERE CONSTRAINT_SCHEMA=DATABASE() AND CONSTRAINT_TYPE='UNIQUE';"))
    return dict(mysql=sql("SELECT VERSION();"), tables=len(actual), indexes_including_primary=index_count,
                foreign_keys=len(fks.splitlines()), unique_constraints=unique_count, seed_counts=counts,
                schema_sha256=hashlib.sha256((DB / "schema.sql").read_bytes()).hexdigest(),
                data_sha256=hashlib.sha256((DB / "data.sql").read_bytes()).hexdigest(), seed_replay="PASS")


def backend_checks(target, port, password, data_dir, tests_pattern=None, reuse_forks=False):
    env = os.environ.copy()
    java_home = os.environ.get("JAVA_HOME", "C:/Program Files/Java/jdk-17" if os.name == "nt" else "")
    if java_home:
        env["JAVA_HOME"] = java_home
        env["PATH"] = java_home + ("/bin;" if os.name == "nt" else "/bin:") + env["PATH"]
    env.update(RUN_FRESH_SCHEMA_TESTS="true", RUN_MYSQL_INTEGRATION_TESTS="true", FRESH_SCHEMA_USER="root",
               FRESH_SCHEMA_PASSWORD=password, FRESH_SCHEMA_JDBC_URL=f"jdbc:mysql://127.0.0.1:{port}/chinese_online_learning?serverTimezone=UTC",
               DB_URL=f"jdbc:mysql://127.0.0.1:{port}/chinese_online_learning?serverTimezone=UTC", DB_USERNAME="root", DB_PASSWORD=password,
               POST_AUTH_MYSQL_DATADIR=str(data_dir), JWT_SECRET="AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
               FRONTEND_VERIFY_EMAIL_URL="http://localhost:5173/verify-email", FRONTEND_PAYMENT_RESULT_URL="http://localhost:5173/payment/result",
               OAUTH2_FRONTEND_REDIRECT_URI="http://localhost:5173/oauth/callback", CORS_ALLOWED_ORIGINS="http://localhost:5173",
               GOOGLE_CLIENT_ID="isolated-test", GOOGLE_CLIENT_SECRET="isolated-test",
               MAIL_PROVIDER="smtp", MAIL_FROM_EMAIL="isolated@seed.invalid", SMTP_HOST="127.0.0.1", SMTP_PORT="9",
               SMTP_AUTH="false", SMTP_STARTTLS_ENABLE="false", SMTP_USERNAME="", SMTP_PASSWORD="",
               MANAGEMENT_HEALTH_MAIL_ENABLED="false",
               # Webhook signature verification is local and needs a nonempty test key.
               # An empty env value overrides payos.checksum-key in the security-test profile.
               PAYOS_CLIENT_ID="", PAYOS_API_KEY="", PAYOS_CHECKSUM_KEY="security-test-checksum-key",
               PAYOS_CREATE_PAYMENT_URL="http://127.0.0.1:9/payment-requests", PAYOS_PAYMENT_REQUEST_URL="http://127.0.0.1:9/payment-requests")
    mvn = ["mvn.cmd" if os.name == "nt" else "mvn"]
    cache = os.environ.get("MAVEN_TEST_CACHE")
    if not cache and (ROOT / ".deployment-check/m2").is_dir():
        cache = str(ROOT / ".deployment-check/m2")
    if cache: mvn += ["-o", "-Dmaven.repo.local=" + cache]
    suffix = "consolidated-" + uuid.uuid4().hex
    # The native RefreshSession test explicitly verifies a Windows datadir. Run it in native mode only.
    tests = tests_pattern or ("*Test" if os.name == "nt" and isinstance(data_dir, Path) else "*Test,!RefreshSessionMySqlTest")
    with (target / "maven.log").open("wb") as log:
        result = subprocess.run(mvn + ["-Dsurefire.reportNameSuffix="+suffix, "-Dtest="+tests,
                                       "-DreuseForks="+str(reuse_forks).lower(), "test"], cwd=ROOT / "backend", env=env,
                                stdout=log, stderr=subprocess.STDOUT, timeout=1200)
    reports = [ET.parse(p).getroot() for p in (ROOT / "backend/target/surefire-reports").glob("TEST-*-"+suffix+".xml")]
    summary = {key:sum(int(r.get(key,0)) for r in reports) for key in ("tests","failures","errors","skipped")}
    (target / "maven-summary.json").write_text(json.dumps(summary,indent=2),encoding="utf-8")
    check_maven_result(result.returncode, reports, summary, target / "maven.log")
    with (target / "package.log").open("wb") as log:
        result = subprocess.run(mvn + ["-DskipTests", "package"], cwd=ROOT / "backend", env=env,
                                stdout=log, stderr=subprocess.STDOUT, timeout=300)
    assert result.returncode == 0, str(target / "package.log")
    jar = next(p for p in (ROOT / "backend/target").glob("*.jar") if not p.name.endswith(".original"))
    with socket.socket() as probe:
        probe.bind(("127.0.0.1",0)); http_port = probe.getsockname()[1]
    env.update(SERVER_PORT=str(http_port), SPRING_PROFILES_ACTIVE="local", SPRING_JPA_HIBERNATE_DDL_AUTO="validate")
    with (target / "spring-boot.log").open("wb") as log:
        process = subprocess.Popen([str(Path(java_home)/"bin/java") if java_home else "java", "-jar", str(jar)],
                                   env=env,cwd=target,stdout=log,stderr=subprocess.STDOUT,
                                   creationflags=subprocess.CREATE_NO_WINDOW if os.name=="nt" else 0)
        try:
            healthy = False
            for _ in range(120):
                if process.poll() is not None: break
                try:
                    with urllib.request.urlopen(f"http://127.0.0.1:{http_port}/actuator/health",timeout=2) as response:
                        healthy = json.load(response).get("status") == "UP"
                    if healthy: break
                except (OSError, ValueError): pass
                time.sleep(1)
            assert healthy, str(target / "spring-boot.log")
        finally:
            process.terminate(); process.wait(timeout=30)
    return dict(tests=summary, spring_boot="PASS: Hibernate validate and HTTP health UP")


def check_maven_result(returncode, reports, summary, log_path):
    if reports and returncode == 0 and summary["failures"] == summary["errors"] == 0:
        return
    print(f"Fresh MySQL backend tests FAILED: Maven exit={returncode}, summary={summary}", flush=True)
    for report in reports:
        for case in report.findall("testcase"):
            for failure in list(case.findall("failure")) + list(case.findall("error")):
                print(f"FAILED {case.get('classname', report.get('name', ''))}.{case.get('name', '')}: "
                      f"{failure.get('message', '')}", flush=True)
                if failure.text:
                    print(failure.text[:6000], flush=True)
    print(f"Last 100 lines of {log_path}:", flush=True)
    print("\n".join(log_path.read_text(encoding="utf-8", errors="replace").splitlines()[-100:]), flush=True)
    raise RuntimeError(f"Fresh MySQL backend tests failed; see {log_path}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--docker",action="store_true")
    parser.add_argument("--backend",action="store_true")
    parser.add_argument("--compare-legacy",action="store_true")
    parser.add_argument("--backend-tests",help="Optional Maven test pattern for a focused backend regression run")
    args = parser.parse_args()
    assert not (args.docker and args.compare_legacy), "Legacy comparison uses a separate native instance"
    context = docker_mysql(33087 if args.backend else 0) if args.docker else private_mysql(port=33087 if args.backend else 0)
    with context as values:
        sql,run,client,target,port,verify = values[:6]
        reference = None
        if args.compare_legacy:
            for name in LEGACY_CHAIN:
                verify(); run(client,input=(LEGACY_DIR/name).read_bytes())
            verify(); run(client,input=(DB/"migrations/20261019_learning_analytics.sql").read_bytes())
            verify(); run(client,input=(DB/"migrations/20261022_admin_dashboard.sql").read_bytes())
            reference = snapshot(sql)
            reference_content = content_snapshot(sql)
            verify()
            sql("DROP DATABASE chinese_online_learning;")  # Only the guarded private instance created above.
        if not args.docker:
            for name in ("schema.sql","data.sql"):
                verify(); run(client,input=(DB/name).read_bytes())
        result = validate(sql,run,client)
        if reference is not None:
            assert snapshot(sql) == reference, "Historical chain differs from consolidated schema"
            assert content_snapshot(sql) == reference_content, "Surviving learning content was lost or changed"
            result["legacy_schema_comparison"] = "PASS: every SHOW CREATE TABLE, including keys/checks/defaults, matches"
            result["legacy_content_comparison"] = "PASS: all surviving lessons, vocabulary, patterns, quizzes, questions and answers match"
        if args.backend:
            verify()
            result.update(backend_checks(target,port,values[6] if args.docker else "", "/var/lib/mysql" if args.docker else target/"data",args.backend_tests))
        result["docker_entrypoint"] = "PASS" if args.docker else "NOT RUN (native MySQL)"
        (target/"result.json").write_text(json.dumps(result,indent=2),encoding="utf-8")
        print(json.dumps(dict(artifacts=str(target),**result)),flush=True)


if __name__ == "__main__": main()
