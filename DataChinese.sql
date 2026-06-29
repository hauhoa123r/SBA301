USE chinese_online_learning;

-- Compatibility tables for databases created from an older schema snapshot.
-- These match the current JPA entities and the latest chinese_online_learning.sql.
-- Preflight: this seed expects the latest chinese_online_learning.sql schema.
-- If this query reports any missing table, run chinese_online_learning.sql first,
-- then run this seed file again.
SELECT 'Missing required table. Run chinese_online_learning.sql before this seed.' AS seed_error,
       required_tables.table_name
FROM (
    SELECT 'roles' AS table_name UNION ALL
    SELECT 'permissions' UNION ALL
    SELECT 'categories' UNION ALL
    SELECT 'tags' UNION ALL
    SELECT 'plans' UNION ALL
    SELECT 'users' UNION ALL
    SELECT 'verification_tokens' UNION ALL
    SELECT 'user_roles' UNION ALL
    SELECT 'role_permissions' UNION ALL
    SELECT 'courses' UNION ALL
    SELECT 'course_plan_access' UNION ALL
    SELECT 'course_tags' UNION ALL
    SELECT 'chapters' UNION ALL
    SELECT 'lessons' UNION ALL
    SELECT 'lesson_documents' UNION ALL
    SELECT 'quizzes' UNION ALL
    SELECT 'questions' UNION ALL
    SELECT 'answers' UNION ALL
    SELECT 'assignments' UNION ALL
    SELECT 'course_enrollments' UNION ALL
    SELECT 'lesson_progress' UNION ALL
    SELECT 'quiz_attempts' UNION ALL
    SELECT 'student_answers' UNION ALL
    SELECT 'user_chapter_progress' UNION ALL
    SELECT 'user_lesson_progress' UNION ALL
    SELECT 'assignment_submissions' UNION ALL
    SELECT 'certificates' UNION ALL
    SELECT 'coupons' UNION ALL
    SELECT 'subscriptions' UNION ALL
    SELECT 'invoices' UNION ALL
    SELECT 'payments' UNION ALL
    SELECT 'refunds' UNION ALL
    SELECT 'audit_logs' UNION ALL
    SELECT 'notifications' UNION ALL
    SELECT 'reports' UNION ALL
    SELECT 'user_streaks' UNION ALL
    SELECT 'badges' UNION ALL
    SELECT 'user_badges' UNION ALL
    SELECT 'course_reviews' UNION ALL
    SELECT 'lesson_qa' UNION ALL
    SELECT 'referrals'
) required_tables
LEFT JOIN information_schema.tables existing_tables
    ON existing_tables.table_schema = DATABASE()
   AND existing_tables.table_name = required_tables.table_name
WHERE existing_tables.table_name IS NULL;

