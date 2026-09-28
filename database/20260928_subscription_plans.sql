-- Chuyển sang đăng ký toàn bộ thư viện. Giữ hóa đơn và quyền mua khóa học cũ.
-- Chạy một lần trước khi khởi động backend mới; có thể chạy lại an toàn.
USE chinese_online_learning;
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS subscription_plans (
    code VARCHAR(30) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(15, 2) NOT NULL,
    duration_days INT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT chk_plan_duration CHECK (duration_days > 0),
    CONSTRAINT chk_plan_price CHECK (price >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_subscriptions (
    user_id BIGINT PRIMARY KEY,
    plan_code VARCHAR(30) NOT NULL,
    started_at TIMESTAMP NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    trial_used BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_subscription_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_subscription_plan FOREIGN KEY (plan_code) REFERENCES subscription_plans(code),
    CONSTRAINT chk_subscription_period CHECK (expires_at > started_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO subscription_plans (code, name, price, duration_days, active) VALUES
('FREE_TRIAL', 'Free Trial', 0.00, 3, TRUE),
('STANDARD', 'Standard', 699000.00, 30, TRUE),
('PREMIUM', 'Premium', 899000.00, 30, TRUE)
ON DUPLICATE KEY UPDATE name=VALUES(name), price=VALUES(price), duration_days=VALUES(duration_days);

SET @subscription_ddl = IF(
    EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='course_enrollments' AND column_name='legacy_access'),
    'SELECT 1',
    'ALTER TABLE course_enrollments ADD COLUMN legacy_access BOOLEAN NOT NULL DEFAULT TRUE'
);
PREPARE subscription_stmt FROM @subscription_ddl;
EXECUTE subscription_stmt;
DEALLOCATE PREPARE subscription_stmt;
ALTER TABLE course_enrollments ALTER COLUMN legacy_access SET DEFAULT FALSE;

ALTER TABLE invoices MODIFY COLUMN course_id BIGINT NULL;
SET @subscription_ddl = IF(
    EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='invoices' AND column_name='subscription_plan_code'),
    'SELECT 1',
    'ALTER TABLE invoices ADD COLUMN subscription_plan_code VARCHAR(30) NULL'
);
PREPARE subscription_stmt FROM @subscription_ddl;
EXECUTE subscription_stmt;
DEALLOCATE PREPARE subscription_stmt;
SET @subscription_ddl = IF(
    EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='invoices' AND column_name='subscription_duration_days'),
    'SELECT 1',
    'ALTER TABLE invoices ADD COLUMN subscription_duration_days INT NULL'
);
PREPARE subscription_stmt FROM @subscription_ddl;
EXECUTE subscription_stmt;
DEALLOCATE PREPARE subscription_stmt;
