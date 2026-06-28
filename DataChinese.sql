USE chinese_online_learning;



-- ==========================================
-- 1. MASTER DATA: ROLES, PERMISSIONS, CATEGORIES, TAGS, PLANS
-- ==========================================

INSERT INTO roles (id, name, description) VALUES
(1, 'ADMIN', 'Quản trị viên toàn quyền hệ thống'),
(2, 'TEACHER', 'Giảng viên biên soạn khóa học, chấm điểm bài tập'),
(3, 'STUDENT', 'Học viên tham gia các khóa học và thi cử');

INSERT INTO permissions (id, code, name) VALUES
(1, 'COURSE_CREATE', 'Tạo khóa học mới'),
(2, 'COURSE_PUBLISH', 'Phê duyệt xuất bản khóa học'),
(3, 'LESSON_VIEW', 'Xem video bài học'),
(4, 'QUIZ_ATTEMPT', 'Làm bài kiểm tra'),
(5, 'GRADE_ASSIGNMENT', 'Chấm điểm bài tập tự luận');

INSERT INTO role_permissions (role_id, permission_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5),
(2, 1), (2, 3), (2, 5),
(3, 3), (3, 4);

INSERT INTO categories (id, parent_id, name, slug, order_index) VALUES
(1, NULL, 'Tiếng Trung Giao Tiếp', 'tieng-trung-giao-tiep', 1),
(2, NULL, 'Luyện Thi HSK', 'luyen-thi-hsk', 2),
(3, 2, 'HSK 1 - HSK 2', 'hsk-1-hsk-2', 1),
(4, 2, 'HSK 3 - HSK 4', 'hsk-3-hsk-4', 2),
(5, 2, 'HSK 5 - HSK 6', 'hsk-5-hsk-6', 3),
(6, NULL, 'Tiếng Trung Thương Mại', 'tieng-trung-thuong-mai', 3);

INSERT INTO tags (id, name, slug) VALUES
(1, 'Phát âm sơ cấp', 'phat-am-so-cap'),
(2, 'Từ vựng HSK3', 'tu-vung-hsk3'),
(3, 'Giao tiếp công sở', 'giao-tiep-cong-so'),
(4, 'Ngữ pháp cơ bản', 'ngu-phap-co-ban'),
(5, 'Luyện viết chữ Hán', 'luyen-viet-chu-han'),
(6, 'Đàm phán thương mại', 'dam-phan-thuong-mai');

INSERT INTO plans (id, name, duration_days, price) VALUES
(1, 'Gói Tháng Cơ Bản', 30, 250000.00),
(2, 'Gói 6 Tháng Phổ Thông', 180, 1200000.00),
(3, 'Gói VIP 1 Năm Toàn Diện', 365, 2100000.00);

-- ==========================================
-- 2. AUTHENTICATION & USER MANAGEMENT
-- ==========================================

INSERT INTO users (id, full_name, email, password_hash, status, total_learning_points, referral_code) VALUES
(1, 'Nguyễn Văn Admin', 'admin@chinese.edu.vn', '$2a$12$Rpx.', 'ACTIVE', 0, 'ADMIN999'),
(2, 'Trần Lão Sư', 'tranlaosu@chinese.edu.vn', '$2a$12$Rpx.', 'ACTIVE', 50, 'TEACH777'),
(3, 'Hoàng Đức Thuận', 'thuanhdhe186818@fpt.edu.vn', '$2a$12$Rpx.', 'ACTIVE', 520, 'THUAN186'),
(4, 'Lê Minh Anh', 'minhanh@gmail.com', '$2a$12$Rpx.', 'ACTIVE', 280, 'ANHMINH1'),
(5, 'Vũ Tuyết Mai', 'tuyetmai@gmail.com', '$2a$12$Rpx.', 'ACTIVE', 45, 'MAITUYET'),
(6, 'Phạm Quốc Bảo', 'quocbao@gmail.com', '$2a$12$Rpx.', 'ACTIVE', 890, 'BAOPHAM9'),
(7, 'Đỗ Thùy Linh', 'thuylinh@gmail.com', '$2a$12$Rpx.', 'ACTIVE', 0, 'LINHDO99'),
(8, 'Nguyễn Đình Tuấn', 'dinhtuan@gmail.com', '$2a$12$Rpx.', 'LOCKED', 120, 'TUANNGUYEN');

