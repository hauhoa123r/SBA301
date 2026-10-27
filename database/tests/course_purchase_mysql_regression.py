"""Run migrations twice on a NEW private MySQL 8 datadir; never connects to an existing DB.

Usage: python database/tests/course_purchase_mysql_regression.py
MYSQL_BIN may point to an installed MySQL 8 bin directory (Windows).
Artifacts and the stopped private datadir remain in backend/target for inspection.
"""
from pathlib import Path
import json
import os
import socket
import subprocess
import time
import uuid

ROOT = Path(__file__).resolve().parents[2]
MYSQL = Path(os.environ.get("MYSQL_BIN", "C:/Program Files/MySQL/MySQL Server 8.0/bin"))


def main():
    target = ROOT / "backend/target" / ("course-purchase-mysql-" + uuid.uuid4().hex)
    data = target / "data"
    data.mkdir(parents=True)
    assert data.resolve().is_relative_to((ROOT / "backend/target").resolve())
    with socket.socket() as probe:
        probe.bind(("127.0.0.1", 0))
        port = probe.getsockname()[1]
    env = os.environ.copy()
    env["MYSQL_PWD"] = ""
    args = [MYSQL / "mysqld.exe", "--no-defaults", "--datadir=" + data.as_posix(),
            "--port=" + str(port), "--bind-address=127.0.0.1", "--mysqlx=OFF", "--skip-log-bin",
            "--default-time-zone=+00:00", "--console"]
    client = [MYSQL / "mysql.exe", "--no-defaults", "--protocol=TCP", "--host=127.0.0.1",
              "--port=" + str(port), "--user=root", "--default-character-set=utf8mb4",
              "--batch", "--raw", "--skip-column-names"]

    def run(cmd, **kwargs):
        result = subprocess.run([str(a) for a in cmd], env=env, capture_output=True, timeout=120, **kwargs)
        if result.returncode:
            raise RuntimeError(result.stderr.decode("utf-8", errors="replace"))
        return result

    def sql(text):
        return run(client, input=text.encode("utf-8")).stdout.decode("utf-8").strip()

    run(args + ["--initialize-insecure"])
    log = (target / "mysql.log").open("wb")
    server = subprocess.Popen([str(a) for a in args], env=env, stdout=log, stderr=subprocess.STDOUT,
                              creationflags=subprocess.CREATE_NO_WINDOW)
    ready = False
    try:
        for _ in range(60):
            try:
                actual = sql("SELECT @@datadir")
                assert Path(actual).resolve() == data.resolve()
                ready = True
                break
            except RuntimeError:
                if server.poll() is not None:
                    raise RuntimeError("Private MySQL exited: " + str(target))
                time.sleep(0.5)
        assert ready, str(target)
        # Guard the actual server before executing any fresh-install SQL (which drops its own DB).
        assert Path(sql("SELECT @@datadir")).resolve() == data.resolve()
        for name in ("chinese_online_learning.sql", "DataChinese.sql", "20261012_deploy_update.sql",
                     "20261013_feedback.sql", "20261018_refresh_sessions.sql"):
            run(client, input=(ROOT / "database/legacy" / name).read_bytes())
        # Simulate an existing pre-migration database, with historical purchases and an active subscription.
        sql("""USE chinese_online_learning;
            INSERT INTO courses(teacher_id,title,price,status) SELECT MIN(id),'Historical purchase sentinel',499000,'PUBLISHED' FROM users;
            SET @historical_course=LAST_INSERT_ID(); SET @buyer=(SELECT MAX(id) FROM users);
            INSERT INTO invoices(user_id,course_id,original_amount,amount,status) VALUES(@buyer,@historical_course,499000,499000,'PAID');
            SET @invoice=LAST_INSERT_ID();
            INSERT INTO payments(invoice_id,provider,transaction_id,amount,status) VALUES(@invoice,'PAYOS','historical-sentinel',499000,'SUCCESS');
            INSERT INTO user_subscriptions(user_id,plan_code,started_at,expires_at,trial_used)
            VALUES(@buyer,'STANDARD',UTC_TIMESTAMP(),DATE_ADD(UTC_TIMESTAMP(),INTERVAL 10 DAY),TRUE)
            ON DUPLICATE KEY UPDATE plan_code='STANDARD', expires_at=DATE_ADD(UTC_TIMESTAMP(),INTERVAL 10 DAY);
        """)
        snapshot_sql = """USE chinese_online_learning;
            SELECT id,title,price,status FROM courses ORDER BY id;
            SELECT id,user_id,course_id,amount,status FROM invoices ORDER BY id;
            SELECT id,invoice_id,transaction_id,amount,status FROM payments ORDER BY id;
            SELECT user_id,plan_code,started_at,expires_at,trial_used FROM user_subscriptions ORDER BY user_id;
        """
        before = sql(snapshot_sql)
        migration = (ROOT / "database/legacy/20261018_course_purchases.sql").read_bytes()
        run(client, input=migration)
        first = sql("""USE chinese_online_learning;
            SELECT catalog_code,price,(SELECT COUNT(*) FROM lessons l JOIN chapters ch ON ch.id=l.chapter_id
                WHERE ch.course_id=c.id AND l.published=TRUE) FROM courses c WHERE catalog_code IS NOT NULL ORDER BY price;
            SELECT COUNT(*) FROM courses;
            SELECT COUNT(*) FROM course_enrollments;
        """)
        assert first.splitlines()[0].split("\t") == ["FREE", "0.00", "3"], first
        assert first.splitlines()[1].split("\t") == ["PREMIUM", "99000.00", "6"], first
        run(client, input=migration)
        after = sql("""USE chinese_online_learning;
            SELECT id,title,price,status FROM courses WHERE catalog_code IS NULL ORDER BY id;
            SELECT id,user_id,course_id,amount,status FROM invoices ORDER BY id;
            SELECT id,invoice_id,transaction_id,amount,status FROM payments ORDER BY id;
            SELECT user_id,plan_code,started_at,expires_at,trial_used FROM user_subscriptions ORDER BY user_id;
        """)
        assert before == after, "Historical data changed"
        second = sql("""USE chinese_online_learning;
            SELECT catalog_code,price,(SELECT COUNT(*) FROM lessons l JOIN chapters ch ON ch.id=l.chapter_id
                WHERE ch.course_id=c.id AND l.published=TRUE) FROM courses c WHERE catalog_code IS NOT NULL ORDER BY price;
            SELECT COUNT(*) FROM courses;
            SELECT COUNT(*) FROM course_enrollments;
        """)
        assert first == second, "Repeated migration duplicated data"
        assert sql("""USE chinese_online_learning; SELECT COUNT(*) FROM course_enrollments e JOIN courses c ON c.id=e.course_id
            WHERE c.title='Historical purchase sentinel' AND e.legacy_access=TRUE AND e.purchased_at IS NOT NULL;""") == "1"
        assert sql("USE chinese_online_learning; SELECT COUNT(*) FROM subscription_plans WHERE code IN ('FREE_TRIAL','STANDARD','PREMIUM') AND active=TRUE") == "0"
        violations = run(client + ["chinese_online_learning"], input=(ROOT / "database/tests/check-schema.sql").read_bytes()).stdout.decode().strip()
        assert not violations, violations
        # Verify enum persistence on MySQL, not only the in-memory test dialect.
        sql("""USE chinese_online_learning;
            UPDATE invoices SET status='EXPIRED' WHERE id=(SELECT invoice_id FROM payments WHERE transaction_id='historical-sentinel');
            UPDATE payments SET status='EXPIRED' WHERE transaction_id='historical-sentinel';
            UPDATE invoices SET status='CANCELLED' WHERE id=(SELECT invoice_id FROM payments WHERE transaction_id='historical-sentinel');
            UPDATE payments SET status='CANCELLED' WHERE transaction_id='historical-sentinel';
        """)
        result = {"migration_runs": 2, "catalog": "FREE: 0 VND / 3 lessons; PREMIUM: 99000 VND / 6 lessons",
                  "historical_data_preserved": True, "purchase_backfill": True, "schema_contract": "PASS",
                  "cancelled_expired_enums": "PASS", "artifacts": str(target)}
        (target / "result.json").write_text(json.dumps(result, indent=2), encoding="utf-8")
        print(json.dumps(result), flush=True)
    finally:
        if ready:
            assert Path(sql("SELECT @@datadir")).resolve() == data.resolve()
            run([MYSQL / "mysqladmin.exe", "--no-defaults", "--protocol=TCP", "--host=127.0.0.1",
                 "--port=" + str(port), "--user=root", "shutdown"])
        else:
            server.terminate()
        server.wait(timeout=30)
        log.close()


if __name__ == "__main__":
    main()
