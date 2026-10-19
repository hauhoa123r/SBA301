-- Fresh database initialization only; never use this file to upgrade an existing database.
-- Derived from the complete historical chain on MySQL 8; all keys are defined inline.
SET NAMES utf8mb4;
CREATE DATABASE IF NOT EXISTS chinese_online_learning CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE chinese_online_learning;

CREATE TABLE `audit_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint DEFAULT NULL,
  `action` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `method` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SYSTEM',
  `endpoint` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `before_data` json DEFAULT NULL,
  `after_data` json DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `user_agent` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_audit_logs_search` (`action`,`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `authentication_settings` (
  `id` int NOT NULL,
  `email_verification_enabled` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  CONSTRAINT `chk_auth_settings_singleton` CHECK ((`id` = 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `badges` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `icon_url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `requirement_type` enum('LESSON_COMPLETED','QUIZ_PASSED','STREAK_DAYS','HSK_PASSED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `requirement_value` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `categories` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `parent_id` bigint DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_index` int DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `fk_categories_parent` (`parent_id`),
  KEY `idx_categories_slug` (`slug`),
  CONSTRAINT `fk_categories_parent` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `feedback_forms` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(4000) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DRAFT',
  `active_slot` int DEFAULT NULL,
  `one_per_user` tinyint(1) NOT NULL DEFAULT '1',
  `starts_at` datetime(6) DEFAULT NULL,
  `ends_at` datetime(6) DEFAULT NULL,
  `published_at` datetime(6) DEFAULT NULL,
  `closed_at` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `revision` bigint NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_feedback_active_slot` (`active_slot`),
  KEY `idx_feedback_created` (`created_at`,`id`),
  CONSTRAINT `chk_feedback_active` CHECK ((((`status` = _utf8mb4'PUBLISHED') and (`active_slot` is not null) and (`active_slot` = 1)) or ((`status` <> _utf8mb4'PUBLISHED') and (`active_slot` is null)))),
  CONSTRAINT `chk_feedback_dates` CHECK (((`starts_at` is null) or (`ends_at` is null) or (`starts_at` < `ends_at`))),
  CONSTRAINT `chk_feedback_status` CHECK ((`status` in (_utf8mb4'DRAFT',_utf8mb4'PUBLISHED',_utf8mb4'PAUSED',_utf8mb4'CLOSED')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `feedback_publication_lock` (
  `id` int NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `chk_feedback_lock_singleton` CHECK ((`id` = 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `code` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_permissions_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `roles` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_roles_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `subscription_plans` (
  `code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(15,2) NOT NULL,
  `duration_days` int NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`code`),
  CONSTRAINT `chk_plan_duration` CHECK ((`duration_days` > 0)),
  CONSTRAINT `chk_plan_price` CHECK ((`price` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `tags` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `full_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `avatar_url` varchar(2048) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('ACTIVE','LOCKED','DELETED','INACTIVE','PENDING','SUSPENDED','BANNED','DISABLE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `total_learning_points` int DEFAULT '0',
  `referral_code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_email` (`email`),
  UNIQUE KEY `referral_code` (`referral_code`),
  KEY `idx_users_status` (`status`),
  KEY `idx_users_points` (`total_learning_points` DESC),
  KEY `idx_dashboard_users_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `coupons` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `discount_type` enum('PERCENTAGE','FIXED_AMOUNT') COLLATE utf8mb4_unicode_ci NOT NULL,
  `discount_value` decimal(12,2) NOT NULL,
  `max_uses` int DEFAULT NULL,
  `used_count` int DEFAULT '0',
  `valid_from` timestamp NULL DEFAULT NULL,
  `valid_until` timestamp NULL DEFAULT NULL,
  `created_by` bigint NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `fk_coupons_creator` (`created_by`),
  KEY `idx_coupons_code` (`code`),
  CONSTRAINT `fk_coupons_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `courses` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `teacher_id` bigint NOT NULL,
  `category_id` bigint DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `catalog_code` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `price` decimal(15,2) NOT NULL DEFAULT '0.00',
  `thumbnail_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('DRAFT','PENDING','PUBLISHED','HIDDEN') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DRAFT',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_course_catalog_code` (`catalog_code`),
  KEY `fk_courses_teacher` (`teacher_id`),
  KEY `fk_courses_category` (`category_id`),
  KEY `idx_courses_status_teacher` (`status`,`teacher_id`),
  CONSTRAINT `fk_courses_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_courses_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`),
  CONSTRAINT `chk_courses_price_nonnegative` CHECK ((`price` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `feedback_questions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `form_id` bigint NOT NULL,
  `title` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(2000) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `type` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `required` tinyint(1) NOT NULL DEFAULT '0',
  `position` int NOT NULL,
  `min_value` decimal(18,4) DEFAULT NULL,
  `max_value` decimal(18,4) DEFAULT NULL,
  `max_length` int DEFAULT NULL,
  `min_selections` int DEFAULT NULL,
  `max_selections` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_feedback_question_order` (`form_id`,`position`),
  CONSTRAINT `fk_feedback_question_form` FOREIGN KEY (`form_id`) REFERENCES `feedback_forms` (`id`),
  CONSTRAINT `chk_feedback_question_type` CHECK ((`type` in (_utf8mb4'SHORT_TEXT',_utf8mb4'LONG_TEXT',_utf8mb4'NUMBER',_utf8mb4'SINGLE_CHOICE',_utf8mb4'MULTIPLE_CHOICE',_utf8mb4'DROPDOWN',_utf8mb4'LIKERT',_utf8mb4'RATING',_utf8mb4'YES_NO')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `feedback_submissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `form_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `single_user_id` bigint DEFAULT NULL,
  `submitted_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_feedback_single_submission` (`form_id`,`single_user_id`),
  KEY `fk_feedback_submission_user` (`user_id`),
  KEY `idx_feedback_submission_user` (`form_id`,`user_id`),
  KEY `idx_feedback_submission_date` (`form_id`,`submitted_at`),
  CONSTRAINT `fk_feedback_submission_form` FOREIGN KEY (`form_id`) REFERENCES `feedback_forms` (`id`),
  CONSTRAINT `fk_feedback_submission_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `chk_feedback_single_user` CHECK (((`single_user_id` is null) or (`single_user_id` = `user_id`)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `feedback_visits` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `form_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `started_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_feedback_visit` (`form_id`,`user_id`),
  KEY `fk_feedback_visit_user` (`user_id`),
  CONSTRAINT `fk_feedback_visit_form` FOREIGN KEY (`form_id`) REFERENCES `feedback_forms` (`id`),
  CONSTRAINT `fk_feedback_visit_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `learning_activity_daily` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `activity_date` date NOT NULL,
  `watch_seconds` bigint NOT NULL DEFAULT '0',
  `activity_count` bigint NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_learning_activity_day` (`user_id`,`activity_date`),
  CONSTRAINT `fk_learning_activity_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `notifications` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_notifications_user_unread` (`user_id`,`is_read`),
  CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `oauth_accounts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `provider` enum('GOOGLE','FACEBOOK') COLLATE utf8mb4_unicode_ci NOT NULL,
  `provider_user_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `provider_email` varchar(320) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_oauth_provider_user` (`provider`,`provider_user_id`),
  KEY `idx_oauth_accounts_user` (`user_id`),
  CONSTRAINT `fk_oauth_accounts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `oauth_authorization_codes` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `code_hash` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint NOT NULL,
  `expires_at` timestamp(6) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_oauth_code_hash` (`code_hash`),
  KEY `fk_oauth_codes_user` (`user_id`),
  KEY `idx_oauth_codes_expiry` (`expires_at`),
  CONSTRAINT `fk_oauth_codes_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `referrals` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `referrer_id` bigint NOT NULL,
  `referred_user_id` bigint NOT NULL,
  `status` enum('REGISTERED','PURCHASED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'REGISTERED',
  `reward_granted` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_referred_user` (`referred_user_id`),
  KEY `fk_referrals_referrer` (`referrer_id`),
  CONSTRAINT `fk_referrals_referred` FOREIGN KEY (`referred_user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_referrals_referrer` FOREIGN KEY (`referrer_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `refresh_sessions` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint NOT NULL,
  `token_hash` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` datetime(6) NOT NULL,
  `rotated_at` datetime(6) DEFAULT NULL,
  `revoked` bit(1) NOT NULL DEFAULT b'0',
  PRIMARY KEY (`id`),
  KEY `idx_refresh_sessions_expiry` (`expires_at`),
  KEY `fk_refresh_sessions_user` (`user_id`),
  CONSTRAINT `fk_refresh_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `reports` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `reporter_id` bigint NOT NULL,
  `target_type` enum('COURSE','USER','COMMENT','REVIEW') COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_id` bigint NOT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('PENDING','INVESTIGATING','RESOLVED','DISMISSED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `resolved_by` bigint DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `resolved_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_reports_reporter` (`reporter_id`),
  KEY `fk_reports_resolver` (`resolved_by`),
  CONSTRAINT `fk_reports_reporter` FOREIGN KEY (`reporter_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_reports_resolver` FOREIGN KEY (`resolved_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `role_permissions` (
  `role_id` bigint NOT NULL,
  `permission_id` bigint NOT NULL,
  PRIMARY KEY (`role_id`,`permission_id`),
  KEY `fk_rp_permission` (`permission_id`),
  CONSTRAINT `fk_rp_permission` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rp_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `user_badges` (
  `user_id` bigint NOT NULL,
  `badge_id` bigint NOT NULL,
  `earned_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`,`badge_id`),
  KEY `fk_ub_badge` (`badge_id`),
  CONSTRAINT `fk_ub_badge` FOREIGN KEY (`badge_id`) REFERENCES `badges` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ub_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `user_roles` (
  `user_id` bigint NOT NULL,
  `role_id` bigint NOT NULL,
  PRIMARY KEY (`user_id`,`role_id`),
  KEY `fk_ur_role` (`role_id`),
  CONSTRAINT `fk_ur_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ur_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `user_streaks` (
  `user_id` bigint NOT NULL,
  `current_streak` int DEFAULT '0',
  `longest_streak` int DEFAULT '0',
  `last_activity_date` date DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `fk_streaks_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `user_subscriptions` (
  `user_id` bigint NOT NULL,
  `plan_code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `started_at` timestamp NOT NULL,
  `expires_at` timestamp NOT NULL,
  `trial_used` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`user_id`),
  KEY `fk_subscription_plan` (`plan_code`),
  CONSTRAINT `fk_subscription_plan` FOREIGN KEY (`plan_code`) REFERENCES `subscription_plans` (`code`),
  CONSTRAINT `fk_subscription_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chk_subscription_period` CHECK ((`expires_at` > `started_at`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `verification_tokens` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint NOT NULL,
  `expiry_date` timestamp NOT NULL,
  `is_used` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `fk_verification_tokens_user` (`user_id`),
  CONSTRAINT `fk_verification_tokens_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `certificates` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `course_id` bigint NOT NULL,
  `certificate_code` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `issued_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `pdf_url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `certificate_code` (`certificate_code`),
  UNIQUE KEY `uk_user_cert_course` (`user_id`,`course_id`),
  KEY `fk_certs_course` (`course_id`),
  CONSTRAINT `fk_certs_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_certs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `chapters` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `course_id` bigint NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_index` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_course_chapter_order` (`course_id`,`order_index`),
  CONSTRAINT `fk_chapters_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `course_enrollments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `course_id` bigint NOT NULL,
  `enrolled_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `purchased_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `legacy_access` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_course` (`user_id`,`course_id`),
  KEY `fk_enrollments_course` (`course_id`),
  KEY `idx_dashboard_enrollment_date` (`enrolled_at`,`course_id`),
  CONSTRAINT `fk_enrollments_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_enrollments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `course_reviews` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `course_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `rating` int NOT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_course_review` (`user_id`,`course_id`),
  KEY `fk_reviews_course` (`course_id`),
  CONSTRAINT `fk_reviews_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reviews_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `course_reviews_chk_1` CHECK (((`rating` >= 1) and (`rating` <= 5)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `course_tags` (
  `course_id` bigint NOT NULL,
  `tag_id` bigint NOT NULL,
  PRIMARY KEY (`course_id`,`tag_id`),
  KEY `fk_ct_tag` (`tag_id`),
  CONSTRAINT `fk_ct_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ct_tag` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `feedback_answers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `submission_id` bigint NOT NULL,
  `question_id` bigint NOT NULL,
  `text_value` text COLLATE utf8mb4_unicode_ci,
  `number_value` decimal(18,4) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_feedback_answer_question` (`submission_id`,`question_id`),
  KEY `idx_feedback_answer_numeric` (`question_id`,`number_value`),
  CONSTRAINT `fk_feedback_answer_question` FOREIGN KEY (`question_id`) REFERENCES `feedback_questions` (`id`),
  CONSTRAINT `fk_feedback_answer_submission` FOREIGN KEY (`submission_id`) REFERENCES `feedback_submissions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `feedback_options` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `question_id` bigint NOT NULL,
  `label` varchar(300) COLLATE utf8mb4_unicode_ci NOT NULL,
  `position` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_feedback_option_order` (`question_id`,`position`),
  CONSTRAINT `fk_feedback_option_question` FOREIGN KEY (`question_id`) REFERENCES `feedback_questions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `invoices` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `course_id` bigint DEFAULT NULL,
  `subscription_plan_code` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subscription_duration_days` int DEFAULT NULL,
  `coupon_id` bigint DEFAULT NULL,
  `original_amount` decimal(15,2) NOT NULL,
  `discount_amount` decimal(15,2) DEFAULT '0.00',
  `amount` decimal(15,2) NOT NULL,
  `status` enum('PENDING','PAID','FAILED','CANCELLED','REFUNDED','EXPIRED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_invoices_user` (`user_id`),
  KEY `fk_invoices_course` (`course_id`),
  KEY `fk_invoices_coupon` (`coupon_id`),
  KEY `idx_invoices_status_user` (`status`,`user_id`),
  KEY `idx_dashboard_invoices_month` (`status`,`updated_at`,`amount`),
  KEY `idx_dashboard_invoices_plan` (`status`,`subscription_plan_code`,`amount`),
  KEY `idx_dashboard_invoices_course` (`status`,`course_id`,`subscription_plan_code`,`amount`),
  CONSTRAINT `fk_invoices_coupon` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_invoices_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`),
  CONSTRAINT `fk_invoices_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `feedback_answer_options` (
  `answer_id` bigint NOT NULL,
  `option_id` bigint NOT NULL,
  PRIMARY KEY (`answer_id`,`option_id`),
  KEY `idx_feedback_selected_option` (`option_id`,`answer_id`),
  CONSTRAINT `fk_feedback_selected_answer` FOREIGN KEY (`answer_id`) REFERENCES `feedback_answers` (`id`),
  CONSTRAINT `fk_feedback_selected_option` FOREIGN KEY (`option_id`) REFERENCES `feedback_options` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `lessons` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `chapter_id` bigint NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `video_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content` text COLLATE utf8mb4_unicode_ci,
  `duration_seconds` int DEFAULT '0',
  `order_index` int NOT NULL,
  `published` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_chapter_lesson_order` (`chapter_id`,`order_index`),
  KEY `idx_lessons_chapter` (`chapter_id`),
  CONSTRAINT `fk_lessons_chapter` FOREIGN KEY (`chapter_id`) REFERENCES `chapters` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `payments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `invoice_id` bigint NOT NULL,
  `provider` enum('VNPAY','MOMO','PAYOS','ZALOPAY','STRIPE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `transaction_id` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `status` enum('CREATED','SUCCESS','FAILED','CANCELLED','EXPIRED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `raw_response` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_payments_transaction` (`provider`,`transaction_id`),
  KEY `fk_payments_invoice` (`invoice_id`),
  CONSTRAINT `fk_payments_invoice` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `user_chapter_progress` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `chapter_id` bigint NOT NULL,
  `is_completed` tinyint(1) NOT NULL DEFAULT '0',
  `completed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_chapter` (`user_id`,`chapter_id`),
  KEY `fk_ucp_chapter` (`chapter_id`),
  CONSTRAINT `fk_ucp_chapter` FOREIGN KEY (`chapter_id`) REFERENCES `chapters` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ucp_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `assignments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `lesson_id` bigint NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `attachment_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `deadline_days` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_assignments_lesson` (`lesson_id`),
  CONSTRAINT `fk_assignments_lesson` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `lesson_documents` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `lesson_id` bigint NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_docs_lesson` (`lesson_id`),
  CONSTRAINT `fk_docs_lesson` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `lesson_progress` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `lesson_id` bigint NOT NULL,
  `watch_seconds` int DEFAULT '0',
  `position_seconds` int NOT NULL DEFAULT '0',
  `is_completed` tinyint(1) DEFAULT '0',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_lesson` (`user_id`,`lesson_id`),
  KEY `fk_lp_lesson` (`lesson_id`),
  CONSTRAINT `fk_lp_lesson` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lp_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chk_lp_position_nonnegative` CHECK ((`position_seconds` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `lesson_qa` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `lesson_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `parent_id` bigint DEFAULT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_resolved` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_lesson_qa_user` (`user_id`),
  KEY `fk_lesson_qa_parent` (`parent_id`),
  KEY `idx_lesson_qa_thread` (`lesson_id`,`parent_id`),
  CONSTRAINT `fk_lesson_qa_lesson` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lesson_qa_parent` FOREIGN KEY (`parent_id`) REFERENCES `lesson_qa` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lesson_qa_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `quizzes` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `teacher_id` bigint NOT NULL,
  `course_id` bigint DEFAULT NULL,
  `lesson_id` bigint DEFAULT NULL,
  `chapter_id` bigint DEFAULT NULL,
  `time_limit_minutes` int NOT NULL DEFAULT '0',
  `pass_score` int NOT NULL DEFAULT '50',
  `order_index` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_quizzes_teacher` (`teacher_id`),
  KEY `fk_quizzes_course` (`course_id`),
  KEY `fk_quizzes_chapter` (`chapter_id`),
  KEY `idx_quizzes_lesson_chapter` (`lesson_id`,`chapter_id`),
  CONSTRAINT `fk_quizzes_chapter` FOREIGN KEY (`chapter_id`) REFERENCES `chapters` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_quizzes_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_quizzes_lesson` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_quizzes_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `refunds` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `payment_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('PENDING','APPROVED','REJECTED','PROCESSED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `processed_by` bigint DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `processed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_refunds_payment` (`payment_id`),
  KEY `fk_refunds_user` (`user_id`),
  KEY `fk_refunds_processor` (`processed_by`),
  CONSTRAINT `fk_refunds_payment` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_refunds_processor` FOREIGN KEY (`processed_by`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_refunds_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `user_lesson_progress` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `lesson_id` bigint NOT NULL,
  `current_time_seconds` int NOT NULL DEFAULT '0',
  `is_completed` tinyint(1) NOT NULL DEFAULT '0',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_lesson_progress` (`user_id`,`lesson_id`),
  KEY `fk_ulp_lesson` (`lesson_id`),
  CONSTRAINT `fk_ulp_lesson` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ulp_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `vocabularies` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `lesson_id` bigint NOT NULL,
  `hanzi` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pinyin` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `vietnamese_meaning` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `audio_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `order_index` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_vocabularies_lesson` (`lesson_id`),
  CONSTRAINT `fk_vocabularies_lesson` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `assignment_submissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `assignment_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `submission_text` text COLLATE utf8mb4_unicode_ci,
  `file_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('SUBMITTED','GRADED','NEEDS_REVISION') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SUBMITTED',
  `score` int DEFAULT NULL,
  `teacher_feedback` text COLLATE utf8mb4_unicode_ci,
  `submitted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `graded_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_assignment` (`user_id`,`assignment_id`),
  KEY `fk_as_assignment` (`assignment_id`),
  CONSTRAINT `fk_as_assignment` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_as_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `questions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `quiz_id` bigint NOT NULL,
  `question_type` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `audio_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `points` int NOT NULL DEFAULT '10',
  `order_index` int NOT NULL,
  `meta_data` json DEFAULT NULL,
  `explanation` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `fk_questions_quiz` (`quiz_id`),
  CONSTRAINT `fk_questions_quiz` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `quiz_attempts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `quiz_id` bigint NOT NULL,
  `score` int NOT NULL DEFAULT '0',
  `is_passed` tinyint(1) DEFAULT '0',
  `started_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `submitted_at` timestamp NULL DEFAULT NULL,
  `status` enum('DOING','SUBMITTED','CHEATING_SUSPECTED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DOING',
  PRIMARY KEY (`id`),
  KEY `fk_qa_quiz` (`quiz_id`),
  KEY `idx_quiz_attempts_user_quiz` (`user_id`,`quiz_id`,`status`),
  KEY `idx_learning_attempt_user_quiz` (`user_id`,`quiz_id`,`is_passed`,`id`),
  CONSTRAINT `fk_qa_quiz` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_qa_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `sentence_patterns` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `lesson_id` bigint NOT NULL,
  `vocabulary_id` bigint DEFAULT NULL,
  `chinese_text` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pinyin_text` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `vietnamese_meaning` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `audio_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `order_index` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_sentence_patterns_lesson` (`lesson_id`),
  KEY `fk_sentence_patterns_vocabulary` (`vocabulary_id`),
  CONSTRAINT `fk_sentence_patterns_lesson` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_sentence_patterns_vocabulary` FOREIGN KEY (`vocabulary_id`) REFERENCES `vocabularies` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `user_quiz_attempts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `quiz_id` bigint NOT NULL,
  `score` int NOT NULL,
  `is_passed` tinyint(1) NOT NULL DEFAULT '0',
  `attempt_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_uqa_user` (`user_id`),
  KEY `fk_uqa_quiz` (`quiz_id`),
  CONSTRAINT `fk_uqa_quiz` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_uqa_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `answers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `question_id` bigint NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_correct` tinyint(1) NOT NULL DEFAULT '0',
  `matching_pair` text COLLATE utf8mb4_unicode_ci,
  `order_index` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `fk_answers_question` (`question_id`),
  CONSTRAINT `fk_answers_question` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `student_answers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `attempt_id` bigint NOT NULL,
  `question_id` bigint NOT NULL,
  `selected_answer_id` bigint DEFAULT NULL,
  `input_text` text COLLATE utf8mb4_unicode_ci,
  `is_correct` tinyint(1) DEFAULT '0',
  `student_response` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_sa_attempt` (`attempt_id`),
  KEY `fk_sa_question` (`question_id`),
  KEY `fk_sa_answer` (`selected_answer_id`),
  CONSTRAINT `fk_sa_answer` FOREIGN KEY (`selected_answer_id`) REFERENCES `answers` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_sa_attempt` FOREIGN KEY (`attempt_id`) REFERENCES `quiz_attempts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_sa_question` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
