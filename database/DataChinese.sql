USE chinese_online_learning;

SET NAMES utf8mb4;

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

-- 6. users
INSERT INTO users (id, full_name, email, password_hash, status, total_learning_points, referral_code, created_at, updated_at) VALUES
(1, 'Nguyen Minh Quan', 'admin@chineselearning.vn', '$2a$10$gkT/LMKGX1C.qF7WtYYUPO1QLh.APSzK2TRRpKygBWbk6ku5IRvu6', 'ACTIVE', 0, 'REFADMIN001', '2026-01-02 08:00:00', '2026-06-20 08:00:00'),
(2, 'Tran Thu Ha', 'moderator.ha@chineselearning.vn', '$2a$10$gkT/LMKGX1C.qF7WtYYUPO1QLh.APSzK2TRRpKygBWbk6ku5IRvu6', 'ACTIVE', 120, 'REFMOD002', '2026-01-03 09:00:00', '2026-06-20 09:00:00'),
(3, 'Le Anh Tuan', 'moderator.tuan@chineselearning.vn', '$2a$10$gkT/LMKGX1C.qF7WtYYUPO1QLh.APSzK2TRRpKygBWbk6ku5IRvu6', 'LOCKED', 80, 'REFMOD003', '2026-01-04 09:30:00', '2026-06-18 09:30:00'),
(4, 'Pham Linh Chi', 'teacher.chi@chineselearning.vn', '$2a$10$gkT/LMKGX1C.qF7WtYYUPO1QLh.APSzK2TRRpKygBWbk6ku5IRvu6', 'ACTIVE', 900, 'REFTEA004', '2026-01-05 10:00:00', '2026-06-21 10:00:00'),
(5, 'Hoang Duc Huy', 'teacher.huy@chineselearning.vn', '$2a$10$gkT/LMKGX1C.qF7WtYYUPO1QLh.APSzK2TRRpKygBWbk6ku5IRvu6', 'ACTIVE', 760, 'REFTEA005', '2026-01-06 10:30:00', '2026-06-21 10:30:00'),
(6, 'Dang Ngoc Mai', 'teacher.mai@chineselearning.vn', '$2a$10$gkT/LMKGX1C.qF7WtYYUPO1QLh.APSzK2TRRpKygBWbk6ku5IRvu6', 'DELETED', 450, 'REFTEA006', '2026-01-07 11:00:00', '2026-06-10 11:00:00'),
(7, 'Bui Khanh Linh', 'linh.bui@example.com', '$2a$10$gkT/LMKGX1C.qF7WtYYUPO1QLh.APSzK2TRRpKygBWbk6ku5IRvu6', 'ACTIVE', 1450, 'REFSTU007', '2026-02-01 08:00:00', '2026-06-27 08:00:00'),
(8, 'Vo Thanh Nam', 'nam.vo@example.com', 'Namvo123', 'ACTIVE', 980, 'REFSTU008', '2026-02-02 08:10:00', '2026-06-26 08:10:00'),
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
INSERT INTO courses (id, teacher_id, category_id, title, description, price, thumbnail_url, status, created_at, updated_at) VALUES
(1, 4, 1, 'Tiếng Trung giao tiếp cho Nhân viên Sales (Cơ bản)', 'Hoc chao hoi, gioi thieu ban than, hoi duong va cac mau cau hang ngay.', 199000.00, 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80', 'PUBLISHED', '2026-02-10 08:00:00', '2026-06-10 08:00:00'),
(2, 4, 2, 'HSK 1 tu con so 0', 'Lo trinh HSK 1 voi 150 tu vung, ngu phap nen tang va de luyen tap.', 199000.00, 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80', 'PUBLISHED', '2026-02-12 08:00:00', '2026-06-11 08:00:00'),
(3, 5, 2, 'HSK 2 cap toc', 'On tap tu vung HSK 2, nghe hieu va doc hieu theo cau truc de thi.', 499000.00, 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80', 'PUBLISHED', '2026-02-14 08:00:00', '2026-06-12 08:00:00'),
(4, 5, 4, 'Tieng Trung cho cong nhan nha may', 'Tu vung an toan lao dong, ca kip, may moc va trao doi voi quan ly Trung Quoc.', 499000.00, 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80', 'PUBLISHED', '2026-02-16 08:00:00', '2026-06-13 08:00:00'),
(5, 4, 3, 'Tieng Trung thuong mai ung dung', 'Hoi hop, email, bao gia, dam phan va cham soc khach hang bang tieng Trung.', 1499000.00, 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80', 'PENDING', '2026-03-01 08:00:00', '2026-06-14 08:00:00'),
(6, 6, 6, 'Phat am Pinyin chuan ngay tu dau', 'Luyen thanh mau, van mau, thanh dieu va sua loi phat am pho bien.', 199000.00, 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80', 'DRAFT', '2026-03-03 08:00:00', '2026-06-15 08:00:00'),
(7, 5, 5, 'Ngu phap tieng Trung cho nguoi moi', 'Giai thich cac mau cau co ban voi vi du thuc te trong giao tiep.', 199000.00, 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80', 'HIDDEN', '2026-03-05 08:00:00', '2026-06-16 08:00:00'),
(8, 4, 6, 'Nghe noi tieng Trung moi ngay', 'Bai nghe ngan theo chu de va bai tap phan xa hoi thoai.', 199000.00, 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80', 'PUBLISHED', '2026-03-07 08:00:00', '2026-06-17 08:00:00'),
(9, 4, 2, 'Mini HSK 1 5K', 'Khoa hoc mini gia 5.000 VND de test thanh toan PayOS va on nhanh Pinyin, chao hoi, so dem HSK 1.', 5000.00, 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80', 'PUBLISHED', '2026-07-01 08:00:00', '2026-07-01 08:00:00');

-- 12. course_tags
INSERT INTO course_tags (course_id, tag_id) VALUES
(1, 1), (1, 4), (1, 5), (2, 1), (2, 2), (2, 7), (3, 3), (3, 5), (4, 4), (4, 8),
(5, 6), (5, 4), (6, 1), (6, 5), (7, 2), (7, 7), (8, 4), (8, 5), (9, 1), (9, 2);

-- 13. chapters
INSERT INTO chapters (id, course_id, title, order_index) VALUES
(1, 1, 'Làm quen với môi trường làm việc', 1),
(2, 1, 'Giới thiệu bản thân với khách hàng', 2),
(3, 1, 'Thu thập thông tin khách hàng', 3),
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
(16, 8, 'Phan xa hoi thoai ngan', 2),
(17, 9, 'Mini HSK 1 trong 30 phut', 1);

-- 14. lessons
INSERT INTO lessons (id, chapter_id, title, video_url, duration_seconds, order_index) VALUES
(1, 1, 'Gặp lễ tân', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784137456/B%E1%BB%91i_c%E1%BA%A3nh_H%C3%B4m_nay_l%C3%A0_ng%C3%A0y_%C4%91%E1%BA%A7u_qqe6xj.mp4', 720, 1),
(2, 1, 'Gặp trưởng nhóm', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784174625/phi%C3%AAn_%C3%A2m_ti%E1%BA%BFng_vi%E1%BB%87t_n%E1%BB%AFa_gvmbku.mp4', 840, 2),
(35, 1, 'Gặp đồng nghiệp', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784174679/ti%C3%AAng_trung_pinyin_v%E1%BB%9Bi_phi_eexi8e.mp4', 900, 3),
(3, 2, 'Giới thiệu tên, vị trí, công việc', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784051322/c%C3%A1i_ph%E1%BA%A7n_phi%C3%AAn_%C3%A2m_ti%E1%BA%BFng_vi%E1%BB%87t_b_mgsgze.mp4', 900, 1),
(4, 2, 'Giới thiệu công ty', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784136039/B%E1%BB%91i_c%E1%BA%A3nh_Sau_khi_gi%E1%BB%9Bi_thi%E1%BB%87u_b_rknava.mp4', 960, 2),
(5, 3, 'Hỏi thông tin cá nhân của khách hàng', 'https://cdn.chineselearning.vn/videos/lesson-005.mp4', 780, 1),
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
(32, 16, 'Phan xa dat mon tai nha hang', 'https://cdn.chineselearning.vn/videos/lesson-032.mp4', 850, 2),
(33, 17, 'Pinyin va chao hoi sieu nhanh', 'https://cdn.chineselearning.vn/videos/lesson-033.mp4', 600, 1),
(34, 17, 'So dem va mau cau HSK 1 can biet', 'https://cdn.chineselearning.vn/videos/lesson-034.mp4', 720, 2);

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
INSERT INTO quizzes (id, title, teacher_id, lesson_id, chapter_id, time_limit_minutes, pass_score, created_at) VALUES
(3, 'Dien tu vung so dem', 6, NULL, 10, 70, '2026-02-12 10:00:00'),
(4, 'Noi tu HSK 1', NULL, 4, 15, 70, '2026-02-12 10:10:00'),
(5, 'Nghe hieu HSK 2 tranh anh', 11, NULL, 20, 70, '2026-02-14 10:00:00'),
(6, 'De mo phong HSK 1', NULL, 4, 35, 60, '2026-02-12 11:00:00'),
(7, 'Quiz tu vung nha may', 13, NULL, 10, 60, '2026-02-16 10:00:00'),
(8, 'Quiz bao cao su co', 15, NULL, 15, 70, '2026-02-16 10:10:00'),
(9, 'Quiz email thuong mai', 18, NULL, 15, 70, '2026-03-01 10:00:00'),
(10, 'Noi cap thanh dieu Pinyin', 23, NULL, 10, 70, '2026-03-03 10:00:00'),
(11, 'Quiz nghe chu de an uong', 29, NULL, 15, 70, '2026-03-07 10:00:00'),
(12, 'Quiz phan xa dat mon', 32, NULL, 12, 60, '2026-03-07 10:10:00');

-- 17. questions
INSERT INTO questions (id, quiz_id, question_type, content, audio_url, points, order_index) VALUES
(5, 3, 'FILL_IN_BLANK', 'Dien pinyin cho so 8: ___', NULL, 10, 1),
(6, 3, 'FILL_IN_BLANK', 'Dien tieng Trung pinyin cho "hom nay": ___', NULL, 10, 2),
(7, 4, 'MATCHING', 'Noi tu tieng Trung voi nghia tieng Viet tuong ung.', NULL, 10, 1),
(8, 4, 'MATCHING', 'Noi cum tu hoi dap HSK 1 voi chuc nang giao tiep.', NULL, 10, 2),
(9, 5, 'LISTENING_CHOICE', 'Nghe audio va chon noi dung nguoi noi muon mua.', 'https://cdn.chineselearning.vn/audio/hsk2-shopping-001.mp3', 10, 1),
(10, 5, 'LISTENING_CHOICE', 'Nghe audio va chon thoi gian hen gap.', 'https://cdn.chineselearning.vn/audio/hsk2-time-002.mp3', 10, 2),
(11, 6, 'SINGLE_CHOICE', 'Trong HSK 1, "wo" nghia la gi?', NULL, 10, 1),
(12, 6, 'SINGLE_CHOICE', 'Chon cau dung de hoi "ban la ai?"', NULL, 10, 2),
(13, 7, 'SINGLE_CHOICE', 'An toan lao dong trong tieng Trung thuong noi la gi?', NULL, 10, 1),
(14, 7, 'SINGLE_CHOICE', 'Tu nao lien quan den "may moc"?', NULL, 10, 2),
(15, 8, 'LISTENING_CHOICE', 'Nghe audio va chon su co duoc bao cao.', 'https://cdn.chineselearning.vn/audio/factory-incident-001.mp3', 10, 1),
(16, 8, 'LISTENING_CHOICE', 'Nghe audio va chon hanh dong can lam tiep theo.', 'https://cdn.chineselearning.vn/audio/factory-action-002.mp3', 10, 2),
(17, 9, 'FILL_IN_BLANK', 'Dien tu con thieu trong cau email: Qing ___ huiyi shijian.', NULL, 10, 1),
(18, 9, 'FILL_IN_BLANK', 'Dien tu phu hop: Wo xiang ___ yixia baojia.', NULL, 10, 2),
(19, 10, 'MATCHING', 'Noi thanh dieu voi ky hieu dung.', NULL, 10, 1),
(20, 10, 'MATCHING', 'Noi bien dieu voi vi du dung.', NULL, 10, 2),
(21, 11, 'LISTENING_CHOICE', 'Nghe audio va chon mon an duoc goi.', 'https://cdn.chineselearning.vn/audio/food-001.mp3', 10, 1),
(22, 11, 'LISTENING_CHOICE', 'Nghe audio va chon do uong duoc nhac den.', 'https://cdn.chineselearning.vn/audio/drink-002.mp3', 10, 2),
(23, 12, 'MULTIPLE_CHOICE', 'Nhung cau nao dung khi goi mon?', NULL, 10, 1),
(24, 12, 'MULTIPLE_CHOICE', 'Nhung cau nao dung de yeu cau thanh toan?', NULL, 10, 2);

-- 18. answers
INSERT INTO answers (id, question_id, content, is_correct, matching_pair) VALUES
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
(4, 9, 3, 100, TRUE, '2026-03-12 09:00:00', '2026-03-12 09:07:00', 'SUBMITTED'),
(5, 10, 7, 20, FALSE, '2026-03-13 09:00:00', '2026-03-13 09:05:00', 'CHEATING_SUSPECTED'),
(6, 11, 6, 85, TRUE, '2026-04-02 09:00:00', '2026-04-02 09:30:00', 'SUBMITTED'),
(7, 11, 11, 75, TRUE, '2026-05-06 09:00:00', '2026-05-06 09:12:00', 'SUBMITTED'),
(8, 12, 8, 70, TRUE, '2026-04-03 09:00:00', '2026-04-03 09:14:00', 'SUBMITTED');

-- 23. student_answers
INSERT INTO student_answers (id, attempt_id, question_id, selected_answer_id, input_text, is_correct) VALUES
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
INSERT INTO user_quiz_attempts (id, user_id, quiz_id, score, is_passed, attempt_date) VALUES
(4, 9, 3, 100, TRUE, '2026-03-12 09:07:00'),
(5, 10, 7, 20, FALSE, '2026-03-13 09:05:00'),
(6, 11, 6, 85, TRUE, '2026-04-02 09:30:00'),
(7, 11, 11, 75, TRUE, '2026-05-06 09:12:00'),
(8, 12, 8, 70, TRUE, '2026-04-03 09:14:00');

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

-- 31. invoices
INSERT INTO invoices (id, user_id, course_id, coupon_id, original_amount, discount_amount, amount, status, created_at, updated_at) VALUES
(1, 7, 1, 1, 199000.00, 39800.00, 159200.00, 'PAID', '2026-03-01 07:50:00', '2026-03-01 07:55:00'),
(2, 8, 3, 2, 499000.00, 50000.00, 449000.00, 'PAID', '2026-03-03 07:50:00', '2026-03-03 07:55:00'),
(3, 9, 4, NULL, 499000.00, 0.00, 499000.00, 'FAILED', '2026-03-10 07:50:00', '2026-03-10 07:55:00'),
(4, 10, 2, NULL, 199000.00, 0.00, 199000.00, 'REFUNDED', '2026-03-12 07:50:00', '2026-03-13 10:00:00'),
(5, 11, 5, 3, 1499000.00, 449700.00, 1049300.00, 'PAID', '2026-03-15 07:50:00', '2026-03-15 07:55:00'),
(6, 12, 3, 2, 499000.00, 50000.00, 449000.00, 'PENDING', '2026-04-01 07:50:00', '2026-04-01 07:50:00'),
(7, 14, 8, NULL, 199000.00, 0.00, 199000.00, 'PAID', '2026-04-10 07:50:00', '2026-04-10 07:55:00');

-- 32. payments
INSERT INTO payments (id, invoice_id, provider, transaction_id, amount, status, raw_response, created_at) VALUES
(1, 1, 'VNPAY', 'VNPAY-20260301-0001', 159200.00, 'SUCCESS', JSON_OBJECT('courseId', 1, 'bankCode', 'NCB', 'responseCode', '00', 'message', 'Approved'), '2026-03-01 07:55:00'),
(2, 2, 'MOMO', 'MOMO-20260303-0002', 449000.00, 'SUCCESS', JSON_OBJECT('courseId', 3, 'partnerCode', 'MOMO', 'resultCode', 0, 'message', 'Successful'), '2026-03-03 07:55:00'),
(3, 3, 'STRIPE', 'STRIPE-20260310-0003', 499000.00, 'FAILED', JSON_OBJECT('courseId', 4, 'chargeId', 'ch_course_failed_0003', 'failureCode', 'card_declined'), '2026-03-10 07:55:00'),
(4, 4, 'VNPAY', 'VNPAY-20260312-0004', 199000.00, 'SUCCESS', JSON_OBJECT('courseId', 2, 'bankCode', 'VCB', 'responseCode', '00', 'message', 'Approved'), '2026-03-12 07:55:00'),
(5, 5, 'STRIPE', 'STRIPE-20260315-0005', 1049300.00, 'SUCCESS', JSON_OBJECT('courseId', 5, 'chargeId', 'ch_course_0005', 'currency', 'vnd', 'paid', true), '2026-03-15 07:55:00'),
(6, 7, 'MOMO', 'MOMO-20260410-0007', 199000.00, 'SUCCESS', JSON_OBJECT('courseId', 8, 'partnerCode', 'MOMO', 'resultCode', 0, 'message', 'Successful'), '2026-04-10 07:55:00');

-- 33. refunds
INSERT INTO refunds (id, payment_id, user_id, amount, reason, status, processed_by, created_at, processed_at) VALUES
(1, 4, 10, 199000.00, 'Hoc vien yeu cau hoan tien do trung lich lam viec.', 'PROCESSED', 2, '2026-03-13 09:00:00', '2026-03-13 10:00:00'),
(2, 2, 8, 449000.00, 'Yeu cau hoan tien khong dap ung dieu kien chinh sach.', 'REJECTED', 3, '2026-06-02 09:00:00', '2026-06-02 11:00:00'),
(3, 5, 11, 300000.00, 'Loi truy cap tam thoi trong ngay khai giang.', 'APPROVED', 1, '2026-03-16 09:00:00', '2026-03-16 11:00:00'),
(4, 1, 7, 100000.00, 'Can xem xet uu dai bo sung cho hoc vien gioi thieu ban be.', 'PENDING', NULL, '2026-06-20 09:00:00', NULL);

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
(2, 8, 'PAYMENT', 'Thanh toan thanh cong', 'Quyen truy cap khoa HSK 2 cap toc cua ban da duoc kich hoat.', TRUE, '2026-03-03 08:00:00'),
(3, 9, 'QUIZ', 'Diem quiz rat tot', 'Ban dat 100 diem trong bai Dien tu vung so dem.', FALSE, '2026-03-12 09:10:00'),
(4, 12, 'ASSIGNMENT', 'Bai nop can chinh sua', 'Giang vien da yeu cau bo sung noi dung cho bai Bao cao su co nha may.', FALSE, '2026-04-06 09:05:00'),
(5, 14, 'SYSTEM', 'Cap nhat khoa hoc', 'Khoa Nghe noi tieng Trung moi ngay vua co noi dung moi.', FALSE, '2026-05-09 08:00:00');

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

-- =========================================================
-- Latest migration seed: Chapter 3, Lesson 1
-- =========================================================

-- -------------------------------------------------------------
-- SEEDING DATA FOR CHAPTER 3, LESSON 1
-- -------------------------------------------------------------

-- Create Chapter 3 for Course 1 (Tieng Trung giao tiep co ban) if it doesn't exist
INSERT INTO chapters (course_id, title, order_index)
SELECT 1, 'Chương 3: Thu thập thông tin khách hàng', 3
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM chapters WHERE course_id = 1 AND order_index = 3
);

-- Store the chapter id
SET @chapter_3_id = (SELECT id FROM chapters WHERE course_id = 1 AND order_index = 3 LIMIT 1);

-- Create Lesson 1 under Chapter 3 if it doesn't exist
INSERT INTO lessons (chapter_id, title, video_url, duration_seconds, order_index)
SELECT @chapter_3_id, 'Lesson 1 - Hỏi thông tin cá nhân của khách hàng', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1783833897/video1_r1i65s.mp4', 180, 1
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM lessons WHERE chapter_id = @chapter_3_id AND order_index = 1
);

-- Update the lesson video URL in case it already existed with default placeholder
UPDATE lessons
SET video_url = 'https://res.cloudinary.com/rir6b8kp/video/upload/v1783833897/video1_r1i65s.mp4'
WHERE chapter_id = @chapter_3_id AND order_index = 1;

-- Store the lesson id
SET @lesson_1_id = (SELECT id FROM lessons WHERE chapter_id = @chapter_3_id AND order_index = 1 LIMIT 1);

-- Seed Vocabularies (Flashcards) for Lesson 1
-- Delete existing first to make it re-runnable
DELETE FROM vocabularies WHERE lesson_id = @lesson_1_id;

INSERT INTO vocabularies (lesson_id, hanzi, pinyin, vietnamese_meaning, image_url, audio_url, order_index)
VALUES
(@lesson_1_id, '名字', 'míngzi', 'tên', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1783834344/T%C3%AAn_tplc0l.jpg', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1783834384/T%C3%AAn_df9p8x.mp3', 1),
(@lesson_1_id, '姓', 'xìng', 'họ (họ danh)', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1783834331/H%E1%BB%8D_a47jhh.jpg', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1783834370/H%E1%BB%8D_ljl0zb.mp3', 2),
(@lesson_1_id, '职务', 'zhíwù', 'chức vụ', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1783834326/Ch%E1%BB%A9c_v%E1%BB%A5_xlpnsn.jpg', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1783834364/Ch%E1%BB%A9c_v%E1%BB%A5_znovly.mp3', 3),
(@lesson_1_id, '经理', 'jīnglǐ', 'trưởng phòng (kinh doanh) / giám đốc', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1783834634/Tr%C6%B0%E1%BB%9Fng_ph%C3%B2ng_l3blgq.jpg', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1783834381/Tr%C6%B0%E1%BB%9Fng_ph%C3%B2ng_g2ozsb.mp3', 4),
(@lesson_1_id, '总经理', 'zǒngjīnglǐ', 'Tổng giám đốc', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1783834348/T%E1%BB%95ng_gi%C3%A1m_%C4%91%E1%BB%91c_b5xlff.jpg', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1783834388/T%E1%BB%95ng_gi%C3%A1m_%C4%91%E1%BB%91c_og83fk.mp3', 5),
(@lesson_1_id, '管理', 'guǎnlǐ', 'quản lý', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1783834630/Qu%E1%BA%A3n_l%C3%BD_ohfvd6.jpg', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1783834377/Qu%E1%BA%A3n_l%C3%BD_geeh2q.mp3', 6),
(@lesson_1_id, '员工', 'yuángōng', 'nhân viên', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1783834335/Nh%C3%A2n_vi%C3%AAn_gzrd62.jpg', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1783834373/Nh%C3%A2n_vi%C3%AAn_rxb9ie.mp3', 7),
(@lesson_1_id, '称呼', 'chēnghu', 'xưng hô', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1783834637/X%C6%B0ng_h%C3%B4_fbsnnz.jpg', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1783834391/X%C6%B0ng_h%C3%B4_porl4z.mp3', 8),
(@lesson_1_id, '公司', 'gōngsī', 'công ty', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1783834329/C%C3%B4ng_ty_ak4dxd.jpg', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1783834367/C%C3%B4ng_ty_lybysg.mp3', 9);

-- Seed Sentence Patterns for Lesson 1
DELETE FROM sentence_patterns WHERE lesson_id = @lesson_1_id;

-- Get the vocabulary ids for reference
SET @vocab_name_id = (SELECT id FROM vocabularies WHERE lesson_id = @lesson_1_id AND hanzi = '名字' LIMIT 1);
SET @vocab_pos_id = (SELECT id FROM vocabularies WHERE lesson_id = @lesson_1_id AND hanzi = '职务' LIMIT 1);
SET @vocab_resp_id = (SELECT id FROM vocabularies WHERE lesson_id = @lesson_1_id AND hanzi = '称呼' LIMIT 1);

INSERT INTO sentence_patterns (lesson_id, vocabulary_id, chinese_text, pinyin_text, vietnamese_meaning, audio_url, order_index)
VALUES
(@lesson_1_id, @vocab_name_id, '您叫什么名字？', 'Nín jiào shénme míngzi?', 'Anh/chị tên là gì?', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1783860596/M%E1%BA%ABu_c%C3%A2u_1_ijulk0.mp3', 1),
(@lesson_1_id, @vocab_pos_id, '您在公司担任什么职位？', 'Nín zài gōngsī dānrèn shénme zhíwèi?', 'Anh/chị đang giữ vị trí gì ở công ty?', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1783860596/M%E1%BA%ABu_c%C3%A2u_2_yyupnr.mp3', 2),
(@lesson_1_id, NULL, '您负责哪个部门？', 'Nín fùzé nǎge bùmén?', 'Anh/chị phụ trách bộ phận nào?', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1783860597/M%E1%BA%ABu_c%C3%A2u_3_cmaeg2.mp3', 3),
(@lesson_1_id, @vocab_resp_id, '我可以称呼您为阮经理吗？', 'Wǒ kěyǐ chēnghu nín wèi Ruǎn jīnglǐ ma?', 'Tôi xin phép được xưng hô với anh/chị là Trưởng phòng Nguyễn được không?', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1783860596/M%E1%BA%ABu_c%C3%A2u_4_ffehvg.mp3', 4);


-- Seed Quizzes for Lesson 1
DELETE FROM quizzes WHERE lesson_id = @lesson_1_id;

INSERT INTO quizzes (title, teacher_id, lesson_id, chapter_id, time_limit_minutes, pass_score)
VALUES ('Bài trắc nghiệm Lesson 1: Hỏi thông tin cá nhân', @lesson_1_id, @chapter_3_id, 10, 50);

SET @quiz_1_id = LAST_INSERT_ID();

-- Seed Questions for Quiz 1
DELETE FROM questions WHERE quiz_id = @quiz_1_id;

-- Question 1: Listening Choice (Nghe và chọn - "请问您在贵公司主要负责...")
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, meta_data, explanation)
VALUES (
    @quiz_1_id,
    'LISTENING_CHOICE',
    'Nghe đoạn âm thanh sau và chọn nghĩa tiếng Việt đúng của câu: "请问您在贵公司...?"',
    'https://res.cloudinary.com/rir6b8kp/video/upload/v1783834137/C%C3%A2u_h%E1%BB%8Fi_luy%E1%BB%87n_nghe_1_su1rpv.mp3',
    10,
    1,
    NULL,
    'Ý nghĩa hoàn chỉnh: Xin hỏi ngài chủ yếu phụ trách mảng nghiệp vụ nào tại quý công ty?'
);
SET @q1_id = LAST_INSERT_ID();

INSERT INTO answers (question_id, content, is_correct, order_index)
VALUES
(@q1_id, 'Xin hỏi anh/chị chủ yếu phụ trách công việc gì ở quý công ty?', TRUE, 1),
(@q1_id, 'Xin hỏi anh/chị tên là gì?', FALSE, 2),
(@q1_id, 'Xin hỏi công ty của anh/chị ở đâu?', FALSE, 3);


-- Question 2: Listening Choice (Nghe và chọn - "李先生是技术部の...")
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, meta_data, explanation)
VALUES (
    @quiz_1_id,
    'LISTENING_CHOICE',
    'Nghe đoạn âm thanh sau và chọn nghĩa tiếng Việt đúng của câu: "李先生 là bộ phận kỹ thuật của...?" (thực chất: "李先生是技术部的...")',
    'https://res.cloudinary.com/rir6b8kp/video/upload/v1783834140/C%C3%A2u_h%E1%BB%8Fi_luy%E1%BB%87n_nghe_2_spqogk.mp3',
    10,
    2,
    NULL,
    'Ý nghĩa hoàn chỉnh: Ông Lý là Quản lý của bộ phận kỹ thuật, anh ấy chịu trách nhiệm bảo trì hệ thống.'
);
SET @q2_id = LAST_INSERT_ID();

INSERT INTO answers (question_id, content, is_correct, order_index)
VALUES
(@q2_id, 'Ông Lý là trưởng phòng của bộ phận kỹ thuật.', TRUE, 1),
(@q2_id, 'Ông Lý là nhân viên bộ phận kinh doanh.', FALSE, 2),
(@q2_id, 'Ông Lý là tổng giám đốc công ty.', FALSE, 3);


-- Question 3: Listening Choice (Nghe và chọn - "阮先生，请问 tôi nên xưng hô như thế nào...?")
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, meta_data, explanation)
VALUES (
    @quiz_1_id,
    'LISTENING_CHOICE',
    'Nghe đoạn âm thanh sau và chọn nghĩa tiếng Việt đúng của câu: "阮先生，请问 tôi nên xưng hô như thế nào...?"',
    'https://res.cloudinary.com/rir6b8kp/video/upload/v1783834143/C%C3%A2u_h%E1%BB%8Fi_luy%E1%BB%87n_nghe_3_tqyapk.mp3',
    10,
    3,
    NULL,
    'Ý nghĩa hoàn chỉnh: Thưa ông Nguyễn, xin hỏi tôi nên xưng hô với ông như thế nào?'
);
SET @q3_id = LAST_INSERT_ID();

INSERT INTO answers (question_id, content, is_correct, order_index)
VALUES
(@q3_id, 'Thưa ông Nguyễn, xin hỏi tôi nên xưng hô với ông như thế nào?', TRUE, 1),
(@q3_id, 'Thưa ông Nguyễn, xin hỏi ông bao nhiêu tuổi?', FALSE, 2),
(@q3_id, 'Thưa ông Nguyễn, xin hỏi ông sống ở đâu?', FALSE, 3);


-- Question 4: Listening Dialogue Ordering (Sắp xếp hội thoại giao tiếp công sở)
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, meta_data, explanation)
VALUES (
    @quiz_1_id,
    'LISTENING_CHOICE',
    'Nghe đoạn hội thoại sau và sắp xếp các câu theo thứ tự',
    'https://res.cloudinary.com/rir6b8kp/video/upload/v1784005358/C%C3%A2u_h%E1%BB%8Fi_luy%E1%BB%87n_nghe_4_d7ice0.mp3',
    10,
    4,
    NULL,
    'Cuộc hội thoại bắt đầu bằng C, khi một người chủ động chào hỏi và xác nhận chức vụ của đối phương. Tiếp theo, A trả lời bằng cách giới thiệu tên, chức vụ và đưa danh thiếp. Sau khi nhận được thông tin, B đáp lại bằng lời chào lịch sự và tự giới thiệu bản thân cũng như công ty của mình. Dựa trên thông tin đó, D tiếp tục cuộc trò chuyện bằng cách hỏi về lĩnh vực kinh doanh của công ty. Cuối cùng, E trả lời trực tiếp câu hỏi ở câu D, giới thiệu rằng công ty chủ yếu phát triển phần mềm doanh nghiệp. Thứ tự này phù hợp với trình tự giao tiếp trong một buổi gặp gỡ và trao đổi danh thiếp trong môi trường công việc.'
);
SET @q4_id = LAST_INSERT_ID();

INSERT INTO answers (question_id, content, is_correct, order_index)
VALUES
(@q4_id, 'A → C → B → D → E', FALSE, 1),
(@q4_id, 'A → B → C → D → E', FALSE, 2),
(@q4_id, 'C → A → D → B → E', FALSE, 3),
(@q4_id, 'C → A → B → D → E', TRUE, 4);


-- Question 5 (Group 1 - Substitution MCQ 1):
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, meta_data, explanation)
VALUES (
    @quiz_1_id,
    'MULTIPLE_CHOICE',
    'Đối tác giao tiếp là người đại diện pháp luật cao nhất của công ty (Tổng giám đốc). Chọn từ thích hợp để hoàn thiện câu xã giao: "请问，我可以直接称呼您为张_____吗？"',
    NULL,
    10,
    5,
    NULL,
    '"总经理" (Tổng giám đốc) là danh xưng phù hợp nhất để xưng hô với người đứng đầu điều hành doanh nghiệp, thể hiện sự kính trọng đúng mực trong lễ nghi thương mại.'
);
SET @q5_id = LAST_INSERT_ID();

INSERT INTO answers (question_id, content, is_correct, order_index)
VALUES
(@q5_id, '职员 (zhíyuán)', FALSE, 1),
(@q5_id, '姓名 (xìngmíng)', FALSE, 2),
(@q5_id, '总经理 (zǒngjīnglǐ)', TRUE, 3),
(@q5_id, '负责 (fùzé)', FALSE, 4);


-- Question 6 (Group 1 - Substitution MCQ 2):
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, meta_data, explanation)
VALUES (
    @quiz_1_id,
    'MULTIPLE_CHOICE',
    'Khách hàng cho biết họ phụ trách mảng tuyển dụng và quản lý nhân sự. Chọn bộ phận thích hợp hoàn thành câu: "请问，您是_____ của nhà máy?" (thực chất: "请问，您是_____的经理吗？")',
    NULL,
    10,
    6,
    NULL,
    '"人力资源部" (Phòng Nhân sự) là bộ phận chịu trách nhiệm tuyển dụng và quản lý nguồn nhân lực.'
);
SET @q6_id = LAST_INSERT_ID();

INSERT INTO answers (question_id, content, is_correct, order_index)
VALUES
(@q6_id, '人力资源部 (rénlì zīyuán bù)', TRUE, 1),
(@q6_id, '软件部 (ruǎnjiàn bù)', FALSE, 2),
(@q6_id, '职务部 (zhíwù bù)', FALSE, 3),
(@q6_id, '名字部 (míngzǐ bù)', FALSE, 4);


-- Question 7 (Group 1 - Substitution MCQ 3):
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, meta_data, explanation)
VALUES (
    @quiz_1_id,
    'MULTIPLE_CHOICE',
    'Chọn động từ biểu thị việc nắm giữ một vai trò hoặc vị trí công vụ chính thức: "请问nắm giữ gì chức vụ?" (thực chất: "请问您在贵公司_____什么职务？")',
    NULL,
    10,
    7,
    NULL,
    'Cấu trúc kết hợp chuẩn mực trong tiếng Trung hành chính là "担任...职务" (đảm nhiệm chức vụ...).'
);
SET @q7_id = LAST_INSERT_ID();

INSERT INTO answers (question_id, content, is_correct, order_index)
VALUES
(@q7_id, '称呼 (chēnghu)', FALSE, 1),
(@q7_id, '负责 (fùzé)', FALSE, 2),
(@q7_id, '担任 (dānrèn)', TRUE, 3),
(@q7_id, '名字 (míngzi)', FALSE, 4);


-- Question 8 (Group 1 - Substitution MCQ 4):
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, meta_data, explanation)
VALUES (
    @quiz_1_id,
    'MULTIPLE_CHOICE',
    'Khách hàng là một nữ nhân viên trẻ tuổi chưa lập gia đình. Chọn danh xưng lịch thiệp phù hợp nhất hoàn thành câu: "请问，这位 là phòng mua sắm bộ phận Trần_____。" (thực chất: "请问，这位sắp là采购部の陈_____。")',
    NULL,
    10,
    8,
    NULL,
    '"小姐" (Tiểu thư/Cô) là danh xưng trang nhã truyền thống dành cho phụ nữ trẻ tuổi trong giao tiếp công sở.'
);
SET @q8_id = LAST_INSERT_ID();

INSERT INTO answers (question_id, content, is_correct, order_index)
VALUES
(@q8_id, '先生 (xiānshēng)', FALSE, 1),
(@q8_id, '小姐 (xiǎojiě)', TRUE, 2),
(@q8_id, '职务 (zhíwù)', FALSE, 3),
(@q8_id, '负责 (fùzé)', FALSE, 4);


-- Question 9 (Group 1 - Substitution MCQ 5):
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, meta_data, explanation)
VALUES (
    @quiz_1_id,
    'MULTIPLE_CHOICE',
    'Đối tác giới thiệu họ làm việc cho một cơ sở sản xuất quy mô lớn (Nhà máy). Chọn đơn vị phù hợp hoàn thành câu: "请问，您 là nhà máy này_____ người quản lý?" (thực chất: "请问，您是这家_____的管理者吗？")',
    NULL,
    10,
    9,
    NULL,
    '"工厂" (Nhà máy/Xưởng) là loại hình đơn vị sản xuất trực tiếp vật chất, tương ứng với vị trí Giám đốc nhà máy "厂长" (chǎngzhǎng).'
);
SET @q9_id = LAST_INSERT_ID();

INSERT INTO answers (question_id, content, is_correct, order_index)
VALUES
(@q9_id, '称呼 (chēnghu)', FALSE, 1),
(@q9_id, '工厂 (gōngchǎng)', TRUE, 2),
(@q9_id, '名字 (míngzi)', FALSE, 3),
(@q9_id, '职务 (zhíwù)', FALSE, 4);


-- Question 10 (Group 1 - Substitution MCQ 6):
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, meta_data, explanation)
VALUES (
    @quiz_1_id,
    'MULTIPLE_CHOICE',
    'Doanh nghiệp đối tác hoạt động trong ngành dịch vụ Logistics/Vận tải. Chọn danh từ thích hợp thay thế hoàn thành câu: "Chúng tôi công ty chủ yếu phụ trách_____ nghiệp vụ。" (thực chất: "我们公司主要负责_____业务。")',
    NULL,
    10,
    10,
    NULL,
    '"物流" (Logistics/Vận tải) là mảng dịch vụ lưu thông hàng hóa phổ biến trong chuỗi cung ứng thương mại.'
);
SET @q10_id = LAST_INSERT_ID();

INSERT INTO answers (question_id, content, is_correct, order_index)
VALUES
(@q10_id, '物流 (wùliú)', TRUE, 1),
(@q10_id, '职务 (zhíwù)', FALSE, 2),
(@q10_id, '称呼 (chēnghu)', FALSE, 3),
(@q10_id, '名字 (míngzi)', FALSE, 4);


-- Question 11 (Group 2 - Semantic & Phonetic MCQ 1):
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, meta_data, explanation)
VALUES (
    @quiz_1_id,
    'MULTIPLE_CHOICE',
    'Cho từ 职务 với phiên âm tương ứng là (zhíwù). Nghĩa tiếng Việt chuẩn xác nhất của từ này trong văn cảnh thương mại là gì?',
    NULL,
    10,
    11,
    NULL,
    '"职务" biểu thị vị trí công tác chính thức của một cá nhân trong tổ chức doanh nghiệp.'
);
SET @q11_id = LAST_INSERT_ID();

INSERT INTO answers (question_id, content, is_correct, order_index)
VALUES
(@q11_id, 'Tên riêng dùng để gọi đối tác', FALSE, 1),
(@q11_id, 'Chức vụ, vị trí công tác được phân công', TRUE, 2),
(@q11_id, 'Tên gọi đầy đủ của một doanh nghiệp', FALSE, 3),
(@q11_id, 'Trách nhiệm bồi thường hợp đồng', FALSE, 4);


-- Question 12 (Group 2 - Semantic & Phonetic MCQ 2):
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, meta_data, explanation)
VALUES (
    @quiz_1_id,
    'MULTIPLE_CHOICE',
    'Từ chỉ chức danh quản lý cao nhất doanh nghiệp 总经理 có phiên âm Pinyin chính xác là gì?',
    NULL,
    10,
    12,
    NULL,
    'Phiên âm chuẩn theo hệ thống Bính âm quốc tế của chữ "总经理" là zǒng jīng lǐ.'
);
SET @q12_id = LAST_INSERT_ID();

INSERT INTO answers (question_id, content, is_correct, order_index)
VALUES
(@q12_id, 'zhōng jīng lǐ', FALSE, 1),
(@q12_id, 'zōng jìn nǐ', FALSE, 2),
(@q12_id, 'zǒng jīng lǐ', TRUE, 3),
(@q12_id, 'zòng jǐng lǐ', FALSE, 4);


-- Question 13 (Group 2 - Semantic & Phonetic MCQ 3):
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, meta_data, explanation)
VALUES (
    @quiz_1_id,
    'MULTIPLE_CHOICE',
    'Trong câu "您目前负责哪个项目？", từ 负责 (fùzé) mang ý nghĩa nào dưới đây?',
    NULL,
    10,
    13,
    NULL,
    '"负责" (fùzé) là một động từ biểu thị hành vi chịu trách nhiệm chính trước một dự án hoặc bộ phận.'
);
SET @q13_id = LAST_INSERT_ID();

INSERT INTO answers (question_id, content, is_correct, order_index)
VALUES
(@q13_id, 'Tìm kiếm thông tin khách hàng mới', FALSE, 1),
(@q13_id, 'Đảm nhiệm, chịu trách nhiệm phụ trách mảng công việc', TRUE, 2),
(@q13_id, 'Ký kết biên bản nghiệm thu dự án', FALSE, 3),
(@q13_id, 'Đánh giá hiệu quả làm việc của nhân viên', FALSE, 4);


-- Question 14 (Group 2 - Semantic & Phonetic MCQ 4):
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, meta_data, explanation)
VALUES (
    @quiz_1_id,
    'MULTIPLE_CHOICE',
    'Từ chỉ hành vi xưng hô trong giao tiếp 称呼 có phiên âm Pinyin đúng là gì?',
    NULL,
    10,
    14,
    NULL,
    'Từ "称呼" có âm đọc chuẩn xác là chēnghu (với âm thứ hai đọc thanh nhẹ).'
);
SET @q14_id = LAST_INSERT_ID();

INSERT INTO answers (question_id, content, is_correct, order_index)
VALUES
(@q14_id, 'chènghū', FALSE, 1),
(@q14_id, 'chēnghu', TRUE, 2),
(@q14_id, 'chēnhú', FALSE, 3),
(@q14_id, 'shēnghǔ', FALSE, 4);


-- Question 15 (Group 2 - Semantic & Phonetic MCQ 5):
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, meta_data, explanation)
VALUES (
    @quiz_1_id,
    'MULTIPLE_CHOICE',
    'Cho hai từ 经理 (jīnglǐ) và 主管 (zhǔguǎn). Nhận định nào dưới đây phản ánh đúng sự khác biệt về vai trò quản lý của hai vị trí này?',
    NULL,
    10,
    15,
    NULL,
    'Trong cơ cấu doanh nghiệp Á Đông, "经理" biểu thị cấp quản lý bộ phận có quyền tự chủ lớn hơn so với "主管" - vị trí giám sát trực tiếp các đầu mục công việc nhỏ.'
);
SET @q15_id = LAST_INSERT_ID();

INSERT INTO answers (question_id, content, is_correct, order_index)
VALUES
(@q15_id, '经理 là nhân viên thực thi trực tiếp, còn 主管 là người đứng đầu toàn bộ tập đoàn.', FALSE, 1),
(@q15_id, '经理 (Trưởng phòng/Giám đốc) có thẩm quyền ký kết quyết định lớn hơn, còn 主管 (Quản lý/Giám sát) thường điều hành hoạt động của một nhóm công việc cụ thể.', TRUE, 2),
(@q15_id, 'Hai từ này hoàn toàn đồng nghĩa và có thể thay thế cho nhau trong mọi văn cảnh hành chính.', FALSE, 3),
(@q15_id, '主管 là chức danh chỉ dùng cho người nước ngoài, còn 经理 chỉ dùng cho nhân sự bản xứ.', FALSE, 4);


-- Question 16 (Group 2 - Semantic & Phonetic MCQ 6):
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, meta_data, explanation)
VALUES (
    @quiz_1_id,
    'MULTIPLE_CHOICE',
    'Từ 软件 với phiên âm tương ứng là (ruǎnjiàn) mang ý nghĩa nào dưới đây?',
    NULL,
    10,
    16,
    NULL,
    '"软件" (ruǎnjiàn) là thuật ngữ chuyên ngành công nghệ thông tin chỉ phần mềm máy tính hoặc phần mềm ứng dụng, phân biệt với phần cứng "硬件" (yìnjiàn).'
);
SET @q16_id = LAST_INSERT_ID();

