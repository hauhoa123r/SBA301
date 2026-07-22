package com.app.features.learning.repository;

import com.app.features.model.CourseEnrollmentEntity;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ICourseEnrollmentRepository extends JpaRepository<CourseEnrollmentEntity, Long> {
    @EntityGraph(attributePaths = "course")
    List<CourseEnrollmentEntity> findByUser_Id(Long userId);

    Optional<CourseEnrollmentEntity> findByUser_IdAndCourse_Id(Long userId, Long courseId);

    boolean existsByUser_IdAndCourse_Id(Long userId, Long id);
}
