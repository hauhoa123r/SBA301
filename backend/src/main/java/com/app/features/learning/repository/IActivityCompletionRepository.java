package com.app.features.learning.repository;

import com.app.features.model.CourseEntity;
import org.springframework.data.repository.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface IActivityCompletionRepository extends Repository<CourseEntity, Long> {
    interface Counts { long getTotal(); long getCompleted(); }

    @Query(value = """
        SELECT COUNT(*) AS total, COALESCE(SUM(activity.done), 0) AS completed FROM (
            SELECT IF(lp.is_completed = 1, 1, 0) AS done
            FROM lessons l JOIN chapters c ON c.id = l.chapter_id
            LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.user_id = :userId
            WHERE c.course_id = :courseId AND (:chapterId IS NULL OR c.id = :chapterId)
            UNION ALL
            SELECT IF(EXISTS(SELECT 1 FROM quiz_attempts qa WHERE qa.quiz_id = q.id
                AND qa.user_id = :userId AND qa.is_passed = 1), 1, 0) AS done
            FROM quizzes q LEFT JOIN lessons l ON l.id = q.lesson_id
            JOIN chapters c ON c.id = COALESCE(l.chapter_id, q.chapter_id)
            WHERE c.course_id = :courseId AND (:chapterId IS NULL OR c.id = :chapterId)
            UNION ALL
            SELECT IF(EXISTS(SELECT 1 FROM assignment_submissions s WHERE s.assignment_id = a.id
                AND s.user_id = :userId AND s.status <> 'NEEDS_REVISION'
                AND s.id = (SELECT MAX(latest.id) FROM assignment_submissions latest
                    WHERE latest.assignment_id = a.id AND latest.user_id = :userId)), 1, 0) AS done
            FROM assignments a JOIN lessons l ON l.id = a.lesson_id JOIN chapters c ON c.id = l.chapter_id
            WHERE c.course_id = :courseId AND (:chapterId IS NULL OR c.id = :chapterId)
        ) activity
        """, nativeQuery = true)
    Counts countActivities(@Param("userId") Long userId, @Param("courseId") Long courseId,
                           @Param("chapterId") Long chapterId);
}