INSERT INTO answers (question_id, content, is_correct, order_index)
VALUES
(@q16_id, 'Thiết bị phần cứng máy tính', FALSE, 1),
(@q16_id, 'Phần mềm công nghệ thông tin', TRUE, 2),
(@q16_id, 'Tài liệu hợp đồng bản cứng', FALSE, 3),
(@q16_id, 'Hệ thống mạng nội bộ công ty', FALSE, 4);


-- ========================================================
-- CHAPTER 2 LESSON 1 ADDITIONS (Lesson ID 3)
-- ========================================================

-- Vocabularies
INSERT INTO vocabularies (lesson_id, hanzi, pinyin, vietnamese_meaning, image_url, audio_url, order_index) VALUES
(3, '客户', 'kèhù', 'Khách hàng', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784051099/kh%C3%A1ch_h%C3%A0ng_gowqmh.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784051155/Kh%C3%A1ch_h%C3%A0ng_g9ljtd.mp3', 1),
(3, '您好', 'nín hǎo', 'Xin chào (lịch sự)', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784051100/l%E1%BB%8Bch_s%E1%BB%B1_l6xogl.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784051161/Xin_ch%C3%A0o_l%E1%BB%8Bch_s%E1%BB%B1_bt7upl.mp3', 2),
(3, '请问', 'qǐngwèn', 'Xin hỏi', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784051103/xin_h%E1%BB%8Fi_fhqpwg.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784051160/Xin_h%E1%BB%8Fi_qawxno.mp3', 3),
(3, '叫', 'jiào', 'Tên là, gọi là', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784051099/h%E1%BB%8Fi_t%C3%AAn_h428yk.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784051158/T%C3%AAn_l%C3%A0_g%E1%BB%8Di_l%C3%A0_uzhvay.mp3', 4),
(3, '什么', 'shénme', 'Gì', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784051099/g%C3%AC_lixmnt.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784051154/g%C3%AC_ehgjn5.mp3', 5),
(3, '名字', 'míngzi', 'Tên', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784051102/t%C3%AAn_dvvvnj.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784051159/t%C3%AAn_gunwh9.mp3', 6),
(3, '我叫', 'wǒ jiào', 'Tôi tên là', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784051102/t%C3%B4i_l%C3%A0_vvvkqx.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784051159/t%C3%AAn_t%C3%B4i_l%C3%A0_f9eufp.mp3', 7),
(3, '担任', 'dānrèn', 'Đảm nhiệm, giữ chức vụ', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784051103/%C4%91%E1%BA%A3m_nhi%E1%BB%87m_al97le.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784051161/%C4%90%E1%BA%A3m_nhi%E1%BB%87m_gi%E1%BB%AF_ch%E1%BB%A9c_v%E1%BB%A5_jibfdb.mp3', 8),
(3, '职位', 'zhíwèi', 'Chức vụ', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784051099/ch%E1%BB%A9c_v%E1%BB%A5_ibepsn.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784051154/Ch%E1%BB%A9c_v%E1%BB%A5_ar9e8h.mp3', 9),
(3, '我是', 'wǒ shì', 'Tôi là', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784051102/t%C3%B4i_l%C3%A0_vvvkqx.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784051159/t%C3%B4i_l%C3%A0_vyu8cy.mp3', 10),
(3, '销售经理', 'xiāoshòu jīnglǐ', 'Quản lý kinh doanh', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784051101/qu%E1%BA%A3n_l%C3%BD_kinh_doanh_itqmlv.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784051157/Qu%E1%BA%A3n_l%C3%BD_kinh_doanh_m5b47r.mp3', 11),
(3, '负责', 'fùzé', 'Phụ trách', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784051101/ph%E1%BB%A5_tr%C3%A1ch_wrxoge.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784051156/ph%E1%BB%A5_tr%C3%A1ch_d0ndjs.mp3', 12),
(3, '客户服务', 'kèhù fúwù', 'Chăm sóc khách hàng', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784051098/ch%C4%83m_s%C3%B3c_kh%C3%A1ch_h%C3%A0ng_bsidex.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784051153/Ch%C4%83m_s%C3%B3c_kh%C3%A1ch_h%C3%A0ng_c6u48q.mp3', 13),
(3, '很高兴', 'hěn gāoxìng', 'Rất vui', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784051101/r%E1%BA%A5t_vui_ofzobr.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784051157/R%E1%BA%A5t_vui_spfh7w.mp3', 14),
(3, '认识', 'rènshi', 'Làm quen, gặp gỡ', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784051100/l%C3%A0m_quen_engije.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784051155/L%C3%A0m_quen_g%E1%BA%B7p_g%E1%BB%A1_iizv7b.mp3', 15);

-- Sentence Patterns
INSERT INTO sentence_patterns (lesson_id, chinese_text, pinyin_text, vietnamese_meaning, audio_url, order_index) VALUES
(3, '您好！我叫王明。', 'Nín hǎo! Wǒ jiào Wáng Míng.', 'Xin chào! Tôi tên là Vương Minh.', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784051196/MC1-1_iib2zz.mp3', 1),
(3, '您好！我叫王明，是负责这次项目的新员工。', 'Nín hǎo! Wǒ jiào Wáng Míng, shì fùzé zhè cì xiàngmù de xīn yuángōng.', 'Xin chào! Tôi tên là Vương Minh, là nhân viên mới đảm nhiệm dự án lần này.', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784051196/MC1-2_xprizj.mp3', 2),
(3, '我是销售经理，负责客户服务。', 'Wǒ shì xiāoshòu jīnglǐ, fùzé kèhù fúwù.', 'Tôi là quản lý kinh doanh, phụ trách chăm sóc khách hàng.', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784051196/MC2-1_vtop2a.mp3', 3),
(3, '他在公司担任销售经理，主要负责客户服务。', 'Tā zài gōngsī dānrèn xiāoshòu jīnglǐ, zhǔyào fùzé kèhù fúwù.', 'Anh ấy đảm nhiệm chức vụ quản lý kinh doanh tại công ty, chịu trách nhiệm chính về mảng chăm sóc khách hàng.', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784051197/MC2-2_vvy4no.mp3', 4);

-- Quiz
INSERT INTO quizzes (title, teacher_id, lesson_id, time_limit_minutes, pass_score) VALUES
('Trắc nghiệm Chapter 2 Lesson 1', 4, 3, 15, 50);
SET @c2_l1_quiz_id = LAST_INSERT_ID();

-- Quiz Questions & Answers

-- Question 1
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c2_l1_quiz_id, 'SINGLE_CHOICE', '您好！我________兰。', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784051268/ph%C3%A2n_%C4%91o%E1%BA%A1n_1_p0tbei.mp3', 10, 1, 'Động từ ''叫'' (gọi là/tên là) dùng để tự giới thiệu tên riêng một cách tự nhiên và lịch sự trong giao tiếp thương mại.');
SET @q1_c2l1_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q1_c2l1_id, 'A. 叫 (jiào)', TRUE, 1),
(@q1_c2l1_id, 'B. 是 (shì)', FALSE, 2),
(@q1_c2l1_id, 'C. 负责 (fùzé)', FALSE, 3),
(@q1_c2l1_id, 'D. 认识 (rènshi)', FALSE, 4);

-- Question 2
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c2_l1_quiz_id, 'SINGLE_CHOICE', '我是AB公司的________。', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784051270/ph%C3%A2n_%C4%91o%E1%BA%A1n_2_mui4sr.mp3', 10, 2, 'Từ khóa ''销售员'' (nhân viên kinh doanh/sales) bổ nghĩa cho thuộc sở hữu của công ty AB biểu thị chính xác vai trò chức vụ.');
SET @q2_c2l1_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q2_c2l1_id, 'A. 客户 (kèhù)', FALSE, 1),
(@q2_c2l1_id, 'B. 销售员 (xiāoshòuyuán)', TRUE, 2),
(@q2_c2l1_id, 'C. 主管 (zhǔguǎn)', FALSE, 3),
(@q2_c2l1_id, 'D. 经理 (jīnglǐ)', FALSE, 4);

-- Question 3
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c2_l1_quiz_id, 'SINGLE_CHOICE', '很高兴________nhi/tỉ/tù (chữ dịch/pinyin: 你)。', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784051270/ph%C3%A2n_%C4%91o%E1%BA%A1n_3_l1rdcf.mp3', 10, 3, 'Cụm bổ ngữ liên kết ''很高兴见到你'' (Rất vui được gặp bạn) là khẩu ngữ xã giao bắt buộc để mở đầu mối quan hệ hợp tác.');
SET @q3_c2l1_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q3_c2l1_id, 'A. 见到 (jiàndào)', TRUE, 1),
(@q3_c2l1_id, 'B. 谢谢 (xièxie)', FALSE, 2),
(@q3_c2l1_id, 'C. 担任 (dānrèn)', FALSE, 3),
(@q3_c2l1_id, 'D. 负责 (fùzé)', FALSE, 4);

-- Question 4
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c2_l1_quiz_id, 'SINGLE_CHOICE', '我________客户咨询和支持。', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784051271/ph%C3%A2n_%C4%91o%E1%BA%A1n_4_nswbxz.mp3', 10, 4, 'Động từ ''负责'' (phụ trách/chịu trách nhiệm về) đi liền trước danh từ chỉ mảng công việc để giới thiệu nghĩa vụ chuyên môn của mình.');
SET @q4_c2l1_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q4_c2l1_id, 'A. 叫 (jiào)', FALSE, 1),
(@q4_c2l1_id, 'B. 担任 (dānrèn)', FALSE, 2),
(@q4_c2l1_id, 'C. 负责 (fùzé)', TRUE, 3),
(@q4_c2l1_id, 'D. 很高兴 (hěn gāoxìng)', FALSE, 4);

-- Question 5
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c2_l1_quiz_id, 'SINGLE_CHOICE', '我负责________咨询 và hỗ trợ (chữ dịch: 咨询和支持)。', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784051272/ph%C3%A2n_%C4%91o%E1%BA%A1n_5_y0yvsy.mp3', 10, 5, 'Danh từ ''客户'' (khách hàng) kết hợp với cụm ''咨询 và hỗ trợ'' tạo thành thuật ngữ ngành dịch vụ thương mại ''tư vấn và hỗ trợ khách hàng''.');
SET @q5_c2l1_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q5_c2l1_id, 'A. 公司 (gōngsī)', FALSE, 1),
(@q5_c2l1_id, 'B. 职位 (zhíwèi)', FALSE, 2),
(@q5_c2l1_id, 'C. 销售 (xiāoshòu)', FALSE, 3),
(@q5_c2l1_id, 'D. 客户 (kèhù)', TRUE, 4);

-- Question 6
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c2_l1_quiz_id, 'SINGLE_CHOICE', 'Từ “来自” có ý nghĩa là gì trong câu giới thiệu nguồn gốc doanh nghiệp hoặc quê hương?', NULL, 10, 6, '“来自” (láizì) mang nghĩa là ''đến từ'', dùng để giới thiệu xuất xứ công ty (Ví dụ: 我来自AB公司 - Tôi đến từ công ty AB).');
SET @q6_c2l1_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q6_c2l1_id, 'A. Đến từ', TRUE, 1),
(@q6_c2l1_id, 'B. Làm việc', FALSE, 2),
(@q6_c2l1_id, 'C. Đi đến', FALSE, 3),
(@q6_c2l1_id, 'D. Hợp tác', FALSE, 4);

-- Question 7
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c2_l1_quiz_id, 'SINGLE_CHOICE', 'Xác định phiên âm Pinyin chuẩn xác viết liền theo quy tắc ngữ pháp của thuật ngữ công nghệ “人工智能” (Trí tuệ nhân tạo):', NULL, 10, 7, '“人工智能” phát âm chuẩn là ''Réngōng zhìnéng'' (Nhân công trí năng), tuân thủ viết liền các từ tố cấu thành thuật ngữ chuyên ngành.');
SET @q7_c2l1_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q7_c2l1_id, 'A. Réngōng zhìnéng', TRUE, 1),
(@q7_c2l1_id, 'B. Réngōng zhīnén', FALSE, 2),
(@q7_c2l1_id, 'C. Rén gōng zhìnéng', FALSE, 3),
(@q7_c2l1_id, 'D. Rèngōng zhǐnéng', FALSE, 4);

-- Question 8
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c2_l1_quiz_id, 'SINGLE_CHOICE', 'Động từ thương mại “提供” có nghĩa tiếng Việt chuẩn xác là gì?', NULL, 10, 8, '“提供” (tígōng) nghĩa là ''cung cấp/bàn giao'', ví dụ cung cấp giải pháp dịch vụ hoặc cung ứng hàng hóa cho đối tác.');
SET @q8_c2l1_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q8_c2l1_id, 'A. Cung cấp', TRUE, 1),
(@q8_c2l1_id, 'B. Giới thiệu', FALSE, 2),
(@q8_c2l1_id, 'C. Hợp tác', FALSE, 3),
(@q8_c2l1_id, 'D. Đảm nhiệm', FALSE, 4);

-- Question 9
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c2_l1_quiz_id, 'SINGLE_CHOICE', 'Xác định nghĩa tiếng Việt chuẩn xác của tổ hợp danh từ sản phẩm dịch vụ số “学习平台”:', NULL, 10, 9, '“学习平台” ghép từ ''学习'' (học tập) và ''平台'' (nền tảng/platform), chỉ hệ thống công nghệ giáo dục, học tập trực tuyến.');
SET @q9_c2l1_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q9_c2l1_id, 'A. Nhà máy sản xuất', FALSE, 1),
(@q9_c2l1_id, 'B. Nền tảng học tập', TRUE, 2),
(@q9_c2l1_id, 'C. Văn phòng làm việc', FALSE, 3),
(@q9_c2l1_id, 'D. Nhịp độ công việc', FALSE, 4);

-- Question 10
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c2_l1_quiz_id, 'SINGLE_CHOICE', 'Tìm nghĩa tiếng Việt chuẩn xác nhất của danh từ chỉ chức vụ “销售经理” trong phòng kinh doanh doanh nghiệp:', NULL, 10, 10, '“销售经理” (xiāoshòu jīnglǐ) chỉ người chịu trách nhiệm quản lý đội ngũ kinh doanh và chỉ tiêu doanh số tại một bộ phận.');
SET @q10_c2l1_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q10_c2l1_id, 'A. Giám đốc điều hành', FALSE, 1),
(@q10_c2l1_id, 'B. Nhân viên kỹ thuật', FALSE, 2),
(@q10_c2l1_id, 'C. Quản lý kinh doanh / Trưởng phòng kinh doanh', TRUE, 3),
(@q10_c2l1_id, 'D. Lễ tân tòa nhà', FALSE, 4);


-- ========================================================
-- CHAPTER 2 LESSON 2 ADDITIONS (Lesson ID 4)
-- ========================================================

-- Vocabularies
INSERT INTO vocabularies (lesson_id, hanzi, pinyin, vietnamese_meaning, image_url, audio_url, order_index) VALUES
(4, '公司', 'gōngsī', 'Công ty', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784051396/c%C3%B4ng_ty_wcvgn7.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784051519/C%C3%B4ng_ty_ly90zg.mp3', 1),
(4, '企业', 'qǐyè', 'Doanh nghiệp', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784051397/doanh_nghi%E1%BB%87p_bdzxpn.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784051520/Doanh_nghi%E1%BB%87p_cckk4t.mp3', 2),
(4, '产品', 'chǎnpǐn', 'Sản phẩm', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784051403/s%E1%BA%A3n_ph%E1%BA%A9m_g1rus4.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784051526/S%E1%BA%A3n_ph%E1%BA%A9m_kiojtq.mp3', 3),
(4, '服务', 'fúwù', 'Dịch vụ', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784051400/d%E1%BB%8Bch_v%E1%BB%A5_fyg89z.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784051521/D%E1%BB%8Bch_v%E1%BB%A5_yosxg8.mp3', 4),
(4, '解决方案', 'jiějué fāng\'àn', 'Giải pháp', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784051400/gi%E1%BA%A3i_ph%C3%A1p_vwp125.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784051522/Gi%E1%BA%A3i_ph%C3%A1p_h2fkla.mp3', 5),
(4, '提供', 'tígōng', 'Cung cấp', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784051396/cung_c%E1%BA%A5p_dkm6q1.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784051518/Cung_c%E1%BA%A5p_hf4c93.mp3', 6),
(4, '领域', 'lǐngyù', 'Lĩnh vực', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784051402/l%C4%A9nh_v%E1%BB%B1c_trtmf8.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784051525/L%C4%A9nh_v%E1%BB%B1c_ausqmk.mp3', 7),
(4, '活动', 'huódòng', 'Hoạt động', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784051401/ho%E1%BA%A1t_%C4%91%E1%BB%99ng_vxvvyq.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784051524/Ho%E1%BA%A1t_%C4%91%E1%BB%99ng_olvlvb.mp3', 8);

-- Sentence Patterns
INSERT INTO sentence_patterns (lesson_id, chinese_text, pinyin_text, vietnamese_meaning, audio_url, order_index) VALUES
(4, '我来自AB公司。', 'Wǒ láizì AB gōngsī.', 'Tôi đến từ Công ty AB.', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784051585/MC1-1_w5lr6c.mp3', 1),
(4, '我们公司专门为企业提供软件解决方案。', 'Wǒmen gōngsī zhuānmén wèi qǐyè tígōng ruǎnjiàn jiějué fāng\'àn.', 'Công ty chúng tôi chuyên cung cấp giải pháp phần mềm cho doanh nghiệp.', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784051587/MC2-1_z40g5p.mp3', 2),
(4, '我们公司专门提供软件。', 'Wǒmen gōngsī zhuānmén tígōng ruǎnjiàn.', 'Công ty chúng tôi chuyên cung cấp phần mềm.', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784051587/MC2-2_vbwuxy.mp3', 3),
(4, '我们提供人工智能学习 platform。', 'Wǒmen tígōng réngōng zhìnéng xuéxí píngtái.', 'Chúng tôi cung cấp nền tảng học tập trí tuệ nhân tạo.', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784051589/MC3-1_aqogd3.mp3', 4);

-- Quiz
INSERT INTO quizzes (title, teacher_id, lesson_id, time_limit_minutes, pass_score) VALUES
('Trắc nghiệm Chapter 2 Lesson 2', 4, 4, 15, 50);
SET @c2_l2_quiz_id = LAST_INSERT_ID();

-- Quiz Questions & Answers

-- Question 1
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c2_l2_quiz_id, 'SINGLE_CHOICE', '我________AB公司。', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784051655/ph%C3%A2n_%C4%91o%E1%BA%A1n_1_o7xuw1.mp3', 10, 1, '“来自” có nghĩa là “đến từ”. Cấu trúc 我来自 + tên công ty/địa điểm được dùng để giới thiệu nơi mình đến từ hoặc đơn vị mình thuộc về. Câu hoàn chỉnh là 我来自AB公司。, nghĩa là “Tôi đến từ Công ty AB.”');
SET @q1_c2l2_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q1_c2l2_id, 'A. 来自 (láizì)', TRUE, 1),
(@q1_c2l2_id, 'B. 提供 (tígōng)', FALSE, 2),
(@q1_c2l2_id, 'C. 活动 (huódòng)', FALSE, 3),
(@q1_c2l2_id, 'D. 负责 (fùzé)', FALSE, 4);

-- Question 2
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c2_l2_quiz_id, 'SINGLE_CHOICE', '贵公司在什么________活动？', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784051657/ph%C3%A2n_%C4%91o%E1%BA%A1n_2_yf77ye.mp3', 10, 2, '“领域” có nghĩa là “lĩnh vực”. Cụm 在什么领域 activity nghĩa là “hoạt động trong lĩnh vực nào”. Câu hoàn chỉnh 贵公司在什么领域活动？ có nghĩa là “Quý công ty hoạt động trong lĩnh vực nào?”');
SET @q2_c2l2_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q2_c2l2_id, 'A. 产品 (chǎnpǐn)', FALSE, 1),
(@q2_c2l2_id, 'B. 服务 (fúwù)', FALSE, 2),
(@q2_c2l2_id, 'C. 领域 (lǐngyù)', TRUE, 3),
(@q2_c2l2_id, 'D. 企业 (qǐyè)', FALSE, 4);

-- Question 3
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c2_l2_quiz_id, 'SINGLE_CHOICE', 'Chúng tôi công ty________vì xí nghiệp cung cấp phần mềm giải quyết phương án。', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784051658/ph%C3%A2n_%C4%91o%E1%BA%A1n_3_q3urrj.mp3', 10, 3, '“专门” có nghĩa là “chuyên, chuyên về”. Từ này được dùng để nhấn mạnh rằng công ty tập trung cung cấp một sản phẩm hoặc dịch vụ cụ thể. Câu hoàn chỉnh là 我们公司专门为企业提供软件解决方案。, nghĩa là “Công ty chúng tôi chuyên cung cấp giải pháp phần mềm cho doanh nghiệp.”');
SET @q3_c2l2_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q3_c2l2_id, 'A. 很高兴 (hěn gāoxìng)', FALSE, 1),
(@q3_c2l2_id, 'B. 专门 (zhuānmén)', TRUE, 2),
(@q3_c2l2_id, 'C. 谢谢 (xièxie)', FALSE, 3),
(@q3_c2l2_id, 'D. 叫 (jiào)', FALSE, 4);

-- Question 4
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c2_l2_quiz_id, 'SINGLE_CHOICE', 'Chúng tôi công ty chuyên môn vì xí nghiệp________phần mềm giải quyết phương án。', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784051660/ph%C3%A2n_%C4%91o%E1%BA%A1n_4_uzelll.mp3', 10, 4, '“提供” có nghĩa là “cung cấp”. Cấu trúc 为 + đối tượng + 提供 + sản phẩm/dịch vụ nghĩa là “cung cấp sản phẩm hoặc dịch vụ cho một đối tượng”. Câu hoàn chỉnh là 我们公司专门为企业提供软件解决方案。');
SET @q4_c2l2_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q4_c2l2_id, 'A. 提供 (tígōng)', TRUE, 1),
(@q4_c2l2_id, 'B. 活动 (huódòng)', FALSE, 2),
(@q4_c2l2_id, 'C. 来自 (láizì)', FALSE, 3),
(@q4_c2l2_id, 'D. 名字 (míngzi)', FALSE, 4);

-- Question 5
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c2_l2_quiz_id, 'SINGLE_CHOICE', '我们公司专门为企业提供软件________。', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784051661/ph%C3%A2n_%C4%91o%E1%BA%A1n_5_vre4e0.mp3', 10, 5, '“解决方案” có nghĩa là “giải pháp”. Cụm 软件解决方案 nghĩa là “giải pháp phần mềm”, là một cụm từ tự nhiên và thường dùng trong môi trường doanh nghiệp. Câu hoàn chỉnh là 我们公司专门为企业提供软件解决方案。');
SET @q5_c2l2_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q5_c2l2_id, 'A. 客户服务 (kèhù fúwù)', FALSE, 1),
(@q5_c2l2_id, 'B. 销售经理 (xiāoshòu jīnglǐ)', FALSE, 2),
(@q5_c2l2_id, 'C. 解决方案 (jiějué fāng\'àn)', TRUE, 3),
(@q5_c2l2_id, 'D. 学习平台 (xuéxí píngtái)', FALSE, 4);

-- Question 6
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c2_l2_quiz_id, 'SINGLE_CHOICE', 'Chọn động từ thích hợp để điền vào lời giới thiệu xuất xứ doanh nghiệp của nhân viên kinh doanh với đối tác:\n“我_______AB公司。”', NULL, 10, 6, 'Động từ ''来自'' mang nghĩa là ''đến từ'', dùng để giới thiệu nguồn gốc công ty nơi mình đang công tác một cách lịch sự.');
SET @q6_c2l2_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q6_c2l2_id, 'A. 来自 (láizì)', TRUE, 1),
(@q6_c2l2_id, 'B. 提供 (tígōng)', FALSE, 2),
(@q6_c2l2_id, 'C. 活动 (huódòng)', FALSE, 3),
(@q6_c2l2_id, 'D. 负责 (fùzé)', FALSE, 4);

-- Question 7
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c2_l2_quiz_id, 'SINGLE_CHOICE', 'Hoàn thành câu hỏi xã giao của khách hàng khi muốn tìm hiểu về lĩnh vực kinh doanh của doanh nghiệp đối tác:\n“贵公司在什么_______活动？”', NULL, 10, 7, 'Danh từ ''领域'' kết hợp với động từ ''活动'' tạo thành cấu trúc ''hoạt động trong lĩnh vực gì'', thường dùng trong giao tiếp thương mại.');
SET @q7_c2l2_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q7_c2l2_id, 'A. 产品 (chǎnpǐn)', FALSE, 1),
(@q7_c2l2_id, 'B. 服务 (fúwù)', FALSE, 2),
(@q7_c2l2_id, 'C. 领域 (lǐngyù)', TRUE, 3),
(@q7_c2l2_id, 'D. 企业 (qǐyè)', FALSE, 4);

-- Question 8
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c2_l2_quiz_id, 'SINGLE_CHOICE', 'Chọn phó từ thích hợp thể hiện tính chuyên môn hóa, tập trung sâu vào một mảng sản phẩm/giải pháp của công ty:\n“Chúng tôi công ty_______vì xí nghiệp cung cấp phần mềm giải quyết phương án。”', NULL, 10, 8, 'Phó từ ''专门'' mang nghĩa là ''chuyên/chuyên môn về'', đứng trước động từ để nhấn mạnh năng lực cốt lõi của doanh nghiệp.');
SET @q8_c2l2_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q8_c2l2_id, 'A. 很高兴 (hěn gāoxìng)', FALSE, 1),
(@q8_c2l2_id, 'B. 专门 (zhuānmén)', TRUE, 2),
(@q8_c2l2_id, 'C. 谢谢 (xièxie)', FALSE, 3),
(@q8_c2l2_id, 'D. 叫 (jiào)', FALSE, 4);

-- Question 9
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c2_l2_quiz_id, 'SINGLE_CHOICE', 'Điền động từ thương mại mang nghĩa cung ứng giải pháp/dịch vụ cho các khách hàng doanh nghiệp:\n“Chúng tôi công ty chuyên môn vì xí nghiệp_______phần mềm giải quyết phương án。”', NULL, 10, 9, 'Động từ ''提供'' nghĩa là ''cung cấp'', đi kèm với đối tượng nhận (企业) và sản phẩm bàn giao (解决方案).');
SET @q9_c2l2_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q9_c2l2_id, 'A. 提供 (tígōng)', TRUE, 1),
(@q9_c2l2_id, 'B. 活动 (huódòng)', FALSE, 2),
(@q9_c2l2_id, 'C. 来自 (láizì)', FALSE, 3),
(@q9_c2l2_id, 'D. 名字 (míngzi)', FALSE, 4);

-- Question 10
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c2_l2_quiz_id, 'SINGLE_CHOICE', 'Chọn cụm danh từ thích hợp điền vào vị trí khuyết để hoàn thành câu giới thiệu sản phẩm cốt lõi của công ty công nghệ:\n“我们公司专门 cung cấp phần mềm_______。”', NULL, 10, 10, 'Thuật ngữ ''解决方案'' (giải pháp) kết hợp với ''软件'' tạo thành cụm từ hoàn chỉnh ''giải pháp phần mềm'' chuẩn ngữ cảnh bài học.');
SET @q10_c2l2_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q10_c2l2_id, 'A. 客户服务 (kèhù fúwù)', FALSE, 1),
(@q10_c2l2_id, 'B. 销售经理 (xiāoshòu jīnglǐ)', FALSE, 2),
(@q10_c2l2_id, 'C. 解决方案 (jiějué fāng\'àn)', TRUE, 3),
(@q10_c2l2_id, 'D. 学习平台 (xuéxí píngtái)', FALSE, 4);

-- Question 11
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c2_l2_quiz_id, 'SINGLE_CHOICE', 'Xác định phiên âm Pinyin chuẩn xác của thuật ngữ “解决方案” (Giải pháp):', NULL, 10, 11, '“解决方案” có phiên âm chính xác là ''jiějué fāng''àn''. Lưu ý có dấu cách âm ('') trước âm ''àn'' để tách rõ hai âm tiết của từ ''方案''.');
SET @q11_c2l2_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q11_c2l2_id, 'A. jiějué fāng\'àn', TRUE, 1),
(@q11_c2l2_id, 'B. jiějué fāngàn', FALSE, 2),
(@q11_c2l2_id, 'C. jiéjué fāng\'ān', FALSE, 3),
(@q11_c2l2_id, 'D. jiějuè fāng\'ān', FALSE, 4);

