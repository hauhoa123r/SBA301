package com.app.features.learning.repository;

import com.app.features.model.QuizEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface IQuizLearningRepository extends JpaRepository<QuizEntity, Long> {
    @Query("select q from QuizEntity q left join q.lessonEntity l left join l.chapter lc left join q.chapter c where q.id = :id and (lc.courseEntity.id = :courseId or (l.id is null and c.courseEntity.id = :courseId))")
    Optional<QuizEntity> findInCourse(@Param("id") Long id, @Param("courseId") Long courseId);
}
