-- Fresh database seed only. Do not import into an existing application database.
-- All references resolve by natural keys; generated database IDs are never assumed.
-- Re-running preserves existing values and creates no duplicate seed records.
SET NAMES utf8mb4;
USE chinese_online_learning;
START TRANSACTION;

-- Two subscription products. Course prices below are content metadata, not checkout products.
INSERT INTO subscription_plans (code,name,price,duration_days,active)
SELECT 'FREE_TRIAL','Free',0.00,3,TRUE
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE code='FREE_TRIAL');
INSERT INTO subscription_plans (code,name,price,duration_days,active)
SELECT 'PREMIUM','Premium',99000.00,30,TRUE
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE code='PREMIUM');


-- roles
INSERT INTO `roles` (`name`,`description`)
SELECT 'ADMIN','Quản trị viên toàn hệ thống'
WHERE NOT EXISTS (SELECT 1 FROM `roles` WHERE `name` <=> 'ADMIN');
SET @seed_roles_1 = (SELECT id FROM `roles` WHERE `name` <=> 'ADMIN');
INSERT INTO `roles` (`name`,`description`)
SELECT 'MODERATOR','Kiểm duyệt nội dung và xử lý báo cáo'
WHERE NOT EXISTS (SELECT 1 FROM `roles` WHERE `name` <=> 'MODERATOR');
SET @seed_roles_2 = (SELECT id FROM `roles` WHERE `name` <=> 'MODERATOR');
INSERT INTO `roles` (`name`,`description`)
SELECT 'TEACHER','Giảng viên tạo và quản lý khóa học'
WHERE NOT EXISTS (SELECT 1 FROM `roles` WHERE `name` <=> 'TEACHER');
SET @seed_roles_3 = (SELECT id FROM `roles` WHERE `name` <=> 'TEACHER');
INSERT INTO `roles` (`name`,`description`)
SELECT 'STUDENT','Học viên tham gia khóa học'
WHERE NOT EXISTS (SELECT 1 FROM `roles` WHERE `name` <=> 'STUDENT');
SET @seed_roles_4 = (SELECT id FROM `roles` WHERE `name` <=> 'STUDENT');

-- permissions
INSERT INTO `permissions` (`code`,`name`)
SELECT 'USER_VIEW','Xem danh sách người dùng'
WHERE NOT EXISTS (SELECT 1 FROM `permissions` WHERE `code` <=> 'USER_VIEW');
SET @seed_permissions_1 = (SELECT id FROM `permissions` WHERE `code` <=> 'USER_VIEW');
INSERT INTO `permissions` (`code`,`name`)
SELECT 'USER_CREATE','Tạo tài khoản người dùng'
WHERE NOT EXISTS (SELECT 1 FROM `permissions` WHERE `code` <=> 'USER_CREATE');
SET @seed_permissions_2 = (SELECT id FROM `permissions` WHERE `code` <=> 'USER_CREATE');
INSERT INTO `permissions` (`code`,`name`)
SELECT 'USER_UPDATE','Cập nhật thông tin người dùng'
WHERE NOT EXISTS (SELECT 1 FROM `permissions` WHERE `code` <=> 'USER_UPDATE');
SET @seed_permissions_3 = (SELECT id FROM `permissions` WHERE `code` <=> 'USER_UPDATE');
INSERT INTO `permissions` (`code`,`name`)
SELECT 'USER_LOCK','Khóa tài khoản người dùng'
WHERE NOT EXISTS (SELECT 1 FROM `permissions` WHERE `code` <=> 'USER_LOCK');
SET @seed_permissions_4 = (SELECT id FROM `permissions` WHERE `code` <=> 'USER_LOCK');
INSERT INTO `permissions` (`code`,`name`)
SELECT 'COURSE_VIEW','Xem khóa học'
WHERE NOT EXISTS (SELECT 1 FROM `permissions` WHERE `code` <=> 'COURSE_VIEW');
SET @seed_permissions_5 = (SELECT id FROM `permissions` WHERE `code` <=> 'COURSE_VIEW');
INSERT INTO `permissions` (`code`,`name`)
SELECT 'COURSE_CREATE','Tạo khóa học'
WHERE NOT EXISTS (SELECT 1 FROM `permissions` WHERE `code` <=> 'COURSE_CREATE');
SET @seed_permissions_6 = (SELECT id FROM `permissions` WHERE `code` <=> 'COURSE_CREATE');
INSERT INTO `permissions` (`code`,`name`)
SELECT 'COURSE_UPDATE','Cập nhật khóa học'
WHERE NOT EXISTS (SELECT 1 FROM `permissions` WHERE `code` <=> 'COURSE_UPDATE');
SET @seed_permissions_7 = (SELECT id FROM `permissions` WHERE `code` <=> 'COURSE_UPDATE');
INSERT INTO `permissions` (`code`,`name`)
SELECT 'COURSE_DELETE','Xóa khóa học'
WHERE NOT EXISTS (SELECT 1 FROM `permissions` WHERE `code` <=> 'COURSE_DELETE');
SET @seed_permissions_8 = (SELECT id FROM `permissions` WHERE `code` <=> 'COURSE_DELETE');
INSERT INTO `permissions` (`code`,`name`)
SELECT 'LESSON_CREATE','Tạo bài học'
WHERE NOT EXISTS (SELECT 1 FROM `permissions` WHERE `code` <=> 'LESSON_CREATE');
SET @seed_permissions_9 = (SELECT id FROM `permissions` WHERE `code` <=> 'LESSON_CREATE');
INSERT INTO `permissions` (`code`,`name`)
SELECT 'QUIZ_CREATE','Tạo bài kiểm tra'
WHERE NOT EXISTS (SELECT 1 FROM `permissions` WHERE `code` <=> 'QUIZ_CREATE');
SET @seed_permissions_10 = (SELECT id FROM `permissions` WHERE `code` <=> 'QUIZ_CREATE');
INSERT INTO `permissions` (`code`,`name`)
SELECT 'PAYMENT_VIEW','Xem giao dịch thanh toán'
WHERE NOT EXISTS (SELECT 1 FROM `permissions` WHERE `code` <=> 'PAYMENT_VIEW');
SET @seed_permissions_11 = (SELECT id FROM `permissions` WHERE `code` <=> 'PAYMENT_VIEW');
INSERT INTO `permissions` (`code`,`name`)
SELECT 'REPORT_VIEW','Xem báo cáo vi phạm'
WHERE NOT EXISTS (SELECT 1 FROM `permissions` WHERE `code` <=> 'REPORT_VIEW');
SET @seed_permissions_12 = (SELECT id FROM `permissions` WHERE `code` <=> 'REPORT_VIEW');
INSERT INTO `permissions` (`code`,`name`)
SELECT 'DASHBOARD_VIEW','Xem dashboard quản trị'
WHERE NOT EXISTS (SELECT 1 FROM `permissions` WHERE `code` <=> 'DASHBOARD_VIEW');
SET @seed_permissions_13 = (SELECT id FROM `permissions` WHERE `code` <=> 'DASHBOARD_VIEW');
INSERT INTO `permissions` (`code`,`name`)
SELECT 'AUDIT_LOG_VIEW','Xem nhật ký hệ thống'
WHERE NOT EXISTS (SELECT 1 FROM `permissions` WHERE `code` <=> 'AUDIT_LOG_VIEW');
SET @seed_permissions_14 = (SELECT id FROM `permissions` WHERE `code` <=> 'AUDIT_LOG_VIEW');

-- categories
INSERT INTO `categories` (`name`,`slug`,`parent_id`,`order_index`)
SELECT 'Tiếng Trung giao tiếp','tieng-trung-giao-tiep',NULL,1
WHERE NOT EXISTS (SELECT 1 FROM `categories` WHERE `slug` <=> 'tieng-trung-giao-tiep');
SET @seed_categories_1 = (SELECT id FROM `categories` WHERE `slug` <=> 'tieng-trung-giao-tiep');
INSERT INTO `categories` (`name`,`slug`,`parent_id`,`order_index`)
SELECT 'Luyện thi HSK','luyen-thi-hsk',NULL,2
WHERE NOT EXISTS (SELECT 1 FROM `categories` WHERE `slug` <=> 'luyen-thi-hsk');
SET @seed_categories_2 = (SELECT id FROM `categories` WHERE `slug` <=> 'luyen-thi-hsk');
INSERT INTO `categories` (`name`,`slug`,`parent_id`,`order_index`)
SELECT 'Tiếng Trung thương mại','tieng-trung-thuong-mai',NULL,3
WHERE NOT EXISTS (SELECT 1 FROM `categories` WHERE `slug` <=> 'tieng-trung-thuong-mai');
SET @seed_categories_3 = (SELECT id FROM `categories` WHERE `slug` <=> 'tieng-trung-thuong-mai');
INSERT INTO `categories` (`name`,`slug`,`parent_id`,`order_index`)
SELECT 'Tiếng Trung cho công việc','tieng-trung-cho-cong-viec',NULL,4
WHERE NOT EXISTS (SELECT 1 FROM `categories` WHERE `slug` <=> 'tieng-trung-cho-cong-viec');
SET @seed_categories_4 = (SELECT id FROM `categories` WHERE `slug` <=> 'tieng-trung-cho-cong-viec');
INSERT INTO `categories` (`name`,`slug`,`parent_id`,`order_index`)
SELECT 'Ngữ pháp và từ vựng','ngu-phap-va-tu-vung',NULL,5
WHERE NOT EXISTS (SELECT 1 FROM `categories` WHERE `slug` <=> 'ngu-phap-va-tu-vung');
SET @seed_categories_5 = (SELECT id FROM `categories` WHERE `slug` <=> 'ngu-phap-va-tu-vung');
INSERT INTO `categories` (`name`,`slug`,`parent_id`,`order_index`)
SELECT 'Phát âm và nghe nói','phat-am-va-nghe-noi',NULL,6
WHERE NOT EXISTS (SELECT 1 FROM `categories` WHERE `slug` <=> 'phat-am-va-nghe-noi');
SET @seed_categories_6 = (SELECT id FROM `categories` WHERE `slug` <=> 'phat-am-va-nghe-noi');

-- tags
INSERT INTO `tags` (`name`,`slug`)
SELECT 'Pinyin','pinyin'
WHERE NOT EXISTS (SELECT 1 FROM `tags` WHERE `slug` <=> 'pinyin');
SET @seed_tags_1 = (SELECT id FROM `tags` WHERE `slug` <=> 'pinyin');
INSERT INTO `tags` (`name`,`slug`)
SELECT 'HSK 1','hsk-1'
WHERE NOT EXISTS (SELECT 1 FROM `tags` WHERE `slug` <=> 'hsk-1');
SET @seed_tags_2 = (SELECT id FROM `tags` WHERE `slug` <=> 'hsk-1');
INSERT INTO `tags` (`name`,`slug`)
SELECT 'HSK 2','hsk-2'
WHERE NOT EXISTS (SELECT 1 FROM `tags` WHERE `slug` <=> 'hsk-2');
SET @seed_tags_3 = (SELECT id FROM `tags` WHERE `slug` <=> 'hsk-2');
INSERT INTO `tags` (`name`,`slug`)
SELECT 'Giao tiếp','giao-tiep'
WHERE NOT EXISTS (SELECT 1 FROM `tags` WHERE `slug` <=> 'giao-tiep');
SET @seed_tags_4 = (SELECT id FROM `tags` WHERE `slug` <=> 'giao-tiep');
INSERT INTO `tags` (`name`,`slug`)
SELECT 'Nghe hiểu','nghe-hieu'
WHERE NOT EXISTS (SELECT 1 FROM `tags` WHERE `slug` <=> 'nghe-hieu');
SET @seed_tags_5 = (SELECT id FROM `tags` WHERE `slug` <=> 'nghe-hieu');
INSERT INTO `tags` (`name`,`slug`)
SELECT 'Thương mại','thuong-mai'
WHERE NOT EXISTS (SELECT 1 FROM `tags` WHERE `slug` <=> 'thuong-mai');
SET @seed_tags_6 = (SELECT id FROM `tags` WHERE `slug` <=> 'thuong-mai');
INSERT INTO `tags` (`name`,`slug`)
SELECT 'Viết chữ Hán','viet-chu-han'
WHERE NOT EXISTS (SELECT 1 FROM `tags` WHERE `slug` <=> 'viet-chu-han');
SET @seed_tags_7 = (SELECT id FROM `tags` WHERE `slug` <=> 'viet-chu-han');
INSERT INTO `tags` (`name`,`slug`)
SELECT 'Từ vựng công xưởng','tu-vung-cong-xuong'
WHERE NOT EXISTS (SELECT 1 FROM `tags` WHERE `slug` <=> 'tu-vung-cong-xuong');
SET @seed_tags_8 = (SELECT id FROM `tags` WHERE `slug` <=> 'tu-vung-cong-xuong');

-- badges
INSERT INTO `badges` (`name`,`icon_url`,`description`,`requirement_type`,`requirement_value`)
SELECT 'Người mới chăm chỉ','https://cdn.chineselearning.vn/badges/lesson-5.png','Hoàn thành 5 bài học đầu tiên.','LESSON_COMPLETED',5
WHERE NOT EXISTS (SELECT 1 FROM `badges` WHERE `name` <=> 'Người mới chăm chỉ');
SET @seed_badges_1 = (SELECT id FROM `badges` WHERE `name` <=> 'Người mới chăm chỉ');
INSERT INTO `badges` (`name`,`icon_url`,`description`,`requirement_type`,`requirement_value`)
SELECT 'Chinh phục quiz đầu tiên','https://cdn.chineselearning.vn/badges/quiz-3.png','Đạt điểm qua 3 bài quiz.','QUIZ_PASSED',3
WHERE NOT EXISTS (SELECT 1 FROM `badges` WHERE `name` <=> 'Chinh phục quiz đầu tiên');
SET @seed_badges_2 = (SELECT id FROM `badges` WHERE `name` <=> 'Chinh phục quiz đầu tiên');
INSERT INTO `badges` (`name`,`icon_url`,`description`,`requirement_type`,`requirement_value`)
SELECT 'Chuỗi 7 ngày','https://cdn.chineselearning.vn/badges/streak-7.png','Học liên tiếp 7 ngày.','STREAK_DAYS',7
WHERE NOT EXISTS (SELECT 1 FROM `badges` WHERE `name` <=> 'Chuỗi 7 ngày');
SET @seed_badges_3 = (SELECT id FROM `badges` WHERE `name` <=> 'Chuỗi 7 ngày');
INSERT INTO `badges` (`name`,`icon_url`,`description`,`requirement_type`,`requirement_value`)
SELECT 'Vượt mốc HSK 1','https://cdn.chineselearning.vn/badges/hsk1.png','Hoàn thành đề mô phỏng HSK 1.','HSK_PASSED',1
WHERE NOT EXISTS (SELECT 1 FROM `badges` WHERE `name` <=> 'Vượt mốc HSK 1');
SET @seed_badges_4 = (SELECT id FROM `badges` WHERE `name` <=> 'Vượt mốc HSK 1');

-- Default permissions; no demo administrator or student accounts.
INSERT INTO `role_permissions` (`role_id`,`permission_id`)
SELECT @seed_roles_4,@seed_permissions_5
WHERE NOT EXISTS (SELECT 1 FROM `role_permissions` WHERE `role_id` <=> @seed_roles_4 AND `permission_id` <=> @seed_permissions_5);
INSERT INTO `role_permissions` (`role_id`,`permission_id`)
SELECT @seed_roles_3,@seed_permissions_5
WHERE NOT EXISTS (SELECT 1 FROM `role_permissions` WHERE `role_id` <=> @seed_roles_3 AND `permission_id` <=> @seed_permissions_5);
INSERT INTO `role_permissions` (`role_id`,`permission_id`)
SELECT @seed_roles_3,@seed_permissions_6
WHERE NOT EXISTS (SELECT 1 FROM `role_permissions` WHERE `role_id` <=> @seed_roles_3 AND `permission_id` <=> @seed_permissions_6);
INSERT INTO `role_permissions` (`role_id`,`permission_id`)
SELECT @seed_roles_3,@seed_permissions_7
WHERE NOT EXISTS (SELECT 1 FROM `role_permissions` WHERE `role_id` <=> @seed_roles_3 AND `permission_id` <=> @seed_permissions_7);
INSERT INTO `role_permissions` (`role_id`,`permission_id`)
SELECT @seed_roles_3,@seed_permissions_9
WHERE NOT EXISTS (SELECT 1 FROM `role_permissions` WHERE `role_id` <=> @seed_roles_3 AND `permission_id` <=> @seed_permissions_9);
INSERT INTO `role_permissions` (`role_id`,`permission_id`)
SELECT @seed_roles_3,@seed_permissions_10
WHERE NOT EXISTS (SELECT 1 FROM `role_permissions` WHERE `role_id` <=> @seed_roles_3 AND `permission_id` <=> @seed_permissions_10);
INSERT INTO `role_permissions` (`role_id`,`permission_id`)
SELECT @seed_roles_3,@seed_permissions_13
WHERE NOT EXISTS (SELECT 1 FROM `role_permissions` WHERE `role_id` <=> @seed_roles_3 AND `permission_id` <=> @seed_permissions_13);
INSERT INTO `role_permissions` (`role_id`,`permission_id`)
SELECT @seed_roles_2,@seed_permissions_3
WHERE NOT EXISTS (SELECT 1 FROM `role_permissions` WHERE `role_id` <=> @seed_roles_2 AND `permission_id` <=> @seed_permissions_3);
INSERT INTO `role_permissions` (`role_id`,`permission_id`)
SELECT @seed_roles_2,@seed_permissions_4
WHERE NOT EXISTS (SELECT 1 FROM `role_permissions` WHERE `role_id` <=> @seed_roles_2 AND `permission_id` <=> @seed_permissions_4);
INSERT INTO `role_permissions` (`role_id`,`permission_id`)
SELECT @seed_roles_2,@seed_permissions_5
WHERE NOT EXISTS (SELECT 1 FROM `role_permissions` WHERE `role_id` <=> @seed_roles_2 AND `permission_id` <=> @seed_permissions_5);
INSERT INTO `role_permissions` (`role_id`,`permission_id`)
SELECT @seed_roles_2,@seed_permissions_7
WHERE NOT EXISTS (SELECT 1 FROM `role_permissions` WHERE `role_id` <=> @seed_roles_2 AND `permission_id` <=> @seed_permissions_7);
INSERT INTO `role_permissions` (`role_id`,`permission_id`)
SELECT @seed_roles_2,@seed_permissions_12
WHERE NOT EXISTS (SELECT 1 FROM `role_permissions` WHERE `role_id` <=> @seed_roles_2 AND `permission_id` <=> @seed_permissions_12);
INSERT INTO `role_permissions` (`role_id`,`permission_id`)
SELECT @seed_roles_2,@seed_permissions_13
WHERE NOT EXISTS (SELECT 1 FROM `role_permissions` WHERE `role_id` <=> @seed_roles_2 AND `permission_id` <=> @seed_permissions_13);
INSERT INTO `role_permissions` (`role_id`,`permission_id`)
SELECT @seed_roles_2,@seed_permissions_1
WHERE NOT EXISTS (SELECT 1 FROM `role_permissions` WHERE `role_id` <=> @seed_roles_2 AND `permission_id` <=> @seed_permissions_1);
INSERT INTO `role_permissions` (`role_id`,`permission_id`)
SELECT @seed_roles_1,@seed_permissions_2
WHERE NOT EXISTS (SELECT 1 FROM `role_permissions` WHERE `role_id` <=> @seed_roles_1 AND `permission_id` <=> @seed_permissions_2);
INSERT INTO `role_permissions` (`role_id`,`permission_id`)
SELECT @seed_roles_1,@seed_permissions_10
WHERE NOT EXISTS (SELECT 1 FROM `role_permissions` WHERE `role_id` <=> @seed_roles_1 AND `permission_id` <=> @seed_permissions_10);
INSERT INTO `role_permissions` (`role_id`,`permission_id`)
SELECT @seed_roles_1,@seed_permissions_11
WHERE NOT EXISTS (SELECT 1 FROM `role_permissions` WHERE `role_id` <=> @seed_roles_1 AND `permission_id` <=> @seed_permissions_11);
INSERT INTO `role_permissions` (`role_id`,`permission_id`)
SELECT @seed_roles_1,@seed_permissions_12
WHERE NOT EXISTS (SELECT 1 FROM `role_permissions` WHERE `role_id` <=> @seed_roles_1 AND `permission_id` <=> @seed_permissions_12);
INSERT INTO `role_permissions` (`role_id`,`permission_id`)
SELECT @seed_roles_1,@seed_permissions_13
WHERE NOT EXISTS (SELECT 1 FROM `role_permissions` WHERE `role_id` <=> @seed_roles_1 AND `permission_id` <=> @seed_permissions_13);
INSERT INTO `role_permissions` (`role_id`,`permission_id`)
SELECT @seed_roles_1,@seed_permissions_14
WHERE NOT EXISTS (SELECT 1 FROM `role_permissions` WHERE `role_id` <=> @seed_roles_1 AND `permission_id` <=> @seed_permissions_14);
INSERT INTO `role_permissions` (`role_id`,`permission_id`)
SELECT @seed_roles_1,@seed_permissions_1
WHERE NOT EXISTS (SELECT 1 FROM `role_permissions` WHERE `role_id` <=> @seed_roles_1 AND `permission_id` <=> @seed_permissions_1);
INSERT INTO `role_permissions` (`role_id`,`permission_id`)
SELECT @seed_roles_1,@seed_permissions_3
WHERE NOT EXISTS (SELECT 1 FROM `role_permissions` WHERE `role_id` <=> @seed_roles_1 AND `permission_id` <=> @seed_permissions_3);
INSERT INTO `role_permissions` (`role_id`,`permission_id`)
SELECT @seed_roles_1,@seed_permissions_4
WHERE NOT EXISTS (SELECT 1 FROM `role_permissions` WHERE `role_id` <=> @seed_roles_1 AND `permission_id` <=> @seed_permissions_4);
INSERT INTO `role_permissions` (`role_id`,`permission_id`)
SELECT @seed_roles_1,@seed_permissions_5
WHERE NOT EXISTS (SELECT 1 FROM `role_permissions` WHERE `role_id` <=> @seed_roles_1 AND `permission_id` <=> @seed_permissions_5);
INSERT INTO `role_permissions` (`role_id`,`permission_id`)
SELECT @seed_roles_1,@seed_permissions_6
WHERE NOT EXISTS (SELECT 1 FROM `role_permissions` WHERE `role_id` <=> @seed_roles_1 AND `permission_id` <=> @seed_permissions_6);
INSERT INTO `role_permissions` (`role_id`,`permission_id`)
SELECT @seed_roles_1,@seed_permissions_7
WHERE NOT EXISTS (SELECT 1 FROM `role_permissions` WHERE `role_id` <=> @seed_roles_1 AND `permission_id` <=> @seed_permissions_7);
INSERT INTO `role_permissions` (`role_id`,`permission_id`)
SELECT @seed_roles_1,@seed_permissions_8
WHERE NOT EXISTS (SELECT 1 FROM `role_permissions` WHERE `role_id` <=> @seed_roles_1 AND `permission_id` <=> @seed_permissions_8);
INSERT INTO `role_permissions` (`role_id`,`permission_id`)
SELECT @seed_roles_1,@seed_permissions_9
WHERE NOT EXISTS (SELECT 1 FROM `role_permissions` WHERE `role_id` <=> @seed_roles_1 AND `permission_id` <=> @seed_permissions_9);
INSERT INTO `authentication_settings` (`id`,`email_verification_enabled`)
SELECT 1,1
WHERE NOT EXISTS (SELECT 1 FROM `authentication_settings` WHERE `id` <=> 1);
INSERT INTO `feedback_publication_lock` (`id`)
SELECT 1
WHERE NOT EXISTS (SELECT 1 FROM `feedback_publication_lock` WHERE `id` <=> 1);

-- Non-personal, locked content owner. No valid password or login credentials.
INSERT INTO `users` (`full_name`,`email`,`password_hash`,`status`,`total_learning_points`)
SELECT 'Phạm Linh Chi','catalog-instructor@seed.invalid','!','LOCKED',0
WHERE NOT EXISTS (SELECT 1 FROM `users` WHERE `email` <=> 'catalog-instructor@seed.invalid');
SET @seed_teacher = (SELECT id FROM `users` WHERE `email` <=> 'catalog-instructor@seed.invalid');
INSERT INTO `user_roles` (`user_id`,`role_id`)
SELECT @seed_teacher,@seed_roles_3
WHERE NOT EXISTS (SELECT 1 FROM `user_roles` WHERE `user_id` <=> @seed_teacher AND `role_id` <=> @seed_roles_3);
INSERT INTO `courses` (`teacher_id`,`category_id`,`title`,`description`,`price`,`thumbnail_url`,`status`)
SELECT @seed_teacher,@seed_categories_1,'Tiếng Trung giao tiếp cho Nhân viên Sales (Cơ bản)', 'Học giao tiếp tiếng Trung trong môi trường làm việc: gặp lễ tân, trưởng nhóm, đồng nghiệp; giới thiệu bản thân, công ty và tìm hiểu khách hàng.', 199000.00, 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80', 'PUBLISHED'
WHERE NOT EXISTS (SELECT 1 FROM `courses` WHERE `title` <=> 'Tiếng Trung giao tiếp cho Nhân viên Sales (Cơ bản)');
SET @seed_courses_5 = (SELECT id FROM `courses` WHERE `title` <=> 'Tiếng Trung giao tiếp cho Nhân viên Sales (Cơ bản)');

INSERT INTO courses (teacher_id, category_id, title, description, price, thumbnail_url, status) SELECT @seed_teacher, @seed_categories_1, 'Tiếng Trung tại quán cà phê', 'Khóa ngắn cho người mới bắt đầu: 2 bài đọc có hội thoại chữ Hán, pinyin và nghĩa tiếng Việt; 12 từ vựng, 6 mẫu câu và 6 câu trắc nghiệm. Thực hành gọi đồ uống, nói sở thích và hỏi giá. Học bằng bài đọc, không kèm video.', 0, '/images/course-cafe.svg', 'PUBLISHED' WHERE NOT EXISTS (SELECT 1 FROM courses WHERE title='Tiếng Trung tại quán cà phê');
SET @seed_courses_cafe = (SELECT id FROM courses WHERE title='Tiếng Trung tại quán cà phê');

INSERT INTO courses (teacher_id, category_id, title, description, price, thumbnail_url, status) SELECT @seed_teacher, @seed_categories_1, 'Tiếng Trung hỏi đường và đi lại', 'Khóa ngắn cho người mới bắt đầu: 2 bài đọc có hội thoại chữ Hán, pinyin và nghĩa tiếng Việt; 12 từ vựng, 6 mẫu câu và 6 câu trắc nghiệm. Luyện hỏi địa điểm, hiểu rẽ trái, rẽ phải và hỏi thời gian đi bộ. Học bằng bài đọc, không kèm video.', 0, '/images/course-directions.svg', 'PUBLISHED' WHERE NOT EXISTS (SELECT 1 FROM courses WHERE title='Tiếng Trung hỏi đường và đi lại');
SET @seed_courses_directions = (SELECT id FROM courses WHERE title='Tiếng Trung hỏi đường và đi lại');