-- Question 12
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c2_l2_quiz_id, 'SINGLE_CHOICE', 'Tìm từ viết bằng chữ Hán chuẩn xác ứng với ý nghĩa “Doanh nghiệp” thường dùng trong các hợp đồng hoặc văn bản thương mại:', NULL, 10, 12, 'Chữ Hán ''企业'' (phiên âm: qǐyè) mang nghĩa là doanh nghiệp, xí nghiệp, phân biệt với ''公司'' (gōngsī) là công ty.');
SET @q12_c2l2_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q12_c2l2_id, 'A. 公司', FALSE, 1),
(@q12_c2l2_id, 'B. 企业', TRUE, 2),
(@q12_c2l2_id, 'C. 领域', FALSE, 3),
(@q12_c2l2_id, 'D. 产品', FALSE, 4);

-- Question 13
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c2_l2_quiz_id, 'SINGLE_CHOICE', 'Cho câu thoại: “这是我们公司的主要产品。” Hãy xác định ý nghĩa của từ “产品” trong ngữ cảnh này:', NULL, 10, 13, 'Danh từ ''产品'' (chǎnpǐn) nghĩa là sản phẩm (hàng hóa hữu hình hoặc vô hình do doanh nghiệp sản xuất và cung ứng ra thị trường).');
SET @q13_c2l2_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q13_c2l2_id, 'A. Dịch vụ chăm sóc', FALSE, 1),
(@q13_c2l2_id, 'B. Sản phẩm', TRUE, 2),
(@q13_c2l2_id, 'C. Lĩnh vực hoạt động', FALSE, 3),
(@q13_c2l2_id, 'D. Nền tảng công nghệ', FALSE, 4);