INSERT INTO user_roles (user_id, role_id) VALUES
(1, 1), (2, 2), (3, 3), (4, 3), (5, 3), (6, 3), (7, 3), (8, 3);

INSERT INTO verification_tokens (id, token, token_type, user_id, expiry_date, is_used) VALUES
(1, 'abc-123-xyz', 'EMAIL_VERIFICATION', 3, '2026-07-10 00:00:00', TRUE),
(2, 'def-456-uvw', 'PASSWORD_RESET', 4, '2026-06-30 23:00:00', FALSE),
(3, 'ghi-789-mno', 'EMAIL_VERIFICATION', 6, '2026-06-20 15:00:00', TRUE),
(4, 'jkl-012-pqr', 'EMAIL_VERIFICATION', 7, '2026-06-28 21:00:00', FALSE);

-- ==========================================
-- 3. COURSE & LEARNING LOGIC
-- ==========================================

INSERT INTO courses (id, teacher_id, category_id, title, description, thumbnail_url, status) VALUES
(1, 2, 1, 'Nhập môn Tiếng Trung: Phát âm và Chữ Hán cơ bản', 'Nền tảng Pinyin, thanh điệu và quy tắc bút thuận cho người mới.', 'https://img.cdn/thumb-c1.jpg', 'PUBLISHED'),
(2, 2, 4, 'Bứt phá HSK 3 trong 30 ngày', 'Tổng hợp 600 từ vựng và cấu trúc ngữ pháp trọng điểm HSK 3.', 'https://img.cdn/thumb-c2.jpg', 'PUBLISHED'),
(3, 2, 6, 'Tiếng Trung Thương Mại: Đàm phán và Ký kết', 'Kỹ năng giao tiếp chuyên sâu trong môi trường công sở và đối tác Trung Quốc.', 'https://img.cdn/thumb-c3.jpg', 'PUBLISHED'),
(4, 2, 5, 'Luyện dịch chuyên sâu HSK 5', 'Khóa nâng cao dành cho học viên muốn chinh phục mốc HSK cao cấp.', 'https://img.cdn/thumb-c4.jpg', 'DRAFT');

INSERT INTO course_plan_access (course_id, plan_id) VALUES
(1, 1), (1, 3),
(2, 2), (2, 3),
(3, 3);

INSERT INTO course_tags (course_id, tag_id) VALUES
(1, 1), (1, 4), (1, 5),
(2, 2), (2, 4),
(3, 3), (3, 6);

-- Khóa 1: 3 Chương
INSERT INTO chapters (id, course_id, title, order_index) VALUES
(1, 1, 'Chương 1: Hệ thống ngữ âm Pinyin và Thanh điệu', 1),
(2, 1, 'Chương 2: Các nét cơ bản và Quy tắc bút thuận', 2),
(3, 1, 'Chương 3: Giao tiếp chào hỏi căn bản', 3);

-- Khóa 2: 1 Chương mẫu
INSERT INTO chapters (id, course_id, title, order_index) VALUES
(4, 2, 'Chương 1: Từ vựng trọng điểm về Đời sống và Du lịch', 1);

-- Bài học Chương 1 (Khóa 1)
INSERT INTO lessons (id, chapter_id, title, video_url, duration_seconds, order_index) VALUES
(1, 1, 'Bài 1: Nguyên âm đơn và Thanh điệu cơ bản', 'https://video.cdn/lesson1.mp4', 600, 1),
(2, 1, 'Bài 2: Vận mẫu kép và Quy tắc biến điệu', 'https://video.cdn/lesson2.mp4', 900, 2);

-- Bài học Chương 2 (Khóa 1)
INSERT INTO lessons (id, chapter_id, title, video_url, duration_seconds, order_index) VALUES
(3, 2, 'Bài 3: 8 nét chữ Hán cơ bản và cách viết', 'https://video.cdn/lesson3.mp4', 1200, 1),
(4, 2, 'Bài 4: Quy tắc thuận tay (Bút thuận)', 'https://video.cdn/lesson4.mp4', 1050, 2);

