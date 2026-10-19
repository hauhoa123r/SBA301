-- Additive migration: run on the existing database before rolling out the backend.
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