SELECT 'Schema preflight finished. If the previous result is empty, required tables are present.' AS seed_info;

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE referrals;
TRUNCATE TABLE lesson_qa;
TRUNCATE TABLE course_reviews;
TRUNCATE TABLE user_badges;
TRUNCATE TABLE badges;
TRUNCATE TABLE user_streaks;
TRUNCATE TABLE reports;
TRUNCATE TABLE notifications;
TRUNCATE TABLE audit_logs;
TRUNCATE TABLE refunds;
TRUNCATE TABLE payments;
TRUNCATE TABLE invoices;
TRUNCATE TABLE subscriptions;
TRUNCATE TABLE coupons;
TRUNCATE TABLE certificates;
TRUNCATE TABLE assignment_submissions;
SET @user_quiz_attempts_exists = (
    SELECT COUNT(*)
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
      AND table_name = 'user_quiz_attempts'
);
SET @sql = IF(
    @user_quiz_attempts_exists > 0,
    'TRUNCATE TABLE user_quiz_attempts',
    'SELECT ''Skipping user_quiz_attempts truncate: table does not exist in this database.'' AS seed_warning'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
TRUNCATE TABLE user_lesson_progress;
TRUNCATE TABLE user_chapter_progress;
TRUNCATE TABLE student_answers;
TRUNCATE TABLE quiz_attempts;
TRUNCATE TABLE lesson_progress;
TRUNCATE TABLE course_enrollments;
TRUNCATE TABLE assignments;
TRUNCATE TABLE answers;
TRUNCATE TABLE questions;
TRUNCATE TABLE quizzes;
TRUNCATE TABLE lesson_documents;
TRUNCATE TABLE lessons;
TRUNCATE TABLE chapters;
TRUNCATE TABLE course_tags;
TRUNCATE TABLE course_plan_access;
TRUNCATE TABLE courses;
TRUNCATE TABLE verification_tokens;
TRUNCATE TABLE role_permissions;
TRUNCATE TABLE user_roles;
TRUNCATE TABLE users;
TRUNCATE TABLE plans;
TRUNCATE TABLE tags;
TRUNCATE TABLE categories;
TRUNCATE TABLE permissions;
TRUNCATE TABLE roles;

SET FOREIGN_KEY_CHECKS = 1;

-- =========================================================
-- Seed data for Chinese Online Learning
-- Default password for all users: 123456
-- BCrypt hash is shared by all sample accounts and matches the password above.
-- =========================================================

-- 1. roles
INSERT INTO roles (id, name, description) VALUES
(1, 'ADMIN', 'Quan tri vien toan he thong'),
(2, 'MODERATOR', 'Kiem duyet noi dung va xu ly bao cao'),
(3, 'TEACHER', 'Giang vien tao va quan ly khoa hoc'),
(4, 'STUDENT', 'Hoc vien tham gia khoa hoc');

-- 2. permissions
INSERT INTO permissions (id, code, name) VALUES
(1, 'USER_VIEW', 'Xem danh sach nguoi dung'),
(2, 'USER_CREATE', 'Tao tai khoan nguoi dung'),
(3, 'USER_UPDATE', 'Cap nhat thong tin nguoi dung'),
(4, 'USER_LOCK', 'Khoa tai khoan nguoi dung'),
(5, 'COURSE_VIEW', 'Xem khoa hoc'),
(6, 'COURSE_CREATE', 'Tao khoa hoc'),
(7, 'COURSE_UPDATE', 'Cap nhat khoa hoc'),
(8, 'COURSE_DELETE', 'Xoa khoa hoc'),
(9, 'LESSON_CREATE', 'Tao bai hoc'),
(10, 'QUIZ_CREATE', 'Tao bai kiem tra'),
(11, 'PAYMENT_VIEW', 'Xem giao dich thanh toan'),
(12, 'REPORT_VIEW', 'Xem bao cao vi pham'),
(13, 'DASHBOARD_VIEW', 'Xem dashboard quan tri'),
(14, 'AUDIT_LOG_VIEW', 'Xem nhat ky he thong');

-- 3. categories
INSERT INTO categories (id, parent_id, name, slug, order_index) VALUES
(1, NULL, 'Tieng Trung giao tiep', 'tieng-trung-giao-tiep', 1),
(2, NULL, 'Luyen thi HSK', 'luyen-thi-hsk', 2),
(3, NULL, 'Tieng Trung thuong mai', 'tieng-trung-thuong-mai', 3),
(4, NULL, 'Tieng Trung cho cong viec', 'tieng-trung-cho-cong-viec', 4),
(5, NULL, 'Ngu phap va tu vung', 'ngu-phap-va-tu-vung', 5),
(6, NULL, 'Phat am va nghe noi', 'phat-am-va-nghe-noi', 6);

-- 4. tags
INSERT INTO tags (id, name, slug) VALUES
(1, 'Pinyin', 'pinyin'),
(2, 'HSK 1', 'hsk-1'),
(3, 'HSK 2', 'hsk-2'),
(4, 'Giao tiep', 'giao-tiep'),
(5, 'Nghe hieu', 'nghe-hieu'),
(6, 'Thuong mai', 'thuong-mai'),
(7, 'Viet chu Han', 'viet-chu-han'),
(8, 'Tu vung cong xuong', 'tu-vung-cong-xuong');

-- 5. plans
INSERT INTO plans (id, name, duration_days, price, created_at) VALUES
(1, 'Basic 1 thang', 30, 199000.00, '2026-01-01 08:00:00'),
(2, 'Standard 3 thang', 90, 499000.00, '2026-01-01 08:00:00'),
(3, 'Premium 12 thang', 365, 1499000.00, '2026-01-01 08:00:00');

-- 6. users
INSERT INTO users (id, full_name, email, password_hash, status, total_learning_points, referral_code, created_at, updated_at) VALUES
(1, 'Nguyen Minh Quan', 'admin@chineselearning.vn', '$2a$10$gkT/LMKGX1C.qF7WtYYUPO1QLh.APSzK2TRRpKygBWbk6ku5IRvu6', 'ACTIVE', 0, 'REFADMIN001', '2026-01-02 08:00:00', '2026-06-20 08:00:00'),
(2, 'Tran Thu Ha', 'moderator.ha@chineselearning.vn', '$2a$10$gkT/LMKGX1C.qF7WtYYUPO1QLh.APSzK2TRRpKygBWbk6ku5IRvu6', 'ACTIVE', 120, 'REFMOD002', '2026-01-03 09:00:00', '2026-06-20 09:00:00'),
(3, 'Le Anh Tuan', 'moderator.tuan@chineselearning.vn', '$2a$10$gkT/LMKGX1C.qF7WtYYUPO1QLh.APSzK2TRRpKygBWbk6ku5IRvu6', 'LOCKED', 80, 'REFMOD003', '2026-01-04 09:30:00', '2026-06-18 09:30:00'),
(4, 'Pham Linh Chi', 'teacher.chi@chineselearning.vn', '$2a$10$gkT/LMKGX1C.qF7WtYYUPO1QLh.APSzK2TRRpKygBWbk6ku5IRvu6', 'ACTIVE', 900, 'REFTEA004', '2026-01-05 10:00:00', '2026-06-21 10:00:00'),
(5, 'Hoang Duc Huy', 'teacher.huy@chineselearning.vn', '$2a$10$gkT/LMKGX1C.qF7WtYYUPO1QLh.APSzK2TRRpKygBWbk6ku5IRvu6', 'ACTIVE', 760, 'REFTEA005', '2026-01-06 10:30:00', '2026-06-21 10:30:00'),
(6, 'Dang Ngoc Mai', 'teacher.mai@chineselearning.vn', '$2a$10$gkT/LMKGX1C.qF7WtYYUPO1QLh.APSzK2TRRpKygBWbk6ku5IRvu6', 'DELETED', 450, 'REFTEA006', '2026-01-07 11:00:00', '2026-06-10 11:00:00'),
(7, 'Bui Khanh Linh', 'linh.bui@example.com', '$2a$10$gkT/LMKGX1C.qF7WtYYUPO1QLh.APSzK2TRRpKygBWbk6ku5IRvu6', 'ACTIVE', 1450, 'REFSTU007', '2026-02-01 08:00:00', '2026-06-27 08:00:00'),
(8, 'Vo Thanh Nam', 'nam.vo@example.com', '$2a$10$gkT/LMKGX1C.qF7WtYYUPO1QLh.APSzK2TRRpKygBWbk6ku5IRvu6', 'ACTIVE', 980, 'REFSTU008', '2026-02-02 08:10:00', '2026-06-26 08:10:00'),
(9, 'Do My Duyen', 'duyen.do@example.com', '$2a$10$gkT/LMKGX1C.qF7WtYYUPO1QLh.APSzK2TRRpKygBWbk6ku5IRvu6', 'ACTIVE', 640, 'REFSTU009', '2026-02-03 08:20:00', '2026-06-26 08:20:00'),
(10, 'Mai Quoc Bao', 'bao.mai@example.com', '$2a$10$gkT/LMKGX1C.qF7WtYYUPO1QLh.APSzK2TRRpKygBWbk6ku5IRvu6', 'LOCKED', 310, 'REFSTU010', '2026-02-04 08:30:00', '2026-06-15 08:30:00'),
(11, 'Phan Tuong Vy', 'vy.phan@example.com', '$2a$10$gkT/LMKGX1C.qF7WtYYUPO1QLh.APSzK2TRRpKygBWbk6ku5IRvu6', 'ACTIVE', 1200, 'REFSTU011', '2026-02-05 08:40:00', '2026-06-28 08:40:00'),
(12, 'Ngo Gia Phuc', 'phuc.ngo@example.com', '$2a$10$gkT/LMKGX1C.qF7WtYYUPO1QLh.APSzK2TRRpKygBWbk6ku5IRvu6', 'ACTIVE', 530, 'REFSTU012', '2026-02-06 08:50:00', '2026-06-24 08:50:00'),
(13, 'Trinh Minh Anh', 'minhanh.trinh@example.com', '$2a$10$gkT/LMKGX1C.qF7WtYYUPO1QLh.APSzK2TRRpKygBWbk6ku5IRvu6', 'DELETED', 90, 'REFSTU013', '2026-02-07 09:00:00', '2026-06-01 09:00:00'),
(14, 'Cao Hoai An', 'an.cao@example.com', '$2a$10$gkT/LMKGX1C.qF7WtYYUPO1QLh.APSzK2TRRpKygBWbk6ku5IRvu6', 'ACTIVE', 720, 'REFSTU014', '2026-02-08 09:10:00', '2026-06-25 09:10:00'),
(15, 'Lam Nhat Minh', 'minh.lam@example.com', '$2a$10$gkT/LMKGX1C.qF7WtYYUPO1QLh.APSzK2TRRpKygBWbk6ku5IRvu6', 'ACTIVE', 410, 'REFSTU015', '2026-02-09 09:20:00', '2026-06-23 09:20:00');

-- 7. user_roles
INSERT INTO user_roles (user_id, role_id) VALUES
(1, 1), (2, 2), (3, 2), (4, 3), (5, 3), (6, 3),
(7, 4), (8, 4), (9, 4), (10, 4), (11, 4), (12, 4), (13, 4), (14, 4), (15, 4);

-- 8. role_permissions
INSERT INTO role_permissions (role_id, permission_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9), (1, 10), (1, 11), (1, 12), (1, 13), (1, 14),
(2, 1), (2, 3), (2, 4), (2, 5), (2, 7), (2, 12), (2, 13),
(3, 5), (3, 6), (3, 7), (3, 9), (3, 10), (3, 13),
(4, 5);

-- 9. verification_tokens
INSERT INTO verification_tokens (id, token, token_type, user_id, expiry_date, is_used, created_at) VALUES
(1, 'VERIFY-ADMIN-2026-0001', 'EMAIL_VERIFY', 1, '2026-07-31 23:59:59', TRUE, '2026-01-02 08:05:00'),
(2, 'RESET-LINH-2026-0002', 'PASSWORD_RESET', 7, '2026-07-01 23:59:59', FALSE, '2026-06-28 09:00:00'),
(3, 'VERIFY-NAM-2026-0003', 'EMAIL_VERIFY', 8, '2026-07-15 23:59:59', TRUE, '2026-02-02 08:20:00'),
(4, 'RESET-BAO-2026-0004', 'PASSWORD_RESET', 10, '2026-06-30 23:59:59', FALSE, '2026-06-25 10:00:00'),
(5, 'VERIFY-AN-2026-0005', 'EMAIL_VERIFY', 14, '2026-07-20 23:59:59', TRUE, '2026-02-08 09:15:00');

-- 10. courses
INSERT INTO courses (id, teacher_id, category_id, title, description, thumbnail_url, status, created_at, updated_at) VALUES
(1, 4, 1, 'Tieng Trung giao tiep co ban', 'Hoc chao hoi, gioi thieu ban than, hoi duong va cac mau cau hang ngay.', 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80', 'PUBLISHED', '2026-02-10 08:00:00', '2026-06-10 08:00:00'),
(2, 4, 2, 'HSK 1 tu con so 0', 'Lo trinh HSK 1 voi 150 tu vung, ngu phap nen tang va de luyen tap.', 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80', 'PUBLISHED', '2026-02-12 08:00:00', '2026-06-11 08:00:00'),
(3, 5, 2, 'HSK 2 cap toc', 'On tap tu vung HSK 2, nghe hieu va doc hieu theo cau truc de thi.', 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80', 'PUBLISHED', '2026-02-14 08:00:00', '2026-06-12 08:00:00'),
(4, 5, 4, 'Tieng Trung cho cong nhan nha may', 'Tu vung an toan lao dong, ca kip, may moc va trao doi voi quan ly Trung Quoc.', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80', 'PUBLISHED', '2026-02-16 08:00:00', '2026-06-13 08:00:00'),
(5, 4, 3, 'Tieng Trung thuong mai ung dung', 'Hoi hop, email, bao gia, dam phan va cham soc khach hang bang tieng Trung.', 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80', 'PENDING', '2026-03-01 08:00:00', '2026-06-14 08:00:00'),
(6, 6, 6, 'Phat am Pinyin chuan ngay tu dau', 'Luyen thanh mau, van mau, thanh dieu va sua loi phat am pho bien.', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80', 'DRAFT', '2026-03-03 08:00:00', '2026-06-15 08:00:00'),
(7, 5, 5, 'Ngu phap tieng Trung cho nguoi moi', 'Giai thich cac mau cau co ban voi vi du thuc te trong giao tiep.', 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80', 'HIDDEN', '2026-03-05 08:00:00', '2026-06-16 08:00:00'),
(8, 4, 6, 'Nghe noi tieng Trung moi ngay', 'Bai nghe ngan theo chu de va bai tap phan xa hoi thoai.', 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80', 'PUBLISHED', '2026-03-07 08:00:00', '2026-06-17 08:00:00');

-- 11. course_plan_access
INSERT INTO course_plan_access (course_id, plan_id) VALUES
(1, 1), (1, 2), (1, 3), (2, 1), (2, 2), (2, 3), (3, 2), (3, 3), (4, 2), (4, 3),
(5, 3), (6, 1), (6, 2), (7, 1), (7, 2), (8, 1), (8, 2), (8, 3);

-- 12. course_tags
INSERT INTO course_tags (course_id, tag_id) VALUES
(1, 1), (1, 4), (1, 5), (2, 1), (2, 2), (2, 7), (3, 3), (3, 5), (4, 4), (4, 8),
(5, 6), (5, 4), (6, 1), (6, 5), (7, 2), (7, 7), (8, 4), (8, 5);

-- 13. chapters
INSERT INTO chapters (id, course_id, title, order_index) VALUES
(1, 1, 'Nen tang phat am va chao hoi', 1),
(2, 1, 'Hoi thoai doi song hang ngay', 2),
(3, 2, 'HSK 1: Pinyin va tu vung dau tien', 1),
(4, 2, 'HSK 1: Mau cau co ban', 2),
(5, 3, 'HSK 2: Mo rong tu vung', 1),
(6, 3, 'HSK 2: Luyen de nghe doc', 2),
(7, 4, 'Tu vung nha may va an toan', 1),
(8, 4, 'Giao tiep trong ca lam', 2),
(9, 5, 'Thuong mai: Gioi thieu cong ty', 1),
(10, 5, 'Thuong mai: Bao gia va dam phan', 2),
(11, 6, 'Pinyin: Thanh mau va van mau', 1),
(12, 6, 'Pinyin: Thanh dieu va bien dieu', 2),
(13, 7, 'Ngu phap nen tang', 1),
(14, 7, 'Mau cau thuong dung', 2),
(15, 8, 'Nghe noi chu de sinh hoat', 1),
(16, 8, 'Phan xa hoi thoai ngan', 2);

-- 14. lessons
INSERT INTO lessons (id, chapter_id, title, video_url, duration_seconds, order_index) VALUES
(1, 1, 'Lam quen bang phien am Pinyin', 'https://cdn.chineselearning.vn/videos/lesson-001.mp4', 720, 1),
(2, 1, 'Chao hoi va gioi thieu ten', 'https://cdn.chineselearning.vn/videos/lesson-002.mp4', 840, 2),
(3, 2, 'Hoi tham suc khoe va nghe nghiep', 'https://cdn.chineselearning.vn/videos/lesson-003.mp4', 900, 1),
(4, 2, 'Hoi duong va di taxi', 'https://cdn.chineselearning.vn/videos/lesson-004.mp4', 960, 2),
(5, 3, '150 tu vung HSK 1 dau tien', 'https://cdn.chineselearning.vn/videos/lesson-005.mp4', 780, 1),
(6, 3, 'So dem, ngay thang va thoi gian', 'https://cdn.chineselearning.vn/videos/lesson-006.mp4', 810, 2),
(7, 4, 'Cau hoi voi ma, shei, shenme', 'https://cdn.chineselearning.vn/videos/lesson-007.mp4', 840, 1),
(8, 4, 'Doc doan van HSK 1 ngan', 'https://cdn.chineselearning.vn/videos/lesson-008.mp4', 880, 2),
(9, 5, 'Tu vung HSK 2 theo chu de mua sam', 'https://cdn.chineselearning.vn/videos/lesson-009.mp4', 900, 1),
(10, 5, 'Cau so sanh va bo ngu ket qua', 'https://cdn.chineselearning.vn/videos/lesson-010.mp4', 930, 2),
(11, 6, 'Nghe hieu HSK 2 phan tranh anh', 'https://cdn.chineselearning.vn/videos/lesson-011.mp4', 1020, 1),
(12, 6, 'Doc hieu HSK 2 phan dien tu', 'https://cdn.chineselearning.vn/videos/lesson-012.mp4', 1080, 2),
(13, 7, 'Tu vung bao ho lao dong', 'https://cdn.chineselearning.vn/videos/lesson-013.mp4', 760, 1),
(14, 7, 'Lenh thao tac may moc co ban', 'https://cdn.chineselearning.vn/videos/lesson-014.mp4', 830, 2),
(15, 8, 'Bao cao su co trong ca lam', 'https://cdn.chineselearning.vn/videos/lesson-015.mp4', 880, 1),
(16, 8, 'Xin nghi va doi ca bang tieng Trung', 'https://cdn.chineselearning.vn/videos/lesson-016.mp4', 800, 2),
(17, 9, 'Gioi thieu cong ty va phong ban', 'https://cdn.chineselearning.vn/videos/lesson-017.mp4', 920, 1),
(18, 9, 'Viet email hen lich hop', 'https://cdn.chineselearning.vn/videos/lesson-018.mp4', 970, 2),
(19, 10, 'Tu vung bao gia va hop dong', 'https://cdn.chineselearning.vn/videos/lesson-019.mp4', 940, 1),
(20, 10, 'Dam phan dieu khoan giao hang', 'https://cdn.chineselearning.vn/videos/lesson-020.mp4', 980, 2),
(21, 11, 'Thanh mau b p m f va van mau don', 'https://cdn.chineselearning.vn/videos/lesson-021.mp4', 700, 1),
(22, 11, 'Luyen ghep am va doc am tiet', 'https://cdn.chineselearning.vn/videos/lesson-022.mp4', 730, 2),
(23, 12, 'Bon thanh dieu co ban', 'https://cdn.chineselearning.vn/videos/lesson-023.mp4', 760, 1),
(24, 12, 'Bien dieu cua yi, bu va thanh ba', 'https://cdn.chineselearning.vn/videos/lesson-024.mp4', 790, 2),
(25, 13, 'Cau chu vi va cau vi ngu tinh tu', 'https://cdn.chineselearning.vn/videos/lesson-025.mp4', 840, 1),
(26, 13, 'Cach dung de va le', 'https://cdn.chineselearning.vn/videos/lesson-026.mp4', 860, 2),
(27, 14, 'Mau cau yao, xiang, neng', 'https://cdn.chineselearning.vn/videos/lesson-027.mp4', 870, 1),
(28, 14, 'Cau lien dong trong sinh hoat', 'https://cdn.chineselearning.vn/videos/lesson-028.mp4', 890, 2),
(29, 15, 'Nghe chu de an uong', 'https://cdn.chineselearning.vn/videos/lesson-029.mp4', 760, 1),
(30, 15, 'Nghe chu de mua sam', 'https://cdn.chineselearning.vn/videos/lesson-030.mp4', 800, 2),
(31, 16, 'Hoi thoai tai ga tau dien', 'https://cdn.chineselearning.vn/videos/lesson-031.mp4', 820, 1),
(32, 16, 'Phan xa dat mon tai nha hang', 'https://cdn.chineselearning.vn/videos/lesson-032.mp4', 850, 2);

-- 15. lesson_documents
INSERT INTO lesson_documents (id, lesson_id, title, file_url, created_at) VALUES
(1, 1, 'Bang Pinyin va cach doc', 'https://cdn.chineselearning.vn/docs/pinyin-chart.pdf', '2026-02-10 09:00:00'),
(2, 2, 'Mau cau chao hoi co ban', 'https://cdn.chineselearning.vn/docs/chao-hoi.pdf', '2026-02-10 09:10:00'),
(3, 6, 'Bang so dem va ngay thang', 'https://cdn.chineselearning.vn/docs/so-dem-ngay-thang.pdf', '2026-02-12 09:00:00'),
(4, 11, 'Audio transcript HSK 2', 'https://cdn.chineselearning.vn/docs/hsk2-listening-transcript.pdf', '2026-02-14 09:00:00'),
(5, 13, 'Tu vung an toan lao dong', 'https://cdn.chineselearning.vn/docs/an-toan-lao-dong.pdf', '2026-02-16 09:00:00'),
(6, 18, 'Mau email thuong mai', 'https://cdn.chineselearning.vn/docs/email-thuong-mai.pdf', '2026-03-01 09:00:00'),
(7, 23, 'Bang luyen thanh dieu', 'https://cdn.chineselearning.vn/docs/thanh-dieu.pdf', '2026-03-03 09:00:00'),
(8, 29, 'Transcript nghe chu de an uong', 'https://cdn.chineselearning.vn/docs/nghe-an-uong.pdf', '2026-03-07 09:00:00');

-- 16. quizzes
INSERT INTO quizzes (id, title, type, lesson_id, chapter_id, time_limit_minutes, pass_score, created_at) VALUES
(1, 'Quiz Pinyin co ban', 'SINGLE_CHOICE', 1, NULL, 10, 60, '2026-02-10 10:00:00'),
(2, 'Quiz chao hoi nhieu dap an', 'MULTIPLE_CHOICE', 2, NULL, 12, 60, '2026-02-10 10:10:00'),
(3, 'Dien tu vung so dem', 'FILL_IN_BLANK', 6, NULL, 10, 70, '2026-02-12 10:00:00'),
(4, 'Noi tu HSK 1', 'MATCHING', NULL, 4, 15, 70, '2026-02-12 10:10:00'),
(5, 'Nghe hieu HSK 2 tranh anh', 'LISTENING', 11, NULL, 20, 70, '2026-02-14 10:00:00'),
(6, 'De mo phong HSK 1', 'HSK_MOCK', NULL, 4, 35, 60, '2026-02-12 11:00:00'),
(7, 'Quiz tu vung nha may', 'SINGLE_CHOICE', 13, NULL, 10, 60, '2026-02-16 10:00:00'),
(8, 'Quiz bao cao su co', 'LISTENING', 15, NULL, 15, 70, '2026-02-16 10:10:00'),
(9, 'Quiz email thuong mai', 'FILL_IN_BLANK', 18, NULL, 15, 70, '2026-03-01 10:00:00'),
(10, 'Noi cap thanh dieu Pinyin', 'MATCHING', 23, NULL, 10, 70, '2026-03-03 10:00:00'),
(11, 'Quiz nghe chu de an uong', 'LISTENING', 29, NULL, 15, 70, '2026-03-07 10:00:00'),
(12, 'Quiz phan xa dat mon', 'MULTIPLE_CHOICE', 32, NULL, 12, 60, '2026-03-07 10:10:00');

-- 17. questions
INSERT INTO questions (id, quiz_id, content, audio_url, points, order_index) VALUES
(1, 1, 'Chu cai pinyin nao doc gan giong am "ma" voi thanh ngang?', NULL, 10, 1),
(2, 1, 'Thanh dieu thu ba trong tieng Trung co duong net nao?', NULL, 10, 2),
(3, 2, 'Nhung cau nao co the dung de chao hoi lich su?', NULL, 10, 1),
(4, 2, 'Nhung cau nao dung de gioi thieu ten?', NULL, 10, 2),
(5, 3, 'Dien pinyin cho so 8: ___', NULL, 10, 1),
(6, 3, 'Dien tieng Trung pinyin cho "hom nay": ___', NULL, 10, 2),
(7, 4, 'Noi tu tieng Trung voi nghia tieng Viet tuong ung.', NULL, 10, 1),
(8, 4, 'Noi cum tu hoi dap HSK 1 voi chuc nang giao tiep.', NULL, 10, 2),
(9, 5, 'Nghe audio va chon noi dung nguoi noi muon mua.', 'https://cdn.chineselearning.vn/audio/hsk2-shopping-001.mp3', 10, 1),
(10, 5, 'Nghe audio va chon thoi gian hen gap.', 'https://cdn.chineselearning.vn/audio/hsk2-time-002.mp3', 10, 2),
(11, 6, 'Trong HSK 1, "wo" nghia la gi?', NULL, 10, 1),
(12, 6, 'Chon cau dung de hoi "ban la ai?"', NULL, 10, 2),
(13, 7, 'An toan lao dong trong tieng Trung thuong noi la gi?', NULL, 10, 1),
(14, 7, 'Tu nao lien quan den "may moc"?', NULL, 10, 2),
(15, 8, 'Nghe audio va chon su co duoc bao cao.', 'https://cdn.chineselearning.vn/audio/factory-incident-001.mp3', 10, 1),
(16, 8, 'Nghe audio va chon hanh dong can lam tiep theo.', 'https://cdn.chineselearning.vn/audio/factory-action-002.mp3', 10, 2),
(17, 9, 'Dien tu con thieu trong cau email: Qing ___ huiyi shijian.', NULL, 10, 1),
(18, 9, 'Dien tu phu hop: Wo xiang ___ yixia baojia.', NULL, 10, 2),
(19, 10, 'Noi thanh dieu voi ky hieu dung.', NULL, 10, 1),
(20, 10, 'Noi bien dieu voi vi du dung.', NULL, 10, 2),
(21, 11, 'Nghe audio va chon mon an duoc goi.', 'https://cdn.chineselearning.vn/audio/food-001.mp3', 10, 1),
(22, 11, 'Nghe audio va chon do uong duoc nhac den.', 'https://cdn.chineselearning.vn/audio/drink-002.mp3', 10, 2),
(23, 12, 'Nhung cau nao dung khi goi mon?', NULL, 10, 1),
(24, 12, 'Nhung cau nao dung de yeu cau thanh toan?', NULL, 10, 2);

-- 18. answers
INSERT INTO answers (id, question_id, content, is_correct, matching_pair) VALUES
(1, 1, 'ma1', TRUE, NULL),
(2, 1, 'ma3', FALSE, NULL),
(3, 1, 'mai4', FALSE, NULL),
(4, 2, 'Giong dau hoi roi di len', TRUE, NULL),
(5, 2, 'Doc ngang va deu', FALSE, NULL),
(6, 2, 'Doc ngan va dut khoat', FALSE, NULL),
(7, 3, 'Nin hao', TRUE, NULL),
(8, 3, 'Ni hao', TRUE, NULL),
(9, 3, 'Wo yao yi bei kafei', FALSE, NULL),
(10, 4, 'Wo jiao Linh', TRUE, NULL),
(11, 4, 'Wo shi Yuenan ren', TRUE, NULL),
(12, 4, 'Xianzai ji dian?', FALSE, NULL),
(13, 5, 'ba', TRUE, NULL),
(14, 5, 'jiu', FALSE, NULL),
(15, 6, 'jintian', TRUE, NULL),
(16, 6, 'mingtian', FALSE, NULL),
(17, 7, 'xuexi', TRUE, 'hoc tap'),
(18, 7, 'laoshi', TRUE, 'giao vien'),
(19, 7, 'pengyou', TRUE, 'ban be'),
(20, 8, 'Ni hao ma?', TRUE, 'hoi tham suc khoe'),
(21, 8, 'Ni jiao shenme mingzi?', TRUE, 'hoi ten'),
(22, 8, 'Duo shao qian?', TRUE, 'hoi gia tien'),
(23, 9, 'Mot chiec ao so mi', TRUE, NULL),
(24, 9, 'Mot ve tau', FALSE, NULL),
(25, 9, 'Mot quyen sach', FALSE, NULL),
(26, 10, '3 gio chieu', TRUE, NULL),
(27, 10, '8 gio sang', FALSE, NULL),
(28, 10, '9 gio toi', FALSE, NULL),
(29, 11, 'Toi', TRUE, NULL),
(30, 11, 'Ban', FALSE, NULL),
(31, 11, 'Thay giao', FALSE, NULL),
(32, 12, 'Ni shi shei?', TRUE, NULL),
(33, 12, 'Ni qu nar?', FALSE, NULL),
(34, 12, 'Ni yao shenme?', FALSE, NULL),
(35, 13, 'anquan shengchan', TRUE, NULL),
(36, 13, 'yinyue hui', FALSE, NULL),
(37, 14, 'jiqi', TRUE, NULL),
(38, 14, 'shuiguo', FALSE, NULL),
(39, 15, 'Day chuyen dung dot ngot', TRUE, NULL),
(40, 15, 'Khach hang huy don', FALSE, NULL),
(41, 16, 'Bao ngay cho to truong', TRUE, NULL),
(42, 16, 'Tu y khoi dong lai may', FALSE, NULL),
(43, 17, 'queren', TRUE, NULL),
(44, 17, 'chifan', FALSE, NULL),
(45, 18, 'liaojie', TRUE, NULL),
(46, 18, 'shuijiao', FALSE, NULL),
(47, 19, 'Thanh 1', TRUE, 'ma1'),
(48, 19, 'Thanh 2', TRUE, 'ma2'),
(49, 19, 'Thanh 4', TRUE, 'ma4'),
(50, 20, 'yi + thanh 4', TRUE, 'doi thanh 2'),
(51, 20, 'bu + thanh 4', TRUE, 'doi thanh 2'),
(52, 20, 'hai thanh 3 lien tiep', TRUE, 'thanh 3 dau doi thanh 2'),
(53, 21, 'Mian', TRUE, NULL),
(54, 21, 'Cha', FALSE, NULL),
(55, 22, 'Lu cha', TRUE, NULL),
(56, 22, 'Mi fan', FALSE, NULL),
(57, 23, 'Wo yao yi wan mian', TRUE, NULL),
(58, 23, 'Qing gei wo caidan', TRUE, NULL),
(59, 23, 'Wo zai yinhang gongzuo', FALSE, NULL),
(60, 24, 'Mai dan', TRUE, NULL),
(61, 24, 'Ke yi shuaka ma?', TRUE, NULL),
(62, 24, 'Ni jia zai nar?', FALSE, NULL);

-- 19. assignments
INSERT INTO assignments (id, lesson_id, title, description, attachment_url, deadline_days) VALUES
(1, 2, 'Viet doan hoi thoai chao hoi', 'Viet doan hoi thoai 6 cau ve chao hoi va gioi thieu ten.', 'https://cdn.chineselearning.vn/templates/assignment-greeting.docx', 7),
(2, 6, 'Luyen viet so dem va ngay thang', 'Viet 10 cau co so dem, ngay thang va gio hen.', NULL, 5),
(3, 11, 'Tom tat bai nghe HSK 2', 'Nghe file audio va viet tom tat noi dung bang tieng Viet.', 'https://cdn.chineselearning.vn/templates/hsk2-listening.docx', 7),
(4, 15, 'Bao cao su co nha may', 'Viet mau bao cao su co ngan dung tu vung da hoc.', NULL, 5),
(5, 18, 'Viet email hen lich hop', 'Soan email tieng Trung hen lich hop voi doi tac.', 'https://cdn.chineselearning.vn/templates/business-email.docx', 7),
(6, 29, 'Ghi am hoi thoai dat mon', 'Nop file ghi am hoi thoai dat mon tai nha hang.', NULL, 4);

-- 20. course_enrollments
INSERT INTO course_enrollments (id, user_id, course_id, enrolled_at, completed_at) VALUES
(1, 7, 1, '2026-03-01 08:00:00', '2026-04-01 18:00:00'),
(2, 7, 2, '2026-04-05 08:00:00', NULL),
(3, 8, 1, '2026-03-03 08:00:00', NULL),
(4, 8, 3, '2026-05-01 08:00:00', NULL),
(5, 9, 2, '2026-03-10 08:00:00', '2026-05-01 18:00:00'),
(6, 10, 4, '2026-03-12 08:00:00', NULL),
(7, 11, 1, '2026-03-15 08:00:00', '2026-04-20 18:00:00'),
(8, 11, 8, '2026-05-05 08:00:00', NULL),
(9, 12, 4, '2026-04-01 08:00:00', NULL),
(10, 14, 8, '2026-04-10 08:00:00', NULL),
(11, 15, 2, '2026-05-15 08:00:00', NULL);

-- 21. lesson_progress
INSERT INTO lesson_progress (id, user_id, lesson_id, watch_seconds, is_completed, updated_at) VALUES
(1, 7, 1, 720, TRUE, '2026-03-02 08:00:00'),
(2, 7, 2, 840, TRUE, '2026-03-03 08:00:00'),
(3, 7, 5, 780, TRUE, '2026-04-06 08:00:00'),
(4, 8, 1, 500, FALSE, '2026-03-05 08:00:00'),
(5, 8, 9, 900, TRUE, '2026-05-03 08:00:00'),
(6, 9, 5, 780, TRUE, '2026-03-11 08:00:00'),
(7, 9, 6, 810, TRUE, '2026-03-12 08:00:00'),
(8, 10, 13, 300, FALSE, '2026-03-13 08:00:00'),
(9, 11, 1, 720, TRUE, '2026-03-16 08:00:00'),
(10, 11, 2, 840, TRUE, '2026-03-17 08:00:00'),
(11, 11, 29, 760, TRUE, '2026-05-06 08:00:00'),
(12, 12, 13, 760, TRUE, '2026-04-02 08:00:00'),
(13, 14, 31, 400, FALSE, '2026-04-12 08:00:00'),
(14, 15, 5, 420, FALSE, '2026-05-16 08:00:00');

-- 22. quiz_attempts
INSERT INTO quiz_attempts (id, user_id, quiz_id, score, is_passed, started_at, submitted_at, status) VALUES
(1, 7, 1, 90, TRUE, '2026-03-02 09:00:00', '2026-03-02 09:08:00', 'SUBMITTED'),
(2, 7, 2, 80, TRUE, '2026-03-03 09:00:00', '2026-03-03 09:10:00', 'SUBMITTED'),
(3, 8, 1, 40, FALSE, '2026-03-05 09:00:00', NULL, 'DOING'),
(4, 9, 3, 100, TRUE, '2026-03-12 09:00:00', '2026-03-12 09:07:00', 'SUBMITTED'),
(5, 10, 7, 20, FALSE, '2026-03-13 09:00:00', '2026-03-13 09:05:00', 'CHEATING_SUSPECTED'),
(6, 11, 6, 85, TRUE, '2026-04-02 09:00:00', '2026-04-02 09:30:00', 'SUBMITTED'),
(7, 11, 11, 75, TRUE, '2026-05-06 09:00:00', '2026-05-06 09:12:00', 'SUBMITTED'),
(8, 12, 8, 70, TRUE, '2026-04-03 09:00:00', '2026-04-03 09:14:00', 'SUBMITTED');

-- 23. student_answers
INSERT INTO student_answers (id, attempt_id, question_id, selected_answer_id, input_text, is_correct) VALUES
(1, 1, 1, 1, NULL, TRUE),
(2, 1, 2, 4, NULL, TRUE),
(3, 2, 3, 7, NULL, TRUE),
(4, 2, 4, 10, NULL, TRUE),
(5, 3, 1, 2, NULL, FALSE),
(6, 4, 5, NULL, 'ba', TRUE),
(7, 4, 6, NULL, 'jintian', TRUE),
(8, 5, 13, 36, NULL, FALSE),
(9, 5, 14, 38, NULL, FALSE),
(10, 6, 11, 29, NULL, TRUE),
(11, 6, 12, 32, NULL, TRUE),
(12, 7, 21, 53, NULL, TRUE),
(13, 7, 22, 55, NULL, TRUE),
(14, 8, 15, 39, NULL, TRUE),
(15, 8, 16, 41, NULL, TRUE);

-- 24. user_chapter_progress
INSERT INTO user_chapter_progress (id, user_id, chapter_id, is_completed, completed_at) VALUES
(1, 7, 1, TRUE, '2026-03-04 18:00:00'),
(2, 7, 3, TRUE, '2026-04-07 18:00:00'),
(3, 8, 1, FALSE, NULL),
(4, 9, 3, TRUE, '2026-03-13 18:00:00'),
(5, 10, 7, FALSE, NULL),
(6, 11, 1, TRUE, '2026-03-18 18:00:00'),
(7, 11, 15, TRUE, '2026-05-07 18:00:00'),
(8, 12, 7, TRUE, '2026-04-04 18:00:00'),
(9, 14, 16, FALSE, NULL),
(10, 15, 3, FALSE, NULL);

-- 25. user_lesson_progress
INSERT INTO user_lesson_progress (id, user_id, lesson_id, current_time_seconds, is_completed, updated_at) VALUES
(1, 7, 1, 720, TRUE, '2026-03-02 08:00:00'),
(2, 7, 2, 840, TRUE, '2026-03-03 08:00:00'),
(3, 7, 5, 780, TRUE, '2026-04-06 08:00:00'),
(4, 8, 1, 500, FALSE, '2026-03-05 08:00:00'),
(5, 8, 9, 900, TRUE, '2026-05-03 08:00:00'),
(6, 9, 5, 780, TRUE, '2026-03-11 08:00:00'),
(7, 9, 6, 810, TRUE, '2026-03-12 08:00:00'),
(8, 10, 13, 300, FALSE, '2026-03-13 08:00:00'),
(9, 11, 1, 720, TRUE, '2026-03-16 08:00:00'),
(10, 11, 2, 840, TRUE, '2026-03-17 08:00:00'),
(11, 11, 29, 760, TRUE, '2026-05-06 08:00:00'),
(12, 12, 13, 760, TRUE, '2026-04-02 08:00:00'),
(13, 14, 31, 400, FALSE, '2026-04-12 08:00:00'),
(14, 15, 5, 420, FALSE, '2026-05-16 08:00:00');

-- 26. user_quiz_attempts
SET @user_quiz_attempts_exists = (
    SELECT COUNT(*)
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
      AND table_name = 'user_quiz_attempts'
);
SET @sql = IF(
    @user_quiz_attempts_exists > 0,
    'INSERT INTO user_quiz_attempts (id, user_id, quiz_id, score, is_passed, attempt_date) VALUES
(1, 7, 1, 90, TRUE, ''2026-03-02 09:08:00''),
(2, 7, 2, 80, TRUE, ''2026-03-03 09:10:00''),
(3, 8, 1, 40, FALSE, ''2026-03-05 09:05:00''),
(4, 9, 3, 100, TRUE, ''2026-03-12 09:07:00''),
(5, 10, 7, 20, FALSE, ''2026-03-13 09:05:00''),
(6, 11, 6, 85, TRUE, ''2026-04-02 09:30:00''),
(7, 11, 11, 75, TRUE, ''2026-05-06 09:12:00''),
(8, 12, 8, 70, TRUE, ''2026-04-03 09:14:00'')',
    'SELECT ''Skipping user_quiz_attempts insert: table does not exist in this database.'' AS seed_warning'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 27. assignment_submissions
INSERT INTO assignment_submissions (id, assignment_id, user_id, submission_text, file_url, status, score, teacher_feedback, submitted_at, graded_at) VALUES
(1, 1, 7, 'Ni hao, wo jiao Linh. Hen gaoxing renshi ni.', NULL, 'GRADED', 90, 'Hoi thoai tu nhien, can chu y thanh dieu cau chao.', '2026-03-04 20:00:00', '2026-03-05 09:00:00'),
(2, 2, 9, 'Wo jintian you san jie ke. Xingqiwu wo qu xuexiao.', NULL, 'GRADED', 88, 'Dung tu vung tot, them chu Han neu co the.', '2026-03-13 20:00:00', '2026-03-14 09:00:00'),
(3, 3, 8, 'Bai nghe noi ve mua sam quan ao va hoi gia.', 'https://cdn.chineselearning.vn/submissions/nam-hsk2.docx', 'SUBMITTED', NULL, NULL, '2026-05-04 20:00:00', NULL),
(4, 4, 12, 'May so 3 dung dot ngot, toi da bao to truong va tat nguon.', NULL, 'NEEDS_REVISION', 55, 'Bo sung thoi gian xay ra su co va hanh dong an toan.', '2026-04-05 20:00:00', '2026-04-06 09:00:00'),
(5, 6, 11, 'Ghi am hoi thoai dat mon mi va tra xanh.', 'https://cdn.chineselearning.vn/submissions/vy-food-dialog.mp3', 'GRADED', 92, 'Phan xa tot, phat am ro.', '2026-05-07 20:00:00', '2026-05-08 09:00:00');

-- 28. certificates
INSERT INTO certificates (id, user_id, course_id, certificate_code, issued_at, pdf_url) VALUES
(1, 7, 1, 'CERT-COL-2026-0001', '2026-04-01 18:00:00', 'https://cdn.chineselearning.vn/certificates/CERT-COL-2026-0001.pdf'),
(2, 9, 2, 'CERT-HSK1-2026-0002', '2026-05-01 18:00:00', 'https://cdn.chineselearning.vn/certificates/CERT-HSK1-2026-0002.pdf'),
(3, 11, 1, 'CERT-COL-2026-0003', '2026-04-20 18:00:00', 'https://cdn.chineselearning.vn/certificates/CERT-COL-2026-0003.pdf');

-- 29. coupons
INSERT INTO coupons (id, code, discount_type, discount_value, max_uses, used_count, valid_from, valid_until, created_by, created_at) VALUES
(1, 'WELCOME20', 'PERCENTAGE', 20.00, 500, 128, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 1, '2026-01-01 08:00:00'),
(2, 'HSK50K', 'FIXED_AMOUNT', 50000.00, 200, 76, '2026-02-01 00:00:00', '2026-08-31 23:59:59', 2, '2026-02-01 08:00:00'),
(3, 'SUMMER30', 'PERCENTAGE', 30.00, 300, 45, '2026-06-01 00:00:00', '2026-07-31 23:59:59', 1, '2026-05-20 08:00:00');

-- 30. subscriptions
INSERT INTO subscriptions (id, user_id, plan_id, start_date, end_date, status, created_at) VALUES
(1, 7, 3, '2026-03-01', '2027-02-28', 'ACTIVE', '2026-03-01 07:50:00'),
(2, 8, 2, '2026-03-03', '2026-06-01', 'EXPIRED', '2026-03-03 07:50:00'),
(3, 9, 2, '2026-03-10', '2026-06-08', 'EXPIRED', '2026-03-10 07:50:00'),
(4, 10, 1, '2026-03-12', '2026-04-10', 'CANCELLED', '2026-03-12 07:50:00'),
(5, 11, 3, '2026-03-15', '2027-03-14', 'ACTIVE', '2026-03-15 07:50:00'),
(6, 12, 2, '2026-04-01', '2026-06-29', 'ACTIVE', '2026-04-01 07:50:00'),
(7, 14, 1, '2026-04-10', '2026-05-09', 'EXPIRED', '2026-04-10 07:50:00');

-- 31. invoices
INSERT INTO invoices (id, user_id, subscription_id, coupon_id, original_amount, discount_amount, amount, status, created_at, updated_at) VALUES
(1, 7, 1, 1, 1499000.00, 299800.00, 1199200.00, 'PAID', '2026-03-01 07:50:00', '2026-03-01 07:55:00'),
(2, 8, 2, 2, 499000.00, 50000.00, 449000.00, 'PAID', '2026-03-03 07:50:00', '2026-03-03 07:55:00'),
(3, 9, 3, NULL, 499000.00, 0.00, 499000.00, 'FAILED', '2026-03-10 07:50:00', '2026-03-10 07:55:00'),
(4, 10, 4, NULL, 199000.00, 0.00, 199000.00, 'REFUNDED', '2026-03-12 07:50:00', '2026-03-13 10:00:00'),
(5, 11, 5, 3, 1499000.00, 449700.00, 1049300.00, 'PAID', '2026-03-15 07:50:00', '2026-03-15 07:55:00'),
(6, 12, 6, 2, 499000.00, 50000.00, 449000.00, 'PENDING', '2026-04-01 07:50:00', '2026-04-01 07:50:00'),
(7, 14, 7, NULL, 199000.00, 0.00, 199000.00, 'PAID', '2026-04-10 07:50:00', '2026-04-10 07:55:00');

-- 32. payments
INSERT INTO payments (id, invoice_id, provider, transaction_id, amount, status, raw_response, created_at) VALUES
(1, 1, 'VNPAY', 'VNPAY-20260301-0001', 1199200.00, 'SUCCESS', JSON_OBJECT('bankCode', 'NCB', 'responseCode', '00', 'message', 'Approved'), '2026-03-01 07:55:00'),
(2, 2, 'MOMO', 'MOMO-20260303-0002', 449000.00, 'SUCCESS', JSON_OBJECT('partnerCode', 'MOMO', 'resultCode', 0, 'message', 'Successful'), '2026-03-03 07:55:00'),
(3, 3, 'STRIPE', 'STRIPE-20260310-0003', 499000.00, 'FAILED', JSON_OBJECT('chargeId', 'ch_hsk2_failed_0003', 'failureCode', 'card_declined'), '2026-03-10 07:55:00'),
(4, 4, 'VNPAY', 'VNPAY-20260312-0004', 199000.00, 'SUCCESS', JSON_OBJECT('bankCode', 'VCB', 'responseCode', '00', 'message', 'Approved'), '2026-03-12 07:55:00'),
(5, 5, 'STRIPE', 'STRIPE-20260315-0005', 1049300.00, 'SUCCESS', JSON_OBJECT('chargeId', 'ch_premium_0005', 'currency', 'vnd', 'paid', true), '2026-03-15 07:55:00'),
(6, 7, 'MOMO', 'MOMO-20260410-0007', 199000.00, 'SUCCESS', JSON_OBJECT('partnerCode', 'MOMO', 'resultCode', 0, 'message', 'Successful'), '2026-04-10 07:55:00');

-- 33. refunds
INSERT INTO refunds (id, payment_id, user_id, amount, reason, status, processed_by, created_at, processed_at) VALUES
(1, 4, 10, 199000.00, 'Hoc vien yeu cau hoan tien do trung lich lam viec.', 'PROCESSED', 2, '2026-03-13 09:00:00', '2026-03-13 10:00:00'),
(2, 2, 8, 449000.00, 'Yeu cau hoan tien sau khi goi da het han khong du dieu kien.', 'REJECTED', 3, '2026-06-02 09:00:00', '2026-06-02 11:00:00'),
(3, 5, 11, 300000.00, 'Loi truy cap tam thoi trong ngay khai giang.', 'APPROVED', 1, '2026-03-16 09:00:00', '2026-03-16 11:00:00'),
(4, 1, 7, 200000.00, 'Can xem xet uu dai bo sung cho hoc vien gioi thieu ban be.', 'PENDING', NULL, '2026-06-20 09:00:00', NULL);

-- 34. audit_logs
INSERT INTO audit_logs (id, user_id, action, method, endpoint, before_data, after_data, ip_address, user_agent, created_at) VALUES
(1, 1, 'CREATE_COURSE', 'POST', '/api/courses', NULL, JSON_OBJECT('courseId', 1, 'status', 'PUBLISHED'), '113.161.10.21', 'Mozilla/5.0 Chrome', '2026-02-10 08:05:00'),
(2, 4, 'UPDATE_LESSON', 'PUT', '/api/lessons/2', JSON_OBJECT('duration_seconds', 800), JSON_OBJECT('duration_seconds', 840), '113.161.10.22', 'Mozilla/5.0 Chrome', '2026-02-10 09:05:00'),
(3, 2, 'RESOLVE_REPORT', 'PUT', '/api/reports/3', JSON_OBJECT('status', 'INVESTIGATING'), JSON_OBJECT('status', 'RESOLVED'), '113.161.10.23', 'Mozilla/5.0 Edge', '2026-06-10 10:00:00'),
(4, 7, 'SUBMIT_ASSIGNMENT', 'POST', '/api/assignments/1/submissions', NULL, JSON_OBJECT('submissionId', 1), '14.232.20.11', 'Mozilla/5.0 Safari', '2026-03-04 20:00:00'),
(5, 10, 'PAYMENT_REFUND_REQUEST', 'POST', '/api/refunds', NULL, JSON_OBJECT('refundId', 1), '14.232.20.12', 'Mozilla/5.0 Chrome', '2026-03-13 09:00:00');

-- 35. notifications
INSERT INTO notifications (id, user_id, type, title, content, is_read, created_at) VALUES
(1, 7, 'COURSE', 'Chuc mung hoan thanh khoa hoc', 'Ban da hoan thanh khoa Tieng Trung giao tiep co ban va nhan chung chi.', TRUE, '2026-04-01 18:05:00'),
(2, 8, 'PAYMENT', 'Thanh toan thanh cong', 'Goi Standard 3 thang cua ban da duoc kich hoat.', TRUE, '2026-03-03 08:00:00'),
(3, 9, 'QUIZ', 'Diem quiz rat tot', 'Ban dat 100 diem trong bai Dien tu vung so dem.', FALSE, '2026-03-12 09:10:00'),
(4, 12, 'ASSIGNMENT', 'Bai nop can chinh sua', 'Giang vien da yeu cau bo sung noi dung cho bai Bao cao su co nha may.', FALSE, '2026-04-06 09:05:00'),
(5, 14, 'SYSTEM', 'Goi hoc da het han', 'Goi Basic cua ban da het han, vui long gia han de hoc tiep.', FALSE, '2026-05-09 08:00:00');

-- 36. reports
INSERT INTO reports (id, reporter_id, target_type, target_id, reason, status, resolved_by, created_at, resolved_at) VALUES
(1, 7, 'COURSE', 5, 'Mo ta khoa hoc chua neu ro lich cap nhat bai giang.', 'PENDING', NULL, '2026-06-01 09:00:00', NULL),
(2, 8, 'USER', 10, 'Tin nhan binh luan co dau hieu spam trong Q&A.', 'INVESTIGATING', 2, '2026-06-02 09:00:00', NULL),
(3, 9, 'COMMENT', 1, 'Cau hoi trung lap nhieu lan trong bai hoc.', 'RESOLVED', 2, '2026-06-03 09:00:00', '2026-06-10 10:00:00'),
(4, 11, 'REVIEW', 4, 'Review co noi dung khong lien quan den khoa hoc.', 'DISMISSED', 3, '2026-06-04 09:00:00', '2026-06-08 10:00:00');

-- 37. user_streaks
INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_activity_date) VALUES
(7, 18, 30, '2026-06-28'),
(8, 4, 12, '2026-06-25'),
(9, 0, 9, '2026-06-10'),
(10, 0, 3, '2026-03-13'),
(11, 25, 25, '2026-06-28'),
(12, 6, 14, '2026-06-27'),
(14, 2, 8, '2026-06-26'),
(15, 1, 5, '2026-06-23');

-- 38. badges
INSERT INTO badges (id, name, description, icon_url, requirement_type, requirement_value) VALUES
(1, 'Nguoi moi cham chi', 'Hoan thanh 5 bai hoc dau tien.', 'https://cdn.chineselearning.vn/badges/lesson-5.png', 'LESSON_COMPLETED', 5),
(2, 'Chinh phuc quiz dau tien', 'Dat diem qua 3 bai quiz.', 'https://cdn.chineselearning.vn/badges/quiz-3.png', 'QUIZ_PASSED', 3),
(3, 'Chuoi 7 ngay', 'Hoc lien tiep 7 ngay.', 'https://cdn.chineselearning.vn/badges/streak-7.png', 'STREAK_DAYS', 7),
(4, 'Vuot moc HSK 1', 'Hoan thanh de mo phong HSK 1.', 'https://cdn.chineselearning.vn/badges/hsk1.png', 'HSK_PASSED', 1);

-- 39. user_badges
INSERT INTO user_badges (user_id, badge_id, earned_at) VALUES
(7, 1, '2026-03-10 18:00:00'),
(7, 2, '2026-03-12 18:00:00'),
(7, 3, '2026-03-15 18:00:00'),
(9, 1, '2026-03-14 18:00:00'),
(9, 4, '2026-05-01 18:05:00'),
(11, 1, '2026-03-20 18:00:00'),
(11, 2, '2026-04-02 18:00:00'),
(11, 3, '2026-04-05 18:00:00'),
(12, 1, '2026-04-05 18:00:00');

-- 40. course_reviews
INSERT INTO course_reviews (id, course_id, user_id, rating, comment, created_at, updated_at) VALUES
(1, 1, 7, 5, 'Bai giang de hieu, phan chao hoi ap dung duoc ngay trong cong viec.', '2026-04-02 09:00:00', '2026-04-02 09:00:00'),
(2, 1, 8, 4, 'Noi dung tot, mong co them bai nghe cham hon cho nguoi moi.', '2026-03-20 09:00:00', '2026-03-20 09:00:00'),
(3, 2, 9, 5, 'Lo trinh HSK 1 ro rang, quiz sat voi tu vung da hoc.', '2026-05-02 09:00:00', '2026-05-02 09:00:00'),
(4, 4, 12, 4, 'Tu vung nha may thuc te, phu hop voi nguoi di lam theo ca.', '2026-04-06 09:00:00', '2026-04-06 09:00:00'),
(5, 8, 11, 5, 'Bai nghe ngan nhung rat hieu qua de luyen phan xa.', '2026-05-08 09:00:00', '2026-05-08 09:00:00');

-- 41. lesson_qa
INSERT INTO lesson_qa (id, lesson_id, user_id, parent_id, content, is_resolved, created_at) VALUES
(1, 1, 7, NULL, 'Em hay nham thanh 2 va thanh 3, co cach luyen nao nhanh hon khong?', TRUE, '2026-03-02 10:00:00'),
(2, 1, 4, 1, 'Em hay doc cap tu ma2 - ma3 cham lai va ghi am so sanh moi ngay 5 phut.', TRUE, '2026-03-02 10:20:00'),
(3, 6, 9, NULL, 'Khi noi ngay thang co can them hao sau ngay khong a?', TRUE, '2026-03-12 10:00:00'),
(4, 6, 4, 3, 'Co, khi noi ngay trong thang em dung hao, vi du san yue ba hao.', TRUE, '2026-03-12 10:15:00'),
(5, 13, 12, NULL, 'Tu "bao ho lao dong" noi nhu the nao trong nha may?', FALSE, '2026-04-02 10:00:00'),
(6, 29, 11, NULL, 'Audio bai an uong co transcript khong?', TRUE, '2026-05-06 10:00:00'),
(7, 29, 4, 6, 'Co, em tai file transcript o muc tai lieu cua bai hoc.', TRUE, '2026-05-06 10:10:00');

-- 42. referrals
INSERT INTO referrals (id, referrer_id, referred_user_id, status, reward_granted, created_at) VALUES
(1, 7, 8, 'PURCHASED', TRUE, '2026-03-03 07:40:00'),
(2, 7, 9, 'PURCHASED', TRUE, '2026-03-10 07:40:00'),
(3, 11, 14, 'REGISTERED', FALSE, '2026-04-10 07:40:00'),
(4, 8, 15, 'REGISTERED', FALSE, '2026-05-15 07:40:00');

ALTER TABLE roles AUTO_INCREMENT = 5;
ALTER TABLE permissions AUTO_INCREMENT = 15;
ALTER TABLE categories AUTO_INCREMENT = 7;
ALTER TABLE tags AUTO_INCREMENT = 9;
ALTER TABLE plans AUTO_INCREMENT = 4;
ALTER TABLE users AUTO_INCREMENT = 16;
ALTER TABLE verification_tokens AUTO_INCREMENT = 6;
ALTER TABLE courses AUTO_INCREMENT = 9;
ALTER TABLE chapters AUTO_INCREMENT = 17;
ALTER TABLE lessons AUTO_INCREMENT = 33;
ALTER TABLE lesson_documents AUTO_INCREMENT = 9;
ALTER TABLE quizzes AUTO_INCREMENT = 13;
ALTER TABLE questions AUTO_INCREMENT = 25;
ALTER TABLE answers AUTO_INCREMENT = 63;
ALTER TABLE assignments AUTO_INCREMENT = 7;
ALTER TABLE course_enrollments AUTO_INCREMENT = 12;
ALTER TABLE lesson_progress AUTO_INCREMENT = 15;
ALTER TABLE quiz_attempts AUTO_INCREMENT = 9;
ALTER TABLE student_answers AUTO_INCREMENT = 16;
ALTER TABLE user_chapter_progress AUTO_INCREMENT = 11;
ALTER TABLE user_lesson_progress AUTO_INCREMENT = 15;
SET @user_quiz_attempts_exists = (
    SELECT COUNT(*)
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
      AND table_name = 'user_quiz_attempts'
);
SET @sql = IF(
    @user_quiz_attempts_exists > 0,
    'ALTER TABLE user_quiz_attempts AUTO_INCREMENT = 9',
    'SELECT ''Skipping user_quiz_attempts AUTO_INCREMENT: table does not exist in this database.'' AS seed_warning'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
ALTER TABLE assignment_submissions AUTO_INCREMENT = 6;
ALTER TABLE certificates AUTO_INCREMENT = 4;
ALTER TABLE coupons AUTO_INCREMENT = 4;
ALTER TABLE subscriptions AUTO_INCREMENT = 8;
ALTER TABLE invoices AUTO_INCREMENT = 8;
ALTER TABLE payments AUTO_INCREMENT = 7;
ALTER TABLE refunds AUTO_INCREMENT = 5;
ALTER TABLE audit_logs AUTO_INCREMENT = 6;
ALTER TABLE notifications AUTO_INCREMENT = 6;
ALTER TABLE reports AUTO_INCREMENT = 5;
ALTER TABLE badges AUTO_INCREMENT = 5;
ALTER TABLE course_reviews AUTO_INCREMENT = 6;
ALTER TABLE lesson_qa AUTO_INCREMENT = 8;
ALTER TABLE referrals AUTO_INCREMENT = 5;
