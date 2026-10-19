"""Fresh schema plus additive migration/replay on an isolated MySQL datadir only."""
from private_mysql import private_mysql, ROOT
from fresh_initialization import validate


def main():
    with private_mysql() as (sql, run, client, target, port, verify):
        for name in ("schema.sql", "data.sql"):
            run(client, input=(ROOT / "database" / name).read_bytes())
        validate(sql, run, client)
        migration = (ROOT / "database/migrations/20261019_learning_analytics.sql").read_bytes()
        sql("USE chinese_online_learning; DROP TABLE user_learning_rules,user_feature_usage,learning_analytics_settings;")
        sql("USE chinese_online_learning; DROP INDEX idx_learning_activity_date ON learning_activity_daily;")
        run(client, input=migration)
        sql("USE chinese_online_learning; UPDATE learning_analytics_settings SET minute_thresholds='5,10,15,30' WHERE id=1;")
        run(client, input=migration)
        assert sql("SELECT minute_thresholds FROM chinese_online_learning.learning_analytics_settings WHERE id=1;") == "5,10,15,30"
        assert sql("SELECT COUNT(*) FROM chinese_online_learning.users;") == "1"
        print("PASS: fresh schema, upgrade and migration replay preserve settings and users; " + str(target))


if __name__ == "__main__":
    main()
