-- Run on the existing database before starting the updated backend.
CREATE TABLE IF NOT EXISTS authentication_settings (
    id INT PRIMARY KEY,
    email_verification_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT chk_auth_settings_singleton CHECK (id = 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Preserve a previously saved Admin choice when running the migration again.
INSERT INTO authentication_settings (id, email_verification_enabled)
VALUES (1, TRUE) ON DUPLICATE KEY UPDATE id = id;
