-- Restore the three original courses in an existing database, including the merged catalog.
-- Keep lesson/chapter IDs, all learning payloads, historical invoices and existing enrollments.
-- Run with a client that stops on SQL errors (never --force). Any failed guard rolls back
-- when that connection closes. No permanent DDL, DELETE, or subscription-plan changes.
SET NAMES utf8mb4;
USE chinese_online_learning;
START TRANSACTION;

CREATE TEMPORARY TABLE restore_course_guard (ok INT NOT NULL CHECK (ok=1));
CREATE TEMPORARY TABLE restore_course_targets (
    code VARCHAR(20) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(15,2) NOT NULL,
    thumbnail_url VARCHAR(500) NOT NULL,
    expected_lessons INT NOT NULL,
    course_id BIGINT NULL
);
INSERT INTO restore_course_targets (code,title,description,price,thumbnail_url,expected_lessons) VALUES
('SALES','Tiếng Trung giao tiếp cho Nhân viên Sales (Cơ bản)','Học giao tiếp tiếng Trung trong môi trường làm việc: gặp lễ tân, trưởng nhóm, đồng nghiệp; giới thiệu bản thân, công ty và tìm hiểu khách hàng.',199000,'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',6),
('CAFE','Tiếng Trung tại quán cà phê','Khóa ngắn cho người mới bắt đầu: 2 bài đọc có hội thoại chữ Hán, pinyin và nghĩa tiếng Việt; 12 từ vựng, 6 mẫu câu và 6 câu trắc nghiệm. Thực hành gọi đồ uống, nói sở thích và hỏi giá. Học bằng bài đọc, không kèm video.',0,'/images/course-cafe.svg',2),
('DIRECTIONS','Tiếng Trung hỏi đường và đi lại','Khóa ngắn cho người mới bắt đầu: 2 bài đọc có hội thoại chữ Hán, pinyin và nghĩa tiếng Việt; 12 từ vựng, 6 mẫu câu và 6 câu trắc nghiệm. Luyện hỏi địa điểm, hiểu rẽ trái, rẽ phải và hỏi thời gian đi bộ. Học bằng bài đọc, không kèm video.',0,'/images/course-directions.svg',2);

-- Refuse ambiguous existing titles instead of choosing a course arbitrarily.
INSERT INTO restore_course_guard
SELECT IF(COUNT(*)=0,1,0) FROM (
    SELECT t.code FROM restore_course_targets t JOIN courses c ON c.title=t.title
    GROUP BY t.code HAVING COUNT(*)>1
) ambiguous;

SET @restore_teacher=COALESCE(
    (SELECT MIN(c.teacher_id) FROM courses c JOIN restore_course_targets t ON t.title=c.title),
    (SELECT id FROM users WHERE email='catalog-instructor@seed.invalid' AND status='LOCKED' AND password_hash='!' LIMIT 1),
    (SELECT MIN(teacher_id) FROM courses WHERE catalog_code IN ('FREE','PREMIUM')));
INSERT INTO restore_course_guard VALUES (IF(@restore_teacher IS NOT NULL,1,0));
INSERT INTO categories (name,slug,order_index)
SELECT 'Tiếng Trung giao tiếp','tieng-trung-giao-tiep',1
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug='tieng-trung-giao-tiep');
SET @restore_category=(SELECT id FROM categories WHERE slug='tieng-trung-giao-tiep');

INSERT INTO courses (teacher_id,category_id,title,description,price,thumbnail_url,status)
SELECT @restore_teacher,@restore_category,t.title,t.description,t.price,t.thumbnail_url,'PUBLISHED'
FROM restore_course_targets t WHERE NOT EXISTS (SELECT 1 FROM courses c WHERE c.title=t.title);
UPDATE restore_course_targets t JOIN courses c ON c.title=t.title SET t.course_id=c.id;
UPDATE courses c JOIN restore_course_targets t ON t.course_id=c.id
SET c.description=t.description,c.category_id=@restore_category,c.thumbnail_url=t.thumbnail_url,c.status='PUBLISHED';
-- This locked, non-login content account represents the original course author.
UPDATE users SET full_name='Phạm Linh Chi'
WHERE email='catalog-instructor@seed.invalid' AND status='LOCKED' AND password_hash='!';

