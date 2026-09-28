package com.app.features.learning.service;

import com.app.exception.AccessDeniedException;
import com.app.exception.ResourceNotFoundException;
import com.app.features.courses.repository.ICourseRepository;
import com.app.features.learning.repository.ICourseEnrollmentRepository;
import com.app.features.model.CourseEnrollmentEntity;
import com.app.features.model.enums.CourseStatus;
import com.app.features.subscriptions.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class CourseAccessService {
    private final SubscriptionService subscriptions;
    private final ICourseRepository courses;
    private final ICourseEnrollmentRepository enrollments;

    @Transactional(readOnly = true)
    public void requireAccess(Long userId, Long courseId) {
        if (!courses.existsByIdAndStatus(courseId, CourseStatus.PUBLISHED)) {
            throw new ResourceNotFoundException("Khóa học không tồn tại hoặc chưa được xuất bản.");
        }
        if (subscriptions.hasActiveAccess(userId)) return;
        if (enrollments.findByUser_IdAndCourse_Id(userId, courseId)
                .map(CourseEnrollmentEntity::isLegacyAccess).orElse(false)) return;
        throw new AccessDeniedException("Gói học chưa được kích hoạt hoặc đã hết hạn. Vui lòng đăng ký gói để tiếp tục.");
    }

    @Transactional
    public CourseEnrollmentEntity ensureProgressEnrollment(Long userId, Long courseId) {
        requireAccess(userId, courseId);
        enrollments.insertIfAbsent(userId, courseId, Instant.now());
        return enrollments.findByUser_IdAndCourse_Id(userId, courseId).orElseThrow();
    }
}
