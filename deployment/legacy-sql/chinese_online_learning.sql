-- Fresh initialization only. Never import this file into an existing application database.
DROP DATABASE IF EXISTS chinese_online_learning;
CREATE DATABASE chinese_online_learning CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE chinese_online_learning;

-- ==========================================
-- 1. TỪ ĐIỂN DỮ LIỆU ĐỘC LẬP (MASTER DATA)
-- ==========================================

CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    CONSTRAINT uk_roles_name UNIQUE (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE permissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(100) NOT NULL,
    name VARCHAR(150) NOT NULL,
    CONSTRAINT uk_permissions_code UNIQUE (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    parent_id BIGINT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    order_index INT DEFAULT 0,
    CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE tags (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 2. AUTHENTICATION & USER MANAGEMENT (UPDATE PHASE 2)
-- ==========================================

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(2048) NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    status ENUM('ACTIVE', 'LOCKED', 'DELETED', 'INACTIVE', 'PENDING', 'SUSPENDED', 'BANNED', 'DISABLE') NOT NULL DEFAULT 'ACTIVE',
    total_learning_points INT DEFAULT 0, -- NEW: Điểm tích lũy cho Leaderboard
    referral_code VARCHAR(50) UNIQUE NULL, -- NEW: Mã giới thiệu Affiliate
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uk_users_email UNIQUE (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE oauth_accounts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    provider ENUM('GOOGLE', 'FACEBOOK') NOT NULL,
    provider_user_id VARCHAR(255) NOT NULL,
    provider_email VARCHAR(320) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_oauth_accounts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_oauth_provider_user UNIQUE (provider, provider_user_id),
    INDEX idx_oauth_accounts_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE oauth_authorization_codes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code_hash VARCHAR(64) NOT NULL,
    user_id BIGINT NOT NULL,
    expires_at TIMESTAMP(6) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_oauth_codes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_oauth_code_hash UNIQUE (code_hash),
    INDEX idx_oauth_codes_expiry (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE verification_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    token_type VARCHAR(50) NOT NULL,
    user_id BIGINT NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    is_used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_verification_tokens_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE authentication_settings (
    id INT PRIMARY KEY,
    email_verification_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT chk_auth_settings_singleton CHECK (id = 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO authentication_settings (id, email_verification_enabled) VALUES (1, TRUE);
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_ur_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_ur_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE role_permissions (
    role_id BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_rp_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT fk_rp_permission FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 3. COURSE & LEARNING LOGIC
-- ==========================================

CREATE TABLE subscription_plans (
    code VARCHAR(30) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(15, 2) NOT NULL,
    duration_days INT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT chk_plan_duration CHECK (duration_days > 0),
    CONSTRAINT chk_plan_price CHECK (price >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE user_subscriptions (
    user_id BIGINT PRIMARY KEY,
    plan_code VARCHAR(30) NOT NULL,
    started_at TIMESTAMP NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    trial_used BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_subscription_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_subscription_plan FOREIGN KEY (plan_code) REFERENCES subscription_plans(code),
    CONSTRAINT chk_subscription_period CHECK (expires_at > started_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE courses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    teacher_id BIGINT NOT NULL,
    category_id BIGINT NULL,
    title VARCHAR(255) NOT NULL,
    catalog_code VARCHAR(30) NULL,
    description TEXT,
    price DECIMAL(15, 2) NOT NULL DEFAULT 0,
    thumbnail_url VARCHAR(500),
    status ENUM('DRAFT', 'PENDING', 'PUBLISHED', 'HIDDEN') NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_courses_teacher FOREIGN KEY (teacher_id) REFERENCES users(id),
    CONSTRAINT fk_courses_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    CONSTRAINT chk_courses_price_nonnegative CHECK (price >= 0),
    CONSTRAINT uk_course_catalog_code UNIQUE (catalog_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE course_tags (
    course_id BIGINT NOT NULL,
    tag_id BIGINT NOT NULL,
    PRIMARY KEY (course_id, tag_id),
    CONSTRAINT fk_ct_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    CONSTRAINT fk_ct_tag FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE chapters (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    order_index INT NOT NULL,
    CONSTRAINT uk_course_chapter_order UNIQUE (course_id, order_index),
    CONSTRAINT fk_chapters_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE lessons (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    chapter_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    video_url VARCHAR(500),
    content TEXT NULL,
    duration_seconds INT DEFAULT 0,
    order_index INT NOT NULL,
    published BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT uk_chapter_lesson_order UNIQUE (chapter_id, order_index),
    CONSTRAINT fk_lessons_chapter FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE vocabularies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    lesson_id BIGINT NOT NULL,
    hanzi VARCHAR(255) NOT NULL,
    pinyin VARCHAR(255) NOT NULL,
    vietnamese_meaning VARCHAR(255) NOT NULL,
    image_url VARCHAR(500) NULL,
    audio_url VARCHAR(500) NULL,
    order_index INT NOT NULL,
    CONSTRAINT fk_vocabularies_lesson FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE sentence_patterns (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    lesson_id BIGINT NOT NULL,
    vocabulary_id BIGINT NULL,
    chinese_text VARCHAR(500) NOT NULL,
    pinyin_text VARCHAR(500) NOT NULL,
    vietnamese_meaning VARCHAR(500) NOT NULL,
    audio_url VARCHAR(500) NULL,
    order_index INT NOT NULL,
    CONSTRAINT fk_sentence_patterns_lesson FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    CONSTRAINT fk_sentence_patterns_vocabulary FOREIGN KEY (vocabulary_id) REFERENCES vocabularies(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE lesson_documents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    lesson_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_docs_lesson FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 4. INTERACTIVE QUIZ, ASSIGNMENT & EXERCISE
-- ==========================================
-- (Đã bao gồm bảng quizzes, questions, answers, assignments)
-- (Phần này giữ nguyên cấu trúc cũ vì đã chuẩn)
CREATE TABLE quizzes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    teacher_id BIGINT NOT NULL,
    course_id BIGINT NULL,
    lesson_id BIGINT NULL,
    chapter_id BIGINT NULL,
    time_limit_minutes INT NOT NULL DEFAULT 0,
    pass_score INT NOT NULL DEFAULT 50,
    order_index INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_quizzes_teacher FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_quizzes_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    CONSTRAINT fk_quizzes_lesson FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE SET NULL,
    CONSTRAINT fk_quizzes_chapter FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE questions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    quiz_id BIGINT NOT NULL,
    question_type VARCHAR(30) NOT NULL,
    content TEXT NOT NULL,
    audio_url VARCHAR(500) NULL,
    points INT NOT NULL DEFAULT 10,
    order_index INT NOT NULL,
    meta_data JSON NULL,
    explanation TEXT NULL,
    CONSTRAINT fk_questions_quiz FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE answers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    question_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    matching_pair TEXT NULL,
    order_index INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_answers_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE assignments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    lesson_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    attachment_url VARCHAR(500) NULL,
    deadline_days INT NULL,
    CONSTRAINT fk_assignments_lesson FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 5. STUDENT PROGRESS & TRACKING
-- ==========================================

CREATE TABLE course_enrollments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    purchased_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    legacy_access BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT uk_user_course UNIQUE (user_id, course_id),
    CONSTRAINT fk_enrollments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_enrollments_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE lesson_progress (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    lesson_id BIGINT NOT NULL,
    watch_seconds INT DEFAULT 0,
    -- Resume position is distinct from cumulative watch_seconds; new playback starts at zero.
    position_seconds INT NOT NULL DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uk_user_lesson UNIQUE (user_id, lesson_id),
    CONSTRAINT fk_lp_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_lp_lesson FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    CONSTRAINT chk_lp_position_nonnegative CHECK (position_seconds >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE learning_activity_daily (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    activity_date DATE NOT NULL,
    watch_seconds BIGINT NOT NULL DEFAULT 0,
    activity_count BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT uk_learning_activity_day UNIQUE (user_id, activity_date),
    CONSTRAINT fk_learning_activity_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE quiz_attempts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    quiz_id BIGINT NOT NULL,
    score INT NOT NULL DEFAULT 0,
    is_passed BOOLEAN DEFAULT FALSE,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP NULL,
    status ENUM('DOING', 'SUBMITTED', 'CHEATING_SUSPECTED') NOT NULL DEFAULT 'DOING',
    CONSTRAINT fk_qa_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_qa_quiz FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE student_answers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    attempt_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    selected_answer_id BIGINT NULL,
    input_text TEXT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    student_response JSON NULL,
    CONSTRAINT fk_sa_attempt FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    CONSTRAINT fk_sa_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    CONSTRAINT fk_sa_answer FOREIGN KEY (selected_answer_id) REFERENCES answers(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE user_chapter_progress (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    chapter_id BIGINT NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMP NULL,
    CONSTRAINT uk_user_chapter UNIQUE (user_id, chapter_id),
    CONSTRAINT fk_ucp_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_ucp_chapter FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE user_lesson_progress (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    lesson_id BIGINT NOT NULL,
    current_time_seconds INT NOT NULL DEFAULT 0,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uk_user_lesson_progress UNIQUE (user_id, lesson_id),
    CONSTRAINT fk_ulp_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_ulp_lesson FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE user_quiz_attempts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    quiz_id BIGINT NOT NULL,
    score INT NOT NULL,
    is_passed BOOLEAN NOT NULL DEFAULT FALSE,
    attempt_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_uqa_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_uqa_quiz FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE assignment_submissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    assignment_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    submission_text TEXT NULL,
    file_url VARCHAR(500) NULL,
    status ENUM('SUBMITTED', 'GRADED', 'NEEDS_REVISION') NOT NULL DEFAULT 'SUBMITTED',
    score INT NULL,
    teacher_feedback TEXT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    graded_at TIMESTAMP NULL,
    CONSTRAINT uk_user_assignment UNIQUE (user_id, assignment_id),
    CONSTRAINT fk_as_assignment FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    CONSTRAINT fk_as_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE certificates (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    certificate_code VARCHAR(100) UNIQUE NOT NULL,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    pdf_url VARCHAR(500) NOT NULL,
    CONSTRAINT uk_user_cert_course UNIQUE (user_id, course_id),
    CONSTRAINT fk_certs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_certs_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 6. PAYMENT MANAGEMENT (UPDATE PHASE 2)
-- ==========================================

-- BẢNG MỚI: Quản lý Mã giảm giá
CREATE TABLE coupons (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type ENUM('PERCENTAGE', 'FIXED_AMOUNT') NOT NULL,
    discount_value DECIMAL(12, 2) NOT NULL,
    max_uses INT NULL, -- NULL = Không giới hạn lượt dùng
    used_count INT DEFAULT 0,
    valid_from TIMESTAMP NULL,
    valid_until TIMESTAMP NULL,
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_coupons_creator FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE invoices (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    course_id BIGINT NULL,
    subscription_plan_code VARCHAR(30) NULL,
    subscription_duration_days INT NULL,
    coupon_id BIGINT NULL, -- NEW: Liên kết mã giảm giá
    original_amount DECIMAL(15, 2) NOT NULL, -- Giá gốc tại thời điểm mua
    discount_amount DECIMAL(15, 2) DEFAULT 0, -- Số tiền được giảm
    amount DECIMAL(15, 2) NOT NULL, -- Giá cuối cùng phải thanh toán
    status ENUM('PENDING', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED', 'EXPIRED') NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_invoices_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_invoices_course FOREIGN KEY (course_id) REFERENCES courses(id),
    CONSTRAINT fk_invoices_coupon FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    invoice_id BIGINT NOT NULL,
    provider ENUM('VNPAY', 'MOMO', 'PAYOS', 'ZALOPAY', 'STRIPE') NOT NULL,
    transaction_id VARCHAR(150) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    status ENUM('CREATED', 'SUCCESS', 'FAILED', 'CANCELLED', 'EXPIRED') NOT NULL,
    raw_response JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_payments_transaction UNIQUE (provider, transaction_id),
    CONSTRAINT fk_payments_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE refunds (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    payment_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    reason TEXT NOT NULL,
    status ENUM('PENDING', 'APPROVED', 'REJECTED', 'PROCESSED') NOT NULL DEFAULT 'PENDING',
    processed_by BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    CONSTRAINT fk_refunds_payment FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
    CONSTRAINT fk_refunds_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_refunds_processor FOREIGN KEY (processed_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 7. AUDIT LOG, NOTIFICATION & REPORT
-- ==========================================

CREATE TABLE audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NULL,
    action VARCHAR(100) NOT NULL,
    method VARCHAR(10) NOT NULL DEFAULT 'SYSTEM',
    endpoint VARCHAR(255) NOT NULL DEFAULT '',
    before_data JSON NULL,
    after_data JSON NULL,
    ip_address VARCHAR(45) NOT NULL DEFAULT '',
    user_agent VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reporter_id BIGINT NOT NULL,
    target_type ENUM('COURSE', 'USER', 'COMMENT', 'REVIEW') NOT NULL,
    target_id BIGINT NOT NULL,
    reason TEXT NOT NULL,
    status ENUM('PENDING', 'INVESTIGATING', 'RESOLVED', 'DISMISSED') NOT NULL DEFAULT 'PENDING',
    resolved_by BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    CONSTRAINT fk_reports_reporter FOREIGN KEY (reporter_id) REFERENCES users(id),
    CONSTRAINT fk_reports_resolver FOREIGN KEY (resolved_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 8. GAMIFICATION & MOTIVATION (PHASE 2)
-- ==========================================

-- Bảng theo dõi chuỗi ngày học liên tiếp (Streak)
CREATE TABLE user_streaks (
    user_id BIGINT PRIMARY KEY,
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    last_activity_date DATE NULL,
    CONSTRAINT fk_streaks_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng định nghĩa các Huy hiệu (Badges)
CREATE TABLE badges (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255) NOT NULL,
    icon_url VARCHAR(500) NOT NULL,
    requirement_type ENUM('LESSON_COMPLETED', 'QUIZ_PASSED', 'STREAK_DAYS', 'HSK_PASSED') NOT NULL,
    requirement_value INT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng mapping Huy hiệu học viên đã đạt được
CREATE TABLE user_badges (
    user_id BIGINT NOT NULL,
    badge_id BIGINT NOT NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, badge_id),
    CONSTRAINT fk_ub_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_ub_badge FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 9. SOCIAL & COMMUNITY (PHASE 2)
-- ==========================================

-- Bảng Đánh giá & Review Khóa học
CREATE TABLE course_reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uk_user_course_review UNIQUE (user_id, course_id),
    CONSTRAINT fk_reviews_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng Hỏi đáp (Q&A) trong từng Video Bài học
CREATE TABLE lesson_qa (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    lesson_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    parent_id BIGINT NULL,
    content TEXT NOT NULL,
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_lesson_qa_lesson
        FOREIGN KEY (lesson_id)
        REFERENCES lessons(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_lesson_qa_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_lesson_qa_parent
        FOREIGN KEY (parent_id)
        REFERENCES lesson_qa(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 10. AFFILIATE & REFERRAL (PHASE 2)
-- ==========================================

-- Bảng ghi nhận giới thiệu (Mời bạn bè)
CREATE TABLE referrals (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    referrer_id BIGINT NOT NULL, -- Người gửi link
    referred_user_id BIGINT NOT NULL, -- Người đăng ký qua link
    status ENUM('REGISTERED', 'PURCHASED') NOT NULL DEFAULT 'REGISTERED',
    reward_granted BOOLEAN DEFAULT FALSE, -- Cờ đánh dấu đã trả hoa hồng/tặng tháng học chưa
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_referred_user UNIQUE (referred_user_id),
    CONSTRAINT fk_referrals_referrer FOREIGN KEY (referrer_id) REFERENCES users(id),
    CONSTRAINT fk_referrals_referred FOREIGN KEY (referred_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- ==========================================
-- 11. FEEDBACK (complete before seed/migration scripts run)
-- ==========================================

CREATE TABLE feedback_publication_lock (
    id INT PRIMARY KEY,
    CONSTRAINT chk_feedback_lock_singleton CHECK (id = 1)
) ENGINE=InnoDB;
INSERT IGNORE INTO feedback_publication_lock (id) VALUES (1);

CREATE TABLE feedback_forms (
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

CREATE TABLE feedback_questions (
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

CREATE TABLE feedback_options (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    question_id BIGINT NOT NULL,
    label VARCHAR(300) NOT NULL,
    position INT NOT NULL,
    CONSTRAINT fk_feedback_option_question FOREIGN KEY (question_id) REFERENCES feedback_questions(id),
    INDEX idx_feedback_option_order (question_id, position)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE feedback_visits (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    form_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    started_at DATETIME(6) NOT NULL,
    CONSTRAINT uk_feedback_visit UNIQUE (form_id, user_id),
    CONSTRAINT fk_feedback_visit_form FOREIGN KEY (form_id) REFERENCES feedback_forms(id),
    CONSTRAINT fk_feedback_visit_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE feedback_submissions (
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

CREATE TABLE feedback_answers (
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

CREATE TABLE feedback_answer_options (
    answer_id BIGINT NOT NULL,
    option_id BIGINT NOT NULL,
    PRIMARY KEY (answer_id, option_id),
    CONSTRAINT fk_feedback_selected_answer FOREIGN KEY (answer_id) REFERENCES feedback_answers(id),
    CONSTRAINT fk_feedback_selected_option FOREIGN KEY (option_id) REFERENCES feedback_options(id),
    INDEX idx_feedback_selected_option (option_id, answer_id)
) ENGINE=InnoDB;

-- ==========================================
-- 12. INDEXING TỐI ƯU TRUY VẤN
-- ==========================================

CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_points ON users(total_learning_points DESC); -- Phục vụ bảng xếp hạng (Leaderboard)
CREATE INDEX idx_courses_status_teacher ON courses(status, teacher_id);
CREATE INDEX idx_lessons_chapter ON lessons(chapter_id);
CREATE INDEX idx_quizzes_lesson_chapter ON quizzes(lesson_id, chapter_id);
CREATE INDEX idx_quiz_attempts_user_quiz ON quiz_attempts(user_id, quiz_id, status);
CREATE INDEX idx_invoices_status_user ON invoices(status, user_id);
CREATE INDEX idx_audit_logs_search ON audit_logs(action, created_at);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_assignments_lesson ON assignments(lesson_id);
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_lesson_qa_thread ON lesson_qa(lesson_id, parent_id);

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
