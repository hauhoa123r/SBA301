package com.app.features.learning.loader;

import com.app.features.learning.dto.record.CourseSelectionResult;
import com.app.features.learning.repository.ICourseEnrollmentRepository;
import com.app.features.model.CourseEnrollmentEntity;
import com.app.features.model.CourseEntity;
import com.app.features.model.enums.CourseStatus;
import com.app.features.courses.repository.ICourseRepository;
import com.app.features.subscriptions.service.SubscriptionService;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class CourseSelectorTest {

    private final ICourseEnrollmentRepository courseEnrollmentRepository = mock(ICourseEnrollmentRepository.class);
    private final ICourseRepository courses = mock(ICourseRepository.class);
    private final SubscriptionService subscriptions = mock(SubscriptionService.class);
    private final CourseSelector selector = new CourseSelector(courseEnrollmentRepository, courses, subscriptions);

    @Test
    void selectUsesValidRequestedCourse() {
        CourseEntity requestedCourse = course(2L);
        when(courseEnrollmentRepository.findByUser_Id(10L)).thenReturn(List.of(enrollment(requestedCourse)));

        CourseSelectionResult result = selector.select(10L, 2L);

        assertSame(requestedCourse, result.selectedCourse());
        assertEquals(List.of(requestedCourse), result.availableCourses());
    }

    @Test
    void selectFallsBackToFirstEnrollmentWhenRequestedCourseIsInvalid() {
        CourseEntity firstCourse = course(1L);
        CourseEntity secondCourse = course(2L);
        when(courseEnrollmentRepository.findByUser_Id(10L)).thenReturn(List.of(enrollment(firstCourse), enrollment(secondCourse)));

        CourseSelectionResult result = selector.select(10L, 99L);

        assertSame(firstCourse, result.selectedCourse());
        assertEquals(List.of(firstCourse, secondCourse), result.availableCourses());
    }

    @Test
    void selectReturnsNoCoursesWhenUserHasNoEnrollments() {
        when(courseEnrollmentRepository.findByUser_Id(10L)).thenReturn(List.of());

        CourseSelectionResult result = selector.select(10L, null);

        assertNull(result.selectedCourse());
        assertEquals(List.of(), result.availableCourses());
    }

    private CourseEntity course(Long id) {
        CourseEntity course = new CourseEntity();
        course.setId(id);
        course.setStatus(CourseStatus.PUBLISHED);
        return course;
    }

    private CourseEnrollmentEntity enrollment(CourseEntity course) {
        CourseEnrollmentEntity enrollment = new CourseEnrollmentEntity();
        enrollment.setCourse(course);
        enrollment.setLegacyAccess(true);
        return enrollment;
    }

    @Test
    void activeSubscriptionIncludesPublishedCoursesWithoutIndividualEnrollment() {
        CourseEntity newCourse = course(99L);
        when(subscriptions.hasActiveAccess(10L)).thenReturn(true);
        when(courses.findAllByStatusOrderByCreatedAtDesc(CourseStatus.PUBLISHED)).thenReturn(List.of(newCourse));
        assertEquals(List.of(newCourse), selector.select(10L, 99L).availableCourses());
    }
}
