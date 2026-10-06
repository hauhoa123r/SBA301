-- Re-runnable migration. Keep existing lesson/quiz/assignment records.
USE chinese_online_learning;

SET @learning_ddl = IF(EXISTS(SELECT 1 FROM information_schema.columns
  WHERE table_schema = DATABASE() AND table_name = 'lesson_progress' AND column_name = 'position_seconds'),
  'SELECT 1', 'ALTER TABLE lesson_progress ADD COLUMN position_seconds INT NOT NULL DEFAULT 0');
PREPARE learning_stmt FROM @learning_ddl;
EXECUTE learning_stmt;
DEALLOCATE PREPARE learning_stmt;

CREATE TABLE IF NOT EXISTS learning_activity_daily (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  activity_date DATE NOT NULL,
  watch_seconds BIGINT NOT NULL DEFAULT 0,
  activity_count BIGINT NOT NULL DEFAULT 0,
  CONSTRAINT uk_learning_activity_day UNIQUE (user_id, activity_date),
  CONSTRAINT fk_learning_activity_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @learning_ddl = IF(EXISTS(SELECT 1 FROM information_schema.statistics
  WHERE table_schema = DATABASE() AND table_name = 'quiz_attempts' AND index_name = 'idx_learning_attempt_user_quiz'),
  'SELECT 1', 'CREATE INDEX idx_learning_attempt_user_quiz ON quiz_attempts(user_id, quiz_id, is_passed, id)');
PREPARE learning_stmt FROM @learning_ddl;
EXECUTE learning_stmt;
DEALLOCATE PREPARE learning_stmt;

-- Remove legacy lesson-only completion when a required quiz/assignment remains.
-- Do not invent a completion time for historical activities or erase their results.
UPDATE course_enrollments e SET completed_at = NULL
WHERE completed_at IS NOT NULL AND (
  (NOT EXISTS(SELECT 1 FROM lessons l JOIN chapters c ON c.id = l.chapter_id WHERE c.course_id = e.course_id)
    AND NOT EXISTS(SELECT 1 FROM quizzes q JOIN chapters c ON c.id = q.chapter_id WHERE c.course_id = e.course_id))
  OR EXISTS(SELECT 1 FROM lessons l JOIN chapters c ON c.id = l.chapter_id
    WHERE c.course_id = e.course_id AND NOT EXISTS(SELECT 1 FROM lesson_progress p
      WHERE p.user_id = e.user_id AND p.lesson_id = l.id AND p.is_completed = 1))
  OR EXISTS(SELECT 1 FROM quizzes q LEFT JOIN lessons l ON l.id = q.lesson_id
    JOIN chapters c ON c.id = COALESCE(l.chapter_id, q.chapter_id)
    WHERE c.course_id = e.course_id AND NOT EXISTS(SELECT 1 FROM quiz_attempts a
      WHERE a.user_id = e.user_id AND a.quiz_id = q.id AND a.is_passed = 1))
  OR EXISTS(SELECT 1 FROM assignments a JOIN lessons l ON l.id = a.lesson_id JOIN chapters c ON c.id = l.chapter_id
    WHERE c.course_id = e.course_id AND NOT EXISTS(SELECT 1 FROM assignment_submissions s
      WHERE s.user_id = e.user_id AND s.assignment_id = a.id AND s.status <> 'NEEDS_REVISION'))
);

UPDATE user_chapter_progress p SET is_completed = 0, completed_at = NULL
WHERE is_completed = 1 AND (
  EXISTS(SELECT 1 FROM lessons l WHERE l.chapter_id = p.chapter_id AND NOT EXISTS(
    SELECT 1 FROM lesson_progress lp WHERE lp.user_id = p.user_id AND lp.lesson_id = l.id AND lp.is_completed = 1))
  OR EXISTS(SELECT 1 FROM quizzes q LEFT JOIN lessons l ON l.id = q.lesson_id
    WHERE COALESCE(l.chapter_id, q.chapter_id) = p.chapter_id AND NOT EXISTS(
      SELECT 1 FROM quiz_attempts a WHERE a.user_id = p.user_id AND a.quiz_id = q.id AND a.is_passed = 1))
  OR EXISTS(SELECT 1 FROM assignments a JOIN lessons l ON l.id = a.lesson_id
    WHERE l.chapter_id = p.chapter_id AND NOT EXISTS(SELECT 1 FROM assignment_submissions s
      WHERE s.user_id = p.user_id AND s.assignment_id = a.id AND s.status <> 'NEEDS_REVISION'))
);
