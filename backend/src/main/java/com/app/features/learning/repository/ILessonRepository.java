package com.app.features.learning.repository;

import com.app.features.model.LessonEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ILessonRepository extends JpaRepository<LessonEntity, Long> {
    Optional<LessonEntity> findByIdAndChapter_CourseEntity_Id(Long lessonId, Long courseId);

    long countByChapter_Id(Long chapterId);

    long countByChapter_CourseEntity_Id(Long courseId);
}
