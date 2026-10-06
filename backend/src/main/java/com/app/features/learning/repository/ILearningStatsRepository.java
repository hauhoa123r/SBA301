package com.app.features.learning.repository;

import com.app.features.model.CourseEntity;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ILearningStatsRepository extends Repository<CourseEntity, Long> {

    @Query(value = """
        SELECT COALESCE(ROUND(SUM(best.score * points.total / 100)), 0)
        FROM quizzes q LEFT JOIN lessons l ON l.id = q.lesson_id
        JOIN chapters c ON c.id = COALESCE(l.chapter_id, q.chapter_id)
        JOIN (SELECT quiz_id, MAX(score) score FROM quiz_attempts
              WHERE user_id = :userId AND is_passed = 1 GROUP BY quiz_id) best ON best.quiz_id = q.id
        JOIN (SELECT quiz_id, SUM(COALESCE(points, 10)) total FROM questions GROUP BY quiz_id) points ON points.quiz_id = q.id
        WHERE c.course_id = :courseId
        """, nativeQuery = true)
    long sumEarnedQuizQuestionPoints(@Param("userId") Long userId, @Param("courseId") Long courseId);

    @Query("""
            SELECT COUNT(lesson)
            FROM LessonEntity lesson
            WHERE lesson.chapter.courseEntity.id = :courseId
            """)
    long countLessons(@Param("courseId") Long courseId);

    @Query("""
            SELECT COUNT(DISTINCT quiz.id)
            FROM QuizEntity quiz
            LEFT JOIN quiz.chapter chapter
            LEFT JOIN chapter.courseEntity chapterCourse
            LEFT JOIN quiz.lessonEntity lesson
            LEFT JOIN lesson.chapter lessonChapter
            LEFT JOIN lessonChapter.courseEntity lessonCourse
            WHERE lessonCourse.id = :courseId OR (lesson.id IS NULL AND chapterCourse.id = :courseId)
            """)
    long countQuizzes(@Param("courseId") Long courseId);

    @Query("""
            SELECT COUNT(assignment)
            FROM AssignmentEntity assignment
            WHERE assignment.lesson.chapter.courseEntity.id = :courseId
            """)
    long countAssignments(@Param("courseId") Long courseId);

    @Query("""
            SELECT COUNT(progress)
            FROM LessonProgressEntity progress
            WHERE progress.user.id = :userId
              AND progress.lesson.chapter.courseEntity.id = :courseId
              AND progress.isCompleted = true
            """)
    long countCompletedLessons(@Param("userId") Long userId, @Param("courseId") Long courseId);

    @Query("""
            SELECT COUNT(DISTINCT submission.assignment.id)
            FROM AssignmentSubmissionEntity submission
            WHERE submission.user.id = :userId
              AND submission.assignment.lesson.chapter.courseEntity.id = :courseId
              AND submission.status <> com.app.features.model.enums.AssignmentSubmissionStatus.NEEDS_REVISION
            """)
    long countAssignmentSubmissions(@Param("userId") Long userId, @Param("courseId") Long courseId);

    @Query("""
            SELECT MAX(attempt.score)
            FROM QuizAttemptEntity attempt
            JOIN attempt.quiz quiz
            LEFT JOIN quiz.lessonEntity lesson
            LEFT JOIN lesson.chapter lessonChapter
            LEFT JOIN quiz.chapter chapter
            WHERE attempt.user.id = :userId
              AND (lessonChapter.courseEntity.id = :courseId OR (lesson.id IS NULL AND chapter.courseEntity.id = :courseId))
              AND attempt.isPassed = true
            GROUP BY attempt.quiz.id
            """)
    List<Integer> findHighestPassedQuizScores(@Param("userId") Long userId, @Param("courseId") Long courseId);

    @Query("""
            SELECT COALESCE(SUM(COALESCE(question.points, 10)), 0)
            FROM QuestionEntity question
            JOIN question.quizEntity quiz
            LEFT JOIN quiz.chapter chapter
            LEFT JOIN chapter.courseEntity chapterCourse
            LEFT JOIN quiz.lessonEntity lesson
            LEFT JOIN lesson.chapter lessonChapter
            LEFT JOIN lessonChapter.courseEntity lessonCourse
            WHERE lessonCourse.id = :courseId OR (lesson.id IS NULL AND chapterCourse.id = :courseId)
            """)
    long sumQuizQuestionPoints(@Param("courseId") Long courseId);
}
