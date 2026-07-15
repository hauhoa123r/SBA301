package com.app.features.learning.loader;

import com.app.features.courses.repository.ICourseRepository;
import com.app.features.learning.dto.record.CourseSelectionResult;
import com.app.features.learning.repository.ICourseEnrollmentRepository;
import com.app.features.model.CourseEnrollmentEntity;
import com.app.features.model.CourseEntity;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class CourseSelector {

    private final ICourseRepository courseRepository;
    private final ICourseEnrollmentRepository courseEnrollmentRepository;

    public CourseSelectionResult select(Long userId, Long requestedCourseId) {
        log.debug("Selecting learning course, userId={}, requestedCourseId={}", userId, requestedCourseId);
        List<CourseEnrollmentEntity> enrollments = courseEnrollmentRepository.findByUser_Id(userId);
        List<CourseEntity> availableCourses = loadAvailableCourses(enrollments);
        CourseEntity selectedCourse = findRequestedCourse(requestedCourseId);

        if (selectedCourse == null) {
            log.debug("Requested course unavailable; selecting fallback, userId={}, requestedCourseId={}", userId, requestedCourseId);
            selectedCourse = findFallbackCourse(enrollments, availableCourses);
        }
        if (selectedCourse == null) {
            log.warn("No course available for learning statistics, userId={}", userId);
            throw new IllegalArgumentException("No courses available to calculate statistics.");
        }
        log.debug("Learning course selected, userId={}, selectedCourseId={}, availableCourseCount={}", userId, selectedCourse.getId(), availableCourses.size());
        return new CourseSelectionResult(selectedCourse, availableCourses);
    }

    private List<CourseEntity> loadAvailableCourses(List<CourseEnrollmentEntity> enrollments) {
        if (enrollments.isEmpty()) {
            return courseRepository.findAll();
        }
        return enrollments.stream().map(CourseEnrollmentEntity::getCourse).toList();
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
