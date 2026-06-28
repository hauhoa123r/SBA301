package com.app.features.courses.repository;

import com.app.features.model.CourseEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ICourseRepository extends JpaRepository<CourseEntity,Long> {
}