-- Three independent courses: Sales, cafe and directions; learning content stays in its original course.
INSERT INTO `chapters` (`title`,`course_id`,`order_index`)
SELECT 'Làm quen với môi trường làm việc',@seed_courses_5,1
WHERE NOT EXISTS (SELECT 1 FROM `chapters` WHERE `course_id` <=> @seed_courses_5 AND `order_index` <=> 1);
SET @seed_chapters_1 = (SELECT id FROM `chapters` WHERE `course_id` <=> @seed_courses_5 AND `order_index` <=> 1);
INSERT INTO `chapters` (`title`,`course_id`,`order_index`)
SELECT 'Giới thiệu bản thân với khách hàng',@seed_courses_5,2
WHERE NOT EXISTS (SELECT 1 FROM `chapters` WHERE `course_id` <=> @seed_courses_5 AND `order_index` <=> 2);
SET @seed_chapters_2 = (SELECT id FROM `chapters` WHERE `course_id` <=> @seed_courses_5 AND `order_index` <=> 2);
INSERT INTO `chapters` (`title`,`course_id`,`order_index`)
SELECT 'Thu thập thông tin khách hàng',@seed_courses_5,3
WHERE NOT EXISTS (SELECT 1 FROM `chapters` WHERE `course_id` <=> @seed_courses_5 AND `order_index` <=> 3);
SET @seed_chapters_3 = (SELECT id FROM `chapters` WHERE `course_id` <=> @seed_courses_5 AND `order_index` <=> 3);
INSERT INTO `chapters` (`title`,`course_id`,`order_index`)
SELECT 'Gọi đồ uống và thanh toán',@seed_courses_cafe,1
WHERE NOT EXISTS (SELECT 1 FROM `chapters` WHERE `course_id` <=> @seed_courses_cafe AND `order_index` <=> 1);
SET @seed_chapters_4 = (SELECT id FROM `chapters` WHERE `course_id` <=> @seed_courses_cafe AND `order_index` <=> 1);
INSERT INTO `chapters` (`title`,`course_id`,`order_index`)
SELECT 'Tìm địa điểm và hiểu chỉ dẫn',@seed_courses_directions,1
WHERE NOT EXISTS (SELECT 1 FROM `chapters` WHERE `course_id` <=> @seed_courses_directions AND `order_index` <=> 1);
SET @seed_chapters_5 = (SELECT id FROM `chapters` WHERE `course_id` <=> @seed_courses_directions AND `order_index` <=> 1);
INSERT INTO `lessons` (`title`,`content`,`published`,`video_url`,`chapter_id`,`order_index`,`duration_seconds`)
SELECT 'Gặp trưởng nhóm',NULL,1,'https://res.cloudinary.com/rir6b8kp/video/upload/v1791818172/phi%C3%AAn_%C3%A2m_ti%E1%BA%BFng_vi%E1%BB%87t_n%E1%BB%AFa_gvmbku.mp4',@seed_chapters_1,2,840
WHERE NOT EXISTS (SELECT 1 FROM `lessons` WHERE `chapter_id` <=> @seed_chapters_1 AND `order_index` <=> 2);
SET @seed_lessons_2 = (SELECT id FROM `lessons` WHERE `chapter_id` <=> @seed_chapters_1 AND `order_index` <=> 2);
INSERT INTO `lessons` (`title`,`content`,`published`,`video_url`,`chapter_id`,`order_index`,`duration_seconds`)
SELECT 'Gặp lễ tân',NULL,1,'https://res.cloudinary.com/rir6b8kp/video/upload/v1791816899/B%E1%BB%91i_c%E1%BA%A3nh_H%C3%B4m_nay_l%C3%A0_ng%C3%A0y_%C4%91%E1%BA%A7u_qqe6xj.mp4',@seed_chapters_1,1,720
WHERE NOT EXISTS (SELECT 1 FROM `lessons` WHERE `chapter_id` <=> @seed_chapters_1 AND `order_index` <=> 1);
SET @seed_lessons_1 = (SELECT id FROM `lessons` WHERE `chapter_id` <=> @seed_chapters_1 AND `order_index` <=> 1);
INSERT INTO `lessons` (`title`,`content`,`published`,`video_url`,`chapter_id`,`order_index`,`duration_seconds`)
SELECT 'Giới thiệu tên, vị trí, công việc',NULL,1,'https://res.cloudinary.com/rir6b8kp/video/upload/v1792413441/c%C3%A1i_ph%E1%BA%A7n_phi%C3%AAn_%C3%A2m_ti%E1%BA%BFng_vi%E1%BB%87t_b_mgsgze.mp4',@seed_chapters_2,1,900
WHERE NOT EXISTS (SELECT 1 FROM `lessons` WHERE `chapter_id` <=> @seed_chapters_2 AND `order_index` <=> 1);
SET @seed_lessons_3 = (SELECT id FROM `lessons` WHERE `chapter_id` <=> @seed_chapters_2 AND `order_index` <=> 1);
INSERT INTO `lessons` (`title`,`content`,`published`,`video_url`,`chapter_id`,`order_index`,`duration_seconds`)
SELECT 'Hiểu chỉ dẫn và hỏi thời gian đi bộ','MỤC TIÊU\nHiểu chỉ dẫn đi thẳng, rẽ trái, rẽ phải và hỏi cần đi bộ bao lâu.\n\nMẪU CÂU CHÍNH\n一直走，然后往右拐。\nYìzhí zǒu, ránhòu wǎng yòu guǎi.\nĐi thẳng, sau đó rẽ phải.\n\nHỘI THOẠI\nKhách: 请问，去地铁站怎么走？\nQǐngwèn, qù dìtiězhàn zěnme zǒu?\nXin hỏi, đi đến ga tàu điện ngầm thế nào?\n\nNgười đi đường: 一直走，到路口往右拐。\nYìzhí zǒu, dào lùkǒu wǎng yòu guǎi.\nĐi thẳng, đến giao lộ thì rẽ phải.\n\nKhách: 走路要多久？\nZǒulù yào duōjiǔ?\nĐi bộ mất bao lâu?\n\nNgười đi đường: 大概五分钟。\nDàgài wǔ fēnzhōng.\nKhoảng năm phút.\n\nKhách: 谢谢！\nXièxie!\nCảm ơn!\n\nGHI NHỚ\n往 + hướng + 拐 diễn tả rẽ theo hướng đó. 往左拐 = rẽ trái; 往右拐 = rẽ phải. 多久 hỏi khoảng thời gian, còn 哪里 hỏi địa điểm. 大概 (dàgài) cho biết thời gian chỉ là ước lượng.\n\nTỰ THỰC HÀNH\n1. Vẽ một đường thẳng đến ngã tư rồi rẽ phải; đọc chỉ dẫn khi đưa ngón tay theo đường vẽ.\n2. Đổi chỉ dẫn thành rẽ trái: 一直走，到路口往左拐。\n3. Tập nói khoảng mười phút: 大概十分钟。Dàgài shí fēnzhōng.\n4. Tự tạo hội thoại bốn lượt: hỏi đường, chỉ dẫn, hỏi thời gian, trả lời.',1,NULL,@seed_chapters_5,2,900
WHERE NOT EXISTS (SELECT 1 FROM `lessons` WHERE `chapter_id` <=> @seed_chapters_5 AND `order_index` <=> 2);
SET @seed_lessons_39 = (SELECT id FROM `lessons` WHERE `chapter_id` <=> @seed_chapters_5 AND `order_index` <=> 2);
INSERT INTO `lessons` (`title`,`content`,`published`,`video_url`,`chapter_id`,`order_index`,`duration_seconds`)
SELECT 'Gọi món và chọn đồ uống','MỤC TIÊU\nGọi một đồ uống bằng mẫu 我要… và đề nghị ít đường một cách lịch sự.\n\nMẪU CÂU CHÍNH\n我要 + số lượng + 杯 + đồ uống。\nWǒ yào + số lượng + bēi + đồ uống.\nTôi muốn… cốc… 杯 (bēi) là lượng từ dùng cho đồ uống trong cốc.\n\nHỘI THOẠI\nNhân viên: 你好，你要喝什么？\nNǐ hǎo, nǐ yào hē shénme?\nXin chào, bạn muốn uống gì?\n\nKhách: 我要一杯咖啡。\nWǒ yào yì bēi kāfēi.\nTôi muốn một cốc cà phê.\n\nNhân viên: 要热的还是冰的？\nYào rè de háishi bīng de?\nBạn muốn loại nóng hay loại lạnh?\n\nKhách: 要热的，请少放糖。\nYào rè de, qǐng shǎo fàng táng.\nCho tôi loại nóng, vui lòng cho ít đường.\n\nGHI NHỚ\n还是 (háishi) nối hai lựa chọn trong câu hỏi. 请 (qǐng) giúp lời đề nghị lịch sự hơn. 一 đứng trước 杯 (thanh 1) được đọc thành yì trong lời nói.\n\nTỰ THỰC HÀNH\n1. Đọc luân phiên vai nhân viên và khách ba lần.\n2. Thay 咖啡 bằng 茶 để gọi trà.\n3. Gọi hai cốc cà phê: 我要两杯咖啡。Wǒ yào liǎng bēi kāfēi.\n4. Mở mục Từ vựng, ôn sáu từ rồi làm trắc nghiệm.',1,NULL,@seed_chapters_4,1,900
WHERE NOT EXISTS (SELECT 1 FROM `lessons` WHERE `chapter_id` <=> @seed_chapters_4 AND `order_index` <=> 1);
SET @seed_lessons_36 = (SELECT id FROM `lessons` WHERE `chapter_id` <=> @seed_chapters_4 AND `order_index` <=> 1);
INSERT INTO `lessons` (`title`,`content`,`published`,`video_url`,`chapter_id`,`order_index`,`duration_seconds`)
SELECT 'Hỏi giá và mang đi','MỤC TIÊU\nHỏi tổng tiền, hiểu một số tiền đơn giản và nói mang đồ uống đi.\n\nMẪU CÂU CHÍNH\n一共多少钱？Yígòng duōshao qián? Tổng cộng bao nhiêu tiền?\n打包，谢谢。Dǎbāo, xièxie. Cho tôi mang đi, cảm ơn.\n\nHỘI THOẠI\nKhách: 一共多少钱？\nYígòng duōshao qián?\nTổng cộng bao nhiêu tiền?\n\nNhân viên: 一共二十五块。这里喝还是打包？\nYígòng èrshíwǔ kuài. Zhèlǐ hē háishi dǎbāo?\nTổng cộng 25 tệ. Bạn uống tại đây hay mang đi?\n\nKhách: 打包，可以扫码吗？\nDǎbāo, kěyǐ sǎomǎ ma?\nMang đi. Tôi có thể quét mã thanh toán không?\n\nNhân viên: 可以，请扫这里。\nKěyǐ, qǐng sǎo zhèlǐ.\nĐược, vui lòng quét ở đây.\n\nGHI NHỚ\n块 (kuài) là cách gọi đơn vị tệ thường gặp trong giao tiếp. 二十五 = 2 chục + 5 = 25. 扫码 là quét mã; trong tình huống mua hàng thường được hiểu là quét mã thanh toán. Câu hỏi 可以…吗？ dùng để hỏi có thể làm một việc hay không.\n\nTỰ THỰC HÀNH\n1. Đọc số tiền: 十块 (shí kuài) = 10 tệ; 十八块 (shíbā kuài) = 18 tệ; 三十块 (sānshí kuài) = 30 tệ.\n2. Đóng vai khách: gọi một cốc trà, hỏi tổng tiền rồi nói mang đi.\n3. Tự trả lời: 二十五块 là bao nhiêu? Đáp án: 25 tệ.\n4. Làm trắc nghiệm để kiểm tra cách hỏi giá và thanh toán.',1,NULL,@seed_chapters_4,2,900
WHERE NOT EXISTS (SELECT 1 FROM `lessons` WHERE `chapter_id` <=> @seed_chapters_4 AND `order_index` <=> 2);
SET @seed_lessons_37 = (SELECT id FROM `lessons` WHERE `chapter_id` <=> @seed_chapters_4 AND `order_index` <=> 2);
INSERT INTO `lessons` (`title`,`content`,`published`,`video_url`,`chapter_id`,`order_index`,`duration_seconds`)
SELECT 'Hỏi địa điểm một cách lịch sự','MỤC TIÊU\nMở lời hỏi đường và hỏi vị trí của ga tàu điện, nhà vệ sinh hoặc khách sạn.\n\nMẪU CÂU CHÍNH\n请问，+ địa điểm + 在哪里？\nQǐngwèn, + địa điểm + zài nǎlǐ?\nXin hỏi,… ở đâu?\n\nHỘI THOẠI\nKhách: 请问，地铁站在哪里？\nQǐngwèn, dìtiězhàn zài nǎlǐ?\nXin hỏi, ga tàu điện ngầm ở đâu?\n\nNgười đi đường: 地铁站在前面。\nDìtiězhàn zài qiánmiàn.\nGa tàu điện ngầm ở phía trước.\n\nKhách: 远吗？\nYuǎn ma?\nCó xa không?\n\nNgười đi đường: 不远。走路五分钟。\nBù yuǎn. Zǒulù wǔ fēnzhōng.\nKhông xa. Đi bộ năm phút.\n\nKhách: 谢谢！\nXièxie!\nCảm ơn!\n\nGHI NHỚ\n请问 là lời mở đầu lịch sự khi hỏi người lạ. 在 (zài) đứng trước vị trí. 哪里 (nǎlǐ) nghĩa là ở đâu. Không thêm 吗 vào câu đã có từ hỏi 哪里. 远吗？ là câu hỏi có/không nên dùng 吗.\n\nTỰ THỰC HÀNH\n1. Thay 地铁站 bằng 洗手间 để hỏi nhà vệ sinh.\n2. Thay bằng 酒店 để hỏi khách sạn.\n3. Đáp án mẫu: 请问，洗手间在哪里？Qǐngwèn, xǐshǒujiān zài nǎlǐ?\n4. Đọc hội thoại cùng một người bạn, sau đó đổi vai.',1,NULL,@seed_chapters_5,1,900
WHERE NOT EXISTS (SELECT 1 FROM `lessons` WHERE `chapter_id` <=> @seed_chapters_5 AND `order_index` <=> 1);
SET @seed_lessons_38 = (SELECT id FROM `lessons` WHERE `chapter_id` <=> @seed_chapters_5 AND `order_index` <=> 1);
INSERT INTO `lessons` (`title`,`content`,`published`,`video_url`,`chapter_id`,`order_index`,`duration_seconds`)
SELECT 'Gặp đồng nghiệp',NULL,1,'https://res.cloudinary.com/rir6b8kp/video/upload/v1791818261/ti%C3%AAng_trung_pinyin_v%E1%BB%9Bi_phi_eexi8e.mp4',@seed_chapters_1,3,900
WHERE NOT EXISTS (SELECT 1 FROM `lessons` WHERE `chapter_id` <=> @seed_chapters_1 AND `order_index` <=> 3);
SET @seed_lessons_35 = (SELECT id FROM `lessons` WHERE `chapter_id` <=> @seed_chapters_1 AND `order_index` <=> 3);
INSERT INTO `lessons` (`title`,`content`,`published`,`video_url`,`chapter_id`,`order_index`,`duration_seconds`)
SELECT 'Hỏi thông tin cá nhân của khách hàng',NULL,1,'https://res.cloudinary.com/rir6b8kp/video/upload/v1792413972/video1_r1i65s.mp4',@seed_chapters_3,1,780
WHERE NOT EXISTS (SELECT 1 FROM `lessons` WHERE `chapter_id` <=> @seed_chapters_3 AND `order_index` <=> 1);
SET @seed_lessons_5 = (SELECT id FROM `lessons` WHERE `chapter_id` <=> @seed_chapters_3 AND `order_index` <=> 1);
INSERT INTO `lessons` (`title`,`content`,`published`,`video_url`,`chapter_id`,`order_index`,`duration_seconds`)
SELECT 'Giới thiệu công ty',NULL,1,'https://res.cloudinary.com/rir6b8kp/video/upload/v1792413699/B%E1%BB%91i_c%E1%BA%A3nh_Sau_khi_gi%E1%BB%9Bi_thi%E1%BB%87u_b_rknava.mp4',@seed_chapters_2,2,960
WHERE NOT EXISTS (SELECT 1 FROM `lessons` WHERE `chapter_id` <=> @seed_chapters_2 AND `order_index` <=> 2);
SET @seed_lessons_4 = (SELECT id FROM `lessons` WHERE `chapter_id` <=> @seed_chapters_2 AND `order_index` <=> 2);
INSERT INTO `course_tags` (`course_id`,`tag_id`)
SELECT @seed_courses_5,@seed_tags_5
WHERE NOT EXISTS (SELECT 1 FROM `course_tags` WHERE `course_id` <=> @seed_courses_5 AND `tag_id` <=> @seed_tags_5);
INSERT INTO `course_tags` (`course_id`,`tag_id`)
SELECT @seed_courses_5,@seed_tags_1
WHERE NOT EXISTS (SELECT 1 FROM `course_tags` WHERE `course_id` <=> @seed_courses_5 AND `tag_id` <=> @seed_tags_1);
INSERT INTO `course_tags` (`course_id`,`tag_id`)
SELECT @seed_courses_5,@seed_tags_4
WHERE NOT EXISTS (SELECT 1 FROM `course_tags` WHERE `course_id` <=> @seed_courses_5 AND `tag_id` <=> @seed_tags_4);

