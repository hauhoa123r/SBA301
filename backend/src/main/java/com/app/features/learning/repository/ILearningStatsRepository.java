package com.app.features.learning.repository;

import com.app.features.model.CourseEntity;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ILearningStatsRepository extends Repository<CourseEntity, Long> {

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
            WHERE chapterCourse.id = :courseId OR lessonCourse.id = :courseId
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
            SELECT COUNT(submission)
            FROM AssignmentSubmissionEntity submission
            WHERE submission.user.id = :userId
              AND submission.assignment.lesson.chapter.courseEntity.id = :courseId
            """)
    long countAssignmentSubmissions(@Param("userId") Long userId, @Param("courseId") Long courseId);

    @Query("""
            SELECT MAX(attempt.score)
            FROM QuizAttemptEntity attempt
            WHERE attempt.user.id = :userId
              AND (attempt.quiz.lessonEntity.chapter.courseEntity.id = :courseId OR attempt.quiz.chapter.courseEntity.id = :courseId)
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
            WHERE chapterCourse.id = :courseId OR lessonCourse.id = :courseId
            """)
    long sumQuizQuestionPoints(@Param("courseId") Long courseId);
}
