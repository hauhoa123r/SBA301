-- Upgrade the observed production schema: existing subscriptions, no refresh_sessions,
-- invoices/payments enums without EXPIRED. Keeps all courses and financial history.
-- Test on a restored backup before applying to production. MySQL DDL auto-commits.
SET NAMES utf8mb4;
USE chinese_online_learning;

CREATE TABLE IF NOT EXISTS refresh_sessions (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token_hash VARCHAR(64) NOT NULL,
    expires_at DATETIME(6) NOT NULL,
    rotated_at DATETIME(6) NULL,
    revoked BIT NOT NULL DEFAULT b'0',
    INDEX idx_refresh_sessions_expiry (expires_at),
    CONSTRAINT fk_refresh_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

ALTER TABLE invoices MODIFY COLUMN status
    ENUM('PENDING','PAID','FAILED','CANCELLED','REFUNDED','EXPIRED') NOT NULL DEFAULT 'PENDING';
ALTER TABLE payments MODIFY COLUMN status
    ENUM('CREATED','SUCCESS','FAILED','CANCELLED','EXPIRED') NOT NULL;

START TRANSACTION;
INSERT INTO subscription_plans (code,name,price,duration_days,active)
VALUES ('FREE_TRIAL','Free',0.00,3,TRUE)
ON DUPLICATE KEY UPDATE name='Free',price=0.00,duration_days=3,active=TRUE;
INSERT INTO subscription_plans (code,name,price,duration_days,active)
VALUES ('PREMIUM','Premium',99000.00,30,TRUE)
ON DUPLICATE KEY UPDATE name='Premium',price=99000.00,duration_days=30,active=TRUE;
UPDATE subscription_plans SET active=FALSE WHERE code='STANDARD';
COMMIT;
