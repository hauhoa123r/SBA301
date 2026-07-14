package com.app.features.learning.repository;

import com.app.features.model.QuizAttemptEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IQuizAttemptRepository extends JpaRepository<QuizAttemptEntity, Long> {
    @Query("SELECT qa FROM QuizAttemptEntity qa " +
           "WHERE qa.user.id = :userId " +
           "AND (qa.quiz.lessonEntity.chapter.courseEntity.id = :courseId " +
           "     OR qa.quiz.chapter.courseEntity.id = :courseId) " +
           "AND qa.isPassed = true")
    List<QuizAttemptEntity> findPassedAttemptsByCourse(@Param("userId") Long userId, @Param("courseId") Long courseId);
}