-- Question 14
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c2_l2_quiz_id, 'SINGLE_CHOICE', 'Xác định ý nghĩa tiếng Việt chuẩn xác của động từ “活动” trong câu hỏi thương mại “贵公司 zài cái gì 领域活动？”:', NULL, 10, 14, '“活动” (huódòng) nghĩa là hoạt động. Trong ngữ cảnh công sở, nó chỉ các hành vi vận hành kinh doanh, sản xuất của một tổ chức.');
SET @q14_c2l2_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q14_c2l2_id, 'A. Hoạt động', TRUE, 1),
(@q14_c2l2_id, 'B. Cung cấp', FALSE, 2),
(@q14_c2l2_id, 'C. Thành lập', FALSE, 3),
(@q14_c2l2_id, 'D. Hợp tác', FALSE, 4);

-- Question 15
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c2_l2_quiz_id, 'SINGLE_CHOICE', 'Xác định phiên âm Pinyin chính xác của danh từ “领域” (Lĩnh vực):', NULL, 10, 15, '“领域” có phiên âm chuẩn xác là ''lǐngyù'' (thanh 3 kết hợp thanh 4), mang nghĩa là lĩnh vực (phạm vi hoạt động kinh doanh).');
SET @q15_c2l2_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q15_c2l2_id, 'A. lǐngyù', TRUE, 1),
(@q15_c2l2_id, 'B. língyù', FALSE, 2),
(@q15_c2l2_id, 'C. lǐngyú', FALSE, 3),
(@q15_c2l2_id, 'D. lǐngjù', FALSE, 4);


