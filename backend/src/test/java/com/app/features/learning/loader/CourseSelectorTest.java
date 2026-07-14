package com.app.features.learning.loader;

import com.app.features.courses.repository.ICourseRepository;
import com.app.features.learning.dto.record.CourseSelectionResult;
import com.app.features.learning.repository.ICourseEnrollmentRepository;
import com.app.features.model.CourseEnrollmentEntity;
import com.app.features.model.CourseEntity;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class CourseSelectorTest {

    private final ICourseRepository courseRepository = mock(ICourseRepository.class);
    private final ICourseEnrollmentRepository courseEnrollmentRepository = mock(ICourseEnrollmentRepository.class);
    private final CourseSelector selector = new CourseSelector(courseRepository, courseEnrollmentRepository);

    @Test
    void selectUsesValidRequestedCourse() {
        CourseEntity enrolledCourse = course(1L);
        CourseEntity requestedCourse = course(2L);
        when(courseEnrollmentRepository.findByUser_Id(10L)).thenReturn(List.of(enrollment(enrolledCourse)));
        when(courseRepository.findById(2L)).thenReturn(Optional.of(requestedCourse));

        CourseSelectionResult result = selector.select(10L, 2L);

        assertSame(requestedCourse, result.selectedCourse());
        assertEquals(List.of(enrolledCourse), result.availableCourses());
        verify(courseRepository, never()).findAll();
    }

    @Test
    void selectFallsBackToFirstEnrollmentWhenRequestedCourseIsInvalid() {
        CourseEntity firstCourse = course(1L);
        CourseEntity secondCourse = course(2L);
        when(courseEnrollmentRepository.findByUser_Id(10L)).thenReturn(List.of(enrollment(firstCourse), enrollment(secondCourse)));
        when(courseRepository.findById(99L)).thenReturn(Optional.empty());

        CourseSelectionResult result = selector.select(10L, 99L);

        assertSame(firstCourse, result.selectedCourse());
        assertEquals(List.of(firstCourse, secondCourse), result.availableCourses());
        verify(courseRepository, never()).findAll();
    }

    @Test
    void selectFallsBackToFirstAvailableCourseWhenUserHasNoEnrollments() {
        CourseEntity firstCourse = course(1L);
        CourseEntity secondCourse = course(2L);
        when(courseEnrollmentRepository.findByUser_Id(10L)).thenReturn(List.of());
        when(courseRepository.findAll()).thenReturn(List.of(firstCourse, secondCourse));
        when(courseRepository.findById(1L)).thenReturn(Optional.of(firstCourse));

        CourseSelectionResult result = selector.select(10L, null);

        assertSame(firstCourse, result.selectedCourse());
        assertEquals(List.of(firstCourse, secondCourse), result.availableCourses());
        verify(courseRepository).findById(1L);
    }

    @Test
    void selectThrowsWhenNoCoursesAreAvailable() {
        when(courseEnrollmentRepository.findByUser_Id(10L)).thenReturn(List.of());
        when(courseRepository.findAll()).thenReturn(List.of());

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> selector.select(10L, null));

        assertEquals("No courses available to calculate statistics.", exception.getMessage());
        verify(courseRepository, never()).findById(anyLong());
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
