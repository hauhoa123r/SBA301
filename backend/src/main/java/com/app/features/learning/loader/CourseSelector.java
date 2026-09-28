package com.app.features.learning.loader;

import com.app.features.learning.dto.record.CourseSelectionResult;
import com.app.features.learning.repository.ICourseEnrollmentRepository;
import com.app.features.model.CourseEnrollmentEntity;
import com.app.features.model.CourseEntity;
import com.app.features.model.enums.CourseStatus;
import com.app.features.courses.repository.ICourseRepository;
import com.app.features.subscriptions.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class CourseSelector {

    private final ICourseEnrollmentRepository courseEnrollmentRepository;
    private final ICourseRepository courses;
    private final SubscriptionService subscriptions;

    public CourseSelectionResult select(Long userId, Long requestedCourseId) {
        log.debug("Selecting learning course, userId={}, requestedCourseId={}", userId, requestedCourseId);
        List<CourseEntity> availableCourses = subscriptions.hasActiveAccess(userId)
                ? courses.findAllByStatusOrderByCreatedAtDesc(CourseStatus.PUBLISHED)
                : loadAvailableCourses(courseEnrollmentRepository.findByUser_Id(userId));
        CourseEntity selectedCourse = findRequestedCourse(requestedCourseId, availableCourses);

        if (selectedCourse == null) {
            log.debug("Requested course unavailable; selecting fallback, userId={}, requestedCourseId={}", userId, requestedCourseId);
            selectedCourse = availableCourses.stream().findFirst().orElse(null);
        }
        log.debug("Learning course selected, userId={}, selectedCourseId={}, availableCourseCount={}",
                userId, selectedCourse != null ? selectedCourse.getId() : null, availableCourses.size());
        return new CourseSelectionResult(selectedCourse, availableCourses);
    }

    private List<CourseEntity> loadAvailableCourses(List<CourseEnrollmentEntity> enrollments) {
        return enrollments.stream().filter(CourseEnrollmentEntity::isLegacyAccess)
                .map(CourseEnrollmentEntity::getCourse)
                .filter(course -> course.getStatus() == CourseStatus.PUBLISHED).toList();
    }

    private CourseEntity findRequestedCourse(Long requestedCourseId, List<CourseEntity> availableCourses) {
        if (requestedCourseId == null) {
            return null;
        }
        return availableCourses.stream()
                .filter(course -> requestedCourseId.equals(course.getId()))
                .findFirst()
                .orElse(null);
    }
}