-- ========================================================
-- CHAPTER 1 LESSON 1 ADDITIONS (Lesson ID 1)
-- ========================================================

-- Vocabularies
INSERT INTO vocabularies (lesson_id, hanzi, pinyin, vietnamese_meaning, image_url, audio_url, order_index) VALUES
(1, '您好', 'nínhǎo', 'Xin chào (lịch sự)', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784039450/Xin_ch%C3%A0o_mdebpt.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784039585/xin_ch%C3%A0o_qmyanm.mp3', 1),
(1, '欢迎', 'huānyíng', 'Chào mừng, đón chào', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784039412/Ch%C3%A0o_m%E1%BB%ABng_evt8oe.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784039546/Ch%C3%A0o_m%E1%BB%ABng_%C4%91%C3%B3n_ch%C3%A0o_tf7alw.mp3', 2),
(1, '加入', 'jiārù', 'Gia nhập, tham gia', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784039412/gia_nh%E1%BA%ADp_echwaw.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784039553/Gia_nh%E1%BA%ADp_rnrye1.mp3', 3),
(1, '今天', 'jīntiān', 'Hôm nay', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784039418/h%C3%B4m_nay_kohs4v.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784039561/H%C3%B4m_nay_ggnrjk.mp3', 4),
(1, '是', 'shì', 'Là', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784039421/l%C3%A0_ivngrw.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784039563/L%C3%A0_iw2etn.mp3', 5),
(1, '我', 'wǒ', 'Tôi', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784039441/t%C3%B4i_xa9mva.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784039578/T%C3%B4i_kookxy.mp3', 6),
(1, '第一天', 'dì yī tiān', 'Ngày đầu tiên', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784039428/ng%C3%A0y_%C4%91%E1%BA%A7u_ti%C3%AAn_atv1z1.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784039569/Ng%C3%A0y_%C4%91%E1%BA%A7u_ti%C3%AAn_bgf5qu.mp3', 7),
(1, '上班', 'shàngbān', 'Đi làm', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784039452/%C4%90i_l%C3%A0m_gmklb2.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784039588/%C4%90i_l%C3%A0m_o4jty1.mp3', 8),
(1, '很', 'hěn', 'Rất', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784039435/r%E1%BA%A5t_nl9zce.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784039571/R%E1%BA%A5t_qrnuud.mp3', 9),
(1, '高兴', 'gāoxìng', 'Vui, vui mừng', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784039449/vui_ahqbqf.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784039581/Vui_haxu0n.mp3', 10),
(1, '见到', 'jiàndào', 'Gặp, nhìn thấy', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784039415/g%E1%BA%B7p_xrt6ha.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784039557/G%E1%BA%B7p_b3txm2.mp3', 11),
(1, '您', 'nín', 'Ngài/Bạn/Ông/Bà (lịch sự)', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784039425/l%E1%BB%8Bch_s%E1%BB%B1_zp7ete.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784039545/B%E1%BA%A1n_Ng%C3%A0i_%C3%B4ng_b%C3%A0_reytcc.mp3', 12),
(1, '我也', 'wǒ yě', 'Tôi cũng...', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784039438/t%C3%B4i_c%C5%A9ng_i6dbxi.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784039574/T%C3%B4i_c%C5%A9ng..._qekogz.mp3', 13);

-- Sentence Patterns
INSERT INTO sentence_patterns (lesson_id, chinese_text, pinyin_text, vietnamese_meaning, audio_url, order_index) VALUES
(1, '你好，我叫A。今天是我第一天来上班。', 'Nǐ hǎo, wǒ jiào A. Jīntiān shì wǒ dì yī tiān lái shàngbān.', 'Xin chào tôi tên là A. Hôm nay là ngày đầu tiên tôi đi làm.', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784046978/MC1-1_wgnwii.mp3', 1),
(1, '您好，我叫明。今天是我第一天来上班，请多关照。', 'Nín hǎo, wǒ jiào Míng. Jīntiān shì wǒ dì yī tiān lái shàngbān, qǐng duō guānzhào.', 'Xin chào ạ, tôi tên là Minh. Hôm nay là ngày đầu tiên tôi đi làm, mong được giúp đỡ.', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784046978/MC1-2_a7fh7v.mp3', 2),
(1, '我也很高兴见到你。', 'Wǒ yě hěn gāoxìng jiàndào nǐ.', 'Tôi cũng rất vui được gặp bạn.', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784046978/MC2-1_z2aiwy.mp3', 3),
(1, '认识您，我也很高兴。', 'Rènshi nín, wǒ yě hěn gāoxìng.', 'Được làm quen với bạn, tôi cũng rất vui.', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784046978/MC2-2_hnbhbd.mp3', 4);

-- Quiz
INSERT INTO quizzes (title, teacher_id, lesson_id, time_limit_minutes, pass_score) VALUES
('Trắc nghiệm Chapter 1 Lesson 1', 4, 1, 15, 50);
SET @c1_l1_quiz_id = LAST_INSERT_ID();

-- Quiz Questions & Answers

-- Question 1
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c1_l1_quiz_id, 'SINGLE_CHOICE', '________！________来到ABC公司。', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784041474/ph%C3%A2n_%C4%91o%E1%BA%A1n_1_hpghnx.mp3', 10, 1, '“您好” là cách chào lịch sự trong tiếng Trung, còn “欢迎” có nghĩa là “chào mừng”. Câu hoàn chỉnh 您好！欢迎来到ABC公司。 có nghĩa là “Xin chào! Chào mừng bạn đến với Công ty ABC.” Đây là lời chào đón phổ biến dành cho nhân viên hoặc khách mới.');
SET @q1_c1l1_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q1_c1l1_id, 'A. 高兴 (gāoxìng) / 加入 (jiārù)', FALSE, 1),
(@q1_c1l1_id, 'B. 您好 (nínhǎo) / 欢迎 (huānyíng)', TRUE, 2),
(@q1_c1l1_id, 'C. 上班 (shàngbān) / 公司 (gōngsī)', FALSE, 3),
(@q1_c1l1_id, 'D. 见到 (jiàndào) / 今天 (jīntiān)', FALSE, 4);

-- Question 2
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c1_l1_quiz_id, 'SINGLE_CHOICE', '您好！________叫A。________是我第一天上班。', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784041477/ph%C3%A2n_%C4%91o%E1%BA%A1n_2_fasqeq.mp3', 10, 2, '“我叫A” là mẫu câu giới thiệu tên, nghĩa là “Tôi tên là A”. “今天是我第一天上班” nghĩa là “Hôm nay là ngày đầu tiên tôi đi làm”. Hai từ “我” và “今天” giúp câu hoàn chỉnh, đúng ngữ pháp và đúng ngữ cảnh.');
SET @q2_c1l1_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q2_c1l1_id, 'A. 您 (nín) / 欢迎 (huānyíng)', FALSE, 1),
(@q2_c1l1_id, 'B. 我也 (wǒ yě) / 公司 (gōngsī)', FALSE, 2),
(@q2_c1l1_id, 'C. 我 (wǒ) / 今天 (jīntiān)', TRUE, 3),
(@q2_c1l1_id, 'D. 是 (shì) / 第一天 (dì yī tiān)', FALSE, 4);

-- Question 3
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c1_l1_quiz_id, 'SINGLE_CHOICE', '今天________我________。', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784041481/ph%C3%A2n_%C4%91o%E1%BA%A1n_3_mqernb.mp3', 10, 3, 'Cấu trúc 今天是我第一天上班。 là cách diễn đạt tự nhiên khi giới thiệu ngày đầu tiên đi làm. “是” đóng vai trò động từ liên kết, còn “第一天上班” nghĩa là “ngày đầu tiên đi làm”.');
SET @q3_c1l1_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q3_c1l1_id, 'A. 是 (shì) / 第一天上班 (dì yī tiān shàngbān)', TRUE, 1),
(@q3_c1l1_id, 'B. 很 (hěn) / 高兴见到 (gāoxìng jiàndào)', FALSE, 2),
(@q3_c1l1_id, 'C. 欢迎 (huānyíng) / 加入公司 (jiārù gōngsī)', FALSE, 3),
(@q3_c1l1_id, 'D. 见 (jiàn) / 核心客户 (héxīn kèhù)', FALSE, 4);

-- Question 4
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c1_l1_quiz_id, 'SINGLE_CHOICE', '________您。', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784041484/ph%C3%A2n_%C4%91o%E1%BA%A1n_4_tr03a6.mp3', 10, 4, 'Cụm 很高兴见到您 là cách chào hỏi lịch sự, có nghĩa là “Rất vui được gặp bạn/ngài”. Đây là mẫu câu giao tiếp phổ biến trong môi trường công sở và khi gặp đối tác hoặc người lớn tuổi. Các đáp án còn lại không tạo thành câu hoàn chỉnh hoặc không phù hợp với ngữ cảnh.');
SET @q4_c1l1_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q4_c1l1_id, 'A. 欢迎加入 (huānyíng jiārù)', FALSE, 1),
(@q4_c1l1_id, 'B. 也很高兴 (yě hěn gāoxìng)', FALSE, 2),
(@q4_c1l1_id, 'C. 很高兴见到 (hěn gāoxìng jiàndào)', TRUE, 3),
(@q4_c1l1_id, 'D. 谢谢老板 (xièxie lǎobǎn)', FALSE, 4);

-- Question 5
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c1_l1_quiz_id, 'SINGLE_CHOICE', 'Khi một nhân sự mới bước vào văn phòng lần đầu tiên, họ sẽ dùng mẫu câu nào để tự giới thiệu về bản thân?\n“您好！_______， hôm nay là ngày đầu tiên tôi đi làm.”', NULL, 10, 5, 'Trong bối cảnh ngày đầu nhận việc, từ \"新员工\" (nhân viên mới) là danh xưng chuẩn xác nhất để giới thiệu với đồng nghiệp và lễ tân.');
SET @q5_c1l1_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q5_c1l1_id, 'A. 我是老板 (Wǒ  shì lǎobǎn)', FALSE, 1),
(@q5_c1l1_id, 'B. 我是新员工 (Wǒ shì xīn yuángōng)', TRUE, 2),
(@q5_c1l1_id, 'C. 我是前台 (Wǒ shì qiántái)', FALSE, 3),
(@q5_c1l1_id, 'D. 我是学生 (Wǒ shì xuéshēng)', FALSE, 4);

-- Question 6
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c1_l1_quiz_id, 'SINGLE_CHOICE', 'Hoàn thành câu chào mừng của nhân viên lễ tân khi tiếp đón một nhân sự mới đến nhận việc tại văn phòng:\n“您好！欢迎_______ABC公司。”', NULL, 10, 6, 'Cấu trúc \"欢迎来到 + Địa điểm\" (Chào mừng đến với...) là mẫu câu cố định dùng để thể hiện sự hiếu khách khi ai đó vừa đặt chân tới một địa điểm cụ thể như công ty.');
SET @q6_c1l1_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q6_c1l1_id, 'A. 加入 (jiārù)', FALSE, 1),
(@q6_c1l1_id, 'B. 上班 (shàngbān)', FALSE, 2),
(@q6_c1l1_id, 'C. 来到 (láidào)', TRUE, 3),
(@q6_c1l1_id, 'D. 见到 (jiàndào)', FALSE, 4);

-- Question 7
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c1_l1_quiz_id, 'SINGLE_CHOICE', 'Hoàn thành câu nói diễn tả trạng thái thời gian và hành động trong ngày đầu tiên đến cơ quan:\n“_______是我第一天上班，请大家多多指教。”', NULL, 10, 7, 'Trạng từ chỉ thời gian \"今天\" (hôm nay) đi liền với vế \"第一天上班\" (ngày đầu tiên đi làm) để nhấn mạnh sự kiện đang diễn ra trong thời điểm hiện tại.');
SET @q7_c1l1_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q7_c1l1_id, 'A. 昨天 (zuótiān)', FALSE, 1),
(@q7_c1l1_id, 'B. 明天 (míngtiān)', FALSE, 2),
(@q7_c1l1_id, 'C. 今天 (jīntiān)', TRUE, 3),
(@q7_c1l1_id, 'D. 今年 (jīnnián)', FALSE, 4);

-- Question 8
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c1_l1_quiz_id, 'SINGLE_CHOICE', 'Lựa chọn động từ thích hợp để hoàn thiện câu chào mừng của quản lý khi chính thức nhận một thành viên mới vào đội ngũ:\n“欢迎你_______ ABC公司, hy vọng tương lai chúng ta cùng nhau cố gắng.”', NULL, 10, 8, 'Động từ \"加入\" (gia nhập/tham gia) kết hợp với danh từ chỉ tổ chức như \"公司\" (công ty) thể hiện hành động một cá nhân chính thức trở thành một phần của tập thể.');
SET @q8_c1l1_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q8_c1l1_id, 'A. 见到 (jiàndào)', FALSE, 1),
(@q8_c1l1_id, 'B. 加入 (jiārù)', TRUE, 2),
(@q8_c1l1_id, 'C. 上班 (shàngbān)', FALSE, 3),
(@q8_c1l1_id, 'D. 您好 (nínhǎo)', FALSE, 4);

-- Question 9
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c1_l1_quiz_id, 'SINGLE_CHOICE', 'Điền từ thích hợp để hoàn thành câu thể hiện sự lịch thiệp, vui mừng khi lần đầu gặp mặt đối tác hoặc đồng nghiệp:\n“您好！我叫A。很高兴_______您。”', NULL, 10, 9, 'Cụm từ \"很高兴见到您\" (Rất vui được gặp ngài/bạn) là câu giao tiếp lịch sự chuẩn mực được dùng ngay tại thời điểm hai bên trực tiếp gặp mặt nhau.');
SET @q9_c1l1_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q9_c1l1_id, 'A. 欢迎 (huānyíng)', FALSE, 1),
(@q9_c1l1_id, 'B. 上班 (shàngbān)', FALSE, 2),
(@q9_c1l1_id, 'C. 见到 (jiàndào)', TRUE, 3),
(@q9_c1l1_id, 'D. 公司 (gōngsī)', FALSE, 4);

-- Question 10
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c1_l1_quiz_id, 'SINGLE_CHOICE', 'Để đáp lại lời chào \"很高兴见到...\" từ đối phương, bạn sẽ sử dụng cụm từ nào dưới đây để biểu thị sự đồng thuận về mặt cảm xúc?\n“A: 很高兴见到您！ - B: _______很高兴见到 bạn！”', NULL, 10, 10, 'Cụm \"我也\" (tôi cũng...) được thêm vào trước tính từ/vị ngữ để biểu thị người nói cũng có cùng một trạng thái cảm xúc hoặc hành động tương tự như người đối thoại.');
SET @q10_c1l1_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q10_c1l1_id, 'A. 我 (wǒ)', FALSE, 1),
(@q10_c1l1_id, 'B. 我也 (wǒ yě)', TRUE, 2),
(@q10_c1l1_id, 'C. 您 (nín)', FALSE, 3),
(@q10_c1l1_id, 'D. 很 (hěn)', FALSE, 4);

-- Question 11
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c1_l1_quiz_id, 'SINGLE_CHOICE', 'Phiên âm Pinyin chính xác của danh từ “公司” (Công ty) là gì?', NULL, 10, 11, '“公司” có phiên âm chuẩn là gōngsī (thanh 1 và thanh 1), thanh mẫu ''s'' cần phát âm nhẹ, không uốn lưỡi, tránh nhầm lẫn với ''sh'' hoặc ''x''.');
SET @q11_c1l1_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q11_c1l1_id, 'A. gōngxī', FALSE, 1),
(@q11_c1l1_id, 'B. gōngsī', TRUE, 2),
(@q11_c1l1_id, 'C. gòngshī', FALSE, 3),
(@q11_c1l1_id, 'D. kōngsī', FALSE, 4);

