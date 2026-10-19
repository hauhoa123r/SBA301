-- Additive migration for existing MySQL 8 databases. Safe to run again.
USE chinese_online_learning;

CREATE TABLE IF NOT EXISTS feedback_publication_lock (
    id INT PRIMARY KEY,
    CONSTRAINT chk_feedback_lock_singleton CHECK (id = 1)
) ENGINE=InnoDB;
INSERT IGNORE INTO feedback_publication_lock (id) VALUES (1);

CREATE TABLE IF NOT EXISTS feedback_forms (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description VARCHAR(4000) NOT NULL DEFAULT '',
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    active_slot INT NULL,
    one_per_user BOOLEAN NOT NULL DEFAULT TRUE,
    starts_at DATETIME(6) NULL,
    ends_at DATETIME(6) NULL,
    published_at DATETIME(6) NULL,
    closed_at DATETIME(6) NULL,
    created_at DATETIME(6) NOT NULL,
    revision BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT uk_feedback_active_slot UNIQUE (active_slot),
    CONSTRAINT chk_feedback_status CHECK (status IN ('DRAFT','PUBLISHED','PAUSED','CLOSED')),
    CONSTRAINT chk_feedback_active CHECK (
        (status = 'PUBLISHED' AND active_slot IS NOT NULL AND active_slot = 1)
        OR (status <> 'PUBLISHED' AND active_slot IS NULL)
    ),
    CONSTRAINT chk_feedback_dates CHECK (starts_at IS NULL OR ends_at IS NULL OR starts_at < ends_at),
    INDEX idx_feedback_created (created_at, id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS feedback_questions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    form_id BIGINT NOT NULL,
    title VARCHAR(500) NOT NULL,
    description VARCHAR(2000) NOT NULL DEFAULT '',
    type VARCHAR(30) NOT NULL,
    required BOOLEAN NOT NULL DEFAULT FALSE,
    position INT NOT NULL,
    min_value DECIMAL(18,4) NULL,
    max_value DECIMAL(18,4) NULL,
    max_length INT NULL,
    min_selections INT NULL,
    max_selections INT NULL,
    CONSTRAINT fk_feedback_question_form FOREIGN KEY (form_id) REFERENCES feedback_forms(id),
    CONSTRAINT chk_feedback_question_type CHECK (type IN ('SHORT_TEXT','LONG_TEXT','NUMBER','SINGLE_CHOICE','MULTIPLE_CHOICE','DROPDOWN','LIKERT','RATING','YES_NO')),
    INDEX idx_feedback_question_order (form_id, position)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS feedback_options (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    question_id BIGINT NOT NULL,
    label VARCHAR(300) NOT NULL,
    position INT NOT NULL,
    CONSTRAINT fk_feedback_option_question FOREIGN KEY (question_id) REFERENCES feedback_questions(id),
    INDEX idx_feedback_option_order (question_id, position)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS feedback_visits (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    form_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    started_at DATETIME(6) NOT NULL,
    CONSTRAINT uk_feedback_visit UNIQUE (form_id, user_id),
    CONSTRAINT fk_feedback_visit_form FOREIGN KEY (form_id) REFERENCES feedback_forms(id),
    CONSTRAINT fk_feedback_visit_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS feedback_submissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    form_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    single_user_id BIGINT NULL,
    submitted_at DATETIME(6) NOT NULL,
    CONSTRAINT uk_feedback_single_submission UNIQUE (form_id, single_user_id),
    CONSTRAINT chk_feedback_single_user CHECK (single_user_id IS NULL OR single_user_id = user_id),
    CONSTRAINT fk_feedback_submission_form FOREIGN KEY (form_id) REFERENCES feedback_forms(id),
    CONSTRAINT fk_feedback_submission_user FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_feedback_submission_user (form_id, user_id),
    INDEX idx_feedback_submission_date (form_id, submitted_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS feedback_answers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    submission_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    text_value TEXT NULL,
    number_value DECIMAL(18,4) NULL,
    CONSTRAINT uk_feedback_answer_question UNIQUE (submission_id, question_id),
    CONSTRAINT fk_feedback_answer_submission FOREIGN KEY (submission_id) REFERENCES feedback_submissions(id),
    CONSTRAINT fk_feedback_answer_question FOREIGN KEY (question_id) REFERENCES feedback_questions(id),
    INDEX idx_feedback_answer_numeric (question_id, number_value)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS feedback_answer_options (
    answer_id BIGINT NOT NULL,
    option_id BIGINT NOT NULL,
    PRIMARY KEY (answer_id, option_id),
    CONSTRAINT fk_feedback_selected_answer FOREIGN KEY (answer_id) REFERENCES feedback_answers(id),
    CONSTRAINT fk_feedback_selected_option FOREIGN KEY (option_id) REFERENCES feedback_options(id),
    INDEX idx_feedback_selected_option (option_id, answer_id)
) ENGINE=InnoDB;