-- vocabularies
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '扫码','sǎomǎ',NULL,NULL,@seed_lessons_37,5,'Quét mã'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_37 AND `order_index` <=> 5 AND `hanzi` <=> '扫码');
SET @seed_vocabularies_103 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_37 AND `order_index` <=> 5 AND `hanzi` <=> '扫码');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '您好','nín hǎo','https://res.cloudinary.com/rir6b8kp/video/upload/v1784051161/Xin_ch%C3%A0o_l%E1%BB%8Bch_s%E1%BB%B1_bt7upl.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784051100/l%E1%BB%8Bch_s%E1%BB%B1_l6xogl.png',@seed_lessons_3,2,'Xin chào (lịch sự)'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_3 AND `order_index` <=> 2 AND `hanzi` <=> '您好');
SET @seed_vocabularies_11 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_3 AND `order_index` <=> 2 AND `hanzi` <=> '您好');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '担任','dānrèn','https://res.cloudinary.com/rir6b8kp/video/upload/v1784051161/%C4%90%E1%BA%A3m_nhi%E1%BB%87m_gi%E1%BB%AF_ch%E1%BB%A9c_v%E1%BB%A5_jibfdb.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784051103/%C4%91%E1%BA%A3m_nhi%E1%BB%87m_al97le.png',@seed_lessons_3,8,'Đảm nhiệm, giữ chức vụ'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_3 AND `order_index` <=> 8 AND `hanzi` <=> '担任');
SET @seed_vocabularies_17 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_3 AND `order_index` <=> 8 AND `hanzi` <=> '担任');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '路口','lùkǒu',NULL,NULL,@seed_lessons_39,4,'Giao lộ; chỗ đường giao nhau'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_39 AND `order_index` <=> 4 AND `hanzi` <=> '路口');
SET @seed_vocabularies_114 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_39 AND `order_index` <=> 4 AND `hanzi` <=> '路口');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '欢迎','huānyíng','https://res.cloudinary.com/rir6b8kp/video/upload/v1784047343/Ch%C3%A0o_m%E1%BB%ABng_vkzmad.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784047230/ch%C3%A0o_m%E1%BB%ABng_k7i1sh.png',@seed_lessons_35,8,'Chào mừng'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_35 AND `order_index` <=> 8 AND `hanzi` <=> '欢迎');
SET @seed_vocabularies_78 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_35 AND `order_index` <=> 8 AND `hanzi` <=> '欢迎');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '名字','míngzi','https://res.cloudinary.com/rir6b8kp/video/upload/v1784051159/t%C3%AAn_gunwh9.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784051102/t%C3%AAn_dvvvnj.png',@seed_lessons_3,6,'Tên'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_3 AND `order_index` <=> 6 AND `hanzi` <=> '名字');
SET @seed_vocabularies_15 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_3 AND `order_index` <=> 6 AND `hanzi` <=> '名字');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '服务','fúwù','https://res.cloudinary.com/rir6b8kp/video/upload/v1784051521/D%E1%BB%8Bch_v%E1%BB%A5_yosxg8.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784051400/d%E1%BB%8Bch_v%E1%BB%A5_fyg89z.png',@seed_lessons_4,4,'Dịch vụ'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_4 AND `order_index` <=> 4 AND `hanzi` <=> '服务');
SET @seed_vocabularies_28 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_4 AND `order_index` <=> 4 AND `hanzi` <=> '服务');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '职位','zhíwèi','https://res.cloudinary.com/rir6b8kp/video/upload/v1784051154/Ch%E1%BB%A9c_v%E1%BB%A5_ar9e8h.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784051099/ch%E1%BB%A9c_v%E1%BB%A5_ibepsn.png',@seed_lessons_3,9,'Chức vụ'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_3 AND `order_index` <=> 9 AND `hanzi` <=> '职位');
SET @seed_vocabularies_18 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_3 AND `order_index` <=> 9 AND `hanzi` <=> '职位');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '正常','zhèngcháng','https://res.cloudinary.com/rir6b8kp/video/upload/v1784047342/B%C3%ACnh_th%C6%B0%E1%BB%9Dng_aqjvhe.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784047229/b%C3%ACnh_th%C6%B0%E1%BB%9Dng_vktfek.png',@seed_lessons_35,20,'Bình thường'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_35 AND `order_index` <=> 20 AND `hanzi` <=> '正常');
SET @seed_vocabularies_90 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_35 AND `order_index` <=> 20 AND `hanzi` <=> '正常');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '一共','yígòng',NULL,NULL,@seed_lessons_37,1,'Tổng cộng'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_37 AND `order_index` <=> 1 AND `hanzi` <=> '一共');
SET @seed_vocabularies_99 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_37 AND `order_index` <=> 1 AND `hanzi` <=> '一共');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '右','yòu',NULL,NULL,@seed_lessons_39,3,'Phải'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_39 AND `order_index` <=> 3 AND `hanzi` <=> '右');
SET @seed_vocabularies_113 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_39 AND `order_index` <=> 3 AND `hanzi` <=> '右');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '名字','míngzi','https://res.cloudinary.com/rir6b8kp/video/upload/v1783834384/T%C3%AAn_df9p8x.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1783834344/T%C3%AAn_tplc0l.jpg',@seed_lessons_5,1,'tên'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_5 AND `order_index` <=> 1 AND `hanzi` <=> '名字');
SET @seed_vocabularies_1 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_5 AND `order_index` <=> 1 AND `hanzi` <=> '名字');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '称呼','chēnghu','https://res.cloudinary.com/rir6b8kp/video/upload/v1783834391/X%C6%B0ng_h%C3%B4_porl4z.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1783834637/X%C6%B0ng_h%C3%B4_fbsnnz.jpg',@seed_lessons_5,8,'xưng hô'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_5 AND `order_index` <=> 8 AND `hanzi` <=> '称呼');
SET @seed_vocabularies_8 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_5 AND `order_index` <=> 8 AND `hanzi` <=> '称呼');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '公司','gōngsī','https://res.cloudinary.com/rir6b8kp/video/upload/v1783834367/C%C3%B4ng_ty_lybysg.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1783834329/C%C3%B4ng_ty_ak4dxd.jpg',@seed_lessons_5,9,'công ty'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_5 AND `order_index` <=> 9 AND `hanzi` <=> '公司');
SET @seed_vocabularies_9 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_5 AND `order_index` <=> 9 AND `hanzi` <=> '公司');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '认识','rènshi','https://res.cloudinary.com/rir6b8kp/video/upload/v1784047352/L%C3%A0m_quen_quen_bi%E1%BA%BFt_twytod.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784047238/l%C3%A0m_quen_y1zm5q.png',@seed_lessons_35,6,'Làm quen, quen biết'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_35 AND `order_index` <=> 6 AND `hanzi` <=> '认识');
SET @seed_vocabularies_76 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_35 AND `order_index` <=> 6 AND `hanzi` <=> '认识');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '总经理','zǒngjīnglǐ','https://res.cloudinary.com/rir6b8kp/video/upload/v1783834388/T%E1%BB%95ng_gi%C3%A1m_%C4%91%E1%BB%91c_og83fk.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1783834348/T%E1%BB%95ng_gi%C3%A1m_%C4%91%E1%BB%91c_b5xlff.jpg',@seed_lessons_5,5,'Tổng giám đốc'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_5 AND `order_index` <=> 5 AND `hanzi` <=> '总经理');
SET @seed_vocabularies_5 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_5 AND `order_index` <=> 5 AND `hanzi` <=> '总经理');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '开始','kāishǐ','https://res.cloudinary.com/rir6b8kp/video/upload/v1784175867/b%E1%BA%AFt_%C4%91%E1%BA%A7u_x0z7ip.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784174563/b%E1%BA%AFt_%C4%91%E1%BA%A7u_hurtmq.png',@seed_lessons_2,15,'Bắt đầu'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_2 AND `order_index` <=> 15 AND `hanzi` <=> '开始');
SET @seed_vocabularies_60 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_2 AND `order_index` <=> 15 AND `hanzi` <=> '开始');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '您','nín','https://res.cloudinary.com/rir6b8kp/video/upload/v1784039545/B%E1%BA%A1n_Ng%C3%A0i_%C3%B4ng_b%C3%A0_reytcc.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784039425/l%E1%BB%8Bch_s%E1%BB%B1_zp7ete.png',@seed_lessons_1,12,'Ngài/Bạn/Ông/Bà (lịch sự)'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_1 AND `order_index` <=> 12 AND `hanzi` <=> '您');
SET @seed_vocabularies_44 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_1 AND `order_index` <=> 12 AND `hanzi` <=> '您');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '企业','qǐyè','https://res.cloudinary.com/rir6b8kp/video/upload/v1784051520/Doanh_nghi%E1%BB%87p_cckk4t.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784051397/doanh_nghi%E1%BB%87p_bdzxpn.png',@seed_lessons_4,2,'Doanh nghiệp'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_4 AND `order_index` <=> 2 AND `hanzi` <=> '企业');
SET @seed_vocabularies_26 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_4 AND `order_index` <=> 2 AND `hanzi` <=> '企业');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '欢迎','huānyíng','https://res.cloudinary.com/rir6b8kp/video/upload/v1784039546/Ch%C3%A0o_m%E1%BB%ABng_%C4%91%C3%B3n_ch%C3%A0o_tf7alw.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784039412/Ch%C3%A0o_m%E1%BB%ABng_evt8oe.png',@seed_lessons_1,2,'Chào mừng, đón chào'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_1 AND `order_index` <=> 2 AND `hanzi` <=> '欢迎');
SET @seed_vocabularies_34 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_1 AND `order_index` <=> 2 AND `hanzi` <=> '欢迎');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '客户','kèhù','https://res.cloudinary.com/rir6b8kp/video/upload/v1784051155/Kh%C3%A1ch_h%C3%A0ng_g9ljtd.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784051099/kh%C3%A1ch_h%C3%A0ng_gowqmh.png',@seed_lessons_3,1,'Khách hàng'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_3 AND `order_index` <=> 1 AND `hanzi` <=> '客户');
SET @seed_vocabularies_10 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_3 AND `order_index` <=> 1 AND `hanzi` <=> '客户');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '我是','wǒ shì','https://res.cloudinary.com/rir6b8kp/video/upload/v1784051159/t%C3%B4i_l%C3%A0_vyu8cy.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784051102/t%C3%B4i_l%C3%A0_vvvkqx.png',@seed_lessons_3,10,'Tôi là'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_3 AND `order_index` <=> 10 AND `hanzi` <=> '我是');
SET @seed_vocabularies_19 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_3 AND `order_index` <=> 10 AND `hanzi` <=> '我是');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '请问','qǐngwèn','https://res.cloudinary.com/rir6b8kp/video/upload/v1784051160/Xin_h%E1%BB%8Fi_qawxno.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784051103/xin_h%E1%BB%8Fi_fhqpwg.png',@seed_lessons_3,3,'Xin hỏi'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_3 AND `order_index` <=> 3 AND `hanzi` <=> '请问');
SET @seed_vocabularies_12 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_3 AND `order_index` <=> 3 AND `hanzi` <=> '请问');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '旁边','pángbiān','https://res.cloudinary.com/rir6b8kp/video/upload/v1784047341/B%C3%AAn_c%E1%BA%A1nh_sv3iq3.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784047228/b%C3%AAn_c%E1%BA%A1nh_utrvbt.png',@seed_lessons_35,10,'Bên cạnh'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_35 AND `order_index` <=> 10 AND `hanzi` <=> '旁边');
SET @seed_vocabularies_80 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_35 AND `order_index` <=> 10 AND `hanzi` <=> '旁边');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '不懂','bù dǒng','https://res.cloudinary.com/rir6b8kp/video/upload/v1784047349/Kh%C3%B4ng_hi%E1%BB%83u_pk6lc0.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784047235/kh%C3%B4ng_hi%E1%BB%83u_uetpvk.png',@seed_lessons_35,14,'Không hiểu'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_35 AND `order_index` <=> 14 AND `hanzi` <=> '不懂');
SET @seed_vocabularies_84 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_35 AND `order_index` <=> 14 AND `hanzi` <=> '不懂');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '工作','gōngzuò','https://res.cloudinary.com/rir6b8kp/video/upload/v1784042721/L%C3%A0m_vi%E1%BB%87c_f3l8ny.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784174573/l%C3%A0m_vi%E1%BB%87c_fxrfig.png',@seed_lessons_2,11,'Làm việc'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_2 AND `order_index` <=> 11 AND `hanzi` <=> '工作');
SET @seed_vocabularies_56 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_2 AND `order_index` <=> 11 AND `hanzi` <=> '工作');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '可以','kěyǐ',NULL,NULL,@seed_lessons_37,6,'Có thể; được phép'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_37 AND `order_index` <=> 6 AND `hanzi` <=> '可以');
SET @seed_vocabularies_104 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_37 AND `order_index` <=> 6 AND `hanzi` <=> '可以');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '管理','guǎnlǐ','https://res.cloudinary.com/rir6b8kp/video/upload/v1783834377/Qu%E1%BA%A3n_l%C3%BD_geeh2q.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1783834630/Qu%E1%BA%A3n_l%C3%BD_ohfvd6.jpg',@seed_lessons_5,6,'quản lý'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_5 AND `order_index` <=> 6 AND `hanzi` <=> '管理');
SET @seed_vocabularies_6 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_5 AND `order_index` <=> 6 AND `hanzi` <=> '管理');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '产品','chǎnpǐn','https://res.cloudinary.com/rir6b8kp/video/upload/v1784051526/S%E1%BA%A3n_ph%E1%BA%A9m_kiojtq.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784051403/s%E1%BA%A3n_ph%E1%BA%A9m_g1rus4.png',@seed_lessons_4,3,'Sản phẩm'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_4 AND `order_index` <=> 3 AND `hanzi` <=> '产品');
SET @seed_vocabularies_27 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_4 AND `order_index` <=> 3 AND `hanzi` <=> '产品');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '很快','hěn kuài','https://res.cloudinary.com/rir6b8kp/video/upload/v1784047357/R%E1%BA%A5t_nhanh_zvxbkv.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784047243/r%E1%BA%A5t_nhanh_faljwz.png',@seed_lessons_35,18,'Rất nhanh'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_35 AND `order_index` <=> 18 AND `hanzi` <=> '很快');
SET @seed_vocabularies_88 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_35 AND `order_index` <=> 18 AND `hanzi` <=> '很快');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '没问题','méi wèntí','https://res.cloudinary.com/rir6b8kp/video/upload/v1784047351/Kh%C3%B4ng_v%E1%BA%A5n_%C4%91%E1%BB%81_ugmgsj.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784047236/kh%C3%B4ng_v%E1%BA%A5n_%C4%91%E1%BB%81_w5xm0w.png',@seed_lessons_35,16,'Không vấn đề'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_35 AND `order_index` <=> 16 AND `hanzi` <=> '没问题');
SET @seed_vocabularies_86 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_35 AND `order_index` <=> 16 AND `hanzi` <=> '没问题');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '请坐','qǐng zuò','https://res.cloudinary.com/rir6b8kp/video/upload/v1784042722/M%E1%BB%9Di_ng%E1%BB%93i_rjt72y.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784174575/m%E1%BB%9Di_ng%E1%BB%93i_mqdwld.png',@seed_lessons_2,7,'Mời ngồi'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_2 AND `order_index` <=> 7 AND `hanzi` <=> '请坐');
SET @seed_vocabularies_52 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_2 AND `order_index` <=> 7 AND `hanzi` <=> '请坐');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '领域','lǐngyù','https://res.cloudinary.com/rir6b8kp/video/upload/v1784051525/L%C4%A9nh_v%E1%BB%B1c_ausqmk.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784051402/l%C4%A9nh_v%E1%BB%B1c_trtmf8.png',@seed_lessons_4,7,'Lĩnh vực'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_4 AND `order_index` <=> 7 AND `hanzi` <=> '领域');
SET @seed_vocabularies_31 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_4 AND `order_index` <=> 7 AND `hanzi` <=> '领域');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '经理','jīnglǐ','https://res.cloudinary.com/rir6b8kp/video/upload/v1783834381/Tr%C6%B0%E1%BB%9Fng_ph%C3%B2ng_g2ozsb.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1783834634/Tr%C6%B0%E1%BB%9Fng_ph%C3%B2ng_l3blgq.jpg',@seed_lessons_5,4,'trưởng phòng (kinh doanh) / giám đốc'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_5 AND `order_index` <=> 4 AND `hanzi` <=> '经理');
SET @seed_vocabularies_4 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_5 AND `order_index` <=> 4 AND `hanzi` <=> '经理');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '我也','wǒ yě','https://res.cloudinary.com/rir6b8kp/video/upload/v1784039574/T%C3%B4i_c%C5%A9ng..._qekogz.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784039438/t%C3%B4i_c%C5%A9ng_i6dbxi.png',@seed_lessons_1,13,'Tôi cũng...'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_1 AND `order_index` <=> 13 AND `hanzi` <=> '我也');
SET @seed_vocabularies_45 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_1 AND `order_index` <=> 13 AND `hanzi` <=> '我也');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '欢迎','huānyíng','https://res.cloudinary.com/rir6b8kp/video/upload/v1784042703/Ch%C3%A0o_m%E1%BB%ABng_nijgnk.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784174563/ch%C3%A0o_m%E1%BB%ABng_ftyiik.png',@seed_lessons_2,3,'Chào mừng'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_2 AND `order_index` <=> 3 AND `hanzi` <=> '欢迎');
SET @seed_vocabularies_48 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_2 AND `order_index` <=> 3 AND `hanzi` <=> '欢迎');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '很高兴','hěn gāoxìng','https://res.cloudinary.com/rir6b8kp/video/upload/v1784047358/R%E1%BA%A5t_vui_y6m5hv.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784047244/r%E1%BA%A5t_vui_lcbt2u.png',@seed_lessons_35,5,'Rất vui'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_35 AND `order_index` <=> 5 AND `hanzi` <=> '很高兴');
SET @seed_vocabularies_75 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_35 AND `order_index` <=> 5 AND `hanzi` <=> '很高兴');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '多少钱','duōshao qián',NULL,NULL,@seed_lessons_37,2,'Bao nhiêu tiền'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_37 AND `order_index` <=> 2 AND `hanzi` <=> '多少钱');
SET @seed_vocabularies_100 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_37 AND `order_index` <=> 2 AND `hanzi` <=> '多少钱');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '谢谢大家','xièxie dàjiā','https://res.cloudinary.com/rir6b8kp/video/upload/v1784047346/C%E1%BA%A3m_%C6%A1n_m%E1%BB%8Di_ng%C6%B0%E1%BB%9Di_gaaih9.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784047232/c%E1%BA%A3m_%C6%A1n_m%E1%BB%8Di_ng%C6%B0%E1%BB%9Di_y6qtax.png',@seed_lessons_35,22,'Cảm ơn mọi người'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_35 AND `order_index` <=> 22 AND `hanzi` <=> '谢谢大家');
SET @seed_vocabularies_92 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_35 AND `order_index` <=> 22 AND `hanzi` <=> '谢谢大家');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '上班','shàngbān','https://res.cloudinary.com/rir6b8kp/video/upload/v1784047364/%C4%91i_l%C3%A0m_zipuqr.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784047249/%C4%9i_l%C3%A0m_lwt0el.png',@seed_lessons_35,4,'Đi làm'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_35 AND `order_index` <=> 4 AND `hanzi` <=> '上班');
SET @seed_vocabularies_74 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_35 AND `order_index` <=> 4 AND `hanzi` <=> '上班');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '加入','jiārù','https://res.cloudinary.com/rir6b8kp/video/upload/v1784039553/Gia_nh%E1%BA%ADp_rnrye1.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784039412/gia_nh%E1%BA%ADp_echwaw.png',@seed_lessons_1,3,'Gia nhập, tham gia'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_1 AND `order_index` <=> 3 AND `hanzi` <=> '加入');
SET @seed_vocabularies_35 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_1 AND `order_index` <=> 3 AND `hanzi` <=> '加入');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '很高兴','hěn gāoxìng','https://res.cloudinary.com/rir6b8kp/video/upload/v1784051157/R%E1%BA%A5t_vui_spfh7w.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784051101/r%E1%BA%A5t_vui_ofzobr.png',@seed_lessons_3,14,'Rất vui'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_3 AND `order_index` <=> 14 AND `hanzi` <=> '很高兴');
SET @seed_vocabularies_23 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_3 AND `order_index` <=> 14 AND `hanzi` <=> '很高兴');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '做好','zuò hǎo','https://res.cloudinary.com/rir6b8kp/video/upload/v1784042721/L%C3%A0m_t%E1%BB%91t_vgifiz.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784174572/l%C3%A0m_t%E1%BB%91t_nzrbkp.png',@seed_lessons_2,23,'Làm tốt'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_2 AND `order_index` <=> 23 AND `hanzi` <=> '做好');
SET @seed_vocabularies_68 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_2 AND `order_index` <=> 23 AND `hanzi` <=> '做好');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '尽管','jǐnguǎn','https://res.cloudinary.com/rir6b8kp/video/upload/v1784042704/C%E1%BB%A9_c%E1%BB%A9_vi%E1%BB%87c_asqjgo.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784174566/c%E1%BB%A9_vi%E1%BB%87c_vdkrcw.png',@seed_lessons_2,20,'Cứ, cứ việc'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_2 AND `order_index` <=> 20 AND `hanzi` <=> '尽管');
SET @seed_vocabularies_65 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_2 AND `order_index` <=> 20 AND `hanzi` <=> '尽管');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '我们','wǒmen','https://res.cloudinary.com/rir6b8kp/video/upload/v1784042703/Ch%C3%BAng_t%C3%B4i_d8hc7o.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784174563/ch%C3%BAng_t%C3%B4i_msuvuo.png',@seed_lessons_2,5,'Chúng tôi'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_2 AND `order_index` <=> 5 AND `hanzi` <=> '我们');
SET @seed_vocabularies_50 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_2 AND `order_index` <=> 5 AND `hanzi` <=> '我们');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '多久','duōjiǔ',NULL,NULL,@seed_lessons_39,5,'Bao lâu'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_39 AND `order_index` <=> 5 AND `hanzi` <=> '多久');
SET @seed_vocabularies_115 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_39 AND `order_index` <=> 5 AND `hanzi` <=> '多久');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '分钟','fēnzhōng',NULL,NULL,@seed_lessons_39,6,'Phút'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_39 AND `order_index` <=> 6 AND `hanzi` <=> '分钟');
SET @seed_vocabularies_116 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_39 AND `order_index` <=> 6 AND `hanzi` <=> '分钟');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '前面','qiánmiàn',NULL,NULL,@seed_lessons_38,4,'Phía trước'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_38 AND `order_index` <=> 4 AND `hanzi` <=> '前面');
SET @seed_vocabularies_108 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_38 AND `order_index` <=> 4 AND `hanzi` <=> '前面');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '负责','fùzé','https://res.cloudinary.com/rir6b8kp/video/upload/v1784051156/ph%E1%BB%A5_tr%C3%A1ch_d0ndjs.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784051101/ph%E1%BB%A5_tr%C3%A1ch_wrxoge.png',@seed_lessons_3,12,'Phụ trách'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_3 AND `order_index` <=> 12 AND `hanzi` <=> '负责');
SET @seed_vocabularies_21 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_3 AND `order_index` <=> 12 AND `hanzi` <=> '负责');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '我叫','wǒ jiào','https://res.cloudinary.com/rir6b8kp/video/upload/v1784051159/t%C3%AAn_t%C3%B4i_l%C3%A0_f9eufp.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784051102/t%C3%B4i_l%C3%A0_vvvkqx.png',@seed_lessons_3,7,'Tôi tên là'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_3 AND `order_index` <=> 7 AND `hanzi` <=> '我叫');
SET @seed_vocabularies_16 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_3 AND `order_index` <=> 7 AND `hanzi` <=> '我叫');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '争取','zhēngqǔ','https://res.cloudinary.com/rir6b8kp/video/upload/v1784042724/Ph%E1%BA%A5n_%C4%91%E1%BA%A5u_oxmowt.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784174579/ph%E1%BA%A5n_%C4%91%E1%BA%A5u_qi6c9k.png',@seed_lessons_2,22,'Phấn đấu'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_2 AND `order_index` <=> 22 AND `hanzi` <=> '争取');
SET @seed_vocabularies_67 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_2 AND `order_index` <=> 22 AND `hanzi` <=> '争取');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '熟悉','shúxī','https://res.cloudinary.com/rir6b8kp/video/upload/v1784047356/Quen_thu%E1%BB%99c_w6jmmf.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784047241/quen_thu%E1%BB%99c_iygcmv.png',@seed_lessons_35,19,'Quen thuộc'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_35 AND `order_index` <=> 19 AND `hanzi` <=> '熟悉');
SET @seed_vocabularies_89 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_35 AND `order_index` <=> 19 AND `hanzi` <=> '熟悉');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '杯','bēi',NULL,NULL,@seed_lessons_36,3,'Cốc; lượng từ cho đồ uống'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_36 AND `order_index` <=> 3 AND `hanzi` <=> '杯');
SET @seed_vocabularies_95 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_36 AND `order_index` <=> 3 AND `hanzi` <=> '杯');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '请问','qǐngwèn',NULL,NULL,@seed_lessons_38,1,'Xin hỏi'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_38 AND `order_index` <=> 1 AND `hanzi` <=> '请问');
SET @seed_vocabularies_105 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_38 AND `order_index` <=> 1 AND `hanzi` <=> '请问');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '安全规章','ānquán guīzhāng','https://res.cloudinary.com/rir6b8kp/video/upload/v1784042724/N%E1%BB%99i_quy_an_to%C3%A0n_zevury.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784174578/n%E1%BB%99i_quy_an_to%C3%A0n_imohin.png',@seed_lessons_2,18,'Nội quy an toàn'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_2 AND `order_index` <=> 18 AND `hanzi` <=> '安全规章');
SET @seed_vocabularies_63 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_2 AND `order_index` <=> 18 AND `hanzi` <=> '安全规章');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '热','rè',NULL,NULL,@seed_lessons_36,4,'Nóng'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_36 AND `order_index` <=> 4 AND `hanzi` <=> '热');
SET @seed_vocabularies_96 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_36 AND `order_index` <=> 4 AND `hanzi` <=> '热');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '工业园区','gōngyè yuánqū','https://res.cloudinary.com/rir6b8kp/video/upload/v1784042707/Khu_c%C3%B4ng_nghi%E1%BB%87p_v5ey4f.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784174570/khu_c%C3%B4ng_nghi%E1%BB%87p_hxhrfv.png',@seed_lessons_2,10,'Khu công nghiệp'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_2 AND `order_index` <=> 10 AND `hanzi` <=> '工业园区');
SET @seed_vocabularies_55 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_2 AND `order_index` <=> 10 AND `hanzi` <=> '工业园区');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '职务','zhíwù','https://res.cloudinary.com/rir6b8kp/video/upload/v1783834364/Ch%E1%BB%A9c_v%E1%BB%A5_znovly.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1783834326/Ch%E1%BB%A9c_v%E1%BB%A5_xlpnsn.jpg',@seed_lessons_5,3,'chức vụ'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_5 AND `order_index` <=> 3 AND `hanzi` <=> '职务');
SET @seed_vocabularies_3 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_5 AND `order_index` <=> 3 AND `hanzi` <=> '职务');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '左','zuǒ',NULL,NULL,@seed_lessons_39,2,'Trái'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_39 AND `order_index` <=> 2 AND `hanzi` <=> '左');
SET @seed_vocabularies_112 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_39 AND `order_index` <=> 2 AND `hanzi` <=> '左');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '第一天','dì yī tiān','https://res.cloudinary.com/rir6b8kp/video/upload/v1784039569/Ng%C3%A0y_%C4%91%E1%BA%A7u_ti%C3%AAn_bgf5qu.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784039428/ng%C3%A0y_%C4%91%E1%BA%A7u_ti%C3%AAn_atv1z1.png',@seed_lessons_1,7,'Ngày đầu tiên'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_1 AND `order_index` <=> 7 AND `hanzi` <=> '第一天');
SET @seed_vocabularies_39 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_1 AND `order_index` <=> 7 AND `hanzi` <=> '第一天');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '打包','dǎbāo',NULL,NULL,@seed_lessons_37,4,'Gói lại; mang đi'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_37 AND `order_index` <=> 4 AND `hanzi` <=> '打包');
SET @seed_vocabularies_102 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_37 AND `order_index` <=> 4 AND `hanzi` <=> '打包');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '加入','jiārù','https://res.cloudinary.com/rir6b8kp/video/upload/v1784042705/Gia_nh%E1%BA%ADp_gllyog.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784174567/gia_nh%E1%BA%ADp_am8ol9.png',@seed_lessons_2,4,'Gia nhập'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_2 AND `order_index` <=> 4 AND `hanzi` <=> '加入');
SET @seed_vocabularies_49 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_2 AND `order_index` <=> 4 AND `hanzi` <=> '加入');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '团队','tuánduì','https://res.cloudinary.com/rir6b8kp/video/upload/v1784042727/%C4%90%E1%BB%99i_nh%C3%B3m_ne9xxi.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784174582/%C4%91%E1%BB%99i_nh%C3%B3m_ct4qoe.png',@seed_lessons_2,6,'Đội nhóm'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_2 AND `order_index` <=> 6 AND `hanzi` <=> '团队');
SET @seed_vocabularies_51 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_2 AND `order_index` <=> 6 AND `hanzi` <=> '团队');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '客户服务','kèhù fúwù','https://res.cloudinary.com/rir6b8kp/video/upload/v1784051153/Ch%C4%83m_s%C3%B3c_kh%C3%A1ch_h%C3%A0ng_c6u48q.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784051098/ch%C4%83m_s%C3%B3c_kh%C3%A1ch_h%C3%A0ng_bsidex.png',@seed_lessons_3,13,'Chăm sóc khách hàng'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_3 AND `order_index` <=> 13 AND `hanzi` <=> '客户服务');
SET @seed_vocabularies_22 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_3 AND `order_index` <=> 13 AND `hanzi` <=> '客户服务');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '多多指导','duōduō zhǐdǎo','https://res.cloudinary.com/rir6b8kp/video/upload/v1784047345/Ch%E1%BB%89_b%E1%BA%A3o_nhi%E1%BB%81u_h%C6%A1n_zs2tzp.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784047231/ch%E1%BB%89_b%E1%BA%A3o_nhi%E1%BB%81u_h%C6%A1n_brjn01.png',@seed_lessons_35,13,'Chỉ bảo nhiều hơn'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_35 AND `order_index` <=> 13 AND `hanzi` <=> '多多指导');
SET @seed_vocabularies_83 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_35 AND `order_index` <=> 13 AND `hanzi` <=> '多多指导');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '介绍','jièshào','https://res.cloudinary.com/rir6b8kp/video/upload/v1784042705/Gi%E1%BB%9Bi_thi%E1%BB%87u_xajnwd.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784174567/gi%E1%BB%9Bi_thi%E1%BB%87u_nscikm.png',@seed_lessons_2,24,'Giới thiệu'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_2 AND `order_index` <=> 24 AND `hanzi` <=> '介绍');
SET @seed_vocabularies_69 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_2 AND `order_index` <=> 24 AND `hanzi` <=> '介绍');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '流程','liúchéng','https://res.cloudinary.com/rir6b8kp/video/upload/v1784042725/Quy_tr%C3%ACnh_xzjlwu.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784174579/quy_tr%C3%ACnh_yqt7m5.png',@seed_lessons_2,17,'Quy trình'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_2 AND `order_index` <=> 17 AND `hanzi` <=> '流程');
SET @seed_vocabularies_62 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_2 AND `order_index` <=> 17 AND `hanzi` <=> '流程');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '困难','kùnnán','https://res.cloudinary.com/rir6b8kp/video/upload/v1784042707/Kh%C3%B3_kh%C4%83n_yacqro.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784174571/kh%C3%B3_kh%C4%83n_iweers.png',@seed_lessons_2,19,'Khó khăn'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_2 AND `order_index` <=> 19 AND `hanzi` <=> '困难');
SET @seed_vocabularies_64 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_2 AND `order_index` <=> 19 AND `hanzi` <=> '困难');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '上班','shàngbān','https://res.cloudinary.com/rir6b8kp/video/upload/v1784039588/%C4%90i_l%C3%A0m_o4jty1.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784039452/%C4%90i_l%C3%A0m_gmklb2.png',@seed_lessons_1,8,'Đi làm'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_1 AND `order_index` <=> 8 AND `hanzi` <=> '上班');
SET @seed_vocabularies_40 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_1 AND `order_index` <=> 8 AND `hanzi` <=> '上班');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '我叫','wǒ jiào','https://res.cloudinary.com/rir6b8kp/video/upload/v1784047361/T%C3%B4i_t%C3%AAn_l%C3%A0_e37kwp.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784047246/t%C3%B4i_t%C3%AAn_l%C3%A0_imuj1t.png',@seed_lessons_35,9,'Tôi tên là'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_35 AND `order_index` <=> 9 AND `hanzi` <=> '我叫');
SET @seed_vocabularies_79 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_35 AND `order_index` <=> 9 AND `hanzi` <=> '我叫');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '工作节奏','gōngzuò jiézòu','https://res.cloudinary.com/rir6b8kp/video/upload/v1784047354/Nh%E1%BB%8Bp_%C4%91%E1%BB%99_c%C3%B4ng_vi%E1%BB%87c_fcoy3f.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784047240/nh%E1%BB%8Bp_%C4%91%E1%BB%99_c%C3%B4ng_vi%E1%BB%87c_b2rwhy.png',@seed_lessons_35,17,'Nhịp độ công việc'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_35 AND `order_index` <=> 17 AND `hanzi` <=> '工作节奏');
SET @seed_vocabularies_87 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_35 AND `order_index` <=> 17 AND `hanzi` <=> '工作节奏');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '麻烦','máfan','https://res.cloudinary.com/rir6b8kp/video/upload/v1784047356/Phi%C3%AAn_l%C3%A0m_phi%E1%BB%81n_asb1ir.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784047237/l%C3%A0m_phi%E1%BB%81n_hrblet.png',@seed_lessons_35,15,'Phiên, làm phiền'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_35 AND `order_index` <=> 15 AND `hanzi` <=> '麻烦');
SET @seed_vocabularies_85 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_35 AND `order_index` <=> 15 AND `hanzi` <=> '麻烦');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '什么','shénme','https://res.cloudinary.com/rir6b8kp/video/upload/v1784051154/g%C3%AC_ehgjn5.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784051099/g%C3%AC_lixmnt.png',@seed_lessons_3,5,'Gì'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_3 AND `order_index` <=> 5 AND `hanzi` <=> '什么');
SET @seed_vocabularies_14 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_3 AND `order_index` <=> 5 AND `hanzi` <=> '什么');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '一直走','yìzhí zǒu',NULL,NULL,@seed_lessons_39,1,'Đi thẳng'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_39 AND `order_index` <=> 1 AND `hanzi` <=> '一直走');
SET @seed_vocabularies_111 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_39 AND `order_index` <=> 1 AND `hanzi` <=> '一直走');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '很','hěn','https://res.cloudinary.com/rir6b8kp/video/upload/v1784039571/R%E1%BA%A5t_qrnuud.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784039435/r%E1%BA%A5t_nl9zce.png',@seed_lessons_1,9,'Rất'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_1 AND `order_index` <=> 9 AND `hanzi` <=> '很');
SET @seed_vocabularies_41 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_1 AND `order_index` <=> 9 AND `hanzi` <=> '很');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '希望','xīwàng','https://res.cloudinary.com/rir6b8kp/video/upload/v1784042705/Hy_v%E1%BB%8Dng_xpzowu.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784174568/hi_v%E1%BB%8Dng_exnarp.png',@seed_lessons_2,12,'Hy vọng'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_2 AND `order_index` <=> 12 AND `hanzi` <=> '希望');
SET @seed_vocabularies_57 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_2 AND `order_index` <=> 12 AND `hanzi` <=> '希望');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '工厂','gōngchǎng','https://res.cloudinary.com/rir6b8kp/video/upload/v1784042723/Nh%C3%A0_m%C3%A1y_uulfl7.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784174575/nh%C3%A0_m%C3%A1y_adeupa.png',@seed_lessons_2,16,'Nhà máy'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_2 AND `order_index` <=> 16 AND `hanzi` <=> '工厂');
SET @seed_vocabularies_61 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_2 AND `order_index` <=> 16 AND `hanzi` <=> '工厂');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '提供','tígōng','https://res.cloudinary.com/rir6b8kp/video/upload/v1784051518/Cung_c%E1%BA%A5p_hf4c93.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784051396/cung_c%E1%BA%A5p_dkm6q1.png',@seed_lessons_4,6,'Cung cấp'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_4 AND `order_index` <=> 6 AND `hanzi` <=> '提供');
SET @seed_vocabularies_30 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_4 AND `order_index` <=> 6 AND `hanzi` <=> '提供');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '以后','yǐhòu','https://res.cloudinary.com/rir6b8kp/video/upload/v1784047359/Sau_n%C3%A0y_jtx5cb.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784047245/sau_n%C3%A0y_k9buhm.png',@seed_lessons_35,12,'Sau này'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_35 AND `order_index` <=> 12 AND `hanzi` <=> '以后');
SET @seed_vocabularies_82 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_35 AND `order_index` <=> 12 AND `hanzi` <=> '以后');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '冰','bīng',NULL,NULL,@seed_lessons_36,5,'Đá; lạnh (trong ngữ cảnh đồ uống)'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_36 AND `order_index` <=> 5 AND `hanzi` <=> '冰');
SET @seed_vocabularies_97 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_36 AND `order_index` <=> 5 AND `hanzi` <=> '冰');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '解决方案','jiějué fāng''àn','https://res.cloudinary.com/rir6b8kp/video/upload/v1784051522/Gi%E1%BA%A3i_ph%C3%A1p_h2fkla.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784051400/gi%E1%BA%A3i_ph%C3%A1p_vwp125.png',@seed_lessons_4,5,'Giải pháp'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_4 AND `order_index` <=> 5 AND `hanzi` <=> '解决方案');
SET @seed_vocabularies_29 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_4 AND `order_index` <=> 5 AND `hanzi` <=> '解决方案');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '块','kuài',NULL,NULL,@seed_lessons_37,3,'Tệ (cách nói thông dụng)'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_37 AND `order_index` <=> 3 AND `hanzi` <=> '块');
SET @seed_vocabularies_101 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_37 AND `order_index` <=> 3 AND `hanzi` <=> '块');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '新来的员工','xīn lái de yuángōng','https://res.cloudinary.com/rir6b8kp/video/upload/v1784042724/Nh%C3%A2n_vi%C3%AAn_m%E1%BB%9Bi_dbdlww.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784174577/nh%C3%A2n_vi%C3%AAn_m%E1%BB%9Bi_zfpnff.png',@seed_lessons_2,2,'Nhân viên mới'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_2 AND `order_index` <=> 2 AND `hanzi` <=> '新来的员工');
SET @seed_vocabularies_47 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_2 AND `order_index` <=> 2 AND `hanzi` <=> '新来的员工');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '糖','táng',NULL,NULL,@seed_lessons_36,6,'Đường'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_36 AND `order_index` <=> 6 AND `hanzi` <=> '糖');
SET @seed_vocabularies_98 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_36 AND `order_index` <=> 6 AND `hanzi` <=> '糖');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '没关系','méiguānxi','https://res.cloudinary.com/rir6b8kp/video/upload/v1784042708/Kh%C3%B4ng_sao_tjhcs2.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784174572/kh%C3%B4ng_sao_zcqqd5.png',@seed_lessons_2,14,'Không sao'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_2 AND `order_index` <=> 14 AND `hanzi` <=> '没关系');
SET @seed_vocabularies_59 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_2 AND `order_index` <=> 14 AND `hanzi` <=> '没关系');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '指导','zhǐdǎo','https://res.cloudinary.com/rir6b8kp/video/upload/v1784042706/H%C6%B0%E1%BB%9Bng_d%E1%BA%ABn_ch%E1%BB%89_b%E1%BA%A3o_pjeanu.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784174569/h%C6%B0%E1%BB%9Bng_d%E1%BA%ABn_ig1r1z.png',@seed_lessons_2,13,'Hướng dẫn, chỉ bảo'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_2 AND `order_index` <=> 13 AND `hanzi` <=> '指导');
SET @seed_vocabularies_58 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_2 AND `order_index` <=> 13 AND `hanzi` <=> '指导');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '见到','jiàndào','https://res.cloudinary.com/rir6b8kp/video/upload/v1784039557/G%E1%BA%B7p_b3txm2.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784039415/g%E1%BA%B7p_xrt6ha.png',@seed_lessons_1,11,'Gặp, nhìn thấy'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_1 AND `order_index` <=> 11 AND `hanzi` <=> '见到');
SET @seed_vocabularies_43 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_1 AND `order_index` <=> 11 AND `hanzi` <=> '见到');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '茶','chá',NULL,NULL,@seed_lessons_36,2,'Trà'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_36 AND `order_index` <=> 2 AND `hanzi` <=> '茶');
SET @seed_vocabularies_94 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_36 AND `order_index` <=> 2 AND `hanzi` <=> '茶');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '姓','xìng','https://res.cloudinary.com/rir6b8kp/video/upload/v1783834370/H%E1%BB%8D_ljl0zb.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1783834331/H%E1%BB%8D_a47jhh.jpg',@seed_lessons_5,2,'họ (họ danh)'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_5 AND `order_index` <=> 2 AND `hanzi` <=> '姓');
SET @seed_vocabularies_2 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_5 AND `order_index` <=> 2 AND `hanzi` <=> '姓');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '公司','gōngsī','https://res.cloudinary.com/rir6b8kp/video/upload/v1784051519/C%C3%B4ng_ty_ly90zg.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784051396/c%C3%B4ng_ty_wcvgn7.png',@seed_lessons_4,1,'Công ty'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_4 AND `order_index` <=> 1 AND `hanzi` <=> '公司');
SET @seed_vocabularies_25 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_4 AND `order_index` <=> 1 AND `hanzi` <=> '公司');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '员工','yuángōng','https://res.cloudinary.com/rir6b8kp/video/upload/v1783834373/Nh%C3%A2n_vi%C3%AAn_rxb9ie.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1783834335/Nh%C3%A2n_vi%C3%AAn_gzrd62.jpg',@seed_lessons_5,7,'nhân viên'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_5 AND `order_index` <=> 7 AND `hanzi` <=> '员工');
SET @seed_vocabularies_7 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_5 AND `order_index` <=> 7 AND `hanzi` <=> '员工');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '希望','xīwàng','https://res.cloudinary.com/rir6b8kp/video/upload/v1784047347/Hy_v%E1%BB%8Dng_a2qmw6.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784047233/hi_v%E1%BB%8Dng_g1oes8.png',@seed_lessons_35,11,'Hy vọng'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_35 AND `order_index` <=> 11 AND `hanzi` <=> '希望');
SET @seed_vocabularies_81 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_35 AND `order_index` <=> 11 AND `hanzi` <=> '希望');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '部门主管','bùmén zhǔguǎn','https://res.cloudinary.com/rir6b8kp/video/upload/v1784042726/Tr%C6%B0%E1%BB%9Fng_b%E1%BB%99_ph%E1%BA%ADn_f2gvfs.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784174580/tr%C6%B0%E1%BB%9Fng_b%E1%BB%99_ph%E1%BA%ADn_eh5obx.png',@seed_lessons_2,1,'Trưởng bộ phận'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_2 AND `order_index` <=> 1 AND `hanzi` <=> '部门主管');
SET @seed_vocabularies_46 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_2 AND `order_index` <=> 1 AND `hanzi` <=> '部门主管');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '我','wǒ','https://res.cloudinary.com/rir6b8kp/video/upload/v1784039578/T%C3%B4i_kookxy.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784039441/t%C3%B4i_xa9mva.png',@seed_lessons_1,6,'Tôi'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_1 AND `order_index` <=> 6 AND `hanzi` <=> '我');
SET @seed_vocabularies_38 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_1 AND `order_index` <=> 6 AND `hanzi` <=> '我');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '活动','huódòng','https://res.cloudinary.com/rir6b8kp/video/upload/v1784051524/Ho%E1%BA%A1t_%C4%91%E1%BB%99ng_olvlvb.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784051401/ho%E1%BA%A1t_%C4%91%E1%BB%99ng_vxvvyq.png',@seed_lessons_4,8,'Hoạt động'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_4 AND `order_index` <=> 8 AND `hanzi` <=> '活动');
SET @seed_vocabularies_32 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_4 AND `order_index` <=> 8 AND `hanzi` <=> '活动');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '大家好','dàjiā hǎo','https://res.cloudinary.com/rir6b8kp/video/upload/v1784047363/Xin_ch%C3%A0o_m%E1%BB%8Di_ng%C6%B0%E1%BB%9Di_vpblcu.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784047248/xin_ch%C3%A0o_m%E1%BB%8Di_ng%C6%B0%E1%BB%9Di_dwidto.png',@seed_lessons_35,1,'Xin chào mọi người'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_35 AND `order_index` <=> 1 AND `hanzi` <=> '大家好');
SET @seed_vocabularies_71 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_35 AND `order_index` <=> 1 AND `hanzi` <=> '大家好');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '咖啡','kāfēi',NULL,NULL,@seed_lessons_36,1,'Cà phê'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_36 AND `order_index` <=> 1 AND `hanzi` <=> '咖啡');
SET @seed_vocabularies_93 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_36 AND `order_index` <=> 1 AND `hanzi` <=> '咖啡');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '今天','jīntiān','https://res.cloudinary.com/rir6b8kp/video/upload/v1784039561/H%C3%B4m_nay_ggnrjk.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784039418/h%C3%B4m_nay_kohs4v.png',@seed_lessons_1,4,'Hôm nay'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_1 AND `order_index` <=> 4 AND `hanzi` <=> '今天');
SET @seed_vocabularies_36 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_1 AND `order_index` <=> 4 AND `hanzi` <=> '今天');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '认识','rènshi','https://res.cloudinary.com/rir6b8kp/video/upload/v1784051155/L%C3%A0m_quen_g%E1%BA%B7p_g%E1%BB%A1_iizv7b.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784051100/l%C3%A0m_quen_engije.png',@seed_lessons_3,15,'Làm quen, gặp gỡ'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_3 AND `order_index` <=> 15 AND `hanzi` <=> '认识');
SET @seed_vocabularies_24 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_3 AND `order_index` <=> 15 AND `hanzi` <=> '认识');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '地铁站','dìtiězhàn',NULL,NULL,@seed_lessons_38,2,'Ga tàu điện ngầm'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_38 AND `order_index` <=> 2 AND `hanzi` <=> '地铁站');
SET @seed_vocabularies_106 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_38 AND `order_index` <=> 2 AND `hanzi` <=> '地铁站');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '洗手间','xǐshǒujiān',NULL,NULL,@seed_lessons_38,5,'Nhà vệ sinh'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_38 AND `order_index` <=> 5 AND `hanzi` <=> '洗手间');
SET @seed_vocabularies_109 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_38 AND `order_index` <=> 5 AND `hanzi` <=> '洗手间');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '今天','jīntiān','https://res.cloudinary.com/rir6b8kp/video/upload/v1784047348/H%C3%B4m_nay_g3hrtb.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784047234/h%C3%B4m_nay_quippl.png',@seed_lessons_35,2,'Hôm nay'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_35 AND `order_index` <=> 2 AND `hanzi` <=> '今天');
SET @seed_vocabularies_72 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_35 AND `order_index` <=> 2 AND `hanzi` <=> '今天');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '第一次','dì yī cì','https://res.cloudinary.com/rir6b8kp/video/upload/v1784042722/L%E1%BA%A7n_%C4%91%E1%BA%A7u_ti%C3%AAn_ghyo2j.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784174575/l%E1%BA%A7n_%C4%91%E1%BA%A7u_ti%C3%AAn_anprhi.png',@seed_lessons_2,9,'Lần đầu tiên'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_2 AND `order_index` <=> 9 AND `hanzi` <=> '第一次');
SET @seed_vocabularies_54 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_2 AND `order_index` <=> 9 AND `hanzi` <=> '第一次');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '同事','tóngshì','https://res.cloudinary.com/rir6b8kp/video/upload/v1784042726/%C4%90%E1%BB%93ng_nghi%E1%BB%87p_f34qxf.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784174581/%C4%91%E1%BB%93ng_nghi%E1%BB%87p_bhu46v.png',@seed_lessons_2,25,'Đồng nghiệp'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_2 AND `order_index` <=> 25 AND `hanzi` <=> '同事');
SET @seed_vocabularies_70 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_2 AND `order_index` <=> 25 AND `hanzi` <=> '同事');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '高兴','gāoxìng','https://res.cloudinary.com/rir6b8kp/video/upload/v1784039581/Vui_haxu0n.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784039449/vui_ahqbqf.png',@seed_lessons_1,10,'Vui, vui mừng'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_1 AND `order_index` <=> 10 AND `hanzi` <=> '高兴');
SET @seed_vocabularies_42 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_1 AND `order_index` <=> 10 AND `hanzi` <=> '高兴');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '谢谢','xièxie','https://res.cloudinary.com/rir6b8kp/video/upload/v1784042704/C%E1%BA%A3m_%C6%A1n_jt5hdu.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784174564/c%E1%BA%A3m_%C6%A1n_dwlpup.png',@seed_lessons_2,8,'Cảm ơn'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_2 AND `order_index` <=> 8 AND `hanzi` <=> '谢谢');
SET @seed_vocabularies_53 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_2 AND `order_index` <=> 8 AND `hanzi` <=> '谢谢');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '刚','gāng','https://res.cloudinary.com/rir6b8kp/video/upload/v1784047362/V%E1%BB%ABa_m%E1%BB%9Bi_hmflfd.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784047247/v%E1%BB%ABa_m%E1%BB%9Bi_suaugp.png',@seed_lessons_35,3,'Vừa mới'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_35 AND `order_index` <=> 3 AND `hanzi` <=> '刚');
SET @seed_vocabularies_73 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_35 AND `order_index` <=> 3 AND `hanzi` <=> '刚');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '哪里','nǎlǐ',NULL,NULL,@seed_lessons_38,3,'Ở đâu'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_38 AND `order_index` <=> 3 AND `hanzi` <=> '哪里');
SET @seed_vocabularies_107 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_38 AND `order_index` <=> 3 AND `hanzi` <=> '哪里');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '努力','nǔlì','https://res.cloudinary.com/rir6b8kp/video/upload/v1784042704/C%E1%BB%91_g%E1%BA%AFng_fotrc5.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784174565/c%E1%BB%91_g%E1%BA%AFng_g0ynfe.png',@seed_lessons_2,21,'Cố gắng'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_2 AND `order_index` <=> 21 AND `hanzi` <=> '努力');
SET @seed_vocabularies_66 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_2 AND `order_index` <=> 21 AND `hanzi` <=> '努力');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '您好','nínhǎo','https://res.cloudinary.com/rir6b8kp/video/upload/v1784039585/xin_ch%C3%A0o_qmyanm.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784039450/Xin_ch%C3%A0o_mdebpt.png',@seed_lessons_1,1,'Xin chào (lịch sự)'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_1 AND `order_index` <=> 1 AND `hanzi` <=> '您好');
SET @seed_vocabularies_33 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_1 AND `order_index` <=> 1 AND `hanzi` <=> '您好');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '是','shì','https://res.cloudinary.com/rir6b8kp/video/upload/v1784039563/L%C3%A0_iw2etn.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784039421/l%C3%A0_ivngrw.png',@seed_lessons_1,5,'Là'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_1 AND `order_index` <=> 5 AND `hanzi` <=> '是');
SET @seed_vocabularies_37 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_1 AND `order_index` <=> 5 AND `hanzi` <=> '是');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '别着急','bié zhāojí','https://res.cloudinary.com/rir6b8kp/video/upload/v1784047366/%C4%90%E1%BB%ABng_v%E1%BB%99i_nsr2di.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784047250/%C4%91%E1%BB%ABng_v%E1%BB%99i_puyabr.png',@seed_lessons_35,21,'Đừng vội'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_35 AND `order_index` <=> 21 AND `hanzi` <=> '别着急');
SET @seed_vocabularies_91 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_35 AND `order_index` <=> 21 AND `hanzi` <=> '别着急');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '销售经理','xiāoshòu jīnglǐ','https://res.cloudinary.com/rir6b8kp/video/upload/v1784051157/Qu%E1%BA%A3n_l%C3%BD_kinh_doanh_m5b47r.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784051101/qu%E1%BA%A3n_l%C3%BD_kinh_doanh_itqmlv.png',@seed_lessons_3,11,'Quản lý kinh doanh'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_3 AND `order_index` <=> 11 AND `hanzi` <=> '销售经理');
SET @seed_vocabularies_20 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_3 AND `order_index` <=> 11 AND `hanzi` <=> '销售经理');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '大家','dàjiā','https://res.cloudinary.com/rir6b8kp/video/upload/v1784047353/M%E1%BB%8Di_ng%C6%B0%E1%BB%9Di_j0nmog.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784047239/m%E1%BB%8Di_ng%C6%B0%E1%BB%9Di_a7pyk0.png',@seed_lessons_35,7,'Mọi người'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_35 AND `order_index` <=> 7 AND `hanzi` <=> '大家');
SET @seed_vocabularies_77 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_35 AND `order_index` <=> 7 AND `hanzi` <=> '大家');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '酒店','jiǔdiàn',NULL,NULL,@seed_lessons_38,6,'Khách sạn'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_38 AND `order_index` <=> 6 AND `hanzi` <=> '酒店');
SET @seed_vocabularies_110 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_38 AND `order_index` <=> 6 AND `hanzi` <=> '酒店');
INSERT INTO `vocabularies` (`hanzi`,`pinyin`,`audio_url`,`image_url`,`lesson_id`,`order_index`,`vietnamese_meaning`)
SELECT '叫','jiào','https://res.cloudinary.com/rir6b8kp/video/upload/v1784051158/T%C3%AAn_l%C3%A0_g%E1%BB%8Di_l%C3%A0_uzhvay.mp3','https://res.cloudinary.com/rir6b8kp/image/upload/v1784051099/h%E1%BB%8Fi_t%C3%AAn_h428yk.png',@seed_lessons_3,4,'Tên là, gọi là'
WHERE NOT EXISTS (SELECT 1 FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_3 AND `order_index` <=> 4 AND `hanzi` <=> '叫');
SET @seed_vocabularies_13 = (SELECT id FROM `vocabularies` WHERE `lesson_id` <=> @seed_lessons_3 AND `order_index` <=> 4 AND `hanzi` <=> '叫');

