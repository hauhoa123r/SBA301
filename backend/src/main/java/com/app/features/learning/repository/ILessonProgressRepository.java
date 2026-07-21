package com.app.features.learning.repository;

import com.app.features.model.LessonProgressEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ILessonProgressRepository extends JpaRepository<LessonProgressEntity, Long> {
    Optional<LessonProgressEntity> findByUser_IdAndLesson_Id(Long userId, Long lessonId);

    long countByUser_IdAndLesson_Chapter_IdAndIsCompletedTrue(Long userId, Long chapterId);

    long countByUser_IdAndLesson_Chapter_CourseEntity_IdAndIsCompletedTrue(Long userId, Long courseId);

    @Query("""
            SELECT progress.lesson.id
            FROM LessonProgressEntity progress
            WHERE progress.user.id = :userId
              AND progress.lesson.chapter.courseEntity.id = :courseId
              AND progress.isCompleted = true
            ORDER BY progress.lesson.chapter.orderIndex, progress.lesson.orderIndex
            """)
    List<Long> findCompletedLessonIds(@Param("userId") Long userId, @Param("courseId") Long courseId);
}
