package com.app.features.learning.repository;

import com.app.features.model.AssignmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface IAssignmentLearningRepository extends JpaRepository<AssignmentEntity, Long> {
    Optional<AssignmentEntity> findByIdAndLesson_Chapter_CourseEntity_Id(Long id, Long courseId);
}
