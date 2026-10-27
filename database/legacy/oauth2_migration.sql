-- Apply once to an existing database. The base schema files below also include these objects.
ALTER TABLE users ADD COLUMN avatar_url VARCHAR(2048) NULL AFTER full_name;

CREATE TABLE oauth_accounts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    provider ENUM('GOOGLE', 'FACEBOOK') NOT NULL,
    provider_user_id VARCHAR(255) NOT NULL,
    provider_email VARCHAR(320) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_oauth_accounts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_oauth_provider_user UNIQUE (provider, provider_user_id),
    INDEX idx_oauth_accounts_user (user_id)
);

CREATE TABLE oauth_authorization_codes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code_hash CHAR(64) NOT NULL,
    user_id BIGINT NOT NULL,
    expires_at TIMESTAMP(6) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_oauth_codes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_oauth_code_hash UNIQUE (code_hash),
    INDEX idx_oauth_codes_expiry (expires_at)
);
