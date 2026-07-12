package com.app.features.learning.repository;

import com.app.features.model.CourseEnrollmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ICourseEnrollmentRepository extends JpaRepository<CourseEnrollmentEntity, Long> {
    List<CourseEnrollmentEntity> findByUser_Id(Long userId);
    Optional<CourseEnrollmentEntity> findByUser_IdAndCourse_Id(Long userId, Long courseId);
}