-- sentence_patterns
INSERT INTO `sentence_patterns` (`audio_url`,`lesson_id`,`order_index`,`pinyin_text`,`chinese_text`,`vocabulary_id`,`vietnamese_meaning`)
SELECT NULL,@seed_lessons_39,3,'Dàgài wǔ fēnzhōng.','大概五分钟。',NULL,'Khoảng năm phút.'
WHERE NOT EXISTS (SELECT 1 FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_39 AND `order_index` <=> 3);
SET @seed_sentence_patterns_36 = (SELECT id FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_39 AND `order_index` <=> 3);
INSERT INTO `sentence_patterns` (`audio_url`,`lesson_id`,`order_index`,`pinyin_text`,`chinese_text`,`vocabulary_id`,`vietnamese_meaning`)
SELECT 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784051589/MC3-1_aqogd3.mp3',@seed_lessons_4,4,'Wǒmen tígōng réngōng zhìnéng xuéxí píngtái.','我们提供人工智能学习 platform。',NULL,'Chúng tôi cung cấp nền tảng học tập trí tuệ nhân tạo.'
WHERE NOT EXISTS (SELECT 1 FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_4 AND `order_index` <=> 4);
SET @seed_sentence_patterns_12 = (SELECT id FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_4 AND `order_index` <=> 4);
INSERT INTO `sentence_patterns` (`audio_url`,`lesson_id`,`order_index`,`pinyin_text`,`chinese_text`,`vocabulary_id`,`vietnamese_meaning`)
SELECT 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784046978/MC1-1_wgnwii.mp3',@seed_lessons_1,1,'Nǐ hǎo, wǒ jiào A. Jīntiān shì wǒ dì yī tiān lái shàngbān.','你好，我叫A。今天是我第一天来上班。',NULL,'Xin chào tôi tên là A. Hôm nay là ngày đầu tiên tôi đi làm.'
WHERE NOT EXISTS (SELECT 1 FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_1 AND `order_index` <=> 1);
SET @seed_sentence_patterns_13 = (SELECT id FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_1 AND `order_index` <=> 1);
INSERT INTO `sentence_patterns` (`audio_url`,`lesson_id`,`order_index`,`pinyin_text`,`chinese_text`,`vocabulary_id`,`vietnamese_meaning`)
SELECT 'https://res.cloudinary.com/rir6b8kp/video/upload/v1783860596/M%E1%BA%ABu_c%C3%A2u_4_ffehvg.mp3',@seed_lessons_5,4,'Wǒ kěyǐ chēnghu nín wèi Ruǎn jīnglǐ ma?','我可以称呼您为阮经理吗？',@seed_vocabularies_8,'Tôi xin phép được xưng hô với anh/chị là Trưởng phòng Nguyễn được không?'
WHERE NOT EXISTS (SELECT 1 FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_5 AND `order_index` <=> 4);
SET @seed_sentence_patterns_4 = (SELECT id FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_5 AND `order_index` <=> 4);
INSERT INTO `sentence_patterns` (`audio_url`,`lesson_id`,`order_index`,`pinyin_text`,`chinese_text`,`vocabulary_id`,`vietnamese_meaning`)
SELECT 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784051587/MC2-1_z40g5p.mp3',@seed_lessons_4,2,'Wǒmen gōngsī zhuānmén wèi qǐyè tígōng ruǎnjiàn jiějué fāng''àn.','我们公司专门为企业提供软件解决方案。',NULL,'Công ty chúng tôi chuyên cung cấp giải pháp phần mềm cho doanh nghiệp.'
WHERE NOT EXISTS (SELECT 1 FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_4 AND `order_index` <=> 2);
SET @seed_sentence_patterns_10 = (SELECT id FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_4 AND `order_index` <=> 2);
INSERT INTO `sentence_patterns` (`audio_url`,`lesson_id`,`order_index`,`pinyin_text`,`chinese_text`,`vocabulary_id`,`vietnamese_meaning`)
SELECT 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784047056/MC2-1_vx0csd.mp3',@seed_lessons_2,3,'Huānyíng jiārù wǒmen de tuánduì. Qǐng zuò, méi guānxi, mànmàn shúxī.','欢迎加入我们的团队。请坐，没关系，慢慢熟悉。',NULL,'Chào mừng cậu gia nhập đội ngũ của chúng ta. Mời ngồi, không sao đâu, cứ từ từ làm quen.'
WHERE NOT EXISTS (SELECT 1 FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_2 AND `order_index` <=> 3);
SET @seed_sentence_patterns_19 = (SELECT id FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_2 AND `order_index` <=> 3);
INSERT INTO `sentence_patterns` (`audio_url`,`lesson_id`,`order_index`,`pinyin_text`,`chinese_text`,`vocabulary_id`,`vietnamese_meaning`)
SELECT 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784051196/MC1-1_iib2zz.mp3',@seed_lessons_3,1,'Nín hǎo! Wǒ jiào Wáng Míng.','您好！我叫王明。',NULL,'Xin chào! Tôi tên là Vương Minh.'
WHERE NOT EXISTS (SELECT 1 FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_3 AND `order_index` <=> 1);
SET @seed_sentence_patterns_5 = (SELECT id FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_3 AND `order_index` <=> 1);
INSERT INTO `sentence_patterns` (`audio_url`,`lesson_id`,`order_index`,`pinyin_text`,`chinese_text`,`vocabulary_id`,`vietnamese_meaning`)
SELECT 'https://res.cloudinary.com/rir6b8kp/video/upload/v1783860597/M%E1%BA%ABu_c%C3%A2u_3_cmaeg2.mp3',@seed_lessons_5,3,'Nín fùzé nǎge bùmén?','您负责哪个部门？',NULL,'Anh/chị phụ trách bộ phận nào?'
WHERE NOT EXISTS (SELECT 1 FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_5 AND `order_index` <=> 3);
SET @seed_sentence_patterns_3 = (SELECT id FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_5 AND `order_index` <=> 3);
INSERT INTO `sentence_patterns` (`audio_url`,`lesson_id`,`order_index`,`pinyin_text`,`chinese_text`,`vocabulary_id`,`vietnamese_meaning`)
SELECT NULL,@seed_lessons_39,2,'Zǒulù yào duōjiǔ?','走路要多久？',NULL,'Đi bộ mất bao lâu?'
WHERE NOT EXISTS (SELECT 1 FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_39 AND `order_index` <=> 2);
SET @seed_sentence_patterns_35 = (SELECT id FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_39 AND `order_index` <=> 2);
INSERT INTO `sentence_patterns` (`audio_url`,`lesson_id`,`order_index`,`pinyin_text`,`chinese_text`,`vocabulary_id`,`vietnamese_meaning`)
SELECT NULL,@seed_lessons_37,3,'Kěyǐ sǎomǎ ma?','可以扫码吗？',NULL,'Tôi có thể quét mã thanh toán không?'
WHERE NOT EXISTS (SELECT 1 FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_37 AND `order_index` <=> 3);
SET @seed_sentence_patterns_30 = (SELECT id FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_37 AND `order_index` <=> 3);
INSERT INTO `sentence_patterns` (`audio_url`,`lesson_id`,`order_index`,`pinyin_text`,`chinese_text`,`vocabulary_id`,`vietnamese_meaning`)
SELECT NULL,@seed_lessons_37,1,'Yígòng duōshao qián?','一共多少钱？',NULL,'Tổng cộng bao nhiêu tiền?'
WHERE NOT EXISTS (SELECT 1 FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_37 AND `order_index` <=> 1);
SET @seed_sentence_patterns_28 = (SELECT id FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_37 AND `order_index` <=> 1);
INSERT INTO `sentence_patterns` (`audio_url`,`lesson_id`,`order_index`,`pinyin_text`,`chinese_text`,`vocabulary_id`,`vietnamese_meaning`)
SELECT NULL,@seed_lessons_36,1,'Wǒ yào yì bēi kāfēi.','我要一杯咖啡。',NULL,'Tôi muốn một cốc cà phê.'
WHERE NOT EXISTS (SELECT 1 FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_36 AND `order_index` <=> 1);
SET @seed_sentence_patterns_25 = (SELECT id FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_36 AND `order_index` <=> 1);
INSERT INTO `sentence_patterns` (`audio_url`,`lesson_id`,`order_index`,`pinyin_text`,`chinese_text`,`vocabulary_id`,`vietnamese_meaning`)
SELECT NULL,@seed_lessons_38,2,'Dìtiězhàn zài qiánmiàn.','地铁站在前面。',NULL,'Ga tàu điện ngầm ở phía trước.'
WHERE NOT EXISTS (SELECT 1 FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_38 AND `order_index` <=> 2);
SET @seed_sentence_patterns_32 = (SELECT id FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_38 AND `order_index` <=> 2);
INSERT INTO `sentence_patterns` (`audio_url`,`lesson_id`,`order_index`,`pinyin_text`,`chinese_text`,`vocabulary_id`,`vietnamese_meaning`)
SELECT NULL,@seed_lessons_36,3,'Qǐng shǎo fàng táng.','请少放糖。',NULL,'Vui lòng cho ít đường.'
WHERE NOT EXISTS (SELECT 1 FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_36 AND `order_index` <=> 3);
SET @seed_sentence_patterns_27 = (SELECT id FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_36 AND `order_index` <=> 3);
INSERT INTO `sentence_patterns` (`audio_url`,`lesson_id`,`order_index`,`pinyin_text`,`chinese_text`,`vocabulary_id`,`vietnamese_meaning`)
SELECT NULL,@seed_lessons_36,2,'Yào rè de háishi bīng de?','要热的还是冰的？',NULL,'Bạn muốn loại nóng hay loại lạnh?'
WHERE NOT EXISTS (SELECT 1 FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_36 AND `order_index` <=> 2);
SET @seed_sentence_patterns_26 = (SELECT id FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_36 AND `order_index` <=> 2);
INSERT INTO `sentence_patterns` (`audio_url`,`lesson_id`,`order_index`,`pinyin_text`,`chinese_text`,`vocabulary_id`,`vietnamese_meaning`)
SELECT 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784051587/MC2-2_vbwuxy.mp3',@seed_lessons_4,3,'Wǒmen gōngsī zhuānmén tígōng ruǎnjiàn.','我们公司专门提供软件。',NULL,'Công ty chúng tôi chuyên cung cấp phần mềm.'
WHERE NOT EXISTS (SELECT 1 FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_4 AND `order_index` <=> 3);
SET @seed_sentence_patterns_11 = (SELECT id FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_4 AND `order_index` <=> 3);
INSERT INTO `sentence_patterns` (`audio_url`,`lesson_id`,`order_index`,`pinyin_text`,`chinese_text`,`vocabulary_id`,`vietnamese_meaning`)
SELECT NULL,@seed_lessons_39,1,'Yìzhí zǒu, dào lùkǒu wǎng yòu guǎi.','一直走，到路口往右拐。',NULL,'Đi thẳng, đến giao lộ thì rẽ phải.'
WHERE NOT EXISTS (SELECT 1 FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_39 AND `order_index` <=> 1);
SET @seed_sentence_patterns_34 = (SELECT id FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_39 AND `order_index` <=> 1);
INSERT INTO `sentence_patterns` (`audio_url`,`lesson_id`,`order_index`,`pinyin_text`,`chinese_text`,`vocabulary_id`,`vietnamese_meaning`)
SELECT 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784047738/MC2-2_uey1nc.mp3',@seed_lessons_35,4,'Gāng kāishǐ bù shúxī hěn zhèngcháng, bié zháojí, mànmàn lái.','刚开始不熟悉很正常，别着急，慢慢来。',NULL,'Mới đầu chưa quen là chuyện bình thường, đừng vội vàng, cứ từ từ làm.'
WHERE NOT EXISTS (SELECT 1 FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_35 AND `order_index` <=> 4);
SET @seed_sentence_patterns_24 = (SELECT id FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_35 AND `order_index` <=> 4);
INSERT INTO `sentence_patterns` (`audio_url`,`lesson_id`,`order_index`,`pinyin_text`,`chinese_text`,`vocabulary_id`,`vietnamese_meaning`)
SELECT 'https://res.cloudinary.com/rir6b8kp/video/upload/v1783860596/M%E1%BA%ABu_c%C3%A2u_2_yyupnr.mp3',@seed_lessons_5,2,'Nín zài gōngsī dānrèn shénme zhíwèi?','您在公司担任什么职位？',@seed_vocabularies_3,'Anh/chị đang giữ vị trí gì ở công ty?'
WHERE NOT EXISTS (SELECT 1 FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_5 AND `order_index` <=> 2);
SET @seed_sentence_patterns_2 = (SELECT id FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_5 AND `order_index` <=> 2);
INSERT INTO `sentence_patterns` (`audio_url`,`lesson_id`,`order_index`,`pinyin_text`,`chinese_text`,`vocabulary_id`,`vietnamese_meaning`)
SELECT NULL,@seed_lessons_37,2,'Dǎbāo, xièxie.','打包，谢谢。',NULL,'Cho tôi mang đi, cảm ơn.'
WHERE NOT EXISTS (SELECT 1 FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_37 AND `order_index` <=> 2);
SET @seed_sentence_patterns_29 = (SELECT id FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_37 AND `order_index` <=> 2);
INSERT INTO `sentence_patterns` (`audio_url`,`lesson_id`,`order_index`,`pinyin_text`,`chinese_text`,`vocabulary_id`,`vietnamese_meaning`)
SELECT 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784051197/MC2-2_vvy4no.mp3',@seed_lessons_3,4,'Tā zài gōngsī dānrèn xiāoshòu jīnglǐ, zhǔyào fùzé kèhù fúwù.','他在公司担任销售经理，主要负责客户服务。',NULL,'Anh ấy đảm nhiệm chức vụ quản lý kinh doanh tại công ty, chịu trách nhiệm chính về mảng chăm sóc khách hàng.'
WHERE NOT EXISTS (SELECT 1 FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_3 AND `order_index` <=> 4);
SET @seed_sentence_patterns_8 = (SELECT id FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_3 AND `order_index` <=> 4);
INSERT INTO `sentence_patterns` (`audio_url`,`lesson_id`,`order_index`,`pinyin_text`,`chinese_text`,`vocabulary_id`,`vietnamese_meaning`)
SELECT 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784047737/MC2-1_tdxnth.mp3',@seed_lessons_35,3,'Wǒmen gōngchǎng de gōngzuò jiézòu hěn kuài, gāng kāishǐ yǒudiǎn bù shúxī hěn zhèngcháng, bié zháojí.','我们 factory 的工作节奏很快，刚开始有点不熟悉很正常，别着急。',NULL,'Nhịp độ công việc ở xưởng mình khá nhanh, mới đầu chưa quen là chuyện bình thường thôi, cứ từ từ nhé (đừng vội).'
WHERE NOT EXISTS (SELECT 1 FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_35 AND `order_index` <=> 3);
SET @seed_sentence_patterns_23 = (SELECT id FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_35 AND `order_index` <=> 3);
INSERT INTO `sentence_patterns` (`audio_url`,`lesson_id`,`order_index`,`pinyin_text`,`chinese_text`,`vocabulary_id`,`vietnamese_meaning`)
SELECT NULL,@seed_lessons_38,1,'Qǐngwèn, dìtiězhàn zài nǎlǐ?','请问，地铁站在哪里？',NULL,'Xin hỏi, ga tàu điện ngầm ở đâu?'
WHERE NOT EXISTS (SELECT 1 FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_38 AND `order_index` <=> 1);
SET @seed_sentence_patterns_31 = (SELECT id FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_38 AND `order_index` <=> 1);
INSERT INTO `sentence_patterns` (`audio_url`,`lesson_id`,`order_index`,`pinyin_text`,`chinese_text`,`vocabulary_id`,`vietnamese_meaning`)
SELECT 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784051585/MC1-1_w5lr6c.mp3',@seed_lessons_4,1,'Wǒ láizì AB gōngsī.','我来自AB公司。',NULL,'Tôi đến từ Công ty AB.'
WHERE NOT EXISTS (SELECT 1 FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_4 AND `order_index` <=> 1);
SET @seed_sentence_patterns_9 = (SELECT id FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_4 AND `order_index` <=> 1);
INSERT INTO `sentence_patterns` (`audio_url`,`lesson_id`,`order_index`,`pinyin_text`,`chinese_text`,`vocabulary_id`,`vietnamese_meaning`)
SELECT 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784047057/MC2-2_ckgs9b.mp3',@seed_lessons_2,4,'Huānyíng jiārù wǒmen de tuánduì, xiànzài wǒ dài nǐ qù rènshi yíxià chējiān de tóngshì.','欢迎加入我们的团队，现在我带你去认识一下车间的同事。',NULL,'Chào mừng cậu gia nhập đội ngũ chúng ta, bây giờ tôi dẫn cậu đi làm quen đồng nghiệp trong phân xưởng.'
WHERE NOT EXISTS (SELECT 1 FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_2 AND `order_index` <=> 4);
SET @seed_sentence_patterns_20 = (SELECT id FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_2 AND `order_index` <=> 4);
INSERT INTO `sentence_patterns` (`audio_url`,`lesson_id`,`order_index`,`pinyin_text`,`chinese_text`,`vocabulary_id`,`vietnamese_meaning`)
SELECT 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784046978/MC2-2_hnbhbd.mp3',@seed_lessons_1,4,'Rènshi nín, wǒ yě hěn gāoxìng.','认识您，我也很高兴。',NULL,'Được làm quen với bạn, tôi cũng rất vui.'
WHERE NOT EXISTS (SELECT 1 FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_1 AND `order_index` <=> 4);
SET @seed_sentence_patterns_16 = (SELECT id FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_1 AND `order_index` <=> 4);
INSERT INTO `sentence_patterns` (`audio_url`,`lesson_id`,`order_index`,`pinyin_text`,`chinese_text`,`vocabulary_id`,`vietnamese_meaning`)
SELECT 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784047735/MC1-2_gsi0qy.mp3',@seed_lessons_35,2,'Yǐhòu hái yào duōduō máfan dàjiā, xièxie dàjiā.','以后还要多多麻烦大家，谢谢大家。',NULL,'Sau này còn phải làm phiền mọi người nhiều, xin cảm ơn mọi người.'
WHERE NOT EXISTS (SELECT 1 FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_35 AND `order_index` <=> 2);
SET @seed_sentence_patterns_22 = (SELECT id FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_35 AND `order_index` <=> 2);
INSERT INTO `sentence_patterns` (`audio_url`,`lesson_id`,`order_index`,`pinyin_text`,`chinese_text`,`vocabulary_id`,`vietnamese_meaning`)
SELECT 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784051196/MC2-1_vtop2a.mp3',@seed_lessons_3,3,'Wǒ shì xiāoshòu jīnglǐ, fùzé kèhù fúwù.','我是销售经理，负责客户服务。',NULL,'Tôi là quản lý kinh doanh, phụ trách chăm sóc khách hàng.'
WHERE NOT EXISTS (SELECT 1 FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_3 AND `order_index` <=> 3);
SET @seed_sentence_patterns_7 = (SELECT id FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_3 AND `order_index` <=> 3);
INSERT INTO `sentence_patterns` (`audio_url`,`lesson_id`,`order_index`,`pinyin_text`,`chinese_text`,`vocabulary_id`,`vietnamese_meaning`)
SELECT 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784047734/MC1-1_g4zyys.mp3',@seed_lessons_35,1,'Xīwàng yǐhòu dàjiā néng duōduō zhǐdǎo wǒ. Rúguǒ yǒu shénme bù dǒng de, jiù máfan dàjiā le.','希望以后大家能多多指导我。如果有什么不懂的，就麻烦大家了。',NULL,'Sau này mong được mọi người chỉ bảo thêm. Nếu tôi có chỗ nào chưa biết, phải làm phiền mọi người rồi.'
WHERE NOT EXISTS (SELECT 1 FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_35 AND `order_index` <=> 1);
SET @seed_sentence_patterns_21 = (SELECT id FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_35 AND `order_index` <=> 1);
INSERT INTO `sentence_patterns` (`audio_url`,`lesson_id`,`order_index`,`pinyin_text`,`chinese_text`,`vocabulary_id`,`vietnamese_meaning`)
SELECT 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784046978/MC2-1_z2aiwy.mp3',@seed_lessons_1,3,'Wǒ yě hěn gāoxìng jiàndào nǐ.','我也很高兴见到你。',NULL,'Tôi cũng rất vui được gặp bạn.'
WHERE NOT EXISTS (SELECT 1 FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_1 AND `order_index` <=> 3);
SET @seed_sentence_patterns_15 = (SELECT id FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_1 AND `order_index` <=> 3);
INSERT INTO `sentence_patterns` (`audio_url`,`lesson_id`,`order_index`,`pinyin_text`,`chinese_text`,`vocabulary_id`,`vietnamese_meaning`)
SELECT 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784047055/MC1-1_y0szwc.mp3',@seed_lessons_2,1,'Jīnglǐ, nín hǎo! Wǒ shì jīntiān lái bàodào de xīn yuángōng.','经理，您好！我是今天来报到的新员工。',NULL,'Chào Trưởng phòng ạ! Tôi là nhân viên mới đến nhận việc hôm nay.'
WHERE NOT EXISTS (SELECT 1 FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_2 AND `order_index` <=> 1);
SET @seed_sentence_patterns_17 = (SELECT id FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_2 AND `order_index` <=> 1);
INSERT INTO `sentence_patterns` (`audio_url`,`lesson_id`,`order_index`,`pinyin_text`,`chinese_text`,`vocabulary_id`,`vietnamese_meaning`)
SELECT 'https://res.cloudinary.com/rir6b8kp/video/upload/v1783860596/M%E1%BA%ABu_c%C3%A2u_1_ijulk0.mp3',@seed_lessons_5,1,'Nín jiào shénme míngzi?','您叫什么名字？',@seed_vocabularies_1,'Anh/chị tên là gì?'
WHERE NOT EXISTS (SELECT 1 FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_5 AND `order_index` <=> 1);
SET @seed_sentence_patterns_1 = (SELECT id FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_5 AND `order_index` <=> 1);
INSERT INTO `sentence_patterns` (`audio_url`,`lesson_id`,`order_index`,`pinyin_text`,`chinese_text`,`vocabulary_id`,`vietnamese_meaning`)
SELECT 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784046978/MC1-2_a7fh7v.mp3',@seed_lessons_1,2,'Nín hǎo, wǒ jiào Míng. Jīntiān shì wǒ dì yī tiān lái shàngbān, qǐng duō guānzhào.','您好，我叫明。今天是我第一天来上班，请多关照。',NULL,'Xin chào ạ, tôi tên là Minh. Hôm nay là ngày đầu tiên tôi đi làm, mong được giúp đỡ.'
WHERE NOT EXISTS (SELECT 1 FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_1 AND `order_index` <=> 2);
SET @seed_sentence_patterns_14 = (SELECT id FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_1 AND `order_index` <=> 2);
INSERT INTO `sentence_patterns` (`audio_url`,`lesson_id`,`order_index`,`pinyin_text`,`chinese_text`,`vocabulary_id`,`vietnamese_meaning`)
SELECT 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784051196/MC1-2_xprizj.mp3',@seed_lessons_3,2,'Nín hǎo! Wǒ jiào Wáng Míng, shì fùzé zhè cì xiàngmù de xīn yuángōng.','您好！我叫王明，是负责这次项目的新员工。',NULL,'Xin chào! Tôi tên là Vương Minh, là nhân viên mới đảm nhiệm dự án lần này.'
WHERE NOT EXISTS (SELECT 1 FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_3 AND `order_index` <=> 2);
SET @seed_sentence_patterns_6 = (SELECT id FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_3 AND `order_index` <=> 2);
INSERT INTO `sentence_patterns` (`audio_url`,`lesson_id`,`order_index`,`pinyin_text`,`chinese_text`,`vocabulary_id`,`vietnamese_meaning`)
SELECT NULL,@seed_lessons_38,3,'Qǐngwèn, xǐshǒujiān zài nǎlǐ?','请问，洗手间在哪里？',NULL,'Xin hỏi, nhà vệ sinh ở đâu?'
WHERE NOT EXISTS (SELECT 1 FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_38 AND `order_index` <=> 3);
SET @seed_sentence_patterns_33 = (SELECT id FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_38 AND `order_index` <=> 3);
INSERT INTO `sentence_patterns` (`audio_url`,`lesson_id`,`order_index`,`pinyin_text`,`chinese_text`,`vocabulary_id`,`vietnamese_meaning`)
SELECT 'https://res.cloudinary.com/rir6b8kp/video/upload/v1784047055/MC1-2_bkbsy9.mp3',@seed_lessons_2,2,'Zhǔguǎn, nín hǎo! Wǒ shì jīntiān lái bàodào de xīn yuángōng, zhè shì wǒ dì yī cì zài gōngchǎng gōngzuò.','主管，您好！我是今天来报到的新员工，这是 me_c1l2_id_2第一次在工厂工作。',NULL,'Chào Trưởng bộ phận, tôi là nhân viên mới đến ngày hôm nay, đây là lần đầu tôi công tác xưởng.'
WHERE NOT EXISTS (SELECT 1 FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_2 AND `order_index` <=> 2);
SET @seed_sentence_patterns_18 = (SELECT id FROM `sentence_patterns` WHERE `lesson_id` <=> @seed_lessons_2 AND `order_index` <=> 2);

