package com.app.features.learning.repository;

import com.app.features.model.LessonProgressEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ILessonProgressRepository extends JpaRepository<LessonProgressEntity, Long> {
    @Query("SELECT COUNT(lp) FROM LessonProgressEntity lp WHERE lp.user.id = :userId AND lp.lesson.chapter.courseEntity.id = :courseId AND lp.isCompleted = true")
    long countCompletedLessons(@Param("userId") Long userId, @Param("courseId") Long courseId);
}