-- Bài học Chương 3 (Khóa 1)
INSERT INTO lessons (id, chapter_id, title, video_url, duration_seconds, order_index) VALUES
(5, 3, 'Bài 5: Xin chào và Tạm biệt', 'https://video.cdn/lesson5.mp4', 800, 1);

-- Bài học Khóa 2
INSERT INTO lessons (id, chapter_id, title, video_url, duration_seconds, order_index) VALUES
(6, 4, 'Bài 1: Phương hướng và Cách hỏi đường', 'https://video.cdn/lesson6.mp4', 1500, 1);

INSERT INTO lesson_documents (id, lesson_id, title, file_url) VALUES
(1, 1, 'Slide bài giảng Nguyên âm', 'https://docs.cdn/slide-b1.pdf'),
(2, 1, 'Bảng biểu mẫu tập viết Pinyin', 'https://docs.cdn/tap-viet-b1.pdf'),
(3, 3, 'Tập bản vẽ quy tắc bút thuận', 'https://docs.cdn/but-thuan.pdf'),
(4, 5, 'Hội thoại mẫu bằng chữ Pinyin', 'https://docs.cdn/chao-hoi.pdf'),
(5, 6, 'Bản đồ từ vựng phương hướng', 'https://docs.cdn/phuong-huong.pdf');

-- ==========================================
-- 4. INTERACTIVE QUIZ, ASSIGNMENT & EXERCISE
-- ==========================================

INSERT INTO quizzes (id, title, type, lesson_id, chapter_id, time_limit_minutes, pass_score) VALUES
(1, 'Trắc nghiệm luyện tai: Phân biệt Thanh điệu', 'LISTENING', 1, NULL, 10, 60),
(2, 'Kiểm tra tổng hợp kiến thức Chương 1', 'SINGLE_CHOICE', NULL, 1, 20, 70),
(3, 'Thử thách nối từ vựng Chào Hỏi', 'MATCHING', 5, NULL, 5, 80),
(4, 'Khảo sát năng lực HSK 3 đầu khóa', 'HSK_MOCK', NULL, 4, 45, 60);

-- Câu hỏi cho Quiz 1
INSERT INTO questions (id, quiz_id, content, audio_url, points, order_index) VALUES
(1, 1, 'Nghe audio và chọn từ đúng: Bạn nghe thấy "mā" hay "má"?', 'https://audio.cdn/ma1.mp3', 50, 1),
(2, 1, 'Thanh 4 (Thanh khứ) trong tiếng Trung được phát âm như thế nào?', NULL, 50, 2);

INSERT INTO answers (id, question_id, content, is_correct, matching_pair) VALUES
(1, 1, 'mā (Thanh 1)', TRUE, NULL),
(2, 1, 'má (Thanh 2)', FALSE, NULL),
(3, 2, 'Đọc cao và bình bình', FALSE, NULL),
(4, 2, 'Đọc từ cao xuống thấp nhất một cách dứt khoát', TRUE, NULL);

-- Câu hỏi cho Quiz 2 (Tổng hợp chương 1)
INSERT INTO questions (id, quiz_id, content, audio_url, points, order_index) VALUES
(3, 2, 'Khi hai âm tiết cùng mang Thanh 3 đi liền nhau, âm tiết thứ nhất biến điệu thành thanh mấy?', NULL, 100, 1);

INSERT INTO answers (id, question_id, content, is_correct, matching_pair) VALUES
(5, 3, 'Thanh 1', FALSE, NULL),
(6, 3, 'Thanh 2', TRUE, NULL),
(7, 3, 'Thanh 4', FALSE, NULL);

-- Câu hỏi cho Quiz 3 (Matching)
INSERT INTO questions (id, quiz_id, content, audio_url, points, order_index) VALUES
(4, 3, 'Hãy ghép cặp từ tiếng Trung tương ứng với nghĩa tiếng Việt.', NULL, 100, 1);

INSERT INTO answers (id, question_id, content, is_correct, matching_pair) VALUES
(8, 4, '你好', FALSE, 'Xin chào'),
(9, 4, '谢谢', FALSE, 'Cảm ơn'),
(10, 4, '再见', FALSE, 'Tạm biệt');