-- Question 12
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c1_l1_quiz_id, 'SINGLE_CHOICE', 'Từ “上班” có ý nghĩa hành động và phiên âm chuẩn xác nào dưới đây?', NULL, 10, 12, '“上班” (shàngbān) là động từ ly hợp chỉ hành động đến nơi làm việc để thực hiện nghĩa vụ lao động theo giờ quy định.');
SET @q12_c1l1_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q12_c1l1_id, 'A. xiàbān | Tan làm', FALSE, 1),
(@q12_c1l1_id, 'B. shàngbān | Đi làm, vào ca làm việc', TRUE, 2),
(@q12_c1l1_id, 'C. shàngwǎng | Lên mạng', FALSE, 3),
(@q12_c1l1_id, 'D. chūchāi | Đi công tác', FALSE, 4);

-- Question 13
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c1_l1_quiz_id, 'SINGLE_CHOICE', 'Cho chữ Hán “高兴”, hãy xác định phiên âm và nghĩa tiếng Việt đúng của từ này:', NULL, 10, 13, '“高兴” phát âm là gāoxìng (thanh 1 và thanh 4), dùng làm tính từ chỉ trạng thái tâm lý phấn chấn, vui mừng của con người.');
SET @q13_c1l1_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q13_c1l1_id, 'A. gāoxìng | Vui vẻ, mừng rỡ', TRUE, 1),
(@q13_c1l1_id, 'B. gǎoxìng | Đau khổ', FALSE, 2),
(@q13_c1l1_id, 'C. gāoxīn | Lương cao', FALSE, 3),
(@q13_c1l1_id, 'D. kāixīn | Mở lòng', FALSE, 4);

-- Question 14
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c1_l1_quiz_id, 'SINGLE_CHOICE', 'Tìm đại từ nhân xưng ngôi thứ hai dạng tôn kính, lịch sự viết bằng chữ Hán ứng với phiên âm “nín”:', NULL, 10, 14, 'Đại từ “您” (nín) có cấu trúc gồm chữ ''nǐ'' ở trên và bộ ''Tâm'' (心 - trái tim) ở dưới, dùng để xưng hô một cách kính trọng với cấp trên, người lớn tuổi hoặc khách hàng.');
SET @q14_c1l1_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q14_c1l1_id, 'A. 你', FALSE, 1),
(@q14_c1l1_id, 'B. 你们', FALSE, 2),
(@q14_c1l1_id, 'C. 您', TRUE, 3),
(@q14_c1l1_id, 'D. 那', FALSE, 4);

-- Question 15
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c1_l1_quiz_id, 'SINGLE_CHOICE', 'Xác định nghĩa tiếng Việt và phiên âm của từ “欢迎”:', NULL, 10, 15, '“欢迎” (huānyíng) là động từ thể hiện thái độ vui vẻ, nhiệt tình đón nhận sự xuất hiện của một ai đó hoặc một điều gì đó.');
SET @q15_c1l1_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q15_c1l1_id, 'A. huānyíng | Chào mừng, hoan nghênh đón tiếp', TRUE, 1),
(@q15_c1l1_id, 'B. huānyǐng | Tiết mục văn nghệ', FALSE, 2),
(@q15_c1l1_id, 'C. huànyíng | Ảo ảnh', FALSE, 3),
(@q15_c1l1_id, 'D. fǎnyìng | Phản ứng', FALSE, 4);

-- Question 16
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c1_l1_quiz_id, 'SINGLE_CHOICE', 'Cụm từ “第一天” (dì yī tiān) mang ý nghĩa biểu thị trật tự thời gian nào dưới đây?', NULL, 10, 16, 'Từ “第” (dì) là dấu hiệu hình thành số thứ tự, kết hợp với “一天” (một ngày) tạo thành cụm từ chỉ vị trí mốc thời gian đầu tiên trong một chuỗi sự kiện.');
SET @q16_c1l1_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q16_c1l1_id, 'A. Ngày cuối cùng', FALSE, 1),
(@q16_c1l1_id, 'B. Ngày làm việc', FALSE, 2),
(@q16_c1l1_id, 'C. Ngày đầu tiên', TRUE, 3),
(@q16_c1l1_id, 'D. Tuần đầu tiên', FALSE, 4);

