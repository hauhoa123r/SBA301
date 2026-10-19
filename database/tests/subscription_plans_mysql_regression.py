"""Verify the two-plan upgrade on a new private MySQL; never uses an existing database."""
import json
from private_mysql import private_mysql, ROOT
from fresh_initialization import LEGACY_CHAIN, LEGACY_DIR


def main():
    with private_mysql() as (sql, run, client, target, port, verify):
        for name in LEGACY_CHAIN:
            verify()
            run(client, input=(LEGACY_DIR / name).read_bytes())

        def query(statement):
            return sql("USE chinese_online_learning; " + statement)

        # Explicit historical snapshots and an active Standard grant must survive repricing.
        query("""SET @fixture_user=(SELECT MIN(id) FROM users);
            INSERT INTO user_subscriptions (user_id,plan_code,started_at,expires_at,trial_used)
            VALUES (@fixture_user,'STANDARD','2026-10-01 00:00:00','2026-11-01 00:00:00',TRUE)
            ON DUPLICATE KEY UPDATE plan_code='STANDARD';
            INSERT INTO invoices (user_id,original_amount,discount_amount,amount,status,
                subscription_plan_code,subscription_duration_days)
            VALUES (@fixture_user,699000,0,699000,'PENDING','STANDARD',30);""")
        tables = query("SHOW TABLES;").splitlines()
        preserved = [t for t in tables if t != "subscription_plans"]
        checksum = "CHECKSUM TABLE " + ",".join("`" + t + "`" for t in preserved) + ";"
        before = query(checksum)
        standard_before = query("SELECT code,name,price,duration_days FROM subscription_plans WHERE code='STANDARD';")
        script = LEGACY_DIR / "20261019_free_premium_plans.sql"
        for _ in range(2):
            verify()
            run(client, input=script.read_bytes())
            assert query(checksum) == before, "Upgrade changed courses, history or access"
            assert query("SELECT code,name,price,duration_days FROM subscription_plans WHERE active=TRUE ORDER BY price;").splitlines() == [
                "FREE_TRIAL\tFree\t0.00\t3", "PREMIUM\tPremium\t99000.00\t30"]
            assert query("SELECT active FROM subscription_plans WHERE code='STANDARD';") == "0"
            assert query("SELECT code,name,price,duration_days FROM subscription_plans WHERE code='STANDARD';") == standard_before
        result = dict(result="PASS", migration_replay="PASS", preserved_tables=len(preserved),
                      historical_standard_invoice="699000 / 30 days unchanged", artifacts=str(target))
        (target / "result.json").write_text(json.dumps(result, indent=2), encoding="utf-8")
        print(json.dumps(result))


if __name__ == "__main__":
    main()