-- Assignments
INSERT INTO assignments (id, lesson_id, title, description, attachment_url, deadline_days) VALUES
(1, 3, 'Bài tập viết chữ Hán đầu đời', 'Tải file đính kèm, tập viết các chữ: 你, 好, 谢谢. Chụp ảnh nộp bản viết tay.', 'https://docs.cdn/de-bai-tap-viet.pdf', 7),
(2, 6, 'Viết đoạn văn ngắn về kỳ nghỉ của bạn', 'Sử dụng ít nhất 5 từ vựng đã học trong bài 6 viết đoạn văn từ 50-80 chữ Hán.', NULL, 5);

-- ==========================================
-- 5. STUDENT PROGRESS & TRACKING
-- ==========================================

-- Đăng ký khóa học
INSERT INTO course_enrollments (id, user_id, course_id, enrolled_at, completed_at) VALUES
(1, 3, 1, '2026-06-01 08:00:00', NULL),
(2, 4, 1, '2026-06-15 09:30:00', NULL),
(3, 6, 1, '2026-05-10 11:00:00', '2026-06-15 16:20:00'), -- Bảo đã học xong khóa 1
(4, 6, 2, '2026-06-16 08:00:00', NULL),
(5, 5, 1, '2026-06-20 14:00:00', NULL);

-- Tiến độ học tập chi tiết của Đức Thuận (User 3)
INSERT INTO lesson_progress (user_id, lesson_id, watch_seconds, is_completed) VALUES
(3, 1, 600, TRUE),
(3, 2, 450, FALSE),
(3, 3, 1200, TRUE),
(3, 4, 0, FALSE);

INSERT INTO user_lesson_progress (user_id, lesson_id, current_time_seconds, is_completed) VALUES
(3, 1, 600, TRUE),
(3, 2, 450, FALSE),
(3, 3, 1200, TRUE),
(3, 4, 0, FALSE);

-- Tiến độ học tập của Quốc Bảo (User 6 - Học xong sạch sẽ khóa 1)
INSERT INTO user_lesson_progress (user_id, lesson_id, current_time_seconds, is_completed) VALUES
(6, 1, 600, TRUE),
(6, 2, 900, TRUE),
(6, 3, 1200, TRUE),
(6, 4, 1050, TRUE),
(6, 5, 800, TRUE);

INSERT INTO user_chapter_progress (id, user_id, chapter_id, is_completed, completed_at) VALUES
(1, 6, 1, TRUE, '2026-05-20 10:00:00'),
(2, 6, 2, TRUE, '2026-06-01 15:30:00'),
(3, 6, 3, TRUE, '2026-06-15 16:20:00'),
(4, 3, 1, FALSE, NULL);

-- Lịch sử làm Quiz
-- Lần 1: Đức Thuận làm Quiz 1 qua luôn
INSERT INTO quiz_attempts (id, user_id, quiz_id, score, is_passed, status, started_at, submitted_at) VALUES
(1, 3, 1, 100, TRUE, 'SUBMITTED', '2026-06-02 20:00:00', '2026-06-02 20:08:22');
INSERT INTO student_answers (attempt_id, question_id, selected_answer_id, input_text, is_correct) VALUES
(1, 1, 1, NULL, TRUE),
(1, 2, 4, NULL, TRUE);

-- Lần 2: Minh Anh làm Quiz 1 bị tạch lần đầu
INSERT INTO quiz_attempts (id, user_id, quiz_id, score, is_passed, status, started_at, submitted_at) VALUES
(2, 4, 1, 50, FALSE, 'SUBMITTED', '2026-06-16 10:00:00', '2026-06-16 10:09:00');
INSERT INTO student_answers (attempt_id, question_id, selected_answer_id, input_text, is_correct) VALUES
(2, 1, 2, NULL, FALSE),
(2, 2, 4, NULL, TRUE);

