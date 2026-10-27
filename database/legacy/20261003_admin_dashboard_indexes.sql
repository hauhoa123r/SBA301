-- Optional performance migration for an existing database. No data or role changes.
-- Re-runnable: indexes are created only if their names are absent.
USE chinese_online_learning;

SET @dashboard_ddl = IF(EXISTS(SELECT 1 FROM information_schema.statistics
  WHERE table_schema = DATABASE() AND table_name = 'users' AND index_name = 'idx_dashboard_users_created'),
  'SELECT 1', 'CREATE INDEX idx_dashboard_users_created ON users(created_at)');
PREPARE dashboard_stmt FROM @dashboard_ddl;
EXECUTE dashboard_stmt;
DEALLOCATE PREPARE dashboard_stmt;

SET @dashboard_ddl = IF(EXISTS(SELECT 1 FROM information_schema.statistics
  WHERE table_schema = DATABASE() AND table_name = 'invoices' AND index_name = 'idx_dashboard_invoices_month'),
  'SELECT 1', 'CREATE INDEX idx_dashboard_invoices_month ON invoices(status, updated_at, amount)');
PREPARE dashboard_stmt FROM @dashboard_ddl;
EXECUTE dashboard_stmt;
DEALLOCATE PREPARE dashboard_stmt;

SET @dashboard_ddl = IF(EXISTS(SELECT 1 FROM information_schema.statistics
  WHERE table_schema = DATABASE() AND table_name = 'invoices' AND index_name = 'idx_dashboard_invoices_plan'),
  'SELECT 1', 'CREATE INDEX idx_dashboard_invoices_plan ON invoices(status, subscription_plan_code, amount)');
PREPARE dashboard_stmt FROM @dashboard_ddl;
EXECUTE dashboard_stmt;
DEALLOCATE PREPARE dashboard_stmt;

SET @dashboard_ddl = IF(EXISTS(SELECT 1 FROM information_schema.statistics
  WHERE table_schema = DATABASE() AND table_name = 'invoices' AND index_name = 'idx_dashboard_invoices_course'),
  'SELECT 1', 'CREATE INDEX idx_dashboard_invoices_course ON invoices(status, course_id, subscription_plan_code, amount)');
PREPARE dashboard_stmt FROM @dashboard_ddl;
EXECUTE dashboard_stmt;
DEALLOCATE PREPARE dashboard_stmt;

SET @dashboard_ddl = IF(EXISTS(SELECT 1 FROM information_schema.statistics
  WHERE table_schema = DATABASE() AND table_name = 'course_enrollments' AND index_name = 'idx_dashboard_enrollment_date'),
  'SELECT 1', 'CREATE INDEX idx_dashboard_enrollment_date ON course_enrollments(enrolled_at, course_id)');
PREPARE dashboard_stmt FROM @dashboard_ddl;
EXECUTE dashboard_stmt;
DEALLOCATE PREPARE dashboard_stmt;