-- lesson_documents

-- quizzes
INSERT INTO `quizzes` (`title`,`course_id`,`lesson_id`,`chapter_id`,`pass_score`,`teacher_id`,`order_index`,`time_limit_minutes`)
SELECT 'Trắc nghiệm Chapter 2 Lesson 1',NULL,@seed_lessons_3,NULL,50,@seed_teacher,1,15
WHERE NOT EXISTS (SELECT 1 FROM `quizzes` WHERE `course_id` <=> NULL AND `chapter_id` <=> NULL AND `lesson_id` <=> @seed_lessons_3 AND `title` <=> 'Trắc nghiệm Chapter 2 Lesson 1' AND `order_index` <=> 1);
SET @seed_quizzes_2 = (SELECT id FROM `quizzes` WHERE `course_id` <=> NULL AND `chapter_id` <=> NULL AND `lesson_id` <=> @seed_lessons_3 AND `title` <=> 'Trắc nghiệm Chapter 2 Lesson 1' AND `order_index` <=> 1);
INSERT INTO `quizzes` (`title`,`course_id`,`lesson_id`,`chapter_id`,`pass_score`,`teacher_id`,`order_index`,`time_limit_minutes`)
SELECT 'Bài trắc nghiệm Lesson 1: Hỏi thông tin cá nhân',NULL,@seed_lessons_5,@seed_chapters_3,50,@seed_teacher,1,10
WHERE NOT EXISTS (SELECT 1 FROM `quizzes` WHERE `course_id` <=> NULL AND `chapter_id` <=> @seed_chapters_3 AND `lesson_id` <=> @seed_lessons_5 AND `title` <=> 'Bài trắc nghiệm Lesson 1: Hỏi thông tin cá nhân' AND `order_index` <=> 1);
SET @seed_quizzes_1 = (SELECT id FROM `quizzes` WHERE `course_id` <=> NULL AND `chapter_id` <=> @seed_chapters_3 AND `lesson_id` <=> @seed_lessons_5 AND `title` <=> 'Bài trắc nghiệm Lesson 1: Hỏi thông tin cá nhân' AND `order_index` <=> 1);
INSERT INTO `quizzes` (`title`,`course_id`,`lesson_id`,`chapter_id`,`pass_score`,`teacher_id`,`order_index`,`time_limit_minutes`)
SELECT 'Ôn tập: Hiểu chỉ dẫn và hỏi thời gian đi bộ',@seed_courses_directions,@seed_lessons_39,NULL,60,@seed_teacher,2,5
WHERE NOT EXISTS (SELECT 1 FROM `quizzes` WHERE `course_id` <=> @seed_courses_directions AND `chapter_id` <=> NULL AND `lesson_id` <=> @seed_lessons_39 AND `title` <=> 'Ôn tập: Hiểu chỉ dẫn và hỏi thời gian đi bộ' AND `order_index` <=> 2);
SET @seed_quizzes_10 = (SELECT id FROM `quizzes` WHERE `course_id` <=> @seed_courses_directions AND `chapter_id` <=> NULL AND `lesson_id` <=> @seed_lessons_39 AND `title` <=> 'Ôn tập: Hiểu chỉ dẫn và hỏi thời gian đi bộ' AND `order_index` <=> 2);
INSERT INTO `quizzes` (`title`,`course_id`,`lesson_id`,`chapter_id`,`pass_score`,`teacher_id`,`order_index`,`time_limit_minutes`)
SELECT 'Ôn tập: Hỏi giá và mang đi',@seed_courses_cafe,@seed_lessons_37,NULL,60,@seed_teacher,2,5
WHERE NOT EXISTS (SELECT 1 FROM `quizzes` WHERE `course_id` <=> @seed_courses_cafe AND `chapter_id` <=> NULL AND `lesson_id` <=> @seed_lessons_37 AND `title` <=> 'Ôn tập: Hỏi giá và mang đi' AND `order_index` <=> 2);
SET @seed_quizzes_8 = (SELECT id FROM `quizzes` WHERE `course_id` <=> @seed_courses_cafe AND `chapter_id` <=> NULL AND `lesson_id` <=> @seed_lessons_37 AND `title` <=> 'Ôn tập: Hỏi giá và mang đi' AND `order_index` <=> 2);
INSERT INTO `quizzes` (`title`,`course_id`,`lesson_id`,`chapter_id`,`pass_score`,`teacher_id`,`order_index`,`time_limit_minutes`)
SELECT 'Ôn tập: Hỏi địa điểm một cách lịch sự',@seed_courses_directions,@seed_lessons_38,NULL,60,@seed_teacher,1,5
WHERE NOT EXISTS (SELECT 1 FROM `quizzes` WHERE `course_id` <=> @seed_courses_directions AND `chapter_id` <=> NULL AND `lesson_id` <=> @seed_lessons_38 AND `title` <=> 'Ôn tập: Hỏi địa điểm một cách lịch sự' AND `order_index` <=> 1);
SET @seed_quizzes_9 = (SELECT id FROM `quizzes` WHERE `course_id` <=> @seed_courses_directions AND `chapter_id` <=> NULL AND `lesson_id` <=> @seed_lessons_38 AND `title` <=> 'Ôn tập: Hỏi địa điểm một cách lịch sự' AND `order_index` <=> 1);
INSERT INTO `quizzes` (`title`,`course_id`,`lesson_id`,`chapter_id`,`pass_score`,`teacher_id`,`order_index`,`time_limit_minutes`)
SELECT 'Trắc nghiệm Chapter 1 Lesson 2',NULL,@seed_lessons_2,NULL,50,@seed_teacher,1,15
WHERE NOT EXISTS (SELECT 1 FROM `quizzes` WHERE `course_id` <=> NULL AND `chapter_id` <=> NULL AND `lesson_id` <=> @seed_lessons_2 AND `title` <=> 'Trắc nghiệm Chapter 1 Lesson 2' AND `order_index` <=> 1);
SET @seed_quizzes_5 = (SELECT id FROM `quizzes` WHERE `course_id` <=> NULL AND `chapter_id` <=> NULL AND `lesson_id` <=> @seed_lessons_2 AND `title` <=> 'Trắc nghiệm Chapter 1 Lesson 2' AND `order_index` <=> 1);
INSERT INTO `quizzes` (`title`,`course_id`,`lesson_id`,`chapter_id`,`pass_score`,`teacher_id`,`order_index`,`time_limit_minutes`)
SELECT 'Ôn tập: Gọi món và chọn đồ uống',@seed_courses_cafe,@seed_lessons_36,NULL,60,@seed_teacher,1,5
WHERE NOT EXISTS (SELECT 1 FROM `quizzes` WHERE `course_id` <=> @seed_courses_cafe AND `chapter_id` <=> NULL AND `lesson_id` <=> @seed_lessons_36 AND `title` <=> 'Ôn tập: Gọi món và chọn đồ uống' AND `order_index` <=> 1);
SET @seed_quizzes_7 = (SELECT id FROM `quizzes` WHERE `course_id` <=> @seed_courses_cafe AND `chapter_id` <=> NULL AND `lesson_id` <=> @seed_lessons_36 AND `title` <=> 'Ôn tập: Gọi món và chọn đồ uống' AND `order_index` <=> 1);
INSERT INTO `quizzes` (`title`,`course_id`,`lesson_id`,`chapter_id`,`pass_score`,`teacher_id`,`order_index`,`time_limit_minutes`)
SELECT 'Trắc nghiệm Chapter 2 Lesson 2',NULL,@seed_lessons_4,NULL,50,@seed_teacher,1,15
WHERE NOT EXISTS (SELECT 1 FROM `quizzes` WHERE `course_id` <=> NULL AND `chapter_id` <=> NULL AND `lesson_id` <=> @seed_lessons_4 AND `title` <=> 'Trắc nghiệm Chapter 2 Lesson 2' AND `order_index` <=> 1);
SET @seed_quizzes_3 = (SELECT id FROM `quizzes` WHERE `course_id` <=> NULL AND `chapter_id` <=> NULL AND `lesson_id` <=> @seed_lessons_4 AND `title` <=> 'Trắc nghiệm Chapter 2 Lesson 2' AND `order_index` <=> 1);
INSERT INTO `quizzes` (`title`,`course_id`,`lesson_id`,`chapter_id`,`pass_score`,`teacher_id`,`order_index`,`time_limit_minutes`)
SELECT 'Trắc nghiệm Chapter 1 Lesson 3',NULL,@seed_lessons_35,NULL,50,@seed_teacher,1,15
WHERE NOT EXISTS (SELECT 1 FROM `quizzes` WHERE `course_id` <=> NULL AND `chapter_id` <=> NULL AND `lesson_id` <=> @seed_lessons_35 AND `title` <=> 'Trắc nghiệm Chapter 1 Lesson 3' AND `order_index` <=> 1);
SET @seed_quizzes_6 = (SELECT id FROM `quizzes` WHERE `course_id` <=> NULL AND `chapter_id` <=> NULL AND `lesson_id` <=> @seed_lessons_35 AND `title` <=> 'Trắc nghiệm Chapter 1 Lesson 3' AND `order_index` <=> 1);
INSERT INTO `quizzes` (`title`,`course_id`,`lesson_id`,`chapter_id`,`pass_score`,`teacher_id`,`order_index`,`time_limit_minutes`)
SELECT 'Trắc nghiệm Chapter 1 Lesson 1',NULL,@seed_lessons_1,NULL,50,@seed_teacher,1,15
WHERE NOT EXISTS (SELECT 1 FROM `quizzes` WHERE `course_id` <=> NULL AND `chapter_id` <=> NULL AND `lesson_id` <=> @seed_lessons_1 AND `title` <=> 'Trắc nghiệm Chapter 1 Lesson 1' AND `order_index` <=> 1);
SET @seed_quizzes_4 = (SELECT id FROM `quizzes` WHERE `course_id` <=> NULL AND `chapter_id` <=> NULL AND `lesson_id` <=> @seed_lessons_1 AND `title` <=> 'Trắc nghiệm Chapter 1 Lesson 1' AND `order_index` <=> 1);