-- Lần 3: Đình Tuấn (User 8) bị hệ thống đánh dấu gian lận do tab out quá nhiều
INSERT INTO quiz_attempts (id, user_id, quiz_id, score, is_passed, status, started_at, submitted_at) VALUES
(3, 8, 2, 0, FALSE, 'CHEATING_SUSPECTED', '2026-06-22 11:00:00', '2026-06-22 11:02:15');

-- Đồng bộ lịch sử tổng quát
INSERT INTO user_quiz_attempts (user_id, quiz_id, score, is_passed, attempt_date) VALUES
(3, 1, 100, TRUE, '2026-06-02 20:08:22'),
(4, 1, 50, FALSE, '2026-06-16 10:09:00');

-- Bài tập nộp (Submissions)
INSERT INTO assignment_submissions (id, assignment_id, user_id, submission_text, file_url, status, score, teacher_feedback, submitted_at, graded_at) VALUES
(1, 1, 3, 'Em gửi bài tập viết các nét cơ bản ạ', 'https://student-uploads.cdn/thuan-bai1.pdf', 'GRADED', 90, 'Chữ viết rõ ràng, nét mác viết rất có lực. Phát huy nhé em!', '2026-06-05 14:00:00', '2026-06-06 09:00:00'),
(2, 1, 4, 'Em nộp bài muộn chút thầy thông cảm ạ', 'https://student-uploads.cdn/minhanh-b1.jpg', 'SUBMITTED', NULL, NULL, '2026-06-28 19:30:00', NULL);

-- Chứng chỉ tốt nghiệp của Quốc Bảo
INSERT INTO certificates (id, user_id, course_id, certificate_code, pdf_url, issued_at) VALUES
(1, 6, 1, 'CERT-C1-BAOPHAM2026', 'https://certs.cdn/pdf/c1-6.pdf', '2026-06-15 16:20:00');

-- ==========================================
-- 6. SUBSCRIPTION & PAYMENT MANAGEMENT
-- ==========================================

INSERT INTO coupons (id, code, discount_type, discount_value, max_uses, used_count, valid_from, valid_until, created_by) VALUES
(1, 'CHINESEHE2026', 'PERCENTAGE', 10.00, 100, 2, '2026-06-01 00:00:00', '2026-08-31 23:59:59', 2),
(2, 'WELCOMEKHOI', 'FIXED_AMOUNT', 50000.00, 50, 1, '2026-06-01 00:00:00', '2026-12-31 23:59:59', 1),
(3, 'VIPSIEUCAP', 'PERCENTAGE', 20.00, 5, 1, '2026-06-20 00:00:00', '2026-06-27 23:59:59', 1);

-- Các gói đăng ký (Subscriptions)
INSERT INTO subscriptions (id, user_id, plan_id, start_date, end_date, status) VALUES
(1, 3, 3, '2026-06-01', '2027-06-01', 'ACTIVE'), -- Đức Thuận mua gói năm
(2, 4, 1, '2026-06-15', '2026-07-15', 'ACTIVE'), -- Minh Anh mua gói tháng
(3, 5, 2, '2026-06-25', '2026-12-25', 'ACTIVE'), -- Tuyết Mai mua gói 6 tháng
(4, 6, 3, '2026-05-01', '2027-05-01', 'ACTIVE'), -- Quốc Bảo
(5, 7, 3, '2026-06-28', '2027-06-28', 'CANCELLED'); -- Đã hủy gói

-- Hóa đơn thanh toán thành công (Đức Thuận)
INSERT INTO invoices (id, user_id, subscription_id, coupon_id, original_amount, discount_amount, amount, status) VALUES
(1, 3, 1, 1, 2100000.00, 210000.00, 1890000.00, 'PAID');
INSERT INTO payments (id, invoice_id, provider, transaction_id, amount, status, raw_response) VALUES
(1, 1, 'VNPAY', 'VNP20260601999888', 1890000.00, 'SUCCESS', '{"rsp_code": "00", "bank": "NCB"}');

-- Hóa đơn thanh toán thành công (Minh Anh - Giảm giá tiền mặt 50K)
INSERT INTO invoices (id, user_id, subscription_id, coupon_id, original_amount, discount_amount, amount, status) VALUES
(2, 4, 2, 2, 250000.00, 50000.00, 200000.00, 'PAID');
INSERT INTO payments (id, invoice_id, provider, transaction_id, amount, status, raw_response) VALUES
(2, 2, 'MOMO', 'MOMO6677151522', 200000.00, 'SUCCESS', '{"resultCode": 0, "message": "Success"}');