CREATE TEMPORARY TABLE restore_course_chapters (
    code VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    order_index INT NOT NULL,
    chapter_id BIGINT NULL,
    target_course_id BIGINT NULL
);
INSERT INTO restore_course_chapters (code,title,order_index) VALUES
('SALES','Làm quen với môi trường làm việc',1),
('SALES','Giới thiệu bản thân với khách hàng',2),
('SALES','Thu thập thông tin khách hàng',3),
('CAFE','Gọi đồ uống và thanh toán',1),
('DIRECTIONS','Tìm địa điểm và hiểu chỉ dẫn',1);
UPDATE restore_course_chapters m JOIN restore_course_targets t ON t.code=m.code
SET m.target_course_id=t.course_id;

-- Exactly one original chapter must exist, either already separate or in a merged course.
INSERT INTO restore_course_guard
SELECT IF(COUNT(*)=0,1,0) FROM (
    SELECT m.code,m.title FROM restore_course_chapters m
    LEFT JOIN chapters ch ON ch.title=m.title
        AND (ch.course_id=m.target_course_id OR ch.course_id IN (
            SELECT id FROM courses WHERE catalog_code IN ('FREE','PREMIUM')))
    GROUP BY m.code,m.title HAVING COUNT(ch.id)<>1
) ambiguous;
UPDATE restore_course_chapters m JOIN chapters ch ON ch.title=m.title
JOIN courses c ON c.id=ch.course_id
SET m.chapter_id=ch.id
WHERE ch.course_id=m.target_course_id OR c.catalog_code IN ('FREE','PREMIUM');

-- Guard target order uniqueness before moving an existing chapter.
INSERT INTO restore_course_guard
SELECT IF(COUNT(*)=0,1,0) FROM restore_course_chapters m JOIN chapters ch
ON ch.course_id=m.target_course_id AND ch.order_index=m.order_index AND ch.id<>m.chapter_id;
UPDATE chapters ch JOIN restore_course_chapters m ON m.chapter_id=ch.id
SET ch.course_id=m.target_course_id,ch.order_index=m.order_index;
UPDATE quizzes q JOIN lessons l ON l.id=q.lesson_id JOIN restore_course_chapters m ON m.chapter_id=l.chapter_id
JOIN courses old ON old.id=q.course_id
SET q.course_id=m.target_course_id WHERE old.catalog_code IN ('FREE','PREMIUM');
UPDATE quizzes q JOIN restore_course_chapters m ON m.chapter_id=q.chapter_id
JOIN courses old ON old.id=q.course_id
SET q.course_id=m.target_course_id WHERE old.catalog_code IN ('FREE','PREMIUM');

-- Keep original enrollment rows, and carry their progress/ownership to the restored courses.
INSERT INTO course_enrollments (user_id,course_id,enrolled_at,legacy_access)
SELECT e.user_id,t.course_id,MIN(e.enrolled_at),MAX(e.legacy_access)
FROM course_enrollments e JOIN courses c ON c.id=e.course_id AND c.catalog_code='PREMIUM'
CROSS JOIN restore_course_targets t GROUP BY e.user_id,t.course_id
ON DUPLICATE KEY UPDATE legacy_access=IF(VALUES(legacy_access),TRUE,course_enrollments.legacy_access);
-- A paid historical Premium invoice also proves ownership even if its old enrollment is missing.
INSERT INTO course_enrollments (user_id,course_id,enrolled_at,legacy_access)
SELECT i.user_id,t.course_id,MIN(i.created_at),TRUE
FROM invoices i JOIN courses c ON c.id=i.course_id AND c.catalog_code='PREMIUM'
CROSS JOIN restore_course_targets t WHERE i.status='PAID' GROUP BY i.user_id,t.course_id
ON DUPLICATE KEY UPDATE legacy_access=TRUE;

-- Preserve the retired synthetic courses and their introductory lessons for historical references.
UPDATE courses SET status='DRAFT' WHERE catalog_code IN ('FREE','PREMIUM') AND status='PUBLISHED';

INSERT INTO restore_course_guard
SELECT IF(COUNT(*)=0,1,0) FROM (
    SELECT t.code FROM restore_course_targets t LEFT JOIN chapters ch ON ch.course_id=t.course_id
    LEFT JOIN lessons l ON l.chapter_id=ch.id
    GROUP BY t.code,t.expected_lessons HAVING COUNT(l.id)<>t.expected_lessons
) unexpected_content;

DROP TEMPORARY TABLE restore_course_chapters;
DROP TEMPORARY TABLE restore_course_targets;
DROP TEMPORARY TABLE restore_course_guard;
COMMIT;
