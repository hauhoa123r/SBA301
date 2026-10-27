-- MySQL 8, additive and idempotent. Run AFTER the existing migrations, before the new backend.
-- Never import the destructive fresh-install schema into an existing database.
-- Historical courses, subscriptions, invoices, coupons and progress are left intact.
USE chinese_online_learning;
SET NAMES utf8mb4;

SET @course_purchase_ddl = IF(EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='courses' AND column_name='catalog_code'),
 'SELECT 1', 'ALTER TABLE courses ADD COLUMN catalog_code VARCHAR(30) NULL, ADD UNIQUE KEY uk_course_catalog_code (catalog_code)');
PREPARE course_purchase_stmt FROM @course_purchase_ddl;
EXECUTE course_purchase_stmt;
DEALLOCATE PREPARE course_purchase_stmt;
SET @course_purchase_ddl = IF(EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='lessons' AND column_name='published'),
 'SELECT 1', 'ALTER TABLE lessons ADD COLUMN published BOOLEAN NOT NULL DEFAULT TRUE');
PREPARE course_purchase_stmt FROM @course_purchase_ddl;
EXECUTE course_purchase_stmt;
DEALLOCATE PREPARE course_purchase_stmt;
SET @course_purchase_ddl = IF(EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='course_enrollments' AND column_name='purchased_at'),
 'SELECT 1', 'ALTER TABLE course_enrollments ADD COLUMN purchased_at TIMESTAMP NULL');
PREPARE course_purchase_stmt FROM @course_purchase_ddl;
EXECUTE course_purchase_stmt;
DEALLOCATE PREPARE course_purchase_stmt;
ALTER TABLE invoices MODIFY COLUMN status ENUM('PENDING','PAID','FAILED','CANCELLED','REFUNDED','EXPIRED') NOT NULL DEFAULT 'PENDING';
ALTER TABLE payments MODIFY COLUMN status ENUM('CREATED','SUCCESS','FAILED','CANCELLED','EXPIRED') NOT NULL;

START TRANSACTION;
-- Preserve old ownership even if an enrollment was missed by the old callback.
INSERT INTO course_enrollments (user_id, course_id, enrolled_at, legacy_access, purchased_at)
SELECT user_id, course_id, MIN(created_at), TRUE, MIN(created_at)
FROM invoices WHERE status='PAID' AND course_id IS NOT NULL GROUP BY user_id, course_id
ON DUPLICATE KEY UPDATE legacy_access=TRUE, purchased_at=COALESCE(course_enrollments.purchased_at, VALUES(purchased_at));

-- Do not alter user_subscriptions: existing access continues until its original expiry.
UPDATE subscription_plans SET active=FALSE WHERE code IN ('FREE_TRIAL','STANDARD','PREMIUM');
SET @catalog_teacher = COALESCE(
 (SELECT MIN(ur.user_id) FROM user_roles ur JOIN roles r ON r.id=ur.role_id WHERE r.name='INSTRUCTOR'),
 (SELECT MIN(id) FROM users));
-- A teacher must already exist; an empty installation must seed its users first.
CREATE TEMPORARY TABLE course_purchase_prerequisite (ok INT CHECK(ok=1));
INSERT INTO course_purchase_prerequisite VALUES (IF(@catalog_teacher IS NULL,0,1));
DROP TEMPORARY TABLE course_purchase_prerequisite;

INSERT INTO courses (teacher_id,title,description,price,status,catalog_code,thumbnail_url)
VALUES (@catalog_teacher,'Tiếng Trung cơ bản — Miễn phí','Ba bài học nhập môn, học miễn phí và không giới hạn thời gian.',0,'PUBLISHED','FREE','/images/logo-removebg-preview.png'),
 (@catalog_teacher,'Tiếng Trung thực hành — Premium','Học thử ba bài đầu. Mua một lần 99.000đ để mở khóa toàn bộ khóa học vĩnh viễn.',99000,'PUBLISHED','PREMIUM','/images/logo-removebg-preview.png')
ON DUPLICATE KEY UPDATE price=VALUES(price);

INSERT INTO chapters (course_id,title,order_index)
SELECT courses.id,'Bắt đầu học tiếng Trung',1 FROM courses WHERE catalog_code IN ('FREE','PREMIUM')
ON DUPLICATE KEY UPDATE id=chapters.id;
INSERT INTO lessons (chapter_id,title,content,duration_seconds,order_index,published)
SELECT ch.id, seed.title, seed.content,600,seed.position,TRUE
FROM chapters ch JOIN courses c ON c.id=ch.course_id
JOIN (
 SELECT 1 AS position,'Chào hỏi và làm quen' AS title,'你好！Nǐ hǎo! — Xin chào!\n您好！Nín hǎo! — Xin chào lịch sự.\n我叫安。Wǒ jiào Ān. — Tôi tên là An.\n你叫什么名字？Nǐ jiào shénme míngzi? — Bạn tên là gì?\nThực hành: tự giới thiệu và chào một người bạn.' AS content
 UNION ALL SELECT 2,'Giới thiệu bản thân','我是越南人。Wǒ shì Yuènán rén. — Tôi là người Việt Nam.\n我学习中文。Wǒ xuéxí Zhōngwén. — Tôi học tiếng Trung.\n很高兴认识你。Hěn gāoxìng rènshi nǐ. — Rất vui được biết bạn.\nThực hành: ghép ba câu giới thiệu tên, quốc tịch và việc học.'
 UNION ALL SELECT 3,'Số đếm và thời gian','一、二、三、四、五：yī, èr, sān, sì, wǔ.\n现在几点？Xiànzài jǐ diǎn? — Bây giờ mấy giờ?\n现在九点。Xiànzài jiǔ diǎn. — Bây giờ là chín giờ.\nThực hành: đọc số từ một đến năm và nói giờ bắt đầu học.'
 UNION ALL SELECT 4,'Gọi đồ uống tại quán cà phê','我要一杯咖啡。Wǒ yào yì bēi kāfēi. — Tôi muốn một cốc cà phê.\n不要糖。Bú yào táng. — Không đường.\n多少钱？Duōshao qián? — Bao nhiêu tiền?\nThực hành: đóng vai khách hàng và gọi đồ uống theo sở thích.'
 UNION ALL SELECT 5,'Hỏi đường và đi lại','请问，地铁站在哪里？Qǐngwèn, dìtiězhàn zài nǎlǐ? — Xin hỏi ga tàu điện ở đâu?\n一直走，然后左转。Yìzhí zǒu, ránhòu zuǒ zhuǎn. — Đi thẳng rồi rẽ trái.\nThực hành: chỉ đường từ nhà đến một địa điểm gần bạn.'
 UNION ALL SELECT 6,'Hội thoại mua sắm','我想看看这件。Wǒ xiǎng kànkan zhè jiàn. — Tôi muốn xem món này.\n可以便宜一点吗？Kěyǐ piányi yìdiǎn ma? — Có thể rẻ hơn một chút không?\n谢谢，我买了。Xièxie, wǒ mǎi le. — Cảm ơn, tôi mua.\nThực hành: hỏi giá, chọn một món đồ và kết thúc cuộc hội thoại.'
) seed ON seed.position <= IF(c.catalog_code='FREE',3,6)
WHERE c.catalog_code IN ('FREE','PREMIUM') AND ch.order_index=1
ON DUPLICATE KEY UPDATE id=lessons.id;
COMMIT;