-- Hóa đơn thất bại (Tuyết Mai thanh toán lỗi lần đầu)
INSERT INTO invoices (id, user_id, subscription_id, coupon_id, original_amount, discount_amount, amount, status) VALUES
(3, 5, 3, NULL, 1200000.00, 0.00, 1200000.00, 'FAILED');
INSERT INTO payments (id, invoice_id, provider, transaction_id, amount, status, raw_response) VALUES
(3, 3, 'STRIPE', 'ch_192831238912', 1200000.00, 'FAILED', '{"error": "card_declined"}');

-- Hóa đơn được hoàn tiền (Thùy Linh mua nhầm và yêu cầu hoàn trả)
INSERT INTO invoices (id, user_id, subscription_id, coupon_id, original_amount, discount_amount, amount, status) VALUES
(4, 7, 5, NULL, 2100000.00, 0.00, 2100000.00, 'REFUNDED');
INSERT INTO payments (id, invoice_id, provider, transaction_id, amount, status, raw_response) VALUES
(4, 4, 'VNPAY', 'VNP20260628000111', 2100000.00, 'SUCCESS', '{"rsp_code": "00"}');

INSERT INTO refunds (id, payment_id, user_id, amount, reason, status, processed_by, created_at, processed_at) VALUES
(1, 4, 7, 2100000.00, 'Khách hàng ấn nhầm gói và liên hệ hotline hoàn tiền trong vòng 10 phút', 'PROCESSED', 1, '2026-06-28 21:10:00', '2026-06-28 21:45:00');

-- ==========================================
-- 7. AUDIT LOGS, NOTIFICATIONS & REPORTS
-- ==========================================

INSERT INTO audit_logs (user_id, action, method, endpoint, before_data, after_data, ip_address, user_agent) VALUES
(2, 'CREATE_COURSE', 'POST', '/api/v1/courses', NULL, '{"title": "Bứt phá HSK 3 trong 30 ngày"}', '192.168.1.15', 'Mozilla/5.0'),
(1, 'LOCK_USER', 'PUT', '/api/v1/users/8/lock', '{"status":"ACTIVE"}', '{"status":"LOCKED"}', '10.20.30.40', 'Chrome/124.0'),
(3, 'SUBMIT_ASSIGNMENT', 'POST', '/api/v1/assignments/1/submit', NULL, '{"file": "thuan-bai1.pdf"}', '1.53.200.45', 'Safari/17.4');

INSERT INTO notifications (user_id, type, title, content, is_read) VALUES
(3, 'ASSIGNMENT_GRADED', 'Bài tập của bạn đã được chấm!', 'Giảng viên Trần Lão Sư đã chấm bài tập "Bài tập viết chữ Hán đầu đời" của bạn. Điểm số: 90.', FALSE),
(4, 'SYSTEM_ALERT', 'Chào mừng thành viên mới', 'Hệ thống tặng bạn mã WELCOMEKHOI giảm ngay 50k khi mua gói học.', TRUE),
(6, 'CERTIFICATE_ISSUED', 'Chúc mừng nhận được chứng chỉ', 'Bạn đã hoàn thành xuất sắc khóa học Nhập môn Tiếng Trung.', FALSE),
(8, 'ACCOUNT_LOCKED', 'Tài khoản bị khóa', 'Tài khoản của bạn tạm thời bị khóa do phát hiện bất thường khi thi cử.', FALSE);

-- Report học viên xấu
INSERT INTO reports (reporter_id, target_type, target_id, reason, status) VALUES
(4, 'COMMENT', 99, 'Học viên này dùng từ ngữ thô tục vô văn hóa trong thread thảo luận', 'PENDING'),
(1, 'USER', 8, 'Hệ thống tự động quét log phát hiện thi cử gian lận liên tục', 'RESOLVED');

-- ==========================================
-- 8. GAMIFICATION & MOTIVATION (STREAKS & BADGES)
-- ==========================================

INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_activity_date) VALUES
(3, 7, 15, '2026-06-28'),  -- Đức Thuận giữ streak rất tốt
(4, 2, 5, '2026-06-27'),
(5, 0, 1, '2026-05-10'),
(6, 22, 30, '2026-06-28'); -- Quốc Bảo cày quốc kinh khủng

INSERT INTO badges (id, name, description, icon_url, requirement_type, requirement_value) VALUES
(1, 'Người Khởi Đầu Kiên Trì', 'Hoàn thành bài học video đầu tiên trên hệ thống', 'https://badges.cdn/beginner.png', 'LESSON_COMPLETED', 1),
(2, 'Chiến Thần Chăm Chỉ', 'Đạt chuỗi học tập liên tiếp trong 7 ngày', 'https://badges.cdn/streak7.png', 'STREAK_DAYS', 7),
(3, 'Thủ Khoa Toàn Diện', 'Đạt điểm tối đa (100) trong bất kỳ bài Quiz nào', 'https://badges.cdn/perfect-score.png', 'QUIZ_PASSED', 100);

-- Phát badge cho học viên đạt yêu cầu
INSERT INTO user_badges (user_id, badge_id, earned_at) VALUES
(3, 1, '2026-06-01 10:30:00'),
(3, 3, '2026-06-02 20:08:22'), -- Đức Thuận có badge 1 và 3
(6, 1, '2026-05-11 09:00:00'),
(6, 2, '2026-05-18 22:00:00'); -- Quốc Bảo có badge 1 và 2

-- ==========================================
-- 9. SOCIAL & COMMUNITY
-- ==========================================

INSERT INTO course_reviews (course_id, user_id, rating, comment) VALUES
(1, 3, 5, 'Khóa học cực kỳ chi tiết, thầy Trần phát âm chuẩn, dễ hiểu cho người mới bắt đầu. Tiền nào của nấy ạ!'),
(1, 6, 5, 'Nhờ khóa học này của thầy mà em nắm chắc toàn bộ phần phát âm, tạo tiền đề học lên HSK cao rất nhàn.'),
(1, 4, 4, 'Video chất lượng cao, bài tập phong phú, phản hồi từ giáo viên rất nhanh chóng.');

-- Hội thoại Q&A lồng nhau (Thread thảo luận)
INSERT INTO lesson_qa (id, lesson_id, user_id, parent_id, content, is_resolved) VALUES
(1, 1, 4, NULL, 'Thầy ơi, tại sao thanh 1 đọc cao thanh điệu kéo dài mà em nghe trên phim đôi khi họ đọc rất nhanh vậy ạ?', FALSE),
(2, 1, 2, 1, 'Chào Minh Anh, khi giao tiếp thực tế tốc độ nói tăng lên, các thanh điệu sẽ có độ ngắn dài co lại nhẹ tùy ngữ cảnh, nhưng cao độ cốt lõi vẫn phải đảm bảo chuẩn em nhé.', TRUE),
(3, 1, 3, 1, 'Đúng rồi bạn ơi, xem phim nhiều thì tai quen dần chứ mới đầu ai cũng thấy họ bắn chữ nhanh lắm.', TRUE),
(4, 5, 3, NULL, 'Cho em hỏi từ "再见" ngoài nghĩa tạm biệt thì dịch sát nghĩa đen có phải là "Hẹn gặp lại" không ạ?', TRUE),
(5, 5, 2, 4, 'Chính xác rồi Thuận nhé, "再" là lại (lần nữa), "见" là nhìn/gặp.', TRUE);

-- ==========================================
-- 10. AFFILIATE & REFERRAL
-- ==========================================

-- Đức Thuận mời Tuyết Mai và Thùy Linh tham gia hệ thống bằng mã giới thiệu của mình
INSERT INTO referrals (id, referrer_id, referred_user_id, status, reward_granted) VALUES
(1, 3, 5, 'PURCHASED', TRUE),  -- Tuyết Mai đã mua gói -> Thuận nhận được thưởng hoa hồng
(2, 3, 7, 'REGISTERED', FALSE); -- Thùy Linh mới chỉ tạo acc chưa thực hiện mua gói thành công