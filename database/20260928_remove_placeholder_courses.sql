-- Giữ các bài học đã có nội dung thực tế, loại bỏ dữ liệu khóa học mẫu.
-- Chỉ xét các khóa seed ID 2..8 không có video nào ngoài URL mẫu.
-- Khóa đã được bổ sung video thực tế sẽ được giữ lại.
-- Chạy trên database hiện có; không cần import lại schema hoặc seed.
-- Nếu có lỗi, dừng thực thi và ROLLBACK trước khi thử lại.
USE chinese_online_learning;
SET NAMES utf8mb4;

DROP TEMPORARY TABLE IF EXISTS cleanup_course_ids;
DROP TEMPORARY TABLE IF EXISTS cleanup_lesson_ids;
DROP TEMPORARY TABLE IF EXISTS cleanup_quiz_ids;
CREATE TEMPORARY TABLE cleanup_course_ids (id BIGINT PRIMARY KEY);
CREATE TEMPORARY TABLE cleanup_lesson_ids (id BIGINT PRIMARY KEY);
CREATE TEMPORARY TABLE cleanup_quiz_ids (id BIGINT PRIMARY KEY);

START TRANSACTION;

INSERT INTO cleanup_course_ids (id)
SELECT c.id FROM courses c
WHERE c.id BETWEEN 2 AND 8
  AND NOT EXISTS (
      SELECT 1 FROM chapters ch JOIN lessons l ON l.chapter_id = ch.id
      WHERE ch.course_id = c.id
        AND NULLIF(TRIM(l.video_url), '') IS NOT NULL
        AND l.video_url NOT LIKE 'https://cdn.chineselearning.vn/%'
  );

INSERT INTO cleanup_lesson_ids (id)
SELECT l.id FROM lessons l
JOIN chapters ch ON ch.id = l.chapter_id
LEFT JOIN cleanup_course_ids removed ON removed.id = ch.course_id
WHERE removed.id IS NOT NULL
   OR (ch.course_id = 1 AND l.id = 6
       AND l.video_url LIKE 'https://cdn.chineselearning.vn/%'
       AND NOT EXISTS (SELECT 1 FROM vocabularies v WHERE v.lesson_id = l.id)
       AND NOT EXISTS (SELECT 1 FROM sentence_patterns s WHERE s.lesson_id = l.id));

INSERT INTO cleanup_quiz_ids (id)
SELECT DISTINCT q.id FROM quizzes q
LEFT JOIN chapters ch ON ch.id = q.chapter_id
LEFT JOIN cleanup_course_ids rc ON rc.id = q.course_id OR rc.id = ch.course_id
LEFT JOIN cleanup_lesson_ids rl ON rl.id = q.lesson_id
WHERE rc.id IS NOT NULL OR rl.id IS NOT NULL;

-- Báo cáo dùng tham chiếu đa hình nên cần dọn trước khi xóa bản ghi đích.
DELETE r FROM reports r JOIN cleanup_course_ids rc ON rc.id = r.target_id
WHERE r.target_type = 'COURSE';
DELETE r FROM reports r
JOIN course_reviews cr ON cr.id = r.target_id
JOIN cleanup_course_ids rc ON rc.id = cr.course_id
WHERE r.target_type = 'REVIEW';
DELETE r FROM reports r
JOIN lesson_qa qa ON qa.id = r.target_id
JOIN cleanup_lesson_ids rl ON rl.id = qa.lesson_id
WHERE r.target_type = 'COMMENT';

-- Xóa quiz trước bài/chương vì các liên kết này dùng ON DELETE SET NULL.
DELETE FROM quizzes WHERE id IN (SELECT id FROM cleanup_quiz_ids);
-- Xóa hóa đơn mẫu trước khóa học; payments/refunds được xóa theo CASCADE.
DELETE FROM invoices WHERE course_id IN (SELECT id FROM cleanup_course_ids);

-- Tài liệu/bài tập cũ của khóa Sales vẫn trỏ đến tệp mẫu không có nội dung thật.
DELETE FROM lesson_documents
WHERE id IN (1, 2) AND lesson_id IN (1, 2)
  AND file_url LIKE 'https://cdn.chineselearning.vn/%';
DELETE FROM assignments
WHERE id = 1 AND lesson_id = 2
  AND attachment_url LIKE 'https://cdn.chineselearning.vn/%';

DELETE FROM lessons WHERE id IN (SELECT id FROM cleanup_lesson_ids);
DELETE FROM courses WHERE id IN (SELECT id FROM cleanup_course_ids);

UPDATE courses
SET description = 'Học giao tiếp tiếng Trung trong môi trường làm việc: gặp lễ tân, trưởng nhóm, đồng nghiệp; giới thiệu bản thân, công ty và tìm hiểu khách hàng.'
WHERE id = 1 AND BINARY description = BINARY 'Học chào hỏi, giới thiệu bản thân, hỏi đường và các mẫu câu hằng ngày.';

COMMIT;

DROP TEMPORARY TABLE cleanup_quiz_ids;
DROP TEMPORARY TABLE cleanup_lesson_ids;
DROP TEMPORARY TABLE cleanup_course_ids;