-- questions
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Đối tác giao tiếp là người đại diện pháp luật cao nhất của công ty (Tổng giám đốc). Chọn từ thích hợp để hoàn thiện câu xã giao: "请问，我可以直接称呼您为张_____吗？"',@seed_quizzes_1,NULL,NULL,'"总经理" (Tổng giám đốc) là danh xưng phù hợp nhất để xưng hô với người đứng đầu điều hành doanh nghiệp, thể hiện sự kính trọng đúng mực trong lễ nghi thương mại.',5,'MULTIPLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_1 AND `order_index` <=> 5);
SET @seed_questions_5 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_1 AND `order_index` <=> 5);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'________您。',@seed_quizzes_4,'https://res.cloudinary.com/rir6b8kp/video/upload/v1784041484/ph%C3%A2n_%C4%91o%E1%BA%A1n_4_tr03a6.mp3',NULL,'Cụm 很高兴见到您 là cách chào hỏi lịch sự, có nghĩa là “Rất vui được gặp bạn/ngài”. Đây là mẫu câu giao tiếp phổ biến trong môi trường công sở và khi gặp đối tác hoặc người lớn tuổi. Các đáp án còn lại không tạo thành câu hoàn chỉnh hoặc không phù hợp với ngữ cảnh.',4,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_4 AND `order_index` <=> 4);
SET @seed_questions_45 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_4 AND `order_index` <=> 4);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'我________AB公司。',@seed_quizzes_3,'https://res.cloudinary.com/rir6b8kp/video/upload/v1784051655/ph%C3%A2n_%C4%91o%E1%BA%A1n_1_o7xuw1.mp3',NULL,'“来自” có nghĩa là “đến từ”. Cấu trúc 我来自 + tên công ty/địa điểm được dùng để giới thiệu nơi mình đến từ hoặc đơn vị mình thuộc về. Câu hoàn chỉnh là 我来自AB公司。, nghĩa là “Tôi đến từ Công ty AB.”',1,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_3 AND `order_index` <=> 1);
SET @seed_questions_27 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_3 AND `order_index` <=> 1);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'很高兴________nhi/tỉ/tù (chữ dịch/pinyin: 你)。',@seed_quizzes_2,'https://res.cloudinary.com/rir6b8kp/video/upload/v1784051270/ph%C3%A2n_%C4%91o%E1%BA%A1n_3_l1rdcf.mp3',NULL,'Cụm bổ ngữ liên kết ''很高兴见到你'' (Rất vui được gặp bạn) là khẩu ngữ xã giao bắt buộc để mở đầu mối quan hệ hợp tác.',3,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_2 AND `order_index` <=> 3);
SET @seed_questions_19 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_2 AND `order_index` <=> 3);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Nghe đoạn âm thanh sau và chọn nghĩa tiếng Việt đúng của câu: "请问您在贵公司...?"',@seed_quizzes_1,'https://res.cloudinary.com/rir6b8kp/video/upload/v1783834137/C%C3%A2u_h%E1%BB%8Fi_luy%E1%BB%87n_nghe_1_su1rpv.mp3',NULL,'Ý nghĩa hoàn chỉnh: Xin hỏi ngài chủ yếu phụ trách mảng nghiệp vụ nào tại quý công ty?',1,'LISTENING_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_1 AND `order_index` <=> 1);
SET @seed_questions_1 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_1 AND `order_index` <=> 1);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Xác định nghĩa tiếng Việt chuẩn xác của tính từ “正常” trong câu thoại của đồng nghiệp cũ động viên người mới:',@seed_quizzes_6,NULL,NULL,'“正常” (zhèngcháng) nghĩa là bình thường, điều tất yếu (Ví dụ: 不熟悉很正常 - mới đầu chưa quen là chuyện hết sức bình thường).',14,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_6 AND `order_index` <=> 14);
SET @seed_questions_86 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_6 AND `order_index` <=> 14);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Bạn muốn mang đồ uống đi. Bạn nói thế nào?',@seed_quizzes_8,NULL,NULL,'打包 dùng khi muốn gói lại hoặc mang đi.',2,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_8 AND `order_index` <=> 2);
SET @seed_questions_92 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_8 AND `order_index` <=> 2);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Chọn phó từ thích hợp thể hiện tính chuyên môn hóa, tập trung sâu vào một mảng sản phẩm/giải pháp của công ty:\n“Chúng tôi công ty_______vì xí nghiệp cung cấp phần mềm giải quyết phương án。”',@seed_quizzes_3,NULL,NULL,'Phó từ ''专门'' mang nghĩa là ''chuyên/chuyên môn về'', đứng trước động từ để nhấn mạnh năng lực cốt lõi của doanh nghiệp.',8,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_3 AND `order_index` <=> 8);
SET @seed_questions_34 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_3 AND `order_index` <=> 8);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Xác định nghĩa tiếng Việt chuẩn xác nhất của tổ hợp danh từ “安全规章” dùng trong nhà xưởng sản xuất:',@seed_quizzes_5,NULL,NULL,'“安全规章” (ānquán guīzhāng) kết hợp từ ''安全'' (an toàn) và ''规章'' (quy chương/quy định), là thuật ngữ bắt buộc công nhân phải học thuộc để bảo vệ an toàn lao động.',14,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_5 AND `order_index` <=> 14);
SET @seed_questions_71 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_5 AND `order_index` <=> 14);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Tìm nghĩa tiếng Việt chuẩn xác nhất của cụm từ “工作节奏” thường dùng để mô tả đặc thù công việc tại các nhà máy, xưởng sản xuất:',@seed_quizzes_6,NULL,NULL,'“工作节奏” ghép từ ''工作'' (công việc) và ''节奏'' (nhịp điệu/nhịp độ), dùng để chỉ tốc độ và áp lực tiến độ hoàn thành các công đoạn sản xuất.',11,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_6 AND `order_index` <=> 11);
SET @seed_questions_83 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_6 AND `order_index` <=> 11);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Điền động từ thương mại mang nghĩa cung ứng giải pháp/dịch vụ cho các khách hàng doanh nghiệp:\n“Chúng tôi công ty chuyên môn vì xí nghiệp_______phần mềm giải quyết phương án。”',@seed_quizzes_3,NULL,NULL,'Động từ ''提供'' nghĩa là ''cung cấp'', đi kèm với đối tượng nhận (企业) và sản phẩm bàn giao (解决方案).',9,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_3 AND `order_index` <=> 9);
SET @seed_questions_35 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_3 AND `order_index` <=> 9);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Lựa chọn động từ thích hợp để hoàn thiện câu chào mừng của quản lý khi chính thức nhận một thành viên mới vào đội ngũ:\n“欢迎你_______ ABC公司, hy vọng tương lai chúng ta cùng nhau cố gắng.”',@seed_quizzes_4,NULL,NULL,'Động từ "加入" (gia nhập/tham gia) kết hợp với danh từ chỉ tổ chức như "公司" (công ty) thể hiện hành động một cá nhân chính thức trở thành một phần của tập thể.',8,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_4 AND `order_index` <=> 8);
SET @seed_questions_49 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_4 AND `order_index` <=> 8);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Cho hai từ 经理 (jīnglǐ) và 主管 (zhǔguǎn). Nhận định nào dưới đây phản ánh đúng sự khác biệt về vai trò quản lý của hai vị trí này?',@seed_quizzes_1,NULL,NULL,'Trong cơ cấu doanh nghiệp Á Đông, "经理" biểu thị cấp quản lý bộ phận có quyền tự chủ lớn hơn so với "主管" - vị trí giám sát trực tiếp các đầu mục công việc nhỏ.',15,'MULTIPLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_1 AND `order_index` <=> 15);
SET @seed_questions_15 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_1 AND `order_index` <=> 15);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Xác định nghĩa tiếng Việt và phiên âm của từ “欢迎”:',@seed_quizzes_4,NULL,NULL,'“欢迎” (huānyíng) là động từ thể hiện thái độ vui vẻ, nhiệt tình đón nhận sự xuất hiện của một ai đó hoặc một điều gì đó.',15,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_4 AND `order_index` <=> 15);
SET @seed_questions_56 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_4 AND `order_index` <=> 15);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Câu nào hỏi có thể quét mã thanh toán không?',@seed_quizzes_8,NULL,NULL,'可以…吗？ hỏi có thể làm một việc hay không; 扫码 là quét mã.',3,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_8 AND `order_index` <=> 3);
SET @seed_questions_93 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_8 AND `order_index` <=> 3);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Xác định ý nghĩa tiếng Việt chuẩn xác của động từ “活动” trong câu hỏi thương mại “贵公司 zài cái gì 领域活动？”:',@seed_quizzes_3,NULL,NULL,'“活动” (huódòng) nghĩa là hoạt động. Trong ngữ cảnh công sở, nó chỉ các hành vi vận hành kinh doanh, sản xuất của một tổ chức.',14,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_3 AND `order_index` <=> 14);
SET @seed_questions_40 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_3 AND `order_index` <=> 14);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Cho chữ Hán “高兴”, hãy xác định phiên âm và nghĩa tiếng Việt đúng của từ này:',@seed_quizzes_4,NULL,NULL,'“高兴” phát âm là gāoxìng (thanh 1 và thanh 4), dùng làm tính từ chỉ trạng thái tâm lý phấn chấn, vui mừng của con người.',13,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_4 AND `order_index` <=> 13);
SET @seed_questions_54 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_4 AND `order_index` <=> 13);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'我 hôm nay ________来上班，很高兴认识大家！',@seed_quizzes_6,'https://res.cloudinary.com/rir6b8kp/video/upload/v1784047619/ph%C3%A2n_%C4%91o%E1%BA%A1n_3_n3na3a.mp3',NULL,'“刚” có nghĩa là “vừa mới”. Cấu trúc 刚来上班 nghĩa là “vừa mới đi làm”. Câu hoàn chỉnh 我 hôm nay 刚来上班，很高兴认识大家！ có nghĩa là “Hôm nay tôi vừa mới đi làm, rất vui được làm quen với mọi người!”',3,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_6 AND `order_index` <=> 3);
SET @seed_questions_75 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_6 AND `order_index` <=> 3);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Chọn động từ thích hợp để điền vào lời giới thiệu xuất xứ doanh nghiệp của nhân viên kinh doanh với đối tác:\n“我_______AB公司。”',@seed_quizzes_3,NULL,NULL,'Động từ ''来自'' mang nghĩa là ''đến từ'', dùng để giới thiệu nguồn gốc công ty nơi mình đang công tác một cách lịch sự.',6,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_3 AND `order_index` <=> 6);
SET @seed_questions_32 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_3 AND `order_index` <=> 6);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Tìm từ viết bằng chữ Hán chuẩn xác ứng với ý nghĩa “Doanh nghiệp” thường dùng trong các hợp đồng hoặc văn bản thương mại:',@seed_quizzes_3,NULL,NULL,'Chữ Hán ''企业'' (phiên âm: qǐyè) mang nghĩa là doanh nghiệp, xí nghiệp, phân biệt với ''公司'' (gōngsī) là công ty.',12,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_3 AND `order_index` <=> 12);
SET @seed_questions_38 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_3 AND `order_index` <=> 12);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Chọn cụm từ thích hợp để điền vào lời chào lịch sự của nhân viên mới khi giới thiệu bản thân trước tập thể bộ phận:\n“_______！我 hôm nay 刚来上班，很高兴认识大家！”',@seed_quizzes_6,NULL,NULL,'Cụm từ ''大家好'' (chào mọi người) là lời chào mở đầu phổ biến, lịch sự nhất khi đứng trước một tập thể đông người để giới thiệu bản thân.',6,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_6 AND `order_index` <=> 6);
SET @seed_questions_78 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_6 AND `order_index` <=> 6);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Tìm từ viết bằng chữ Hán chuẩn xác ứng với phiên âm “shàngbān” mang nghĩa là đi làm, vào ca làm việc:',@seed_quizzes_6,NULL,NULL,'Chữ Hán ''上班'' có phiên âm chuẩn là ''shàngbān'', là động từ ly hợp dùng để chỉ hành động đến cơ quan, nhà máy thực hiện ca làm việc.',15,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_6 AND `order_index` <=> 15);
SET @seed_questions_87 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_6 AND `order_index` <=> 15);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Từ chỉ chức danh quản lý cao nhất doanh nghiệp 总经理 có phiên âm Pinyin chính xác là gì?',@seed_quizzes_1,NULL,NULL,'Phiên âm chuẩn theo hệ thống Bính âm quốc tế của chữ "总经理" là zǒng jīng lǐ.',12,'MULTIPLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_1 AND `order_index` <=> 12);
SET @seed_questions_12 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_1 AND `order_index` <=> 12);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Cho chữ Hán “旁边”, hãy xác định ý nghĩa và vị trí không gian không gian tương ứng của từ này:',@seed_quizzes_6,NULL,NULL,'“旁边” phát âm là ''pángbiān'' là danh từ chỉ phương vị mang nghĩa là bên cạnh, kế bên (Ví dụ: 坐在你旁边 - ngồi ngay cạnh bạn).',13,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_6 AND `order_index` <=> 13);
SET @seed_questions_85 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_6 AND `order_index` <=> 13);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Xác định phiên âm Pinyin chính xác của từ “请坐” (Mời ngồi):',@seed_quizzes_5,NULL,NULL,'“请坐” có phiên âm chuẩn xác là ''qǐng zuò'' (thanh 3 và thanh 4), là câu khẩu lệnh lịch sự dùng để mời khách hoặc nhân viên ngồi xuống trao đổi.',12,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_5 AND `order_index` <=> 12);
SET @seed_questions_69 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_5 AND `order_index` <=> 12);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Động từ thương mại “提供” có nghĩa tiếng Việt chuẩn xác là gì?',@seed_quizzes_2,NULL,NULL,'“提供” (tígōng) nghĩa là ''cung cấp/bàn giao'', ví dụ cung cấp giải pháp dịch vụ hoặc cung ứng hàng hóa cho đối tác.',8,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_2 AND `order_index` <=> 8);
SET @seed_questions_24 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_2 AND `order_index` <=> 8);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'地铁站在前面。 cho biết ga tàu điện ở đâu?',@seed_quizzes_9,NULL,NULL,'前面 có nghĩa là phía trước.',2,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_9 AND `order_index` <=> 2);
SET @seed_questions_95 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_9 AND `order_index` <=> 2);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'我________客户咨询和支持。',@seed_quizzes_2,'https://res.cloudinary.com/rir6b8kp/video/upload/v1784051271/ph%C3%A2n_%C4%91o%E1%BA%A1n_4_nswbxz.mp3',NULL,'Động từ ''负责'' (phụ trách/chịu trách nhiệm về) đi liền trước danh từ chỉ mảng công việc để giới thiệu nghĩa vụ chuyên môn của mình.',4,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_2 AND `order_index` <=> 4);
SET @seed_questions_20 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_2 AND `order_index` <=> 4);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Câu nào hỏi vị trí nhà vệ sinh?',@seed_quizzes_9,NULL,NULL,'洗手间 là nhà vệ sinh; 在哪里 hỏi ở đâu.',3,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_9 AND `order_index` <=> 3);
SET @seed_questions_96 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_9 AND `order_index` <=> 3);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Tìm nghĩa tiếng Việt chuẩn xác nhất của danh từ chỉ chức vụ “销售经理” trong phòng kinh doanh doanh nghiệp:',@seed_quizzes_2,NULL,NULL,'“销售经理” (xiāoshòu jīnglǐ) chỉ người chịu trách nhiệm quản lý đội ngũ kinh doanh và chỉ tiêu doanh số tại một bộ phận.',10,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_2 AND `order_index` <=> 10);
SET @seed_questions_26 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_2 AND `order_index` <=> 10);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Hoàn thành câu thoại của nhân viên mới khi giới thiệu bản thân trước người quản lý phòng ban lần đầu gặp mặt:\n“您好，部门主管！我是今天_______的员工。”',@seed_quizzes_5,NULL,NULL,'Cụm định ngữ ''新来'' (mới đến) bổ nghĩa cho danh từ ''员工'' (nhân viên) chỉ rõ danh tính, vị trí của nhân sự vừa mới bước chân vào tổ chức cơ quan.',10,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_5 AND `order_index` <=> 10);
SET @seed_questions_67 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_5 AND `order_index` <=> 10);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'________！我们 factory 的工作节奏很快。',@seed_quizzes_6,'https://res.cloudinary.com/rir6b8kp/video/upload/v1784047618/ph%C3%A2n_%C4%91o%E1%BA%A1n_2_h16myb.mp3',NULL,'“没问题” có nghĩa là “Không vấn đề gì”, “Được thôi”, hoặc “Không sao”. Đây là cách trả lời rất phổ biến để thể hiện sự đồng ý hoặc trấn an người khác. Câu hoàn chỉnh 没问题！我们 factory 的工作节奏很快。 mở đầu bằng lời khẳng định trước khi giới thiệu về môi trường làm việc.',2,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_6 AND `order_index` <=> 2);
SET @seed_questions_74 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_6 AND `order_index` <=> 2);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'________！________来到ABC公司。',@seed_quizzes_4,'https://res.cloudinary.com/rir6b8kp/video/upload/v1784041474/ph%C3%A2n_%C4%91o%E1%BA%A1n_1_hpghnx.mp3',NULL,'“您好” là cách chào lịch sự trong tiếng Trung, còn “欢迎” có nghĩa là “chào mừng”. Câu hoàn chỉnh 您好！欢迎来到ABC公司。 có nghĩa là “Xin chào! Chào mừng bạn đến với Công ty ABC.” Đây là lời chào đón phổ biến dành cho nhân viên hoặc khách mới.',1,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_4 AND `order_index` <=> 1);
SET @seed_questions_42 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_4 AND `order_index` <=> 1);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'如果有什么________，尽管问我。',@seed_quizzes_5,'https://res.cloudinary.com/rir6b8kp/video/upload/v1784042789/Ph%C3%A2n_%C4%91o%E1%BA%A1n_2_ptoiou.mp3',NULL,'“困难” có nghĩa là “khó khăn”. Cấu trúc Nếu có khó khăn gì thì cứ hỏi tôi. có nghĩa là “Nếu có khó khăn gì thì cứ hỏi tôi.”',2,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_5 AND `order_index` <=> 2);
SET @seed_questions_59 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_5 AND `order_index` <=> 2);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Từ “来自” có ý nghĩa là gì trong câu giới thiệu nguồn gốc doanh nghiệp hoặc quê hương?',@seed_quizzes_2,NULL,NULL,'“来自” (láizì) mang nghĩa là ''đến từ'', dùng để giới thiệu xuất xứ công ty (Ví dụ: 我来自AB公司 - Tôi đến từ công ty AB).',6,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_2 AND `order_index` <=> 6);
SET @seed_questions_22 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_2 AND `order_index` <=> 6);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Điền trạng từ chỉ thời gian thích hợp thể hiện trạng thái vừa mới bước chân vào nhà xưởng đi làm ngày hôm nay:\n“大家好！我 hôm nay _______来上班，很高兴认识大家！”',@seed_quizzes_6,NULL,NULL,'Phó từ ''刚'' (vừa/vừa mới) đứng trước động từ ''来'' (đến) bổ nghĩa thời gian cho hành động nhận việc xảy ra ngay sát mốc hiện tại.',9,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_6 AND `order_index` <=> 9);
SET @seed_questions_81 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_6 AND `order_index` <=> 9);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'您好，________！我是今天新来的员工。',@seed_quizzes_5,'https://res.cloudinary.com/rir6b8kp/video/upload/v1784042790/ph%C3%A2n_%C4%91o%E1%BA%A1n_3_xoyfhi.mp3',NULL,'“部门主管” nghĩa là “trưởng bộ phận”. Đây là cách xưng hô phù hợp khi nhân viên mới chào và báo cáo với người quản lý trực tiếp. Câu hoàn chỉnh có nghĩa là: “Chào Trưởng bộ phận! Tôi là nhân viên mới đến hôm nay.”',3,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_5 AND `order_index` <=> 3);
SET @seed_questions_60 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_5 AND `order_index` <=> 3);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'贵公司在什么________活动？',@seed_quizzes_3,'https://res.cloudinary.com/rir6b8kp/video/upload/v1784051657/ph%C3%A2n_%C4%91o%E1%BA%A1n_2_yf77ye.mp3',NULL,'“领域” có nghĩa là “lĩnh vực”. Cụm 在什么领域 activity nghĩa là “hoạt động trong lĩnh vực nào”. Câu hoàn chỉnh 贵公司在什么领域活动？ có nghĩa là “Quý công ty hoạt động trong lĩnh vực nào?”',2,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_3 AND `order_index` <=> 2);
SET @seed_questions_28 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_3 AND `order_index` <=> 2);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Điền từ thích hợp để hoàn thành câu thể hiện sự lịch thiệp, vui mừng khi lần đầu gặp mặt đối tác hoặc đồng nghiệp:\n“您好！我叫A。很高兴_______您。”',@seed_quizzes_4,NULL,NULL,'Cụm từ "很高兴见到您" (Rất vui được gặp ngài/bạn) là câu giao tiếp lịch sự chuẩn mực được dùng ngay tại thời điểm hai bên trực tiếp gặp mặt nhau.',9,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_4 AND `order_index` <=> 9);
SET @seed_questions_50 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_4 AND `order_index` <=> 9);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Hoàn thành câu chào mừng của nhân viên lễ tân khi tiếp đón một nhân sự mới đến nhận việc tại văn phòng:\n“您好！欢迎_______ABC公司。”',@seed_quizzes_4,NULL,NULL,'Cấu trúc "欢迎来到 + Địa điểm" (Chào mừng đến với...) là mẫu câu cố định dùng để thể hiện sự hiếu khách khi ai đó vừa đặt chân tới một địa điểm cụ thể như công ty.',6,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_4 AND `order_index` <=> 6);
SET @seed_questions_47 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_4 AND `order_index` <=> 6);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Chọn cụm từ khuyết thích hợp thể hiện lời phản hồi khẳng định sẵn sàng hỗ trợ nhân viên mới của người đồng nghiệp:\n“_______！刚开始 hungry 有点 không quen rất bình thường, đừng lo lắng。”',@seed_quizzes_6,NULL,NULL,'Cụm từ ''没问题'' (không vấn đề gì/được chứ) mang sắc thái cởi mở, khẳng định đồng nghiệp cũ luôn sẵn sàng giúp đỡ và chỉ bảo cho người mới.',8,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_6 AND `order_index` <=> 8);
SET @seed_questions_80 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_6 AND `order_index` <=> 8);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Muốn hỏi đi bộ mất bao lâu, bạn dùng câu nào?',@seed_quizzes_10,NULL,NULL,'多久 hỏi khoảng thời gian; 走路 là đi bộ.',2,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_10 AND `order_index` <=> 2);
SET @seed_questions_98 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_10 AND `order_index` <=> 2);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Khi Trưởng bộ phận muốn động viên nhân viên mới cứ bình tĩnh, từ từ làm quen với môi trường, họ sẽ dùng mẫu câu nào?\n“没关系，谁都有开始的时候。慢慢熟悉车间的流程就可以了。”',@seed_quizzes_5,NULL,NULL,'Phó từ ''慢慢'' (từ từ, dần dần) đặt trước động từ ''熟悉'' (làm quen, thuần thục) nhằm diễn tả tiến độ làm quen một cách tuần tự, không vội vã, phù hợp với tâm lý động viên nhân viên mới.',8,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_5 AND `order_index` <=> 8);
SET @seed_questions_65 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_5 AND `order_index` <=> 8);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Điền cụm từ khuyết thể hiện thái độ cầu thị nhờ vả, làm phiền mọi người hướng dẫn công việc sau này:\n“希望以后大家能多多指导我。如果有什么不懂 của, 就_______大家了。”',@seed_quizzes_6,NULL,NULL,'Cấu trúc ''就麻烦大家了'' (phải làm phiền mọi người rồi) thể hiện sự khéo léo, tôn trọng và tạo thiện cảm lớn với các đồng nghiệp cũ trong ngày đầu nhận việc.',7,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_6 AND `order_index` <=> 7);
SET @seed_questions_79 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_6 AND `order_index` <=> 7);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Xác định phiên âm Pinyin chuẩn xác viết liền theo quy tắc ngữ pháp của thuật ngữ công nghệ “人工智能” (Trí tuệ nhân tạo):',@seed_quizzes_2,NULL,NULL,'“人工智能” phát âm chuẩn là ''Réngōng zhìnéng'' (Nhân công trí năng), tuân thủ viết liền các từ tố cấu thành thuật ngữ chuyên ngành.',7,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_2 AND `order_index` <=> 7);
SET @seed_questions_23 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_2 AND `order_index` <=> 7);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'您好！________叫A。________是我第一天上班。',@seed_quizzes_4,'https://res.cloudinary.com/rir6b8kp/video/upload/v1784041477/ph%C3%A2n_%C4%91o%E1%BA%A1n_2_fasqeq.mp3',NULL,'“我叫A” là mẫu câu giới thiệu tên, nghĩa là “Tôi tên là A”. “今天是我第一天上班” nghĩa là “Hôm nay là ngày đầu tiên tôi đi làm”. Hai từ “我” và “今天” giúp câu hoàn chỉnh, đúng ngữ pháp và đúng ngữ cảnh.',2,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_4 AND `order_index` <=> 2);
SET @seed_questions_43 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_4 AND `order_index` <=> 2);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Xác định phiên âm Pinyin chính xác của danh từ “领域” (Lĩnh vực):',@seed_quizzes_3,NULL,NULL,'“领域” có phiên âm chuẩn xác là ''lǐngyù'' (thanh 3 kết hợp thanh 4), mang nghĩa là lĩnh vực (phạm vi hoạt động kinh doanh).',15,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_3 AND `order_index` <=> 15);
SET @seed_questions_41 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_3 AND `order_index` <=> 15);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Cụm nào phù hợp để mở lời hỏi đường lịch sự?',@seed_quizzes_9,NULL,NULL,'请问 có nghĩa là xin hỏi, dùng trước câu hỏi với người lạ.',1,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_9 AND `order_index` <=> 1);
SET @seed_questions_94 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_9 AND `order_index` <=> 1);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'慢慢熟悉一下工厂的________和安全规章。',@seed_quizzes_5,'https://res.cloudinary.com/rir6b8kp/video/upload/v1784042791/ph%C3%A2n_%C4%91o%E1%BA%A1n_4_uxfzl8.mp3',NULL,'“流程” có nghĩa là “quy trình”. Cụm 流程和安全规章 nghĩa là “quy trình và nội quy an toàn”. Câu hoàn chỉnh 慢慢熟悉一下工厂的流程和安全规章。 có nghĩa là “Hãy từ từ làm quen với quy trình và các quy định an toàn của nhà máy.”',4,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_5 AND `order_index` <=> 4);
SET @seed_questions_61 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_5 AND `order_index` <=> 4);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'要热的还是冰的？ có nghĩa là gì?',@seed_quizzes_7,NULL,NULL,'热的 chỉ loại nóng, 冰的 chỉ loại lạnh; 还是 nối hai lựa chọn.',3,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_7 AND `order_index` <=> 3);
SET @seed_questions_90 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_7 AND `order_index` <=> 3);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Nhân viên mới muốn bày tỏ mong muốn nhận được sự chỉ bảo, dẫn dắt từ quản lý và đồng nghiệp sẽ dùng từ nào?\n“这是我第一次在工业园区工作，希望主管和大家可以_______我。”',@seed_quizzes_5,NULL,NULL,'Động từ ''指导'' (hướng dẫn, chỉ bảo) được dùng chuẩn xác nhất khi cấp dưới hoặc người mới thể hiện thái độ cầu thị, muốn được cấp trên định hướng công việc.',7,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_5 AND `order_index` <=> 7);
SET @seed_questions_64 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_5 AND `order_index` <=> 7);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Đối tác giới thiệu họ làm việc cho một cơ sở sản xuất quy mô lớn (Nhà máy). Chọn đơn vị phù hợp hoàn thành câu: "请问，您 là nhà máy này_____ người quản lý?" (thực chất: "请问，您是这家_____的管理者吗？")',@seed_quizzes_1,NULL,NULL,'"工厂" (Nhà máy/Xưởng) là loại hình đơn vị sản xuất trực tiếp vật chất, tương ứng với vị trí Giám đốc nhà máy "厂长" (chǎngzhǎng).',9,'MULTIPLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_1 AND `order_index` <=> 9);
SET @seed_questions_9 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_1 AND `order_index` <=> 9);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Chọn cụm danh từ thích hợp điền vào vị trí khuyết để hoàn thành câu giới thiệu sản phẩm cốt lõi của công ty công nghệ:\n“我们公司专门 cung cấp phần mềm_______。”',@seed_quizzes_3,NULL,NULL,'Thuật ngữ ''解决方案'' (giải pháp) kết hợp với ''软件'' tạo thành cụm từ hoàn chỉnh ''giải pháp phần mềm'' chuẩn ngữ cảnh bài học.',10,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_3 AND `order_index` <=> 10);
SET @seed_questions_36 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_3 AND `order_index` <=> 10);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Nghe đoạn âm thanh sau và chọn nghĩa tiếng Việt đúng của câu: "李先生 là bộ phận kỹ thuật của...?" (thực chất: "李先生是技术部的...")',@seed_quizzes_1,'https://res.cloudinary.com/rir6b8kp/video/upload/v1783834140/C%C3%A2u_h%E1%BB%8Fi_luy%E1%BB%87n_nghe_2_spqogk.mp3',NULL,'Ý nghĩa hoàn chỉnh: Ông Lý là Quản lý của bộ phận kỹ thuật, anh ấy chịu trách nhiệm bảo trì hệ thống.',2,'LISTENING_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_1 AND `order_index` <=> 2);
SET @seed_questions_2 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_1 AND `order_index` <=> 2);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Hoàn thành câu hỏi xã giao của khách hàng khi muốn tìm hiểu về lĩnh vực kinh doanh của doanh nghiệp đối tác:\n“贵公司在什么_______活动？”',@seed_quizzes_3,NULL,NULL,'Danh từ ''领域'' kết hợp với động từ ''活动'' tạo thành cấu trúc ''hoạt động trong lĩnh vực gì'', thường dùng trong giao tiếp thương mại.',7,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_3 AND `order_index` <=> 7);
SET @seed_questions_33 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_3 AND `order_index` <=> 7);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Phiên âm Pinyin chính xác của danh từ “公司” (Công ty) là gì?',@seed_quizzes_4,NULL,NULL,'“公司” có phiên âm chuẩn là gōngsī (thanh 1 và thanh 1), thanh mẫu ''s'' cần phát âm nhẹ, không uốn lưỡi, tránh nhầm lẫn với ''sh'' hoặc ''x''.',11,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_4 AND `order_index` <=> 11);
SET @seed_questions_52 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_4 AND `order_index` <=> 11);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Chọn từ thích hợp để điền vào lời chào của Trưởng bộ phận khi chào đón nhân viên mới gia nhập tập thể:\n“欢迎_______我们团队。请坐。”',@seed_quizzes_5,NULL,NULL,'Trong bối cảnh tiếp đón nhân sự mới, động từ ''加入'' (gia nhập/tham gia) kết hợp với cụm ''我们团队'' (đội ngũ của chúng ta) tạo thành cấu trúc chào mừng chuyên nghiệp tại doanh nghiệp.',6,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_5 AND `order_index` <=> 6);
SET @seed_questions_63 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_5 AND `order_index` <=> 6);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'我负责________咨询 và hỗ trợ (chữ dịch: 咨询和支持)。',@seed_quizzes_2,'https://res.cloudinary.com/rir6b8kp/video/upload/v1784051272/ph%C3%A2n_%C4%91o%E1%BA%A1n_5_y0yvsy.mp3',NULL,'Danh từ ''客户'' (khách hàng) kết hợp với cụm ''咨询 và hỗ trợ'' tạo thành thuật ngữ ngành dịch vụ thương mại ''tư vấn và hỗ trợ khách hàng''.',5,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_2 AND `order_index` <=> 5);
SET @seed_questions_21 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_2 AND `order_index` <=> 5);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Chúng tôi công ty________vì xí nghiệp cung cấp phần mềm giải quyết phương án。',@seed_quizzes_3,'https://res.cloudinary.com/rir6b8kp/video/upload/v1784051658/ph%C3%A2n_%C4%91o%E1%BA%A1n_3_q3urrj.mp3',NULL,'“专门” có nghĩa là “chuyên, chuyên về”. Từ này được dùng để nhấn mạnh rằng công ty tập trung cung cấp một sản phẩm hoặc dịch vụ cụ thể. Câu hoàn chỉnh là 我们公司专门为企业提供软件解决方案。, nghĩa là “Công ty chúng tôi chuyên cung cấp giải pháp phần mềm cho doanh nghiệp.”',3,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_3 AND `order_index` <=> 3);
SET @seed_questions_29 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_3 AND `order_index` <=> 3);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Khi một nhân sự mới bước vào văn phòng lần đầu tiên, họ sẽ dùng mẫu câu nào để tự giới thiệu về bản thân?\n“您好！_______， hôm nay là ngày đầu tiên tôi đi làm.”',@seed_quizzes_4,NULL,NULL,'Trong bối cảnh ngày đầu nhận việc, từ "新员工" (nhân viên mới) là danh xưng chuẩn xác nhất để giới thiệu với đồng nghiệp và lễ tân.',5,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_4 AND `order_index` <=> 5);
SET @seed_questions_46 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_4 AND `order_index` <=> 5);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Trong câu "您目前负责哪个项目？", từ 负责 (fùzé) mang ý nghĩa nào dưới đây?',@seed_quizzes_1,NULL,NULL,'"负责" (fùzé) là một động từ biểu thị hành vi chịu trách nhiệm chính trước một dự án hoặc bộ phận.',13,'MULTIPLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_1 AND `order_index` <=> 13);
SET @seed_questions_13 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_1 AND `order_index` <=> 13);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Chọn động từ biểu thị việc nắm giữ một vai trò hoặc vị trí công vụ chính thức: "请问nắm giữ gì chức vụ?" (thực chất: "请问您在贵公司_____什么职务？")',@seed_quizzes_1,NULL,NULL,'Cấu trúc kết hợp chuẩn mực trong tiếng Trung hành chính là "担任...职务" (đảm nhiệm chức vụ...).',7,'MULTIPLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_1 AND `order_index` <=> 7);
SET @seed_questions_7 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_1 AND `order_index` <=> 7);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Từ 软件 với phiên âm tương ứng là (ruǎnjiàn) mang ý nghĩa nào dưới đây?',@seed_quizzes_1,NULL,NULL,'"软件" (ruǎnjiàn) là thuật ngữ chuyên ngành công nghệ thông tin chỉ phần mềm máy tính hoặc phần mềm ứng dụng, phân biệt với phần cứng "硬件" (yìnjiàn).',16,'MULTIPLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_1 AND `order_index` <=> 16);
SET @seed_questions_16 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_1 AND `order_index` <=> 16);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Hoàn thành lời khuyên trấn an tinh thần của đồng nghiệp khi thấy người mới lo lắng về áp lực tiến độ tại xưởng:\n“我们 factory 的工作节奏很快，刚开始 hungry 有点 không quen rất bình thường,_______。”',@seed_quizzes_6,NULL,NULL,'Cụm từ khẩu ngữ ''别着急'' (đừng vội/đừng lo lắng) dùng để xoa dịu tâm lý căng thẳng, áp lực cho nhân sự mới khi tiếp xúc với môi trường làm việc tốc độ cao.',10,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_6 AND `order_index` <=> 10);
SET @seed_questions_82 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_6 AND `order_index` <=> 10);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Nhân viên bày tỏ sự quyết tâm thực hiện tốt nhiệm vụ được phân công sẽ dùng từ khuyết nào dưới đây?\n“好的，部门主管。我会努力工作，争取_______。”',@seed_quizzes_5,NULL,NULL,'Bổ ngữ kết quả ''做好'' (làm tốt) đi liền sau động từ hành động và từ biểu thị mục tiêu phấn đấu ''争取'' (tranh thủ/phấn đấu) thể hiện mục đích hoàn thành xuất sắc công việc.',9,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_5 AND `order_index` <=> 9);
SET @seed_questions_66 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_5 AND `order_index` <=> 9);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Để đáp lại lời chào "很高兴见到..." từ đối phương, bạn sẽ sử dụng cụm từ nào dưới đây để biểu thị sự đồng thuận về mặt cảm xúc?\n“A: 很高兴见到您！ - B: _______很高兴见到 bạn！”',@seed_quizzes_4,NULL,NULL,'Cụm "我也" (tôi cũng...) được thêm vào trước tính từ/vị ngữ để biểu thị người nói cũng có cùng một trạng thái cảm xúc hoặc hành động tương tự như người đối thoại.',10,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_4 AND `order_index` <=> 10);
SET @seed_questions_51 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_4 AND `order_index` <=> 10);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Xác định phiên âm Pinyin chuẩn xác của thuật ngữ “解决方案” (Giải pháp):',@seed_quizzes_3,NULL,NULL,'“解决方案” có phiên âm chính xác là ''jiějué fāng''àn''. Lưu ý có dấu cách âm ('') trước âm ''àn'' để tách rõ hai âm tiết của từ ''方案''.',11,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_3 AND `order_index` <=> 11);
SET @seed_questions_37 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_3 AND `order_index` <=> 11);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Hoàn thành câu nói diễn tả trạng thái thời gian và hành động trong ngày đầu tiên đến cơ quan:\n“_______是我第一天上班，请大家多多指教。”',@seed_quizzes_4,NULL,NULL,'Trạng từ chỉ thời gian "今天" (hôm nay) đi liền với vế "第一天上班" (ngày đầu tiên đi làm) để nhấn mạnh sự kiện đang diễn ra trong thời điểm hiện tại.',7,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_4 AND `order_index` <=> 7);
SET @seed_questions_48 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_4 AND `order_index` <=> 7);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Từ “上班” có ý nghĩa hành động và phiên âm chuẩn xác nào dưới đây?',@seed_quizzes_4,NULL,NULL,'“上班” (shàngbān) là động từ ly hợp chỉ hành động đến nơi làm việc để thực hiện nghĩa vụ lao động theo giờ quy định.',12,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_4 AND `order_index` <=> 12);
SET @seed_questions_53 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_4 AND `order_index` <=> 12);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Lượng từ nào phù hợp trong câu 我要一___咖啡？',@seed_quizzes_7,NULL,NULL,'杯 dùng để đếm cốc đồ uống; 一杯咖啡 là một cốc cà phê.',1,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_7 AND `order_index` <=> 1);
SET @seed_questions_88 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_7 AND `order_index` <=> 1);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Cụm từ “第一天” (dì yī tiān) mang ý nghĩa biểu thị trật tự thời gian nào dưới đây?',@seed_quizzes_4,NULL,NULL,'Từ “第” (dì) là dấu hiệu hình thành số thứ tự, kết hợp với “一天” (một ngày) tạo thành cụm từ chỉ vị trí mốc thời gian đầu tiên trong một chuỗi sự kiện.',16,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_4 AND `order_index` <=> 16);
SET @seed_questions_57 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_4 AND `order_index` <=> 16);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'二十五块 là bao nhiêu tiền?',@seed_quizzes_8,NULL,NULL,'二十 là hai chục; thêm 五 là 25.',1,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_8 AND `order_index` <=> 1);
SET @seed_questions_91 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_8 AND `order_index` <=> 1);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Chúng tôi công ty chuyên môn vì xí nghiệp________phần mềm giải quyết phương án。',@seed_quizzes_3,'https://res.cloudinary.com/rir6b8kp/video/upload/v1784051660/ph%C3%A2n_%C4%91o%E1%BA%A1n_4_uzelll.mp3',NULL,'“提供” có nghĩa là “cung cấp”. Cấu trúc 为 + đối tượng + 提供 + sản phẩm/dịch vụ nghĩa là “cung cấp sản phẩm hoặc dịch vụ cho một đối tượng”. Câu hoàn chỉnh là 我们公司专门为企业提供软件解决方案。',4,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_3 AND `order_index` <=> 4);
SET @seed_questions_30 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_3 AND `order_index` <=> 4);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'大家________！',@seed_quizzes_6,'https://res.cloudinary.com/rir6b8kp/video/upload/v1784047617/ph%C3%A2n_%C4%91o%E1%BA%A1n_1_ytxxyd.mp3',NULL,'“大家好” là lời chào phổ biến trong tiếng Trung, có nghĩa là “Xin chào mọi người”. Đây là cách mở đầu thường dùng khi giới thiệu bản thân hoặc phát biểu trước tập thể.',1,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_6 AND `order_index` <=> 1);
SET @seed_questions_73 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_6 AND `order_index` <=> 1);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Nghe đoạn hội thoại sau và sắp xếp các câu theo thứ tự',@seed_quizzes_1,'https://res.cloudinary.com/rir6b8kp/video/upload/v1784005358/C%C3%A2u_h%E1%BB%8Fi_luy%E1%BB%87n_nghe_4_d7ice0.mp3',NULL,'Cuộc hội thoại bắt đầu bằng C, khi một người chủ động chào hỏi và xác nhận chức vụ của đối phương. Tiếp theo, A trả lời bằng cách giới thiệu tên, chức vụ và đưa danh thiếp. Sau khi nhận được thông tin, B đáp lại bằng lời chào lịch sự và tự giới thiệu bản thân cũng như công ty của mình. Dựa trên thông tin đó, D tiếp tục cuộc trò chuyện bằng cách hỏi về lĩnh vực kinh doanh của công ty. Cuối cùng, E trả lời trực tiếp câu hỏi ở câu D, giới thiệu rằng công ty chủ yếu phát triển phần mềm doanh nghiệp. Thứ tự này phù hợp với trình tự giao tiếp trong một buổi gặp gỡ và trao đổi danh thiếp trong môi trường công việc.',4,'LISTENING_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_1 AND `order_index` <=> 4);
SET @seed_questions_4 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_1 AND `order_index` <=> 4);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Doanh nghiệp đối tác hoạt động trong ngành dịch vụ Logistics/Vận tải. Chọn danh từ thích hợp thay thế hoàn thành câu: "Chúng tôi công ty chủ yếu phụ trách_____ nghiệp vụ。" (thực chất: "我们公司主要负责_____业务。")',@seed_quizzes_1,NULL,NULL,'"物流" (Logistics/Vận tải) là mảng dịch vụ lưu thông hàng hóa phổ biến trong chuỗi cung ứng thương mại.',10,'MULTIPLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_1 AND `order_index` <=> 10);
SET @seed_questions_10 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_1 AND `order_index` <=> 10);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'我们公司专门为企业提供软件________。',@seed_quizzes_3,'https://res.cloudinary.com/rir6b8kp/video/upload/v1784051661/ph%C3%A2n_%C4%91o%E1%BA%A1n_5_vre4e0.mp3',NULL,'“解决方案” có nghĩa là “giải pháp”. Cụm 软件解决方案 nghĩa là “giải pháp phần mềm”, là một cụm từ tự nhiên và thường dùng trong môi trường doanh nghiệp. Câu hoàn chỉnh là 我们公司专门为企业提供软件解决方案。',5,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_3 AND `order_index` <=> 5);
SET @seed_questions_31 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_3 AND `order_index` <=> 5);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'往右拐 có nghĩa là gì?',@seed_quizzes_10,NULL,NULL,'右 là bên phải, 往右拐 là rẽ phải.',1,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_10 AND `order_index` <=> 1);
SET @seed_questions_97 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_10 AND `order_index` <=> 1);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Xác định phiên âm Pinyin chính xác của từ “认识” (Quen biết, làm quen):',@seed_quizzes_6,NULL,NULL,'“认识” có phiên âm chuẩn xác là ''rènshi'' (thanh 4 kết hợp với thanh nhẹ), thường dùng trong mẫu câu giao tiếp ''很高兴认识 bạn'' (rất vui được làm quen với bạn).',12,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_6 AND `order_index` <=> 12);
SET @seed_questions_84 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_6 AND `order_index` <=> 12);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'欢迎加入我们________。请坐。',@seed_quizzes_5,'https://res.cloudinary.com/rir6b8kp/video/upload/v1784042789/ph%C3%A2n_%C4%91o%E1%BA%A1n_1_ejzcow.mp3',NULL,'“团队” có nghĩa là “đội ngũ, nhóm”. Câu 欢迎加入我们团队。请坐。 có nghĩa là “Chào mừng bạn gia nhập đội ngũ của chúng tôi. Mời ngồi.” Đây là cách chào đón nhân viên mới rất phổ biến trong môi trường làm việc.',1,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_5 AND `order_index` <=> 1);
SET @seed_questions_58 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_5 AND `order_index` <=> 1);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Câu nào dùng để đề nghị cho ít đường?',@seed_quizzes_7,NULL,NULL,'少放糖 nghĩa là cho ít đường; thêm 请 để nói lịch sự.',2,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_7 AND `order_index` <=> 2);
SET @seed_questions_89 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_7 AND `order_index` <=> 2);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Khách hàng là một nữ nhân viên trẻ tuổi chưa lập gia đình. Chọn danh xưng lịch thiệp phù hợp nhất hoàn thành câu: "请问，这位 là phòng mua sắm bộ phận Trần_____。" (thực chất: "请问，这位sắp là采购部の陈_____。")',@seed_quizzes_1,NULL,NULL,'"小姐" (Tiểu thư/Cô) là danh xưng trang nhã truyền thống dành cho phụ nữ trẻ tuổi trong giao tiếp công sở.',8,'MULTIPLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_1 AND `order_index` <=> 8);
SET @seed_questions_8 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_1 AND `order_index` <=> 8);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Từ chỉ hành vi xưng hô trong giao tiếp 称呼 có phiên âm Pinyin đúng là gì?',@seed_quizzes_1,NULL,NULL,'Từ "称呼" có âm đọc chuẩn xác là chēnghu (với âm thứ hai đọc thanh nhẹ).',14,'MULTIPLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_1 AND `order_index` <=> 14);
SET @seed_questions_14 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_1 AND `order_index` <=> 14);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Tìm từ viết bằng chữ Hán chuẩn xác ứng với phiên âm “jièshào” mang nghĩa giới thiệu nhân sự, đồng nghiệp:',@seed_quizzes_5,NULL,NULL,'Chữ Hán ''介绍'' có phiên âm chuẩn xác là ''jièshào'' (hai thanh 4 dứt khoát), dùng làm động từ trong câu giới thiệu, làm quen thành viên mới trong công ty.',15,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_5 AND `order_index` <=> 15);
SET @seed_questions_72 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_5 AND `order_index` <=> 15);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Khách hàng cho biết họ phụ trách mảng tuyển dụng và quản lý nhân sự. Chọn bộ phận thích hợp hoàn thành câu: "请问，您是_____ của nhà máy?" (thực chất: "请问，您是_____的经理吗？")',@seed_quizzes_1,NULL,NULL,'"人力资源部" (Phòng Nhân sự) là bộ phận chịu trách nhiệm tuyển dụng và quản lý nguồn nhân lực.',6,'MULTIPLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_1 AND `order_index` <=> 6);
SET @seed_questions_6 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_1 AND `order_index` <=> 6);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Cho câu thoại: “这是我们公司的主要产品。” Hãy xác định ý nghĩa của từ “产品” trong ngữ cảnh này:',@seed_quizzes_3,NULL,NULL,'Danh từ ''产品'' (chǎnpǐn) nghĩa là sản phẩm (hàng hóa hữu hình hoặc vô hình do doanh nghiệp sản xuất và cung ứng ra thị trường).',13,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_3 AND `order_index` <=> 13);
SET @seed_questions_39 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_3 AND `order_index` <=> 13);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'您好！我________兰。',@seed_quizzes_2,'https://res.cloudinary.com/rir6b8kp/video/upload/v1784051268/ph%C3%A2n_%C4%91o%E1%BA%A1n_1_p0tbei.mp3',NULL,'Động từ ''叫'' (gọi là/tên là) dùng để tự giới thiệu tên riêng một cách tự nhiên và lịch sự trong giao tiếp thương mại.',1,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_2 AND `order_index` <=> 1);
SET @seed_questions_17 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_2 AND `order_index` <=> 1);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Xác định nghĩa tiếng Việt chuẩn xác của tổ hợp danh từ sản phẩm dịch vụ số “学习平台”:',@seed_quizzes_2,NULL,NULL,'“学习平台” ghép từ ''学习'' (học tập) và ''平台'' (nền tảng/platform), chỉ hệ thống công nghệ giáo dục, học tập trực tuyến.',9,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_2 AND `order_index` <=> 9);
SET @seed_questions_25 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_2 AND `order_index` <=> 9);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Cho chữ Hán “困难”, hãy xác định ý nghĩa và phiên âm chuẩn xác của từ này trong ngữ cảnh làm việc:',@seed_quizzes_5,NULL,NULL,'“困难” phát âm là ''kùnnán'', đóng vai trò là danh từ hoặc tính từ thể hiện các vấn đề nan giải, trở ngại gặp phải trong quá trình thực hiện nhiệm vụ.',13,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_5 AND `order_index` <=> 13);
SET @seed_questions_70 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_5 AND `order_index` <=> 13);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'我是AB公司的________。',@seed_quizzes_2,'https://res.cloudinary.com/rir6b8kp/video/upload/v1784051270/ph%C3%A2n_%C4%91o%E1%BA%A1n_2_mui4sr.mp3',NULL,'Từ khóa ''销售员'' (nhân viên kinh doanh/sales) bổ nghĩa cho thuộc sở hữu của công ty AB biểu thị chính xác vai trò chức vụ.',2,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_2 AND `order_index` <=> 2);
SET @seed_questions_18 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_2 AND `order_index` <=> 2);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'我们 factory 的________快，刚开始有点 không quen rất bình thường.',@seed_quizzes_6,'https://res.cloudinary.com/rir6b8kp/video/upload/v1784047620/ph%C3%A2n_%C4%91o%E1%BA%A1n_4_ado9kg.mp3',NULL,'“工作节奏” có nghĩa là “nhịp độ công việc”. Cụm 工作节奏很快 nghĩa là “nhịp độ công việc rất nhanh”. Đây là cách diễn đạt phổ biến để mô tả cường độ và tốc độ làm việc trong doanh nghiệp hoặc nhà máy.',4,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_6 AND `order_index` <=> 4);
SET @seed_questions_76 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_6 AND `order_index` <=> 4);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Nghe đoạn âm thanh sau và chọn nghĩa tiếng Việt đúng của câu: "阮先生，请问 tôi nên xưng hô như thế nào...?"',@seed_quizzes_1,'https://res.cloudinary.com/rir6b8kp/video/upload/v1783834143/C%C3%A2u_h%E1%BB%8Fi_luy%E1%BB%87n_nghe_3_tqyapk.mp3',NULL,'Ý nghĩa hoàn chỉnh: Thưa ông Nguyễn, xin hỏi tôi nên xưng hô với ông như thế nào?',3,'LISTENING_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_1 AND `order_index` <=> 3);
SET @seed_questions_3 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_1 AND `order_index` <=> 3);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'我会努力工作，争取________。',@seed_quizzes_5,'https://res.cloudinary.com/rir6b8kp/video/upload/v1784042791/ph%C3%A2n_%C4%91o%E1%BA%A1n_5_jiov1x.mp3',NULL,'“做好” có nghĩa là “làm tốt”. Cấu trúc 争取做好 diễn tả quyết tâm cố gắng hoàn thành công việc thật tốt. Câu 我会努力工作，争取做好。 có nghĩa là “Tôi sẽ cố gắng làm việc và nỗ lực hoàn thành công việc thật tốt.”',5,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_5 AND `order_index` <=> 5);
SET @seed_questions_62 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_5 AND `order_index` <=> 5);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'刚开始 hungry 有点不熟悉很正常，________。',@seed_quizzes_6,'https://res.cloudinary.com/rir6b8kp/video/upload/v1784047621/ph%C3%A2n_%C4%91o%E1%BA%A1n_5_oze7ii.mp3',NULL,'“别着急” có nghĩa là “Đừng vội”, “Đừng lo lắng”. Câu 刚开始 hungry 有点不熟悉很正常，别 lo lắng。 là lời động viên thường dùng với nhân viên mới, nhấn mạnh rằng việc chưa quen công việc lúc ban đầu là điều bình thường và không cần quá căng thẳng.',5,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_6 AND `order_index` <=> 5);
SET @seed_questions_77 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_6 AND `order_index` <=> 5);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Cho từ 职务 với phiên âm tương ứng là (zhíwù). Nghĩa tiếng Việt chuẩn xác nhất của từ này trong văn cảnh thương mại là gì?',@seed_quizzes_1,NULL,NULL,'"职务" biểu thị vị trí công tác chính thức của một cá nhân trong tổ chức doanh nghiệp.',11,'MULTIPLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_1 AND `order_index` <=> 11);
SET @seed_questions_11 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_1 AND `order_index` <=> 11);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'今天________我________。',@seed_quizzes_4,'https://res.cloudinary.com/rir6b8kp/video/upload/v1784041481/ph%C3%A2n_%C4%91o%E1%BA%A1n_3_mqernb.mp3',NULL,'Cấu trúc 今天是我第一天上班。 là cách diễn đạt tự nhiên khi giới thiệu ngày đầu tiên đi làm. “是” đóng vai trò động từ liên kết, còn “第一天上班” nghĩa là “ngày đầu tiên đi làm”.',3,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_4 AND `order_index` <=> 3);
SET @seed_questions_44 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_4 AND `order_index` <=> 3);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'大概五分钟。 có nghĩa là gì?',@seed_quizzes_10,NULL,NULL,'大概 là khoảng, 五 là năm, 分钟 là phút.',3,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_10 AND `order_index` <=> 3);
SET @seed_questions_99 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_10 AND `order_index` <=> 3);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Tìm đại từ nhân xưng ngôi thứ hai dạng tôn kính, lịch sự viết bằng chữ Hán ứng với phiên âm “nín”:',@seed_quizzes_4,NULL,NULL,'Đại từ “您” (nín) có cấu trúc gồm chữ ''nǐ'' ở trên và bộ ''Tâm'' (心 - trái tim) ở dưới, dùng để xưng hô một cách kính trọng với cấp trên, người lớn tuổi hoặc khách hàng.',14,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_4 AND `order_index` <=> 14);
SET @seed_questions_55 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_4 AND `order_index` <=> 14);
INSERT INTO `questions` (`points`,`content`,`quiz_id`,`audio_url`,`meta_data`,`explanation`,`order_index`,`question_type`)
SELECT 10,'Từ khóa “部门主管” có ý nghĩa hành chính và chức vụ nào dưới đây?',@seed_quizzes_5,NULL,NULL,'“部门主管” (bùmén zhǔguǎn) được cấu thành từ ''部门'' (bộ phận/phòng ban) và ''主管'' (người quản lý/trưởng), chỉ người đứng đầu điều hành một bộ phận.',11,'SINGLE_CHOICE'
WHERE NOT EXISTS (SELECT 1 FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_5 AND `order_index` <=> 11);
SET @seed_questions_68 = (SELECT id FROM `questions` WHERE `quiz_id` <=> @seed_quizzes_5 AND `order_index` <=> 11);

