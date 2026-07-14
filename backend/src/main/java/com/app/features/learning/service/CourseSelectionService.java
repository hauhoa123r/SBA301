package com.app.features.learning.service;

import com.app.features.courses.repository.ICourseRepository;
import com.app.features.learning.repository.ICourseEnrollmentRepository;
import com.app.features.learning.service.model.CourseSelectionResult;
import com.app.features.model.CourseEnrollmentEntity;
import com.app.features.model.CourseEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class CourseSelectionService {

    private final ICourseRepository courseRepository;
    private final ICourseEnrollmentRepository courseEnrollmentRepository;

    public CourseSelectionResult select(Long userId, Long requestedCourseId) {
        List<CourseEnrollmentEntity> enrollments = courseEnrollmentRepository.findByUser_Id(userId);
        List<CourseEntity> availableCourses = loadAvailableCourses(enrollments);
        CourseEntity selectedCourse = findRequestedCourse(requestedCourseId);

        if (selectedCourse == null) {
            selectedCourse = findFallbackCourse(enrollments, availableCourses);
        }
        if (selectedCourse == null) {
            throw new IllegalArgumentException("No courses available to calculate statistics.");
        }
        return new CourseSelectionResult(selectedCourse, availableCourses);
    }

    private List<CourseEntity> loadAvailableCourses(List<CourseEnrollmentEntity> enrollments) {
        if (enrollments.isEmpty()) {
            return courseRepository.findAll();
        }
        return enrollments.stream().map(CourseEnrollmentEntity::getCourse).collect(Collectors.toList());
    }

    private CourseEntity findRequestedCourse(Long requestedCourseId) {
        return requestedCourseId == null ? null : courseRepository.findById(requestedCourseId).orElse(null);
    }

    private CourseEntity findFallbackCourse(List<CourseEnrollmentEntity> enrollments, List<CourseEntity> availableCourses) {
        if (!enrollments.isEmpty()) {
            return enrollments.get(0).getCourse();
        }
        if (availableCourses.isEmpty()) {
            return null;
        }
        return courseRepository.findById(availableCourses.get(0).getId()).orElse(null);
    }
}
