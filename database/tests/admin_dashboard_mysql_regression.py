"""Admin upgrade on a fresh private MySQL datadir. Never accepts an external DB URL.

python database/tests/admin_dashboard_mysql_regression.py [--all]
"""
import argparse
import json
import sys
from private_mysql import private_mysql, ROOT
from fresh_initialization import backend_checks, validate


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--all", action="store_true", help="Run the complete backend suite and startup check")
    args = parser.parse_args()
    with private_mysql(port=33087) as (sql, run, client, target, port, verify):
        for name in ("schema.sql", "data.sql"):
            verify()
            run(client, input=(ROOT / "database" / name).read_bytes())
        validate(sql, run, client)
        # Simulate the prior schema only inside this new owned datadir; replay the additive migration.
        verify()
        sql("USE chinese_online_learning; ALTER TABLE payments DROP INDEX idx_payments_status_paid, DROP COLUMN paid_at;")
        sql("USE chinese_online_learning; DROP INDEX idx_audit_target_action ON audit_logs;")
        migration = (ROOT / "database/migrations/20261022_admin_dashboard.sql").read_bytes()
        # Financial sentinels exist only in this private test instance and are removed by exact IDs.
        invoice_id = sql("USE chinese_online_learning; INSERT INTO invoices(user_id,original_amount,amount,status) SELECT id,12345,12345,'PAID' FROM users ORDER BY id LIMIT 1; SELECT LAST_INSERT_ID();")
        sql(f"USE chinese_online_learning; INSERT INTO payments(invoice_id,provider,transaction_id,amount,status) VALUES({int(invoice_id)},'PAYOS','migration-sentinel',12345,'SUCCESS');")
        before = sql("USE chinese_online_learning; SELECT COUNT(*),COALESCE(SUM(amount),0) FROM invoices; SELECT COUNT(*),COALESCE(SUM(amount),0) FROM payments;")
        run(client, input=migration)
        assert sql("USE chinese_online_learning; SELECT paid_at IS NULL FROM payments WHERE transaction_id='migration-sentinel';") == "1"
        sql("USE chinese_online_learning; UPDATE payments SET paid_at='2026-10-01 01:02:03.123456' WHERE transaction_id='migration-sentinel';")
        run(client, input=migration)
        assert sql("USE chinese_online_learning; SELECT COUNT(*),COALESCE(SUM(amount),0) FROM invoices; SELECT COUNT(*),COALESCE(SUM(amount),0) FROM payments;") == before
        assert sql("USE chinese_online_learning; SELECT paid_at FROM payments WHERE transaction_id='migration-sentinel';") == "2026-10-01 01:02:03.123456"
        assert sql("SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='chinese_online_learning' AND TABLE_NAME='payments' AND COLUMN_NAME='paid_at';") == "1"
        verify()
        sql(f"USE chinese_online_learning; DELETE FROM payments WHERE invoice_id={int(invoice_id)} AND transaction_id='migration-sentinel'; DELETE FROM invoices WHERE id={int(invoice_id)};")
        pattern = None if args.all else "AdminUpgradeMySqlTest,AnalyticsRangeTest,AnalyticsSecurityTest,Dashboard*Test,StudentManagement*Test,LearningAnalytics*Test,*Payment*Test,Feedback*Test,JpaSchemaContractTest"
        result = backend_checks(target, port, "", target / "data", pattern, reuse_forks=True)
        (target / "admin-upgrade-result.json").write_text(json.dumps(result, indent=2), encoding="utf-8")
        print(json.dumps(dict(artifacts=str(target), migration_replay="PASS", **result)), flush=True)


if __name__ == "__main__":
    main()
