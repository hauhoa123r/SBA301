# Historical SQL archive

The current offering is Free (3-day trial) and Premium (99,000 VND / 30 days), with three separate Sales, cafe and directions courses. Existing databases use `20261019_free_premium_plans.sql` to update plan prices and disable Standard. It preserves courses, invoices, subscriptions and access. The earlier `20261019_restore_subscription_sales.sql` is superseded and must not be used for the current offering. `20261018_course_purchases.sql` is a retired per-course experiment; do not apply it. Refresh-session authentication and its migration are unchanged.

For databases still showing the two merged courses, `20261019_restore_three_courses.sql` restores the original cafe, directions and Sales catalog with its images, category and 2/2/6 lessons. Existing lesson/chapter IDs and financial history remain intact; retired synthetic courses become drafts, and paid merged-course ownership carries to all three restored courses. The script stops on ambiguous/missing chapters and is safe to replay with a fail-fast client. Validate a backup using `python database/tests/restore_three_courses_mysql_regression.py --backup PATH_TO_BACKUP.sql` first.

These sources are preserved for reviewed upgrades of existing installations and regression comparison. They are excluded from the MySQL build context and never run automatically.

New databases use only [schema.sql](../../database/schema.sql) then [data.sql](../../database/data.sql). See the [upgrade procedure](../../database/README-deploy-update.md). Do not import this archive as an upgrade chain: the original schema drops the database, the old seed contains demo credentials/personal-looking records, the deploy baseline deletes matching demo data and requires user ID 4, and the OAuth2 migration is not re-runnable.

No historical source was discarded because the actual production migration state is unknown. The archive retains the pre-existing local edits to the old schema and both untracked 20261018 migrations. Only the two new sanitized files are shipped for initialization.
