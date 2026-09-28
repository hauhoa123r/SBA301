package com.app.features.subscriptions;

import com.app.exception.AccessDeniedException;
import com.app.exception.ResourceNotFoundException;
import com.app.features.courses.repository.ICourseRepository;
import com.app.features.learning.repository.ICourseEnrollmentRepository;
import com.app.features.learning.service.CourseAccessService;
import com.app.features.model.CourseEnrollmentEntity;
import com.app.features.model.enums.CourseStatus;
import com.app.features.subscriptions.service.SubscriptionService;
import org.junit.jupiter.api.Test;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CourseAccessServiceTest {
    private final SubscriptionService subscriptions=mock(SubscriptionService.class);
    private final ICourseRepository courses=mock(ICourseRepository.class);
    private final ICourseEnrollmentRepository enrollments=mock(ICourseEnrollmentRepository.class);
    private final CourseAccessService access=new CourseAccessService(subscriptions,courses,enrollments);

    @Test
    void activeSubscriptionAccessesNewCourseWithoutEnrollment() {
        when(courses.existsByIdAndStatus(99L,CourseStatus.PUBLISHED)).thenReturn(true);
        when(subscriptions.hasActiveAccess(7L)).thenReturn(true);
        assertDoesNotThrow(()->access.requireAccess(7L,99L));
        verifyNoInteractions(enrollments);
    }

    @Test
    void savedProgressDoesNotBypassExpiredSubscription() {
        when(courses.existsByIdAndStatus(1L,CourseStatus.PUBLISHED)).thenReturn(true);
        when(enrollments.findByUser_IdAndCourse_Id(7L,1L)).thenReturn(Optional.of(new CourseEnrollmentEntity()));
        assertThrows(AccessDeniedException.class,()->access.requireAccess(7L,1L));
    }

    @Test
    void historicalPurchaseRemainsAccessible() {
        when(courses.existsByIdAndStatus(1L,CourseStatus.PUBLISHED)).thenReturn(true);
        CourseEnrollmentEntity enrollment=new CourseEnrollmentEntity(); enrollment.setLegacyAccess(true);
        when(enrollments.findByUser_IdAndCourse_Id(7L,1L)).thenReturn(Optional.of(enrollment));
        assertDoesNotThrow(()->access.requireAccess(7L,1L));
    }

    @Test
    void subscriptionCannotAccessUnpublishedCourse() {
        assertThrows(ResourceNotFoundException.class,()->access.requireAccess(7L,99L));
        verifyNoInteractions(subscriptions,enrollments);
    }
}
