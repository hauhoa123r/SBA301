package com.app.features.learning.service.model;

import com.app.features.model.CourseEntity;

import java.util.List;

public record CourseSelectionResult(CourseEntity selectedCourse, List<CourseEntity> availableCourses) {
}
