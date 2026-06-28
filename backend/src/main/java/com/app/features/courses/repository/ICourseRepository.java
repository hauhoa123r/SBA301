package com.app.features.courses.repository;

import com.app.features.model.CourseEntity;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ICourseRepository extends JpaRepository<CourseEntity,Long> {
    @Override
    @EntityGraph(attributePaths = {"teacher", "category"})
    List<CourseEntity> findAll();

    @Override
    @EntityGraph(attributePaths = {"teacher", "category", "plans", "courseEnrollments", "chapterEntities"})
    Optional<CourseEntity> findById(Long id);
}
