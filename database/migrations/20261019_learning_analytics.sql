-- Additive upgrade for an existing database. Run before deploying the new backend.
-- Safe to rerun: settings and user data are preserved. MySQL 8 DDL auto-commits.
SET NAMES utf8mb4;
USE chinese_online_learning;
CREATE TABLE IF NOT EXISTS learning_analytics_settings (
  id int NOT NULL PRIMARY KEY,
  minute_thresholds varchar(100) NOT NULL DEFAULT '5,10,15',
  CONSTRAINT chk_analytics_singleton CHECK (id=1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
INSERT IGNORE INTO learning_analytics_settings(id,minute_thresholds) VALUES(1,'5,10,15');

SET @learning_index_ddl = IF(EXISTS(SELECT 1 FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='learning_activity_daily' AND INDEX_NAME='idx_learning_activity_date'),
  'SELECT 1', 'CREATE INDEX idx_learning_activity_date ON learning_activity_daily(activity_date,user_id)');
PREPARE learning_index_statement FROM @learning_index_ddl;
EXECUTE learning_index_statement;
DEALLOCATE PREPARE learning_index_statement;

CREATE TABLE IF NOT EXISTS user_learning_rules (
  user_id bigint NOT NULL PRIMARY KEY,
  course_id bigint NOT NULL,
  daily_minutes int NOT NULL DEFAULT 5,
  lessons_per_day int NOT NULL DEFAULT 1,
  enabled tinyint(1) NOT NULL DEFAULT 0,
  features varchar(150) NOT NULL DEFAULT '',
  last_run_date date DEFAULT NULL,
  updated_by bigint NOT NULL,
  updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_learning_rules_schedule(enabled,last_run_date),
  CONSTRAINT fk_learning_rule_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_learning_rule_course FOREIGN KEY(course_id) REFERENCES courses(id),
  CONSTRAINT fk_learning_rule_actor FOREIGN KEY(updated_by) REFERENCES users(id),
  CONSTRAINT chk_learning_rule_minutes CHECK(daily_minutes BETWEEN 1 AND 180),
  CONSTRAINT chk_learning_rule_lessons CHECK(lessons_per_day BETWEEN 0 AND 20)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_feature_usage (
  user_id bigint NOT NULL,
  activity_date date NOT NULL,
  feature varchar(30) NOT NULL,
  access_count bigint NOT NULL DEFAULT 0,
  PRIMARY KEY(user_id,activity_date,feature),
  KEY idx_feature_usage_date(activity_date,feature),
  CONSTRAINT fk_feature_usage_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT chk_feature_access_count CHECK(access_count>=0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
