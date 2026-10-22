-- Additive MySQL 8 upgrade. Review on a restored copy before deployment.
-- Existing users.status already includes DELETED. No user or financial rows are deleted.
-- UTC application confirmation time; historical unknown timestamps deliberately remain NULL.
SET NAMES utf8mb4;
USE chinese_online_learning;
SET @admin_ddl = IF(EXISTS(SELECT 1 FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='payments' AND COLUMN_NAME='paid_at'),
  'SELECT 1','ALTER TABLE payments ADD COLUMN paid_at DATETIME(6) NULL');
PREPARE admin_stmt FROM @admin_ddl;
EXECUTE admin_stmt;
DEALLOCATE PREPARE admin_stmt;
SET @admin_ddl = IF(EXISTS(SELECT 1 FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='audit_logs' AND INDEX_NAME='idx_audit_target_action'),
  'SELECT 1','CREATE INDEX idx_audit_target_action ON audit_logs(endpoint,action)');
PREPARE admin_stmt FROM @admin_ddl;
EXECUTE admin_stmt;
DEALLOCATE PREPARE admin_stmt;
SET @admin_ddl = IF(EXISTS(SELECT 1 FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='payments' AND INDEX_NAME='idx_payments_status_paid'),
  'SELECT 1','CREATE INDEX idx_payments_status_paid ON payments(status,paid_at)');
PREPARE admin_stmt FROM @admin_ddl;
EXECUTE admin_stmt;
DEALLOCATE PREPARE admin_stmt;
