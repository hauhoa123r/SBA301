package com.app.features.learning.loader;

import com.app.features.learning.dto.record.CourseSelectionResult;
import com.app.features.learning.repository.ICourseEnrollmentRepository;
import com.app.features.model.CourseEnrollmentEntity;
import com.app.features.model.CourseEntity;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class CourseSelectorTest {

    private final ICourseEnrollmentRepository courseEnrollmentRepository = mock(ICourseEnrollmentRepository.class);
    private final CourseSelector selector = new CourseSelector(courseEnrollmentRepository);

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
        return course;
    }

    private CourseEnrollmentEntity enrollment(CourseEntity course) {
        CourseEnrollmentEntity enrollment = new CourseEnrollmentEntity();
        enrollment.setCourse(course);
        return enrollment;
    }
}