-- answers
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. 很高兴 (hěn gāoxìng)',0,1,@seed_questions_34,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_34 AND `order_index` <=> 1);
SET @seed_answers_130 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_34 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. Văn phòng làm việc',0,3,@seed_questions_25,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_25 AND `order_index` <=> 3);
SET @seed_answers_96 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_25 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. 负责 (fùzé)',0,3,@seed_questions_17,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_17 AND `order_index` <=> 3);
SET @seed_answers_64 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_17 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT '主管 là chức danh chỉ dùng cho người nước ngoài, còn 经理 chỉ dùng cho nhân sự bản xứ.',0,4,@seed_questions_15,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_15 AND `order_index` <=> 4);
SET @seed_answers_57 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_15 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. 别着急 (bié zhāojí)',1,3,@seed_questions_82,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_82 AND `order_index` <=> 3);
SET @seed_answers_324 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_82 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. 活动 (huódòng)',0,2,@seed_questions_30,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_30 AND `order_index` <=> 2);
SET @seed_answers_115 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_30 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. 开始 (kāishǐ)',0,4,@seed_questions_66,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_66 AND `order_index` <=> 4);
SET @seed_answers_261 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_66 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'shēnghǔ',0,4,@seed_questions_14,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_14 AND `order_index` <=> 4);
SET @seed_answers_53 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_14 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. 是 (shì)',0,2,@seed_questions_73,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_73 AND `order_index` <=> 2);
SET @seed_answers_287 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_73 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. 您 (nín)',0,3,@seed_questions_51,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_51 AND `order_index` <=> 3);
SET @seed_answers_200 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_51 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT '总经理 (zǒngjīnglǐ)',1,3,@seed_questions_5,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_5 AND `order_index` <=> 3);
SET @seed_answers_16 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_5 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. Nền tảng công nghệ',0,4,@seed_questions_39,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_39 AND `order_index` <=> 4);
SET @seed_answers_153 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_39 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT '50 tệ',0,4,@seed_questions_91,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_91 AND `order_index` <=> 4);
SET @seed_answers_361 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_91 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. 客户服务 (kèhù fúwù)',0,1,@seed_questions_31,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_31 AND `order_index` <=> 1);
SET @seed_answers_118 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_31 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. 高兴 (gāoxìng) / 加入 (jiārù)',0,1,@seed_questions_42,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_42 AND `order_index` <=> 1);
SET @seed_answers_162 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_42 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. 产品',0,4,@seed_questions_38,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_38 AND `order_index` <=> 4);
SET @seed_answers_149 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_38 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. 很高兴 (hěn gāoxìng)',0,1,@seed_questions_29,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_29 AND `order_index` <=> 1);
SET @seed_answers_110 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_29 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. 谢谢 (xièxie)',0,2,@seed_questions_19,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_19 AND `order_index` <=> 2);
SET @seed_answers_71 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_19 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. 刚 (gāng)',1,1,@seed_questions_75,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_75 AND `order_index` <=> 1);
SET @seed_answers_294 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_75 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. 我 (wǒ) / 今天 (jīntiān)',1,3,@seed_questions_43,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_43 AND `order_index` <=> 3);
SET @seed_answers_168 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_43 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. 团队 (tuánduì)',0,3,@seed_questions_61,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_61 AND `order_index` <=> 3);
SET @seed_answers_240 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_61 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. 您好 (nínhǎo)',0,4,@seed_questions_49,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_49 AND `order_index` <=> 4);
SET @seed_answers_193 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_49 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. 认识 (rènshi)',0,4,@seed_questions_17,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_17 AND `order_index` <=> 4);
SET @seed_answers_65 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_17 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. Đi ra ngoài',0,4,@seed_questions_85,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_85 AND `order_index` <=> 4);
SET @seed_answers_337 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_85 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. Cung cấp',1,1,@seed_questions_24,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_24 AND `order_index` <=> 1);
SET @seed_answers_90 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_24 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'chēnghu',1,2,@seed_questions_14,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_14 AND `order_index` <=> 2);
SET @seed_answers_51 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_14 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. Công nhân xưởng sản xuất',0,4,@seed_questions_68,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_68 AND `order_index` <=> 4);
SET @seed_answers_269 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_68 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT '名字 (míngzi)',0,4,@seed_questions_10,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_10 AND `order_index` <=> 4);
SET @seed_answers_37 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_10 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. rénshī',0,3,@seed_questions_84,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_84 AND `order_index` <=> 3);
SET @seed_answers_332 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_84 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. 欢迎加入 (huānyíng jiārù)',0,1,@seed_questions_45,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_45 AND `order_index` <=> 1);
SET @seed_answers_174 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_45 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. 努力 (nǔlì)',0,2,@seed_questions_65,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_65 AND `order_index` <=> 2);
SET @seed_answers_255 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_65 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. 欢迎 (huānyíng)',0,3,@seed_questions_66,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_66 AND `order_index` <=> 3);
SET @seed_answers_260 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_66 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. 高兴 (gāoxìng)',0,1,@seed_questions_74,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_74 AND `order_index` <=> 1);
SET @seed_answers_290 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_74 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. huànyíng | Ảo ảnh',0,3,@seed_questions_56,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_56 AND `order_index` <=> 3);
SET @seed_answers_220 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_56 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. huānyíng | Chào mừng, hoan nghênh đón tiếp',1,1,@seed_questions_56,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_56 AND `order_index` <=> 1);
SET @seed_answers_218 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_56 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'Đúng năm giờ',0,1,@seed_questions_99,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_99 AND `order_index` <=> 1);
SET @seed_answers_390 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_99 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT '负责 (fùzé)',0,4,@seed_questions_8,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_8 AND `order_index` <=> 4);
SET @seed_answers_29 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_8 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'Đảm nhiệm, chịu trách nhiệm phụ trách mảng công việc',1,2,@seed_questions_13,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_13 AND `order_index` <=> 2);
SET @seed_answers_47 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_13 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. 很高兴 (hěn gāoxìng)',0,4,@seed_questions_20,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_20 AND `order_index` <=> 4);
SET @seed_answers_77 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_20 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. 没问题 (méi wèntí)',0,1,@seed_questions_78,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_78 AND `order_index` <=> 1);
SET @seed_answers_306 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_78 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. lǐngyù',1,1,@seed_questions_41,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_41 AND `order_index` <=> 1);
SET @seed_answers_158 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_41 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. 见到 (jiàndào)',0,1,@seed_questions_49,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_49 AND `order_index` <=> 1);
SET @seed_answers_190 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_49 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. 主管 (zhǔguǎn)',0,3,@seed_questions_18,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_18 AND `order_index` <=> 3);
SET @seed_answers_68 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_18 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. 见到 (jiàndào)',1,1,@seed_questions_19,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_19 AND `order_index` <=> 1);
SET @seed_answers_70 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_19 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. 见到 (jiàndào) / 今天 (jīntiān)',0,4,@seed_questions_42,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_42 AND `order_index` <=> 4);
SET @seed_answers_165 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_42 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. 同事 (tóngshì)',0,1,@seed_questions_60,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_60 AND `order_index` <=> 1);
SET @seed_answers_234 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_60 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'Xin hỏi công ty của anh/chị ở đâu?',0,3,@seed_questions_1,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_1 AND `order_index` <=> 3);
SET @seed_answers_3 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_1 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. Sản phẩm',1,2,@seed_questions_39,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_39 AND `order_index` <=> 2);
SET @seed_answers_151 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_39 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. 我也 (wǒ yě)',1,2,@seed_questions_51,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_51 AND `order_index` <=> 2);
SET @seed_answers_199 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_51 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. 流程',0,1,@seed_questions_72,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_72 AND `order_index` <=> 1);
SET @seed_answers_282 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_72 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. 产品 (chǎnpǐn)',0,1,@seed_questions_33,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_33 AND `order_index` <=> 1);
SET @seed_answers_126 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_33 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. 你',0,1,@seed_questions_55,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_55 AND `order_index` <=> 1);
SET @seed_answers_214 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_55 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'Bạn muốn trả bằng tiền mặt không?',0,1,@seed_questions_90,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_90 AND `order_index` <=> 1);
SET @seed_answers_354 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_90 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. 销售经理 (xiāoshòu jīnglǐ)',0,2,@seed_questions_36,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_36 AND `order_index` <=> 2);
SET @seed_answers_139 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_36 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. 同事 (tóngshì)',0,1,@seed_questions_67,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_67 AND `order_index` <=> 1);
SET @seed_answers_262 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_67 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A → B → C → D → E',0,2,@seed_questions_4,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_4 AND `order_index` <=> 2);
SET @seed_answers_11 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_4 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT '走路要多久？',1,1,@seed_questions_98,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_98 AND `order_index` <=> 1);
SET @seed_answers_386 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_98 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. gōngzuò | Công việc',0,3,@seed_questions_70,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_70 AND `order_index` <=> 3);
SET @seed_answers_276 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_70 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. Cung cấp',0,2,@seed_questions_40,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_40 AND `order_index` <=> 2);
SET @seed_answers_155 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_40 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT '负责 (fùzé)',0,4,@seed_questions_5,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_5 AND `order_index` <=> 4);
SET @seed_answers_17 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_5 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. 是 (shì) / 第一天 (dì yī tiān)',0,4,@seed_questions_43,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_43 AND `order_index` <=> 4);
SET @seed_answers_169 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_43 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. qǐng jìn',0,2,@seed_questions_69,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_69 AND `order_index` <=> 2);
SET @seed_answers_271 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_69 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. 工作 (gōngzuò)',0,4,@seed_questions_61,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_61 AND `order_index` <=> 4);
SET @seed_answers_241 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_61 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. Nội quy an toàn / Quy định an toàn',1,2,@seed_questions_71,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_71 AND `order_index` <=> 2);
SET @seed_answers_279 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_71 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. gòngshī',0,3,@seed_questions_52,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_52 AND `order_index` <=> 3);
SET @seed_answers_204 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_52 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'Thưa ông Nguyễn, xin hỏi tôi nên xưng hô với ông như thế nào?',1,1,@seed_questions_3,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_3 AND `order_index` <=> 1);
SET @seed_answers_7 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_3 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. 公司',0,1,@seed_questions_38,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_38 AND `order_index` <=> 1);
SET @seed_answers_146 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_38 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. 也 (yě)',0,3,@seed_questions_75,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_75 AND `order_index` <=> 3);
SET @seed_answers_296 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_75 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'Tìm kiếm thông tin khách hàng mới',0,1,@seed_questions_13,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_13 AND `order_index` <=> 1);
SET @seed_answers_46 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_13 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. Đảm nhiệm',0,4,@seed_questions_24,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_24 AND `order_index` <=> 4);
SET @seed_answers_93 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_24 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. qǐng shū',0,1,@seed_questions_69,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_69 AND `order_index` <=> 1);
SET @seed_answers_270 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_69 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. 旁边 (pángbiān)',0,4,@seed_questions_78,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_78 AND `order_index` <=> 4);
SET @seed_answers_309 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_78 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. Nhịp độ công việc',0,4,@seed_questions_25,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_25 AND `order_index` <=> 4);
SET @seed_answers_97 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_25 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT '请少放糖。',1,1,@seed_questions_89,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_89 AND `order_index` <=> 1);
SET @seed_answers_350 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_89 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. Đi đến',0,3,@seed_questions_22,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_22 AND `order_index` <=> 3);
SET @seed_answers_84 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_22 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. gāoxīn | Lương cao',0,3,@seed_questions_54,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_54 AND `order_index` <=> 3);
SET @seed_answers_212 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_54 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. 公司 (gōngsī)',0,4,@seed_questions_50,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_50 AND `order_index` <=> 4);
SET @seed_answers_197 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_50 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. Nhân viên mới',0,1,@seed_questions_68,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_68 AND `order_index` <=> 1);
SET @seed_answers_266 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_68 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. 问题 (wèntí)',0,2,@seed_questions_74,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_74 AND `order_index` <=> 2);
SET @seed_answers_291 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_74 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. 做好 (zuò hǎo)',1,1,@seed_questions_66,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_66 AND `order_index` <=> 1);
SET @seed_answers_258 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_66 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. 名字 (míngzi)',0,4,@seed_questions_30,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_30 AND `order_index` <=> 4);
SET @seed_answers_117 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_30 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. 您好 (nínhǎo) / 欢迎 (huānyíng)',1,2,@seed_questions_42,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_42 AND `order_index` <=> 2);
SET @seed_answers_163 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_42 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT '15 tệ',0,1,@seed_questions_91,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_91 AND `order_index` <=> 1);
SET @seed_answers_358 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_91 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. Hoạt động',1,1,@seed_questions_40,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_40 AND `order_index` <=> 1);
SET @seed_answers_154 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_40 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. fǎnyìng | Phản ứng',0,4,@seed_questions_56,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_56 AND `order_index` <=> 4);
SET @seed_answers_221 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_56 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. 部门主管 (bùmén zhǔguǎn)',1,3,@seed_questions_60,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_60 AND `order_index` <=> 3);
SET @seed_answers_236 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_60 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. lǐngyú',0,3,@seed_questions_41,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_41 AND `order_index` <=> 3);
SET @seed_answers_160 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_41 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. 困难 (kùnnán)',0,2,@seed_questions_64,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_64 AND `order_index` <=> 2);
SET @seed_answers_251 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_64 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. 见 (jiàn) / 核心客户 (héxīn kèhù)',0,4,@seed_questions_44,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_44 AND `order_index` <=> 4);
SET @seed_answers_173 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_44 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. Ngồi đối diện',0,3,@seed_questions_85,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_85 AND `order_index` <=> 3);
SET @seed_answers_336 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_85 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'Cà phê này bao nhiêu tiền?',0,4,@seed_questions_90,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_90 AND `order_index` <=> 4);
SET @seed_answers_357 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_90 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. Hợp tác',0,4,@seed_questions_22,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_22 AND `order_index` <=> 4);
SET @seed_answers_85 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_22 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'Tên riêng dùng để gọi đối tác',0,1,@seed_questions_11,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_11 AND `order_index` <=> 1);
SET @seed_answers_38 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_11 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'zōng jìn nǐ',0,2,@seed_questions_12,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_12 AND `order_index` <=> 2);
SET @seed_answers_43 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_12 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. 谢谢 (xièxie)',0,3,@seed_questions_29,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_29 AND `order_index` <=> 3);
SET @seed_answers_112 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_29 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. 正常 (zhèngcháng)',0,4,@seed_questions_81,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_81 AND `order_index` <=> 4);
SET @seed_answers_321 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_81 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. Réngōng zhìnéng',1,1,@seed_questions_23,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_23 AND `order_index` <=> 1);
SET @seed_answers_86 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_23 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT '软件部 (ruǎnjiàn bù)',0,2,@seed_questions_6,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_6 AND `order_index` <=> 2);
SET @seed_answers_19 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_6 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. Nhịp độ công việc / Tốc độ công việc',1,2,@seed_questions_83,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_83 AND `order_index` <=> 2);
SET @seed_answers_327 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_83 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. jiějué fāng''àn',1,1,@seed_questions_37,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_37 AND `order_index` <=> 1);
SET @seed_answers_142 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_37 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'Thưa ông Nguyễn, xin hỏi ông sống ở đâu?',0,3,@seed_questions_3,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_3 AND `order_index` <=> 3);
SET @seed_answers_9 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_3 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. rènshì',0,2,@seed_questions_84,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_84 AND `order_index` <=> 2);
SET @seed_answers_331 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_84 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. 名字 (míngzi)',0,4,@seed_questions_35,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_35 AND `order_index` <=> 4);
SET @seed_answers_137 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_35 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'zhōng jīng lǐ',0,1,@seed_questions_12,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_12 AND `order_index` <=> 1);
SET @seed_answers_42 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_12 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. Quản lý kinh doanh / Trưởng phòng kinh doanh',1,3,@seed_questions_26,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_26 AND `order_index` <=> 3);
SET @seed_answers_100 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_26 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. 加班',0,3,@seed_questions_87,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_87 AND `order_index` <=> 3);
SET @seed_answers_344 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_87 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. Khu công nghiệp tập trung',0,4,@seed_questions_83,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_83 AND `order_index` <=> 4);
SET @seed_answers_329 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_83 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. 活动 (huódòng)',0,3,@seed_questions_32,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_32 AND `order_index` <=> 3);
SET @seed_answers_124 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_32 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT '一共',0,4,@seed_questions_94,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_94 AND `order_index` <=> 4);
SET @seed_answers_373 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_94 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. gōngxī',0,1,@seed_questions_52,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_52 AND `order_index` <=> 1);
SET @seed_answers_202 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_52 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. Ngày đầu tiên',1,3,@seed_questions_57,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_57 AND `order_index` <=> 3);
SET @seed_answers_224 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_57 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'Quay về khách sạn',0,4,@seed_questions_97,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_97 AND `order_index` <=> 4);
SET @seed_answers_385 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_97 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT '地铁站在哪里？',0,2,@seed_questions_98,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_98 AND `order_index` <=> 2);
SET @seed_answers_387 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_98 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT '打包',0,1,@seed_questions_94,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_94 AND `order_index` <=> 1);
SET @seed_answers_370 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_94 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. Lĩnh vực hoạt động',0,3,@seed_questions_39,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_39 AND `order_index` <=> 3);
SET @seed_answers_152 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_39 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. 安全规章 (ānquán guīzhāng)',0,2,@seed_questions_76,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_76 AND `order_index` <=> 2);
SET @seed_answers_299 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_76 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. 欢迎 (huānyíng)',0,4,@seed_questions_62,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_62 AND `order_index` <=> 4);
SET @seed_answers_245 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_62 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. 企业 (qǐyè)',0,4,@seed_questions_33,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_33 AND `order_index` <=> 4);
SET @seed_answers_129 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_33 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT '称呼 (chēnghu)',0,3,@seed_questions_10,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_10 AND `order_index` <=> 3);
SET @seed_answers_36 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_10 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'Thưa ông Nguyễn, xin hỏi ông bao nhiêu tuổi?',0,2,@seed_questions_3,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_3 AND `order_index` <=> 2);
SET @seed_answers_8 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_3 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'Thiết bị phần cứng máy tính',0,1,@seed_questions_16,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_16 AND `order_index` <=> 1);
SET @seed_answers_58 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_16 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT '先生 (xiānshēng)',0,1,@seed_questions_8,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_8 AND `order_index` <=> 1);
SET @seed_answers_26 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_8 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. 欢迎 (huānyíng) / 加入公司 (jiārù gōngsī)',0,3,@seed_questions_44,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_44 AND `order_index` <=> 3);
SET @seed_answers_172 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_44 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT '本',0,2,@seed_questions_88,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_88 AND `order_index` <=> 2);
SET @seed_answers_347 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_88 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. 负责 (fùzé)',0,4,@seed_questions_27,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_27 AND `order_index` <=> 4);
SET @seed_answers_105 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_27 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT '扫码',0,3,@seed_questions_94,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_94 AND `order_index` <=> 3);
SET @seed_answers_372 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_94 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. 介绍 (jièshào)',0,3,@seed_questions_63,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_63 AND `order_index` <=> 3);
SET @seed_answers_248 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_63 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. 客户服务 (kèhù fúwù)',0,1,@seed_questions_36,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_36 AND `order_index` <=> 1);
SET @seed_answers_138 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_36 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT '你要喝什么？',0,4,@seed_questions_98,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_98 AND `order_index` <=> 4);
SET @seed_answers_389 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_98 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT '人力资源部 (rénlì zīyuán bù)',1,1,@seed_questions_6,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_6 AND `order_index` <=> 1);
SET @seed_answers_18 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_6 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. Quy trình sản xuất',0,1,@seed_questions_71,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_71 AND `order_index` <=> 1);
SET @seed_answers_278 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_71 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. 工厂 (gōngchǎng)',0,3,@seed_questions_58,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_58 AND `order_index` <=> 3);
SET @seed_answers_228 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_58 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'chēnhú',0,3,@seed_questions_14,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_14 AND `order_index` <=> 3);
SET @seed_answers_52 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_14 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT '担任 (dānrèn)',1,3,@seed_questions_7,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_7 AND `order_index` <=> 3);
SET @seed_answers_24 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_7 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. Bình thường / Quy luật tự nhiên',1,3,@seed_questions_86,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_86 AND `order_index` <=> 3);
SET @seed_answers_340 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_86 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. 多多指导 (duōduō zhǐdǎo)',0,2,@seed_questions_82,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_82 AND `order_index` <=> 2);
SET @seed_answers_323 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_82 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'Bên trái',0,2,@seed_questions_95,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_95 AND `order_index` <=> 2);
SET @seed_answers_375 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_95 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. 指导 (zhǐdǎo)',1,3,@seed_questions_64,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_64 AND `order_index` <=> 3);
SET @seed_answers_252 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_64 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. 工作 (gōngzuò)',0,1,@seed_questions_59,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_59 AND `order_index` <=> 1);
SET @seed_answers_230 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_59 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. Nền tảng học tập',1,2,@seed_questions_25,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_25 AND `order_index` <=> 2);
SET @seed_answers_95 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_25 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. Hợp tác',0,4,@seed_questions_40,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_40 AND `order_index` <=> 4);
SET @seed_answers_157 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_40 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. 谢谢大家 (xièxiè dàjiā)',0,1,@seed_questions_82,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_82 AND `order_index` <=> 1);
SET @seed_answers_322 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_82 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. 今年 (jīnnián)',0,4,@seed_questions_48,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_48 AND `order_index` <=> 4);
SET @seed_answers_189 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_48 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT '请问',1,2,@seed_questions_94,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_94 AND `order_index` <=> 2);
SET @seed_answers_371 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_94 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. 企业 (qǐyè)',0,4,@seed_questions_28,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_28 AND `order_index` <=> 4);
SET @seed_answers_109 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_28 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'Xin hỏi anh/chị tên là gì?',0,2,@seed_questions_1,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_1 AND `order_index` <=> 2);
SET @seed_answers_2 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_1 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. kōngsī',0,4,@seed_questions_52,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_52 AND `order_index` <=> 4);
SET @seed_answers_205 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_52 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT '经理 (Trưởng phòng/Giám đốc) có thẩm quyền ký kết quyết định lớn hơn, còn 主管 (Quản lý/Giám sát) thường điều hành hoạt động của một nhóm công việc cụ thể.',1,2,@seed_questions_15,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_15 AND `order_index` <=> 2);
SET @seed_answers_55 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_15 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. 那',0,4,@seed_questions_55,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_55 AND `order_index` <=> 4);
SET @seed_answers_217 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_55 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. 担任 (dānrèn)',0,2,@seed_questions_20,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_20 AND `order_index` <=> 2);
SET @seed_answers_75 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_20 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT '一共二十五块。',0,4,@seed_questions_93,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_93 AND `order_index` <=> 4);
SET @seed_answers_369 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_93 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'chènghū',0,1,@seed_questions_14,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_14 AND `order_index` <=> 1);
SET @seed_answers_50 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_14 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. 下班',0,2,@seed_questions_87,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_87 AND `order_index` <=> 2);
SET @seed_answers_343 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_87 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. 产品 (chǎnpǐn)',0,1,@seed_questions_28,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_28 AND `order_index` <=> 1);
SET @seed_answers_106 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_28 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'Hai từ này hoàn toàn đồng nghĩa và có thể thay thế cho nhau trong mọi văn cảnh hành chính.',0,3,@seed_questions_15,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_15 AND `order_index` <=> 3);
SET @seed_answers_56 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_15 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT '工厂 (gōngchǎng)',1,2,@seed_questions_9,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_9 AND `order_index` <=> 2);
SET @seed_answers_31 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_9 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. Bên cạnh / Kế bên',1,2,@seed_questions_85,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_85 AND `order_index` <=> 2);
SET @seed_answers_335 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_85 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT '25 tệ',1,3,@seed_questions_91,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_91 AND `order_index` <=> 3);
SET @seed_answers_360 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_91 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. lǐngjù',0,4,@seed_questions_41,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_41 AND `order_index` <=> 4);
SET @seed_answers_161 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_41 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. 学习平台 (xuéxí píngtái)',0,4,@seed_questions_31,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_31 AND `order_index` <=> 4);
SET @seed_answers_121 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_31 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'Đi thẳng',0,1,@seed_questions_97,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_97 AND `order_index` <=> 1);
SET @seed_answers_382 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_97 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT '打包，谢谢。',1,2,@seed_questions_92,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_92 AND `order_index` <=> 2);
SET @seed_answers_363 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_92 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT '物流 (wùliú)',1,1,@seed_questions_10,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_10 AND `order_index` <=> 1);
SET @seed_answers_34 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_10 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. kùnlán | Thuận lợi',0,2,@seed_questions_70,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_70 AND `order_index` <=> 2);
SET @seed_answers_275 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_70 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. 你们',0,2,@seed_questions_55,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_55 AND `order_index` <=> 2);
SET @seed_answers_215 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_55 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. 很高兴 (hěn gāoxìng)',0,4,@seed_questions_82,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_82 AND `order_index` <=> 4);
SET @seed_answers_325 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_82 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. 很 (hěn)',0,2,@seed_questions_75,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_75 AND `order_index` <=> 2);
SET @seed_answers_295 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_75 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. kùnnán | Khó khăn, trở ngại',1,1,@seed_questions_70,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_70 AND `order_index` <=> 1);
SET @seed_answers_274 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_70 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. Tuần đầu tiên',0,4,@seed_questions_57,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_57 AND `order_index` <=> 4);
SET @seed_answers_225 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_57 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. 就 (jiù)',0,4,@seed_questions_75,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_75 AND `order_index` <=> 4);
SET @seed_answers_297 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_75 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'zǒng jīng lǐ',1,3,@seed_questions_12,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_12 AND `order_index` <=> 3);
SET @seed_answers_44 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_12 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. 尽管 (jǐnguǎn)',0,1,@seed_questions_65,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_65 AND `order_index` <=> 1);
SET @seed_answers_254 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_65 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. 上班',1,1,@seed_questions_87,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_87 AND `order_index` <=> 1);
SET @seed_answers_342 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_87 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'Đánh giá hiệu quả làm việc của nhân viên',0,4,@seed_questions_13,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_13 AND `order_index` <=> 4);
SET @seed_answers_49 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_13 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. 负责 (fùzé)',0,4,@seed_questions_32,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_32 AND `order_index` <=> 4);
SET @seed_answers_125 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_32 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. gōngsī',1,2,@seed_questions_52,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_52 AND `order_index` <=> 2);
SET @seed_answers_203 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_52 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT '张',0,4,@seed_questions_88,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_88 AND `order_index` <=> 4);
SET @seed_answers_349 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_88 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT '姓名 (xìngmíng)',0,2,@seed_questions_5,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_5 AND `order_index` <=> 2);
SET @seed_answers_15 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_5 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. 明天 (míngtiān)',0,2,@seed_questions_48,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_48 AND `order_index` <=> 2);
SET @seed_answers_187 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_48 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT '请少放糖。',0,4,@seed_questions_92,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_92 AND `order_index` <=> 4);
SET @seed_answers_365 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_92 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. Nhanh chóng, khẩn trương',0,2,@seed_questions_86,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_86 AND `order_index` <=> 2);
SET @seed_answers_339 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_86 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. 见到 (jiàndào)',1,3,@seed_questions_50,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_50 AND `order_index` <=> 3);
SET @seed_answers_196 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_50 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. 认识 (rènshi)',0,2,@seed_questions_79,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_79 AND `order_index` <=> 2);
SET @seed_answers_311 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_79 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. 开始 (kāishǐ)',0,2,@seed_questions_62,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_62 AND `order_index` <=> 2);
SET @seed_answers_243 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_62 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. 上班 (shàngbān)',0,3,@seed_questions_49,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_49 AND `order_index` <=> 3);
SET @seed_answers_192 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_49 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. 很 (hěn) / 高兴见到 (gāoxìng jiàndào)',0,2,@seed_questions_44,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_44 AND `order_index` <=> 2);
SET @seed_answers_171 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_44 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. 别着急 (bié zháojí)',1,1,@seed_questions_77,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_77 AND `order_index` <=> 1);
SET @seed_answers_302 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_77 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT '洗手间在哪里？',1,1,@seed_questions_96,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_96 AND `order_index` <=> 1);
SET @seed_answers_378 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_96 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. Phía sau xưởng',0,1,@seed_questions_85,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_85 AND `order_index` <=> 1);
SET @seed_answers_334 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_85 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. liúchéng | Quy trình',0,4,@seed_questions_70,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_70 AND `order_index` <=> 4);
SET @seed_answers_277 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_70 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'Phần mềm công nghệ thông tin',1,2,@seed_questions_16,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_16 AND `order_index` <=> 2);
SET @seed_answers_59 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_16 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. 去 (qù)',0,4,@seed_questions_73,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_73 AND `order_index` <=> 4);
SET @seed_answers_289 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_73 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. 做好 (zuò hǎo)',1,1,@seed_questions_62,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_62 AND `order_index` <=> 1);
SET @seed_answers_242 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_62 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'Ký kết biên bản nghiệm thu dự án',0,3,@seed_questions_13,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_13 AND `order_index` <=> 3);
SET @seed_answers_48 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_13 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. Đồng nghiệp cùng tổ đội',0,3,@seed_questions_83,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_83 AND `order_index` <=> 3);
SET @seed_answers_328 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_83 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. 欢迎 (huānyíng)',0,1,@seed_questions_50,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_50 AND `order_index` <=> 1);
SET @seed_answers_194 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_50 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. 上班 (shàngbān)',0,3,@seed_questions_80,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_80 AND `order_index` <=> 3);
SET @seed_answers_316 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_80 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'Ông Lý là tổng giám đốc công ty.',0,3,@seed_questions_2,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_2 AND `order_index` <=> 3);
SET @seed_answers_6 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_2 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'zòng jǐng lǐ',0,4,@seed_questions_12,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_12 AND `order_index` <=> 4);
SET @seed_answers_45 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_12 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. 经理 (jīnglǐ)',0,4,@seed_questions_18,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_18 AND `order_index` <=> 4);
SET @seed_answers_69 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_18 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. 见到 (jiàndào)',0,4,@seed_questions_47,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_47 AND `order_index` <=> 4);
SET @seed_answers_185 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_47 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. 活动 (huódòng)',0,2,@seed_questions_35,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_35 AND `order_index` <=> 2);
SET @seed_answers_135 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_35 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'Chức vụ, vị trí công tác được phân công',1,2,@seed_questions_11,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_11 AND `order_index` <=> 2);
SET @seed_answers_39 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_11 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT '你好！',0,4,@seed_questions_89,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_89 AND `order_index` <=> 4);
SET @seed_answers_353 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_89 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. Đồng nghiệp',0,3,@seed_questions_68,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_68 AND `order_index` <=> 3);
SET @seed_answers_268 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_68 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT '要热的。',0,3,@seed_questions_89,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_89 AND `order_index` <=> 3);
SET @seed_answers_352 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_89 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. shàngwǎng | Lên mạng',0,3,@seed_questions_53,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_53 AND `order_index` <=> 3);
SET @seed_answers_208 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_53 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. 销售经理 (xiāoshòu jīnglǐ)',0,2,@seed_questions_31,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_31 AND `order_index` <=> 2);
SET @seed_answers_119 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_31 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. 提供 (tígōng)',0,2,@seed_questions_27,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_27 AND `order_index` <=> 2);
SET @seed_answers_103 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_27 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. gāoxìng | Vui vẻ, mừng rỡ',1,1,@seed_questions_54,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_54 AND `order_index` <=> 1);
SET @seed_answers_210 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_54 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT '职务 (zhíwù)',0,4,@seed_questions_9,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_9 AND `order_index` <=> 4);
SET @seed_answers_33 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_9 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. 新来 (xīn lái)',1,3,@seed_questions_67,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_67 AND `order_index` <=> 3);
SET @seed_answers_264 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_67 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. 专门 (zhuānmén)',1,2,@seed_questions_29,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_29 AND `order_index` <=> 2);
SET @seed_answers_111 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_29 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C → A → B → D → E',1,4,@seed_questions_4,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_4 AND `order_index` <=> 4);
SET @seed_answers_13 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_4 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'Rẽ phải',1,3,@seed_questions_97,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_97 AND `order_index` <=> 3);
SET @seed_answers_384 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_97 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. 今天 (jīntiān)',1,3,@seed_questions_48,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_48 AND `order_index` <=> 3);
SET @seed_answers_188 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_48 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. 来自 (láizì)',1,1,@seed_questions_27,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_27 AND `order_index` <=> 1);
SET @seed_answers_102 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_27 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. 上班 (shàngbān)',0,2,@seed_questions_47,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_47 AND `order_index` <=> 2);
SET @seed_answers_183 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_47 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. 流程 (liúchéng)',0,2,@seed_questions_59,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_59 AND `order_index` <=> 2);
SET @seed_answers_231 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_59 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. 介绍 (jièshào)',0,3,@seed_questions_62,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_62 AND `order_index` <=> 3);
SET @seed_answers_244 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_62 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT '经理 là nhân viên thực thi trực tiếp, còn 主管 là người đứng đầu toàn bộ tập đoàn.',0,1,@seed_questions_15,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_15 AND `order_index` <=> 1);
SET @seed_answers_54 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_15 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. Ngày cuối cùng',0,1,@seed_questions_57,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_57 AND `order_index` <=> 1);
SET @seed_answers_222 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_57 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. 我 (wǒ)',0,1,@seed_questions_51,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_51 AND `order_index` <=> 1);
SET @seed_answers_198 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_51 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. 欢迎 (huānyíng)',0,4,@seed_questions_79,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_79 AND `order_index` <=> 4);
SET @seed_answers_313 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_79 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. jiějué fāngàn',0,2,@seed_questions_37,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_37 AND `order_index` <=> 2);
SET @seed_answers_143 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_37 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. 困难 (kùnnán)',0,4,@seed_questions_67,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_67 AND `order_index` <=> 4);
SET @seed_answers_265 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_67 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. 努力',0,3,@seed_questions_72,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_72 AND `order_index` <=> 3);
SET @seed_answers_284 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_72 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. Nhà máy sản xuất',0,1,@seed_questions_25,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_25 AND `order_index` <=> 1);
SET @seed_answers_94 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_25 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. Hợp tác',0,3,@seed_questions_24,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_24 AND `order_index` <=> 3);
SET @seed_answers_92 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_24 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. Ngày làm việc',0,2,@seed_questions_57,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_57 AND `order_index` <=> 2);
SET @seed_answers_223 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_57 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. 销售员 (xiāoshòuyuán)',1,2,@seed_questions_18,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_18 AND `order_index` <=> 2);
SET @seed_answers_67 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_18 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. 很高兴见到 (hěn gāoxìng jiàndào)',1,3,@seed_questions_45,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_45 AND `order_index` <=> 3);
SET @seed_answers_176 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_45 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT '可以扫码吗？',0,4,@seed_questions_96,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_96 AND `order_index` <=> 4);
SET @seed_answers_381 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_96 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. 上班 (shàngbān) / 公司 (gōngsī)',0,3,@seed_questions_42,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_42 AND `order_index` <=> 3);
SET @seed_answers_164 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_42 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. 没关系 (méiguānxi)',0,4,@seed_questions_77,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_77 AND `order_index` <=> 4);
SET @seed_answers_305 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_77 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. 学习平台 (xuéxí píngtái)',0,4,@seed_questions_36,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_36 AND `order_index` <=> 4);
SET @seed_answers_141 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_36 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT '职员 (zhíyuán)',0,1,@seed_questions_5,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_5 AND `order_index` <=> 1);
SET @seed_answers_14 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_5 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. 客户 (kèhù)',1,4,@seed_questions_21,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_21 AND `order_index` <=> 4);
SET @seed_answers_81 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_21 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. 谢谢大家 (xièxie dàjiā)',0,2,@seed_questions_77,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_77 AND `order_index` <=> 2);
SET @seed_answers_303 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_77 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'Ông Lý là nhân viên bộ phận kinh doanh.',0,2,@seed_questions_2,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_2 AND `order_index` <=> 2);
SET @seed_answers_5 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_2 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'Trong khách sạn',0,4,@seed_questions_95,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_95 AND `order_index` <=> 4);
SET @seed_answers_377 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_95 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT '要热的还是冰的？',0,3,@seed_questions_96,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_96 AND `order_index` <=> 3);
SET @seed_answers_380 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_96 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'Bạn muốn loại nóng hay loại lạnh?',1,2,@seed_questions_90,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_90 AND `order_index` <=> 2);
SET @seed_answers_355 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_90 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. Dịch vụ chăm sóc',0,1,@seed_questions_39,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_39 AND `order_index` <=> 1);
SET @seed_answers_150 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_39 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. 流程 (liúchéng)',1,2,@seed_questions_61,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_61 AND `order_index` <=> 2);
SET @seed_answers_239 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_61 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. 服务 (fúwù)',0,2,@seed_questions_33,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_33 AND `order_index` <=> 2);
SET @seed_answers_127 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_33 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. 叫 (jiào)',1,1,@seed_questions_17,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_17 AND `order_index` <=> 1);
SET @seed_answers_62 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_17 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. 尽管',0,2,@seed_questions_72,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_72 AND `order_index` <=> 2);
SET @seed_answers_283 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_72 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. 叫 (jiào)',0,1,@seed_questions_20,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_20 AND `order_index` <=> 1);
SET @seed_answers_74 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_20 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. 困难 (kùnnán)',0,1,@seed_questions_61,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_61 AND `order_index` <=> 1);
SET @seed_answers_238 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_61 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. 工作 (gōngzuò)',0,4,@seed_questions_74,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_74 AND `order_index` <=> 4);
SET @seed_answers_293 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_74 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. Rén gōng zhìnéng',0,3,@seed_questions_23,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_23 AND `order_index` <=> 3);
SET @seed_answers_88 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_23 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. Giám đốc điều hành',0,1,@seed_questions_26,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_26 AND `order_index` <=> 1);
SET @seed_answers_98 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_26 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT '一共多少钱？',0,2,@seed_questions_96,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_96 AND `order_index` <=> 2);
SET @seed_answers_379 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_96 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. 来自 (láizì)',0,3,@seed_questions_35,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_35 AND `order_index` <=> 3);
SET @seed_answers_136 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_35 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. huānyǐng | Tiết mục văn nghệ',0,2,@seed_questions_56,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_56 AND `order_index` <=> 2);
SET @seed_answers_219 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_56 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. 负责 (fùzé)',0,4,@seed_questions_19,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_19 AND `order_index` <=> 4);
SET @seed_answers_73 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_19 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. 叫 (jiào)',0,4,@seed_questions_34,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_34 AND `order_index` <=> 4);
SET @seed_answers_133 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_34 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. 很快 (hěn kuài)',0,1,@seed_questions_81,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_81 AND `order_index` <=> 1);
SET @seed_answers_318 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_81 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. 我是前台 (Wǒ shì qiántái)',0,3,@seed_questions_46,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_46 AND `order_index` <=> 3);
SET @seed_answers_180 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_46 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'Bạn muốn mấy cốc trà?',0,3,@seed_questions_90,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_90 AND `order_index` <=> 3);
SET @seed_answers_356 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_90 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. 好 (hǎo)',1,1,@seed_questions_73,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_73 AND `order_index` <=> 1);
SET @seed_answers_286 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_73 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT '职务部 (zhíwù bù)',0,3,@seed_questions_6,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_6 AND `order_index` <=> 3);
SET @seed_answers_20 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_6 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. 负责 (fùzé)',1,3,@seed_questions_20,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_20 AND `order_index` <=> 3);
SET @seed_answers_76 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_20 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT '负责 (fùzé)',0,2,@seed_questions_7,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_7 AND `order_index` <=> 2);
SET @seed_answers_23 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_7 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. 正常 (zhèngcháng)',0,1,@seed_questions_79,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_79 AND `order_index` <=> 1);
SET @seed_answers_310 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_79 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. Thành lập',0,3,@seed_questions_40,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_40 AND `order_index` <=> 3);
SET @seed_answers_156 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_40 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. 多多指导 (duōduō zhǐdǎo)',0,3,@seed_questions_77,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_77 AND `order_index` <=> 3);
SET @seed_answers_304 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_77 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. 规章 (guīzhāng)',0,4,@seed_questions_59,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_59 AND `order_index` <=> 4);
SET @seed_answers_233 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_59 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. 专门 (zhuānmén)',1,2,@seed_questions_34,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_34 AND `order_index` <=> 2);
SET @seed_answers_131 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_34 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. 麻烦 (máfan)',1,3,@seed_questions_79,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_79 AND `order_index` <=> 3);
SET @seed_answers_312 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_79 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. qǐng zuò',1,3,@seed_questions_69,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_69 AND `order_index` <=> 3);
SET @seed_answers_272 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_69 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. 担任 (dānrèn)',0,3,@seed_questions_19,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_19 AND `order_index` <=> 3);
SET @seed_answers_72 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_19 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. lènshǐ',0,4,@seed_questions_84,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_84 AND `order_index` <=> 4);
SET @seed_answers_333 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_84 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. 节奏 (jiézòu)',0,2,@seed_questions_80,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_80 AND `order_index` <=> 2);
SET @seed_answers_315 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_80 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. 加入 (jiārù)',0,1,@seed_questions_47,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_47 AND `order_index` <=> 1);
SET @seed_answers_182 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_47 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'Tài liệu hợp đồng bản cứng',0,3,@seed_questions_16,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_16 AND `order_index` <=> 3);
SET @seed_answers_60 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_16 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT '名字 (míngzi)',0,4,@seed_questions_7,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_7 AND `order_index` <=> 4);
SET @seed_answers_25 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_7 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT '20 tệ',0,2,@seed_questions_91,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_91 AND `order_index` <=> 2);
SET @seed_answers_359 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_91 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. 大家好 (dàjiā hǎo)',1,2,@seed_questions_78,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_78 AND `order_index` <=> 2);
SET @seed_answers_307 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_78 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT '职务 (zhíwù)',0,2,@seed_questions_10,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_10 AND `order_index` <=> 2);
SET @seed_answers_35 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_10 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. 是 (shì)',0,2,@seed_questions_17,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_17 AND `order_index` <=> 2);
SET @seed_answers_63 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_17 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. 来 (lái)',0,3,@seed_questions_73,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_73 AND `order_index` <=> 3);
SET @seed_answers_288 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_73 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. 服务 (fúwù)',0,2,@seed_questions_28,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_28 AND `order_index` <=> 2);
SET @seed_answers_107 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_28 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. rènshi',1,1,@seed_questions_84,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_84 AND `order_index` <=> 1);
SET @seed_answers_330 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_84 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. 公司 (gōngsī)',0,1,@seed_questions_58,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_58 AND `order_index` <=> 1);
SET @seed_answers_226 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_58 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. 提供 (tígōng)',0,2,@seed_questions_32,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_32 AND `order_index` <=> 2);
SET @seed_answers_123 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_32 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT '只',0,3,@seed_questions_88,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_88 AND `order_index` <=> 3);
SET @seed_answers_348 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_88 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. 领域 (lǐngyù)',1,3,@seed_questions_28,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_28 AND `order_index` <=> 3);
SET @seed_answers_108 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_28 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. 我是老板 (Wǒ  shì lǎobǎn)',0,1,@seed_questions_46,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_46 AND `order_index` <=> 1);
SET @seed_answers_178 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_46 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. shàngbān | Đi làm, vào ca làm việc',1,2,@seed_questions_53,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_53 AND `order_index` <=> 2);
SET @seed_answers_207 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_53 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. 提供 (tígōng)',1,1,@seed_questions_35,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_35 AND `order_index` <=> 1);
SET @seed_answers_134 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_35 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. Quy định an toàn nhà xưởng',0,1,@seed_questions_83,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_83 AND `order_index` <=> 1);
SET @seed_answers_326 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_83 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. 争取 (zhēngqǔ)',0,4,@seed_questions_65,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_65 AND `order_index` <=> 4);
SET @seed_answers_257 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_65 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. 以后 (yǐhòu)',0,3,@seed_questions_81,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_81 AND `order_index` <=> 3);
SET @seed_answers_320 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_81 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. 没问题 (méi wèntí)',1,1,@seed_questions_80,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_80 AND `order_index` <=> 1);
SET @seed_answers_314 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_80 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'Phía sau',0,1,@seed_questions_95,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_95 AND `order_index` <=> 1);
SET @seed_answers_374 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_95 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT '名字部 (míngzǐ bù)',0,4,@seed_questions_6,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_6 AND `order_index` <=> 4);
SET @seed_answers_21 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_6 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. 我是学生 (Wǒ shì xuéshēng)',0,4,@seed_questions_46,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_46 AND `order_index` <=> 4);
SET @seed_answers_181 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_46 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT '职务 (zhíwù)',0,3,@seed_questions_8,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_8 AND `order_index` <=> 3);
SET @seed_answers_28 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_8 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. 介绍 (jièshào)',0,2,@seed_questions_66,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_66 AND `order_index` <=> 2);
SET @seed_answers_259 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_66 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. 我是新员工 (Wǒ shì xīn yuángōng)',1,2,@seed_questions_46,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_46 AND `order_index` <=> 2);
SET @seed_answers_179 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_46 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. 我也 (wǒ yě) / 公司 (gōngsī)',0,2,@seed_questions_43,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_43 AND `order_index` <=> 2);
SET @seed_answers_167 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_43 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT '小姐 (xiǎojiě)',1,2,@seed_questions_8,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_8 AND `order_index` <=> 2);
SET @seed_answers_27 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_8 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. 来自 (láizì)',0,3,@seed_questions_30,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_30 AND `order_index` <=> 3);
SET @seed_answers_116 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_30 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. jiějuè fāng''ān',0,4,@seed_questions_37,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_37 AND `order_index` <=> 4);
SET @seed_answers_145 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_37 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. 也很高兴 (yě hěn gāoxìng)',0,2,@seed_questions_45,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_45 AND `order_index` <=> 2);
SET @seed_answers_175 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_45 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. 来到 (láidào)',1,3,@seed_questions_47,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_47 AND `order_index` <=> 3);
SET @seed_answers_184 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_47 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. 以后 (yǐhòu)',0,4,@seed_questions_80,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_80 AND `order_index` <=> 4);
SET @seed_answers_317 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_80 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. 领域 (lǐngyù)',1,3,@seed_questions_33,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_33 AND `order_index` <=> 3);
SET @seed_answers_128 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_33 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. Nhân viên kỹ thuật',0,2,@seed_questions_26,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_26 AND `order_index` <=> 2);
SET @seed_answers_99 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_26 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. 是 (shì) / 第一天上班 (dì yī tiān shàngbān)',1,1,@seed_questions_44,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_44 AND `order_index` <=> 1);
SET @seed_answers_170 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_44 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. Réngōng zhīnén',0,2,@seed_questions_23,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_23 AND `order_index` <=> 2);
SET @seed_answers_87 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_23 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. 部门主管 (bùmén zhǔguǎn)',0,4,@seed_questions_76,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_76 AND `order_index` <=> 4);
SET @seed_answers_301 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_76 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. Lễ tân tòa nhà',0,4,@seed_questions_26,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_26 AND `order_index` <=> 4);
SET @seed_answers_101 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_26 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. Đội nhóm làm việc',0,4,@seed_questions_71,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_71 AND `order_index` <=> 4);
SET @seed_answers_281 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_71 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. 解决方案 (jiějué fāng''àn)',1,3,@seed_questions_31,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_31 AND `order_index` <=> 3);
SET @seed_answers_120 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_31 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. 昨天 (zuótiān)',0,1,@seed_questions_48,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_48 AND `order_index` <=> 1);
SET @seed_answers_186 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_48 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'Năm tệ',0,3,@seed_questions_99,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_99 AND `order_index` <=> 3);
SET @seed_answers_392 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_99 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. 工厂 (gōngchǎng)',0,2,@seed_questions_67,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_67 AND `order_index` <=> 2);
SET @seed_answers_263 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_67 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. 刚来',0,4,@seed_questions_87,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_87 AND `order_index` <=> 4);
SET @seed_answers_345 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_87 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. 同事 (tóngshì)',0,4,@seed_questions_58,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_58 AND `order_index` <=> 4);
SET @seed_answers_229 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_58 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT '你要喝什么？',0,3,@seed_questions_93,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_93 AND `order_index` <=> 3);
SET @seed_answers_368 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_93 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. 没问题 (méi wèntí)',1,3,@seed_questions_74,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_74 AND `order_index` <=> 3);
SET @seed_answers_292 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_74 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT '可以扫码吗？',1,1,@seed_questions_93,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_93 AND `order_index` <=> 1);
SET @seed_answers_366 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_93 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. 流程 (liúchéng)',0,1,@seed_questions_64,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_64 AND `order_index` <=> 1);
SET @seed_answers_250 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_64 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. 工业园区 (gōngyè yuánqū)',0,1,@seed_questions_76,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_76 AND `order_index` <=> 1);
SET @seed_answers_298 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_76 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. 慢慢 (mànman)',1,3,@seed_questions_65,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_65 AND `order_index` <=> 3);
SET @seed_answers_256 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_65 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'Rẽ trái',0,2,@seed_questions_97,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_97 AND `order_index` <=> 2);
SET @seed_answers_383 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_97 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. 困难 (kùnnán)',1,3,@seed_questions_59,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_59 AND `order_index` <=> 3);
SET @seed_answers_232 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_59 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT '一共多少钱？',0,3,@seed_questions_92,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_92 AND `order_index` <=> 3);
SET @seed_answers_364 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_92 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'Hệ thống mạng nội bộ công ty',0,4,@seed_questions_16,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_16 AND `order_index` <=> 4);
SET @seed_answers_61 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_16 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'Khoảng năm phút',1,2,@seed_questions_99,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_99 AND `order_index` <=> 2);
SET @seed_answers_391 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_99 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT '一共多少钱？',0,3,@seed_questions_98,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_98 AND `order_index` <=> 3);
SET @seed_answers_388 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_98 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'Đi thẳng năm giao lộ',0,4,@seed_questions_99,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_99 AND `order_index` <=> 4);
SET @seed_answers_393 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_99 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. Rèngōng zhǐnéng',0,4,@seed_questions_23,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_23 AND `order_index` <=> 4);
SET @seed_answers_89 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_23 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. 谢谢 (xièxie)',0,3,@seed_questions_34,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_34 AND `order_index` <=> 3);
SET @seed_answers_132 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_34 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'Tên gọi đầy đủ của một doanh nghiệp',0,3,@seed_questions_11,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_11 AND `order_index` <=> 3);
SET @seed_answers_40 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_11 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. gǎoxìng | Đau khổ',0,2,@seed_questions_54,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_54 AND `order_index` <=> 2);
SET @seed_answers_211 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_54 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'Trách nhiệm bồi thường hợp đồng',0,4,@seed_questions_11,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_11 AND `order_index` <=> 4);
SET @seed_answers_41 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_11 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. 您 (nín) / 欢迎 (huānyíng)',0,1,@seed_questions_43,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_43 AND `order_index` <=> 1);
SET @seed_answers_166 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_43 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT '称呼 (chēnghu)',0,1,@seed_questions_9,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_9 AND `order_index` <=> 1);
SET @seed_answers_30 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_9 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. 加入 (jiārù)',1,2,@seed_questions_49,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_49 AND `order_index` <=> 2);
SET @seed_answers_191 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_49 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C → A → D → B → E',0,3,@seed_questions_4,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_4 AND `order_index` <=> 3);
SET @seed_answers_12 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_4 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. 客户 (kèhù)',0,1,@seed_questions_18,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_18 AND `order_index` <=> 1);
SET @seed_answers_66 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_18 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. 别着急 (bié zhāojí)',0,3,@seed_questions_78,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_78 AND `order_index` <=> 3);
SET @seed_answers_308 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_78 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. 加入 (jiārù)',1,2,@seed_questions_63,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_63 AND `order_index` <=> 2);
SET @seed_answers_247 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_63 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. 谢谢老板 (xièxie lǎobǎn)',0,4,@seed_questions_45,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_45 AND `order_index` <=> 4);
SET @seed_answers_177 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_45 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. 努力 (nǔlì)',0,4,@seed_questions_63,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_63 AND `order_index` <=> 4);
SET @seed_answers_249 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_63 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. 职位 (zhíwèi)',0,2,@seed_questions_21,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_21 AND `order_index` <=> 2);
SET @seed_answers_79 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_21 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. jiéjué fāng''ān',0,3,@seed_questions_37,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_37 AND `order_index` <=> 3);
SET @seed_answers_144 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_37 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. 领域',0,3,@seed_questions_38,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_38 AND `order_index` <=> 3);
SET @seed_answers_148 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_38 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. Đến từ',1,1,@seed_questions_22,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_22 AND `order_index` <=> 1);
SET @seed_answers_82 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_22 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. 工作节奏 (gōngzuò jiézòu)',1,3,@seed_questions_76,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_76 AND `order_index` <=> 3);
SET @seed_answers_300 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_76 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'Ông Lý là trưởng phòng của bộ phận kỹ thuật.',1,1,@seed_questions_2,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_2 AND `order_index` <=> 1);
SET @seed_answers_4 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_2 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. 您',1,3,@seed_questions_55,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_55 AND `order_index` <=> 3);
SET @seed_answers_216 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_55 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. 刚 (gāng)',1,2,@seed_questions_81,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_81 AND `order_index` <=> 2);
SET @seed_answers_319 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_81 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. 来自 (láizì)',1,1,@seed_questions_32,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_32 AND `order_index` <=> 1);
SET @seed_answers_122 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_32 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT '名字 (míngzi)',0,3,@seed_questions_9,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_9 AND `order_index` <=> 3);
SET @seed_answers_32 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_9 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'Phía trước',1,3,@seed_questions_95,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_95 AND `order_index` <=> 3);
SET @seed_answers_376 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_95 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. kāixīn | Mở lòng',0,4,@seed_questions_54,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_54 AND `order_index` <=> 4);
SET @seed_answers_213 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_54 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT '我要两杯茶。',0,2,@seed_questions_89,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_89 AND `order_index` <=> 2);
SET @seed_answers_351 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_89 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. Khó khăn, vất vả',0,1,@seed_questions_86,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_86 AND `order_index` <=> 1);
SET @seed_answers_338 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_86 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT '称呼 (chēnghu)',0,1,@seed_questions_7,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_7 AND `order_index` <=> 1);
SET @seed_answers_22 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_7 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. 前台 (qiántái)',0,4,@seed_questions_60,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_60 AND `order_index` <=> 4);
SET @seed_answers_237 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_60 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. Trưởng bộ phận / Quản lý phòng ban',1,2,@seed_questions_68,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_68 AND `order_index` <=> 2);
SET @seed_answers_267 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_68 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'Xin hỏi anh/chị chủ yếu phụ trách công việc gì ở quý công ty?',1,1,@seed_questions_1,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_1 AND `order_index` <=> 1);
SET @seed_answers_1 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_1 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT '杯',1,1,@seed_questions_88,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_88 AND `order_index` <=> 1);
SET @seed_answers_346 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_88 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. 上班 (shàngbān)',0,2,@seed_questions_50,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_50 AND `order_index` <=> 2);
SET @seed_answers_195 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_50 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. 活动 (huódòng)',0,3,@seed_questions_27,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_27 AND `order_index` <=> 3);
SET @seed_answers_104 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_27 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. Làm việc',0,2,@seed_questions_22,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_22 AND `order_index` <=> 2);
SET @seed_answers_83 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_22 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. xiàbān | Tan làm',0,1,@seed_questions_53,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_53 AND `order_index` <=> 1);
SET @seed_answers_206 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_53 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. Giới thiệu',0,2,@seed_questions_24,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_24 AND `order_index` <=> 2);
SET @seed_answers_91 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_24 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. 公司 (gōngsī)',0,1,@seed_questions_21,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_21 AND `order_index` <=> 1);
SET @seed_answers_78 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_21 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. 销售 (xiāoshòu)',0,3,@seed_questions_21,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_21 AND `order_index` <=> 3);
SET @seed_answers_80 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_21 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. Khu công nghiệp',0,3,@seed_questions_71,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_71 AND `order_index` <=> 3);
SET @seed_answers_280 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_71 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. chūchāi | Đi công tác',0,4,@seed_questions_53,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_53 AND `order_index` <=> 4);
SET @seed_answers_209 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_53 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. 谢谢 (xièxie)',0,4,@seed_questions_64,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_64 AND `order_index` <=> 4);
SET @seed_answers_253 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_64 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'C. 解决方案 (jiějué fāng''àn)',1,3,@seed_questions_36,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_36 AND `order_index` <=> 3);
SET @seed_answers_140 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_36 AND `order_index` <=> 3);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. 团队 (tuánduì)',1,2,@seed_questions_58,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_58 AND `order_index` <=> 2);
SET @seed_answers_227 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_58 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. Nghiêm túc, tuân thủ',0,4,@seed_questions_86,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_86 AND `order_index` <=> 4);
SET @seed_answers_341 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_86 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. 叫 (jiào)',0,4,@seed_questions_29,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_29 AND `order_index` <=> 4);
SET @seed_answers_113 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_29 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. 介绍',1,4,@seed_questions_72,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_72 AND `order_index` <=> 4);
SET @seed_answers_285 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_72 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. 提供 (tígōng)',1,1,@seed_questions_30,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_30 AND `order_index` <=> 1);
SET @seed_answers_114 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_30 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. 老板 (lǎobǎn)',0,2,@seed_questions_60,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_60 AND `order_index` <=> 2);
SET @seed_answers_235 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_60 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A. 开始 (kāishǐ)',0,1,@seed_questions_63,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_63 AND `order_index` <=> 1);
SET @seed_answers_246 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_63 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'A → C → B → D → E',0,1,@seed_questions_4,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_4 AND `order_index` <=> 1);
SET @seed_answers_10 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_4 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT '要热的还是冰的？',0,2,@seed_questions_93,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_93 AND `order_index` <=> 2);
SET @seed_answers_367 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_93 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT '这里喝。',0,1,@seed_questions_92,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_92 AND `order_index` <=> 1);
SET @seed_answers_362 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_92 AND `order_index` <=> 1);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. língyù',0,2,@seed_questions_41,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_41 AND `order_index` <=> 2);
SET @seed_answers_159 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_41 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. qǐng lái',0,4,@seed_questions_69,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_69 AND `order_index` <=> 4);
SET @seed_answers_273 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_69 AND `order_index` <=> 4);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'B. 企业',1,2,@seed_questions_38,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_38 AND `order_index` <=> 2);
SET @seed_answers_147 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_38 AND `order_index` <=> 2);
INSERT INTO `answers` (`content`,`is_correct`,`order_index`,`question_id`,`matching_pair`)
SELECT 'D. 很 (hěn)',0,4,@seed_questions_51,NULL
WHERE NOT EXISTS (SELECT 1 FROM `answers` WHERE `question_id` <=> @seed_questions_51 AND `order_index` <=> 4);
SET @seed_answers_201 = (SELECT id FROM `answers` WHERE `question_id` <=> @seed_questions_51 AND `order_index` <=> 4);

-- assignments

-- Subscription tables remain for historical compatibility, without sale plans or fake purchases.
-- No tokens, invoices, payments, subscriptions, enrollments, learner progress or personal data.
-- Daily learning threshold configuration.
INSERT IGNORE INTO learning_analytics_settings(id,minute_thresholds) VALUES(1,'5,10,15');
COMMIT;