-- Chapter 1 Lesson 2
-- Vocabularies
INSERT INTO vocabularies (lesson_id, hanzi, pinyin, vietnamese_meaning, image_url, audio_url, order_index) VALUES
(2, '部门主管', 'bùmén zhǔguǎn', 'Trưởng bộ phận', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784174580/tr%C6%B0%E1%BB%9Fng_b%E1%BB%99_ph%E1%BA%ADn_eh5obx.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784042726/Tr%C6%B0%E1%BB%9Fng_b%E1%BB%99_ph%E1%BA%ADn_f2gvfs.mp3', 1),
(2, '新来的员工', 'xīn lái de yuángōng', 'Nhân viên mới', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784174577/nh%C3%A2n_vi%C3%AAn_m%E1%BB%9Bi_zfpnff.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784042724/Nh%C3%A2n_vi%C3%AAn_m%E1%BB%9Bi_dbdlww.mp3', 2),
(2, '欢迎', 'huānyíng', 'Chào mừng', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784174563/ch%C3%A0o_m%E1%BB%ABng_ftyiik.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784042703/Ch%C3%A0o_m%E1%BB%ABng_nijgnk.mp3', 3),
(2, '加入', 'jiārù', 'Gia nhập', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784174567/gia_nh%E1%BA%ADp_am8ol9.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784042705/Gia_nh%E1%BA%ADp_gllyog.mp3', 4),
(2, '我们', 'wǒmen', 'Chúng tôi', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784174563/ch%C3%BAng_t%C3%B4i_msuvuo.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784042703/Ch%C3%BAng_t%C3%B4i_d8hc7o.mp3', 5),
(2, '团队', 'tuánduì', 'Đội nhóm', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784174582/%C4%91%E1%BB%99i_nh%C3%B3m_ct4qoe.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784042727/%C4%90%E1%BB%99i_nh%C3%B3m_ne9xxi.mp3', 6),
(2, '请坐', 'qǐng zuò', 'Mời ngồi', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784174575/m%E1%BB%9Di_ng%E1%BB%93i_mqdwld.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784042722/M%E1%BB%9Di_ng%E1%BB%93i_rjt72y.mp3', 7),
(2, '谢谢', 'xièxie', 'Cảm ơn', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784174564/c%E1%BA%A3m_%C6%A1n_dwlpup.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784042704/C%E1%BA%A3m_%C6%A1n_jt5hdu.mp3', 8),
(2, '第一次', 'dì yī cì', 'Lần đầu tiên', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784174575/l%E1%BA%A7n_%C4%91%E1%BA%A7u_ti%C3%AAn_anprhi.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784042722/L%E1%BA%A7n_%C4%91%E1%BA%A7u_ti%C3%AAn_ghyo2j.mp3', 9),
(2, '工业园区', 'gōngyè yuánqū', 'Khu công nghiệp', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784174570/khu_c%C3%B4ng_nghi%E1%BB%87p_hxhrfv.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784042707/Khu_c%C3%B4ng_nghi%E1%BB%87p_v5ey4f.mp3', 10),
(2, '工作', 'gōngzuò', 'Làm việc', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784174573/l%C3%A0m_vi%E1%BB%87c_fxrfig.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784042721/L%C3%A0m_vi%E1%BB%87c_f3l8ny.mp3', 11),
(2, '希望', 'xīwàng', 'Hy vọng', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784174568/hi_v%E1%BB%8Dng_exnarp.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784042705/Hy_v%E1%BB%8Dng_xpzowu.mp3', 12),
(2, '指导', 'zhǐdǎo', 'Hướng dẫn, chỉ bảo', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784174569/h%C6%B0%E1%BB%9Bng_d%E1%BA%ABn_ig1r1z.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784042706/H%C6%B0%E1%BB%9Bng_d%E1%BA%ABn_ch%E1%BB%89_b%E1%BA%A3o_pjeanu.mp3', 13),
(2, '没关系', 'méiguānxi', 'Không sao', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784174572/kh%C3%B4ng_sao_zcqqd5.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784042708/Kh%C3%B4ng_sao_tjhcs2.mp3', 14),
(2, '开始', 'kāishǐ', 'Bắt đầu', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784174563/b%E1%BA%AFt_%C4%91%E1%BA%A7u_hurtmq.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784175867/b%E1%BA%AFt_%C4%91%E1%BA%A7u_x0z7ip.mp3', 15),
(2, '工厂', 'gōngchǎng', 'Nhà máy', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784174575/nh%C3%A0_m%C3%A1y_adeupa.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784042723/Nh%C3%A0_m%C3%A1y_uulfl7.mp3', 16),
(2, '流程', 'liúchéng', 'Quy trình', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784174579/quy_tr%C3%ACnh_yqt7m5.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784042725/Quy_tr%C3%ACnh_xzjlwu.mp3', 17),
(2, '安全规章', 'ānquán guīzhāng', 'Nội quy an toàn', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784174578/n%E1%BB%99i_quy_an_to%C3%A0n_imohin.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784042724/N%E1%BB%99i_quy_an_to%C3%A0n_zevury.mp3', 18),
(2, '困难', 'kùnnán', 'Khó khăn', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784174571/kh%C3%B3_kh%C4%83n_iweers.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784042707/Kh%C3%B3_kh%C4%83n_yacqro.mp3', 19),
(2, '尽管', 'jǐnguǎn', 'Cứ, cứ việc', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784174566/c%E1%BB%A9_vi%E1%BB%87c_vdkrcw.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784042704/C%E1%BB%A9_c%E1%BB%A9_vi%E1%BB%87c_asqjgo.mp3', 20),
(2, '努力', 'nǔlì', 'Cố gắng', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784174565/c%E1%BB%91_g%E1%BA%AFng_g0ynfe.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784042704/C%E1%BB%91_g%E1%BA%AFng_fotrc5.mp3', 21),
(2, '争取', 'zhēngqǔ', 'Phấn đấu', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784174579/ph%E1%BA%A5n_%C4%91%E1%BA%A5u_qi6c9k.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784042724/Ph%E1%BA%A5n_%C4%91%E1%BA%A5u_oxmowt.mp3', 22),
(2, '做好', 'zuò hǎo', 'Làm tốt', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784174572/l%C3%A0m_t%E1%BB%91t_nzrbkp.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784042721/L%C3%A0m_t%E1%BB%91t_vgifiz.mp3', 23),
(2, '介绍', 'jièshào', 'Giới thiệu', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784174567/gi%E1%BB%9Bi_thi%E1%BB%87u_nscikm.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784042705/Gi%E1%BB%9Bi_thi%E1%BB%87u_xajnwd.mp3', 24),
(2, '同事', 'tóngshì', 'Đồng nghiệp', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784174581/%C4%91%E1%BB%93ng_nghi%E1%BB%87p_bhu46v.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784042726/%C4%90%E1%BB%93ng_nghi%E1%BB%87p_f34qxf.mp3', 25);

-- Sentence Patterns
INSERT INTO sentence_patterns (lesson_id, chinese_text, pinyin_text, vietnamese_meaning, audio_url, order_index) VALUES
(2, '经理，您好！我是今天来报到的新员工。', 'Jīnglǐ, nín hǎo! Wǒ shì jīntiān lái bàodào de xīn yuángōng.', 'Chào Trưởng phòng ạ! Tôi là nhân viên mới đến nhận việc hôm nay.', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784047055/MC1-1_y0szwc.mp3', 1),
(2, '主管，您好！我是今天来报到的新员工，这是 me_c1l2_id_2第一次在工厂工作。', 'Zhǔguǎn, nín hǎo! Wǒ shì jīntiān lái bàodào de xīn yuángōng, zhè shì wǒ dì yī cì zài gōngchǎng gōngzuò.', 'Chào Trưởng bộ phận, tôi là nhân viên mới đến ngày hôm nay, đây là lần đầu tôi công tác xưởng.', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784047055/MC1-2_bkbsy9.mp3', 2),
(2, '欢迎加入我们的团队。请坐，没关系，慢慢熟悉。', 'Huānyíng jiārù wǒmen de tuánduì. Qǐng zuò, méi guānxi, mànmàn shúxī.', 'Chào mừng cậu gia nhập đội ngũ của chúng ta. Mời ngồi, không sao đâu, cứ từ từ làm quen.', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784047056/MC2-1_vx0csd.mp3', 3),
(2, '欢迎加入我们的团队，现在我带你去认识一下车间的同事。', 'Huānyíng jiārù wǒmen de tuánduì, xiànzài wǒ dài nǐ qù rènshi yíxià chējiān de tóngshì.', 'Chào mừng cậu gia nhập đội ngũ chúng ta, bây giờ tôi dẫn cậu đi làm quen đồng nghiệp trong phân xưởng.', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784047057/MC2-2_ckgs9b.mp3', 4);

-- Quiz
INSERT INTO quizzes (title, teacher_id, lesson_id, time_limit_minutes, pass_score) VALUES
('Trắc nghiệm Chapter 1 Lesson 2', 4, 2, 15, 50);
SET @c1_l2_quiz_id = LAST_INSERT_ID();

-- Question 1
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c1_l2_quiz_id, 'SINGLE_CHOICE', '欢迎加入我们________。请坐。', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784042789/ph%C3%A2n_%C4%91o%E1%BA%A1n_1_ejzcow.mp3', 10, 1, '“团队” có nghĩa là “đội ngũ, nhóm”. Câu 欢迎加入我们团队。请坐。 có nghĩa là “Chào mừng bạn gia nhập đội ngũ của chúng tôi. Mời ngồi.” Đây là cách chào đón nhân viên mới rất phổ biến trong môi trường làm việc.');
SET @q1_c1l2_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q1_c1l2_id, 'A. 公司 (gōngsī)', FALSE, 1),
(@q1_c1l2_id, 'B. 团队 (tuánduì)', TRUE, 2),
(@q1_c1l2_id, 'C. 工厂 (gōngchǎng)', FALSE, 3),
(@q1_c1l2_id, 'D. 同事 (tóngshì)', FALSE, 4);

-- Question 2
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c1_l2_quiz_id, 'SINGLE_CHOICE', '如果有什么________，尽管问我。', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784042789/Ph%C3%A2n_%C4%91o%E1%BA%A1n_2_ptoiou.mp3', 10, 2, '“困难” có nghĩa là “khó khăn”. Cấu trúc Nếu có khó khăn gì thì cứ hỏi tôi. có nghĩa là “Nếu có khó khăn gì thì cứ hỏi tôi.”');
SET @q2_c1l2_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q2_c1l2_id, 'A. 工作 (gōngzuò)', FALSE, 1),
(@q2_c1l2_id, 'B. 流程 (liúchéng)', FALSE, 2),
(@q2_c1l2_id, 'C. 困难 (kùnnán)', TRUE, 3),
(@q2_c1l2_id, 'D. 规章 (guīzhāng)', FALSE, 4);

-- Question 3
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c1_l2_quiz_id, 'SINGLE_CHOICE', '您好，________！我是今天新来的员工。', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784042790/ph%C3%A2n_%C4%91o%E1%BA%A1n_3_xoyfhi.mp3', 10, 3, '“部门主管” nghĩa là “trưởng bộ phận”. Đây là cách xưng hô phù hợp khi nhân viên mới chào và báo cáo với người quản lý trực tiếp. Câu hoàn chỉnh có nghĩa là: “Chào Trưởng bộ phận! Tôi là nhân viên mới đến hôm nay.”');
SET @q3_c1l2_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q3_c1l2_id, 'A. 同事 (tóngshì)', FALSE, 1),
(@q3_c1l2_id, 'B. 老板 (lǎobǎn)', FALSE, 2),
(@q3_c1l2_id, 'C. 部门主管 (bùmén zhǔguǎn)', TRUE, 3),
(@q3_c1l2_id, 'D. 前台 (qiántái)', FALSE, 4);

-- Question 4
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c1_l2_quiz_id, 'SINGLE_CHOICE', '慢慢熟悉一下工厂的________和安全规章。', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784042791/ph%C3%A2n_%C4%91o%E1%BA%A1n_4_uxfzl8.mp3', 10, 4, '“流程” có nghĩa là “quy trình”. Cụm 流程和安全规章 nghĩa là “quy trình và nội quy an toàn”. Câu hoàn chỉnh 慢慢熟悉一下工厂的流程和安全规章。 có nghĩa là “Hãy từ từ làm quen với quy trình và các quy định an toàn của nhà máy.”');
SET @q4_c1l2_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q4_c1l2_id, 'A. 困难 (kùnnán)', FALSE, 1),
(@q4_c1l2_id, 'B. 流程 (liúchéng)', TRUE, 2),
(@q4_c1l2_id, 'C. 团队 (tuánduì)', FALSE, 3),
(@q4_c1l2_id, 'D. 工作 (gōngzuò)', FALSE, 4);

-- Question 5
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c1_l2_quiz_id, 'SINGLE_CHOICE', '我会努力工作，争取________。', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784042791/ph%C3%A2n_%C4%91o%E1%BA%A1n_5_jiov1x.mp3', 10, 5, '“做好” có nghĩa là “làm tốt”. Cấu trúc 争取做好 diễn tả quyết tâm cố gắng hoàn thành công việc thật tốt. Câu 我会努力工作，争取做好。 có nghĩa là “Tôi sẽ cố gắng làm việc và nỗ lực hoàn thành công việc thật tốt.”');
SET @q5_c1l2_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q5_c1l2_id, 'A. 做好 (zuò hǎo)', TRUE, 1),
(@q5_c1l2_id, 'B. 开始 (kāishǐ)', FALSE, 2),
(@q5_c1l2_id, 'C. 介绍 (jièshào)', FALSE, 3),
(@q5_c1l2_id, 'D. 欢迎 (huānyíng)', FALSE, 4);

-- Question 6
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c1_l2_quiz_id, 'SINGLE_CHOICE', 'Chọn từ thích hợp để điền vào lời chào của Trưởng bộ phận khi chào đón nhân viên mới gia nhập tập thể:\n“欢迎_______我们团队。请坐。”', NULL, 10, 6, 'Trong bối cảnh tiếp đón nhân sự mới, động từ ''加入'' (gia nhập/tham gia) kết hợp với cụm ''我们团队'' (đội ngũ của chúng ta) tạo thành cấu trúc chào mừng chuyên nghiệp tại doanh nghiệp.');
SET @q6_c1l2_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q6_c1l2_id, 'A. 开始 (kāishǐ)', FALSE, 1),
(@q6_c1l2_id, 'B. 加入 (jiārù)', TRUE, 2),
(@q6_c1l2_id, 'C. 介绍 (jièshào)', FALSE, 3),
(@q6_c1l2_id, 'D. 努力 (nǔlì)', FALSE, 4);

-- Question 7
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c1_l2_quiz_id, 'SINGLE_CHOICE', 'Nhân viên mới muốn bày tỏ mong muốn nhận được sự chỉ bảo, dẫn dắt từ quản lý và đồng nghiệp sẽ dùng từ nào?\n“这是我第一次在工业园区工作，希望主管和大家可以_______我。”', NULL, 10, 7, 'Động từ ''指导'' (hướng dẫn, chỉ bảo) được dùng chuẩn xác nhất khi cấp dưới hoặc người mới thể hiện thái độ cầu thị, muốn được cấp trên định hướng công việc.');
SET @q7_c1l2_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q7_c1l2_id, 'A. 流程 (liúchéng)', FALSE, 1),
(@q7_c1l2_id, 'B. 困难 (kùnnán)', FALSE, 2),
(@q7_c1l2_id, 'C. 指导 (zhǐdǎo)', TRUE, 3),
(@q7_c1l2_id, 'D. 谢谢 (xièxie)', FALSE, 4);

-- Question 8
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c1_l2_quiz_id, 'SINGLE_CHOICE', 'Khi Trưởng bộ phận muốn động viên nhân viên mới cứ bình tĩnh, từ từ làm quen với môi trường, họ sẽ dùng mẫu câu nào?\n“没关系，谁都有开始的时候。慢慢熟悉车间的流程就可以了。”', NULL, 10, 8, 'Phó từ ''慢慢'' (từ từ, dần dần) đặt trước động từ ''熟悉'' (làm quen, thuần thục) nhằm diễn tả tiến độ làm quen một cách tuần tự, không vội vã, phù hợp với tâm lý động viên nhân viên mới.');
SET @q8_c1l2_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q8_c1l2_id, 'A. 尽管 (jǐnguǎn)', FALSE, 1),
(@q8_c1l2_id, 'B. 努力 (nǔlì)', FALSE, 2),
(@q8_c1l2_id, 'C. 慢慢 (mànman)', TRUE, 3),
(@q8_c1l2_id, 'D. 争取 (zhēngqǔ)', FALSE, 4);

-- Question 9
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c1_l2_quiz_id, 'SINGLE_CHOICE', 'Nhân viên bày tỏ sự quyết tâm thực hiện tốt nhiệm vụ được phân công sẽ dùng từ khuyết nào dưới đây?\n“好的，部门主管。我会努力工作，争取_______。”', NULL, 10, 9, 'Bổ ngữ kết quả ''做好'' (làm tốt) đi liền sau động từ hành động và từ biểu thị mục tiêu phấn đấu ''争取'' (tranh thủ/phấn đấu) thể hiện mục đích hoàn thành xuất sắc công việc.');
SET @q9_c1l2_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q9_c1l2_id, 'A. 做好 (zuò hǎo)', TRUE, 1),
(@q9_c1l2_id, 'B. 介绍 (jièshào)', FALSE, 2),
(@q9_c1l2_id, 'C. 欢迎 (huānyíng)', FALSE, 3),
(@q9_c1l2_id, 'D. 开始 (kāishǐ)', FALSE, 4);

-- Question 10
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c1_l2_quiz_id, 'SINGLE_CHOICE', 'Hoàn thành câu thoại của nhân viên mới khi giới thiệu bản thân trước người quản lý phòng ban lần đầu gặp mặt:\n“您好，部门主管！我是今天_______的员工。”', NULL, 10, 10, 'Cụm định ngữ ''新来'' (mới đến) bổ nghĩa cho danh từ ''员工'' (nhân viên) chỉ rõ danh tính, vị trí của nhân sự vừa mới bước chân vào tổ chức cơ quan.');
SET @q10_c1l2_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q10_c1l2_id, 'A. 同事 (tóngshì)', FALSE, 1),
(@q10_c1l2_id, 'B. 工厂 (gōngchǎng)', FALSE, 2),
(@q10_c1l2_id, 'C. 新来 (xīn lái)', TRUE, 3),
(@q10_c1l2_id, 'D. 困难 (kùnnán)', FALSE, 4);

-- Question 11
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c1_l2_quiz_id, 'SINGLE_CHOICE', 'Từ khóa “部门主管” có ý nghĩa hành chính và chức vụ nào dưới đây?', NULL, 10, 11, '“部门主管” (bùmén zhǔguǎn) được cấu thành từ ''部门'' (bộ phận/phòng ban) và ''主管'' (người quản lý/trưởng), chỉ người đứng đầu điều hành một bộ phận.');
SET @q11_c1l2_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q11_c1l2_id, 'A. Nhân viên mới', FALSE, 1),
(@q11_c1l2_id, 'B. Trưởng bộ phận / Quản lý phòng ban', TRUE, 2),
(@q11_c1l2_id, 'C. Đồng nghiệp', FALSE, 3),
(@q11_c1l2_id, 'D. Công nhân xưởng sản xuất', FALSE, 4);

-- Question 12
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c1_l2_quiz_id, 'SINGLE_CHOICE', 'Xác định phiên âm Pinyin chính xác của từ “请坐” (Mời ngồi):', NULL, 10, 12, '“请坐” có phiên âm chuẩn xác là ''qǐng zuò'' (thanh 3 và thanh 4), là câu khẩu lệnh lịch sự dùng để mời khách hoặc nhân viên ngồi xuống trao đổi.');
SET @q12_c1l2_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q12_c1l2_id, 'A. qǐng shū', FALSE, 1),
(@q12_c1l2_id, 'B. qǐng jìn', FALSE, 2),
(@q12_c1l2_id, 'C. qǐng zuò', TRUE, 3),
(@q12_c1l2_id, 'D. qǐng lái', FALSE, 4);

-- Question 13
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c1_l2_quiz_id, 'SINGLE_CHOICE', 'Cho chữ Hán “困难”, hãy xác định ý nghĩa và phiên âm chuẩn xác của từ này trong ngữ cảnh làm việc:', NULL, 10, 13, '“困难” phát âm là ''kùnnán'', đóng vai trò là danh từ hoặc tính từ thể hiện các vấn đề nan giải, trở ngại gặp phải trong quá trình thực hiện nhiệm vụ.');
SET @q13_c1l2_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q13_c1l2_id, 'A. kùnnán | Khó khăn, trở ngại', TRUE, 1),
(@q13_c1l2_id, 'B. kùnlán | Thuận lợi', FALSE, 2),
(@q13_c1l2_id, 'C. gōngzuò | Công việc', FALSE, 3),
(@q13_c1l2_id, 'D. liúchéng | Quy trình', FALSE, 4);

-- Question 14
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c1_l2_quiz_id, 'SINGLE_CHOICE', 'Xác định nghĩa tiếng Việt chuẩn xác nhất của tổ hợp danh từ “安全规章” dùng trong nhà xưởng sản xuất:', NULL, 10, 14, '“安全规章” (ānquán guīzhāng) kết hợp từ ''安全'' (an toàn) và ''规章'' (quy chương/quy định), là thuật ngữ bắt buộc công nhân phải học thuộc để bảo vệ an toàn lao động.');
SET @q14_c1l2_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q14_c1l2_id, 'A. Quy trình sản xuất', FALSE, 1),
(@q14_c1l2_id, 'B. Nội quy an toàn / Quy định an toàn', TRUE, 2),
(@q14_c1l2_id, 'C. Khu công nghiệp', FALSE, 3),
(@q14_c1l2_id, 'D. Đội nhóm làm việc', FALSE, 4);

-- Question 15
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c1_l2_quiz_id, 'SINGLE_CHOICE', 'Tìm từ viết bằng chữ Hán chuẩn xác ứng với phiên âm “jièshào” mang nghĩa giới thiệu nhân sự, đồng nghiệp:', NULL, 10, 15, 'Chữ Hán ''介绍'' có phiên âm chuẩn xác là ''jièshào'' (hai thanh 4 dứt khoát), dùng làm động từ trong câu giới thiệu, làm quen thành viên mới trong công ty.');
SET @q15_c1l2_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q15_c1l2_id, 'A. 流程', FALSE, 1),
(@q15_c1l2_id, 'B. 尽管', FALSE, 2),
(@q15_c1l2_id, 'C. 努力', FALSE, 3),
(@q15_c1l2_id, 'D. 介绍', TRUE, 4);

-- Chapter 1 Lesson 3
-- Vocabularies
INSERT INTO vocabularies (lesson_id, hanzi, pinyin, vietnamese_meaning, image_url, audio_url, order_index) VALUES
(35, '大家好', 'dàjiā hǎo', 'Xin chào mọi người', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784047248/xin_ch%C3%A0o_m%E1%BB%8Di_ng%C6%B0%E1%BB%9Di_dwidto.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784047363/Xin_ch%C3%A0o_m%E1%BB%8Di_ng%C6%B0%E1%BB%9Di_vpblcu.mp3', 1),
(35, '今天', 'jīntiān', 'Hôm nay', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784047234/h%C3%B4m_nay_quippl.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784047348/H%C3%B4m_nay_g3hrtb.mp3', 2),
(35, '刚', 'gāng', 'Vừa mới', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784047247/v%E1%BB%ABa_m%E1%BB%9Bi_suaugp.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784047362/V%E1%BB%ABa_m%E1%BB%9Bi_hmflfd.mp3', 3),
(35, '上班', 'shàngbān', 'Đi làm', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784047249/%C4%9i_l%C3%A0m_lwt0el.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784047364/%C4%91i_l%C3%A0m_zipuqr.mp3', 4),
(35, '很高兴', 'hěn gāoxìng', 'Rất vui', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784047244/r%E1%BA%A5t_vui_lcbt2u.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784047358/R%E1%BA%A5t_vui_y6m5hv.mp3', 5),
(35, '认识', 'rènshi', 'Làm quen, quen biết', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784047238/l%C3%A0m_quen_y1zm5q.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784047352/L%C3%A0m_quen_quen_bi%E1%BA%BFt_twytod.mp3', 6),
(35, '大家', 'dàjiā', 'Mọi người', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784047239/m%E1%BB%8Di_ng%C6%B0%E1%BB%9Di_a7pyk0.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784047353/M%E1%BB%8Di_ng%C6%B0%E1%BB%9Di_j0nmog.mp3', 7),
(35, '欢迎', 'huānyíng', 'Chào mừng', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784047230/ch%C3%A0o_m%E1%BB%ABng_k7i1sh.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784047343/Ch%C3%A0o_m%E1%BB%ABng_vkzmad.mp3', 8),
(35, '我叫', 'wǒ jiào', 'Tôi tên là', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784047246/t%C3%B4i_t%C3%AAn_l%C3%A0_imuj1t.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784047361/T%C3%B4i_t%C3%AAn_l%C3%A0_e37kwp.mp3', 9),
(35, '旁边', 'pángbiān', 'Bên cạnh', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784047228/b%C3%AAn_c%E1%BA%A1nh_utrvbt.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784047341/B%C3%AAn_c%E1%BA%A1nh_sv3iq3.mp3', 10),
(35, '希望', 'xīwàng', 'Hy vọng', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784047233/hi_v%E1%BB%8Dng_g1oes8.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784047347/Hy_v%E1%BB%8Dng_a2qmw6.mp3', 11),
(35, '以后', 'yǐhòu', 'Sau này', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784047245/sau_n%C3%A0y_k9buhm.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784047359/Sau_n%C3%A0y_jtx5cb.mp3', 12),
(35, '多多指导', 'duōduō zhǐdǎo', 'Chỉ bảo nhiều hơn', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784047231/ch%E1%BB%89_b%E1%BA%A3o_nhi%E1%BB%81u_h%C6%A1n_brjn01.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784047345/Ch%E1%BB%89_b%E1%BA%A3o_nhi%E1%BB%81u_h%C6%A1n_zs2tzp.mp3', 13),
(35, '不懂', 'bù dǒng', 'Không hiểu', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784047235/kh%C3%B4ng_hi%E1%BB%83u_uetpvk.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784047349/Kh%C3%B4ng_hi%E1%BB%83u_pk6lc0.mp3', 14),
(35, '麻烦', 'máfan', 'Phiên, làm phiền', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784047237/l%C3%A0m_phi%E1%BB%81n_hrblet.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784047356/Phi%C3%AAn_l%C3%A0m_phi%E1%BB%81n_asb1ir.mp3', 15),
(35, '没问题', 'méi wèntí', 'Không vấn đề', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784047236/kh%C3%B4ng_v%E1%BA%A5n_%C4%91%E1%BB%81_w5xm0w.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784047351/Kh%C3%B4ng_v%E1%BA%A5n_%C4%91%E1%BB%81_ugmgsj.mp3', 16),
(35, '工作节奏', 'gōngzuò jiézòu', 'Nhịp độ công việc', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784047240/nh%E1%BB%8Bp_%C4%91%E1%BB%99_c%C3%B4ng_vi%E1%BB%87c_b2rwhy.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784047354/Nh%E1%BB%8Bp_%C4%91%E1%BB%99_c%C3%B4ng_vi%E1%BB%87c_fcoy3f.mp3', 17),
(35, '很快', 'hěn kuài', 'Rất nhanh', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784047243/r%E1%BA%A5t_nhanh_faljwz.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784047357/R%E1%BA%A5t_nhanh_zvxbkv.mp3', 18),
(35, '熟悉', 'shúxī', 'Quen thuộc', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784047241/quen_thu%E1%BB%99c_iygcmv.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784047356/Quen_thu%E1%BB%99c_w6jmmf.mp3', 19),
(35, '正常', 'zhèngcháng', 'Bình thường', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784047229/b%C3%ACnh_th%C6%B0%E1%BB%9Dng_vktfek.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784047342/B%C3%ACnh_th%C6%B0%E1%BB%9Dng_aqjvhe.mp3', 20),
(35, '别着急', 'bié zhāojí', 'Đừng vội', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784047250/%C4%91%E1%BB%ABng_v%E1%BB%99i_puyabr.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784047366/%C4%90%E1%BB%ABng_v%E1%BB%99i_nsr2di.mp3', 21),
(35, '谢谢大家', 'xièxie dàjiā', 'Cảm ơn mọi người', 'https://res.cloudinary.com/rir6b8kp/image/upload/v1784047232/c%E1%BA%A3m_%C6%A1n_m%E1%BB%8Di_ng%C6%B0%E1%BB%9Di_y6qtax.png', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784047346/C%E1%BA%A3m_%C6%A1n_m%E1%BB%8Di_ng%C6%B0%E1%BB%9Di_gaaih9.mp3', 22);

-- Sentence Patterns
INSERT INTO sentence_patterns (lesson_id, chinese_text, pinyin_text, vietnamese_meaning, audio_url, order_index) VALUES
(35, '希望以后大家能多多指导我。如果有什么不懂的，就麻烦大家了。', 'Xīwàng yǐhòu dàjiā néng duōduō zhǐdǎo wǒ. Rúguǒ yǒu shénme bù dǒng de, jiù máfan dàjiā le.', 'Sau này mong được mọi người chỉ bảo thêm. Nếu tôi có chỗ nào chưa biết, phải làm phiền mọi người rồi.', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784047734/MC1-1_g4zyys.mp3', 1),
(35, '以后还要多多麻烦大家，谢谢大家。', 'Yǐhòu hái yào duōduō máfan dàjiā, xièxie dàjiā.', 'Sau này còn phải làm phiền mọi người nhiều, xin cảm ơn mọi người.', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784047735/MC1-2_gsi0qy.mp3', 2),
(35, '我们 factory 的工作节奏很快，刚开始有点不熟悉很正常，别着急。', 'Wǒmen gōngchǎng de gōngzuò jiézòu hěn kuài, gāng kāishǐ yǒudiǎn bù shúxī hěn zhèngcháng, bié zháojí.', 'Nhịp độ công việc ở xưởng mình khá nhanh, mới đầu chưa quen là chuyện bình thường thôi, cứ từ từ nhé (đừng vội).', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784047737/MC2-1_tdxnth.mp3', 3),
(35, '刚开始不熟悉很正常，别着急，慢慢来。', 'Gāng kāishǐ bù shúxī hěn zhèngcháng, bié zháojí, mànmàn lái.', 'Mới đầu chưa quen là chuyện bình thường, đừng vội vàng, cứ từ từ làm.', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784047738/MC2-2_uey1nc.mp3', 4);

-- Quiz
INSERT INTO quizzes (title, teacher_id, lesson_id, time_limit_minutes, pass_score) VALUES
('Trắc nghiệm Chapter 1 Lesson 3', 4, 35, 15, 50);
SET @c1_l3_quiz_id = LAST_INSERT_ID();

-- Question 1
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c1_l3_quiz_id, 'SINGLE_CHOICE', '大家________！', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784047617/ph%C3%A2n_%C4%91o%E1%BA%A1n_1_ytxxyd.mp3', 10, 1, '“大家好” là lời chào phổ biến trong tiếng Trung, có nghĩa là “Xin chào mọi người”. Đây là cách mở đầu thường dùng khi giới thiệu bản thân hoặc phát biểu trước tập thể.');
SET @q1_c1l3_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q1_c1l3_id, 'A. 好 (hǎo)', TRUE, 1),
(@q1_c1l3_id, 'B. 是 (shì)', FALSE, 2),
(@q1_c1l3_id, 'C. 来 (lái)', FALSE, 3),
(@q1_c1l3_id, 'D. 去 (qù)', FALSE, 4);

-- Question 2
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c1_l3_quiz_id, 'SINGLE_CHOICE', '________！我们 factory 的工作节奏很快。', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784047618/ph%C3%A2n_%C4%91o%E1%BA%A1n_2_h16myb.mp3', 10, 2, '“没问题” có nghĩa là “Không vấn đề gì”, “Được thôi”, hoặc “Không sao”. Đây là cách trả lời rất phổ biến để thể hiện sự đồng ý hoặc trấn an người khác. Câu hoàn chỉnh 没问题！我们 factory 的工作节奏很快。 mở đầu bằng lời khẳng định trước khi giới thiệu về môi trường làm việc.');
SET @q2_c1l3_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q2_c1l3_id, 'A. 高兴 (gāoxìng)', FALSE, 1),
(@q2_c1l3_id, 'B. 问题 (wèntí)', FALSE, 2),
(@q2_c1l3_id, 'C. 没问题 (méi wèntí)', TRUE, 3),
(@q2_c1l3_id, 'D. 工作 (gōngzuò)', FALSE, 4);

-- Question 3
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c1_l3_quiz_id, 'SINGLE_CHOICE', '我 hôm nay ________来上班，很高兴认识大家！', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784047619/ph%C3%A2n_%C4%91o%E1%BA%A1n_3_n3na3a.mp3', 10, 3, '“刚” có nghĩa là “vừa mới”. Cấu trúc 刚来上班 nghĩa là “vừa mới đi làm”. Câu hoàn chỉnh 我 hôm nay 刚来上班，很高兴认识大家！ có nghĩa là “Hôm nay tôi vừa mới đi làm, rất vui được làm quen với mọi người!”');
SET @q3_c1l3_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q3_c1l3_id, 'A. 刚 (gāng)', TRUE, 1),
(@q3_c1l3_id, 'B. 很 (hěn)', FALSE, 2),
(@q3_c1l3_id, 'C. 也 (yě)', FALSE, 3),
(@q3_c1l3_id, 'D. 就 (jiù)', FALSE, 4);

-- Question 4
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c1_l3_quiz_id, 'SINGLE_CHOICE', '我们 factory 的________快，刚开始有点 không quen rất bình thường.', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784047620/ph%C3%A2n_%C4%91o%E1%BA%A1n_4_ado9kg.mp3', 10, 4, '“工作节奏” có nghĩa là “nhịp độ công việc”. Cụm 工作节奏很快 nghĩa là “nhịp độ công việc rất nhanh”. Đây là cách diễn đạt phổ biến để mô tả cường độ và tốc độ làm việc trong doanh nghiệp hoặc nhà máy.');
SET @q4_c1l3_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q4_c1l3_id, 'A. 工业园区 (gōngyè yuánqū)', FALSE, 1),
(@q4_c1l3_id, 'B. 安全规章 (ānquán guīzhāng)', FALSE, 2),
(@q4_c1l3_id, 'C. 工作节奏 (gōngzuò jiézòu)', TRUE, 3),
(@q4_c1l3_id, 'D. 部门主管 (bùmén zhǔguǎn)', FALSE, 4);

-- Question 5
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c1_l3_quiz_id, 'SINGLE_CHOICE', '刚开始 hungry 有点不熟悉很正常，________。', 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784047621/ph%C3%A2n_%C4%91o%E1%BA%A1n_5_oze7ii.mp3', 10, 5, '“别着急” có nghĩa là “Đừng vội”, “Đừng lo lắng”. Câu 刚开始 hungry 有点不熟悉很正常，别 lo lắng。 là lời động viên thường dùng với nhân viên mới, nhấn mạnh rằng việc chưa quen công việc lúc ban đầu là điều bình thường và không cần quá căng thẳng.');
SET @q5_c1l3_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q5_c1l3_id, 'A. 别着急 (bié zháojí)', TRUE, 1),
(@q5_c1l3_id, 'B. 谢谢大家 (xièxie dàjiā)', FALSE, 2),
(@q5_c1l3_id, 'C. 多多指导 (duōduō zhǐdǎo)', FALSE, 3),
(@q5_c1l3_id, 'D. 没关系 (méiguānxi)', FALSE, 4);

-- Question 6
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c1_l3_quiz_id, 'SINGLE_CHOICE', 'Chọn cụm từ thích hợp để điền vào lời chào lịch sự của nhân viên mới khi giới thiệu bản thân trước tập thể bộ phận:\n“_______！我 hôm nay 刚来上班，很高兴认识大家！”', NULL, 10, 6, 'Cụm từ ''大家好'' (chào mọi người) là lời chào mở đầu phổ biến, lịch sự nhất khi đứng trước một tập thể đông người để giới thiệu bản thân.');
SET @q6_c1l3_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q6_c1l3_id, 'A. 没问题 (méi wèntí)', FALSE, 1),
(@q6_c1l3_id, 'B. 大家好 (dàjiā hǎo)', TRUE, 2),
(@q6_c1l3_id, 'C. 别着急 (bié zhāojí)', FALSE, 3),
(@q6_c1l3_id, 'D. 旁边 (pángbiān)', FALSE, 4);

-- Question 7
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c1_l3_quiz_id, 'SINGLE_CHOICE', 'Điền cụm từ khuyết thể hiện thái độ cầu thị nhờ vả, làm phiền mọi người hướng dẫn công việc sau này:\n“希望以后大家能多多指导我。如果有什么不懂 của, 就_______大家了。”', NULL, 10, 7, 'Cấu trúc ''就麻烦大家了'' (phải làm phiền mọi người rồi) thể hiện sự khéo léo, tôn trọng và tạo thiện cảm lớn với các đồng nghiệp cũ trong ngày đầu nhận việc.');
SET @q7_c1l3_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q7_c1l3_id, 'A. 正常 (zhèngcháng)', FALSE, 1),
(@q7_c1l3_id, 'B. 认识 (rènshi)', FALSE, 2),
(@q7_c1l3_id, 'C. 麻烦 (máfan)', TRUE, 3),
(@q7_c1l3_id, 'D. 欢迎 (huānyíng)', FALSE, 4);

-- Question 8
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c1_l3_quiz_id, 'SINGLE_CHOICE', 'Chọn cụm từ khuyết thích hợp thể hiện lời phản hồi khẳng định sẵn sàng hỗ trợ nhân viên mới của người đồng nghiệp:\n“_______！刚开始 hungry 有点 không quen rất bình thường, đừng lo lắng。”', NULL, 10, 8, 'Cụm từ ''没问题'' (không vấn đề gì/được chứ) mang sắc thái cởi mở, khẳng định đồng nghiệp cũ luôn sẵn sàng giúp đỡ và chỉ bảo cho người mới.');
SET @q8_c1l3_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q8_c1l3_id, 'A. 没问题 (méi wèntí)', TRUE, 1),
(@q8_c1l3_id, 'B. 节奏 (jiézòu)', FALSE, 2),
(@q8_c1l3_id, 'C. 上班 (shàngbān)', FALSE, 3),
(@q8_c1l3_id, 'D. 以后 (yǐhòu)', FALSE, 4);

-- Question 9
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c1_l3_quiz_id, 'SINGLE_CHOICE', 'Điền trạng từ chỉ thời gian thích hợp thể hiện trạng thái vừa mới bước chân vào nhà xưởng đi làm ngày hôm nay:\n“大家好！我 hôm nay _______来上班，很高兴认识大家！”', NULL, 10, 9, 'Phó từ ''刚'' (vừa/vừa mới) đứng trước động từ ''来'' (đến) bổ nghĩa thời gian cho hành động nhận việc xảy ra ngay sát mốc hiện tại.');
SET @q9_c1l3_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q9_c1l3_id, 'A. 很快 (hěn kuài)', FALSE, 1),
(@q9_c1l3_id, 'B. 刚 (gāng)', TRUE, 2),
(@q9_c1l3_id, 'C. 以后 (yǐhòu)', FALSE, 3),
(@q9_c1l3_id, 'D. 正常 (zhèngcháng)', FALSE, 4);

-- Question 10
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c1_l3_quiz_id, 'SINGLE_CHOICE', 'Hoàn thành lời khuyên trấn an tinh thần của đồng nghiệp khi thấy người mới lo lắng về áp lực tiến độ tại xưởng:\n“我们 factory 的工作节奏很快，刚开始 hungry 有点 không quen rất bình thường,_______。”', NULL, 10, 10, 'Cụm từ khẩu ngữ ''别着急'' (đừng vội/đừng lo lắng) dùng để xoa dịu tâm lý căng thẳng, áp lực cho nhân sự mới khi tiếp xúc với môi trường làm việc tốc độ cao.');
SET @q10_c1l3_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q10_c1l3_id, 'A. 谢谢大家 (xièxiè dàjiā)', FALSE, 1),
(@q10_c1l3_id, 'B. 多多指导 (duōduō zhǐdǎo)', FALSE, 2),
(@q10_c1l3_id, 'C. 别着急 (bié zhāojí)', TRUE, 3),
(@q10_c1l3_id, 'D. 很高兴 (hěn gāoxìng)', FALSE, 4);

-- Question 11
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c1_l3_quiz_id, 'SINGLE_CHOICE', 'Tìm nghĩa tiếng Việt chuẩn xác nhất của cụm từ “工作节奏” thường dùng để mô tả đặc thù công việc tại các nhà máy, xưởng sản xuất:', NULL, 10, 11, '“工作节奏” ghép từ ''工作'' (công việc) và ''节奏'' (nhịp điệu/nhịp độ), dùng để chỉ tốc độ và áp lực tiến độ hoàn thành các công đoạn sản xuất.');
SET @q11_c1l3_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q11_c1l3_id, 'A. Quy định an toàn nhà xưởng', FALSE, 1),
(@q11_c1l3_id, 'B. Nhịp độ công việc / Tốc độ công việc', TRUE, 2),
(@q11_c1l3_id, 'C. Đồng nghiệp cùng tổ đội', FALSE, 3),
(@q11_c1l3_id, 'D. Khu công nghiệp tập trung', FALSE, 4);

-- Question 12
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c1_l3_quiz_id, 'SINGLE_CHOICE', 'Xác định phiên âm Pinyin chính xác của từ “认识” (Quen biết, làm quen):', NULL, 10, 12, '“认识” có phiên âm chuẩn xác là ''rènshi'' (thanh 4 kết hợp với thanh nhẹ), thường dùng trong mẫu câu giao tiếp ''很高兴认识 bạn'' (rất vui được làm quen với bạn).');
SET @q12_c1l3_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q12_c1l3_id, 'A. rènshi', TRUE, 1),
(@q12_c1l3_id, 'B. rènshì', FALSE, 2),
(@q12_c1l3_id, 'C. rénshī', FALSE, 3),
(@q12_c1l3_id, 'D. lènshǐ', FALSE, 4);

-- Question 13
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c1_l3_quiz_id, 'SINGLE_CHOICE', 'Cho chữ Hán “旁边”, hãy xác định ý nghĩa và vị trí không gian không gian tương ứng của từ này:', NULL, 10, 13, '“旁边” phát âm là ''pángbiān'' là danh từ chỉ phương vị mang nghĩa là bên cạnh, kế bên (Ví dụ: 坐在你旁边 - ngồi ngay cạnh bạn).');
SET @q13_c1l3_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q13_c1l3_id, 'A. Phía sau xưởng', FALSE, 1),
(@q13_c1l3_id, 'B. Bên cạnh / Kế bên', TRUE, 2),
(@q13_c1l3_id, 'C. Ngồi đối diện', FALSE, 3),
(@q13_c1l3_id, 'D. Đi ra ngoài', FALSE, 4);

-- Question 14
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c1_l3_quiz_id, 'SINGLE_CHOICE', 'Xác định nghĩa tiếng Việt chuẩn xác của tính từ “正常” trong câu thoại của đồng nghiệp cũ động viên người mới:', NULL, 10, 14, '“正常” (zhèngcháng) nghĩa là bình thường, điều tất yếu (Ví dụ: 不熟悉很正常 - mới đầu chưa quen là chuyện hết sức bình thường).');
SET @q14_c1l3_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q14_c1l3_id, 'A. Khó khăn, vất vả', FALSE, 1),
(@q14_c1l3_id, 'B. Nhanh chóng, khẩn trương', FALSE, 2),
(@q14_c1l3_id, 'C. Bình thường / Quy luật tự nhiên', TRUE, 3),
(@q14_c1l3_id, 'D. Nghiêm túc, tuân thủ', FALSE, 4);

-- Question 15
INSERT INTO questions (quiz_id, question_type, content, audio_url, points, order_index, explanation) VALUES
(@c1_l3_quiz_id, 'SINGLE_CHOICE', 'Tìm từ viết bằng chữ Hán chuẩn xác ứng với phiên âm “shàngbān” mang nghĩa là đi làm, vào ca làm việc:', NULL, 10, 15, 'Chữ Hán ''上班'' có phiên âm chuẩn là ''shàngbān'', là động từ ly hợp dùng để chỉ hành động đến cơ quan, nhà máy thực hiện ca làm việc.');
SET @q15_c1l3_id = LAST_INSERT_ID();
INSERT INTO answers (question_id, content, is_correct, order_index) VALUES
(@q15_c1l3_id, 'A. 上班', TRUE, 1),
(@q15_c1l3_id, 'B. 下班', FALSE, 2),
(@q15_c1l3_id, 'C. 加班', FALSE, 3),
(@q15_c1l3_id, 'D. 刚来', FALSE, 4);




