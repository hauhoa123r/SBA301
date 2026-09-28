package com.app.features.subscriptions.service;

import com.app.exception.BadRequestException;
import com.app.exception.ResourceNotFoundException;
import com.app.features.learning.repository.ICourseEnrollmentRepository;
import com.app.features.model.*;
import com.app.features.model.enums.CourseStatus;
import com.app.features.payments.repository.PaymentUserRepository;
import com.app.features.subscriptions.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Clock;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SubscriptionService {
    public static final String FREE_TRIAL = "FREE_TRIAL";
    private final SubscriptionPlanRepository plans;
    private final UserSubscriptionRepository subscriptions;
    private final PaymentUserRepository users;
    private final ICourseEnrollmentRepository enrollments;
    private final Clock clock;

    public record Status(boolean active, String planCode, Instant expiresAt,
                         boolean trialAvailable, List<Long> legacyCourseIds) {}

    public List<SubscriptionPlanEntity> listPlans() {
        return plans.findByActiveTrueOrderByPriceAsc();
    }

    public SubscriptionPlanEntity requirePlan(String code) {
        return plans.findByCodeAndActiveTrue(code)
                .orElseThrow(() -> new BadRequestException("Gói đăng ký không hợp lệ hoặc đã ngừng cung cấp."));
    }

    public boolean hasActiveAccess(Long userId) {
        return subscriptions.findById(userId).map(this::isActive).orElse(false);
    }

    public Status status(Long userId) {
        UserSubscriptionEntity subscription = subscriptions.findById(userId).orElse(null);
        List<Long> legacyCourses = enrollments.findByUser_Id(userId).stream()
                .filter(CourseEnrollmentEntity::isLegacyAccess)
                .map(CourseEnrollmentEntity::getCourse)
                .filter(course -> course.getStatus() == CourseStatus.PUBLISHED)
                .map(CourseEntity::getId).toList();
        return new Status(subscription != null && isActive(subscription),
                subscription == null ? null : subscription.getPlanCode(),
                subscription == null ? null : subscription.getExpiresAt(),
                subscription == null, legacyCourses);
    }

    @Transactional
    public Status startTrial(Long userId) {
        lockUser(userId);
        // Locking the user also serializes first-time requests when no subscription exists yet.
        if (subscriptions.findByUserIdForUpdate(userId).isPresent()) {
            throw new BadRequestException("Bạn đã sử dụng quyền học thử hoặc đã đăng ký gói trả phí.");
        }
        SubscriptionPlanEntity plan = requirePlan(FREE_TRIAL);
        Instant now = clock.instant();
        UserSubscriptionEntity subscription = new UserSubscriptionEntity();
        subscription.setUserId(userId);
        subscription.setPlanCode(plan.getCode());
        subscription.setStartedAt(now);
        subscription.setExpiresAt(now.plus(plan.getDurationDays(), ChronoUnit.DAYS));
        subscription.setTrialUsed(true);
        subscriptions.save(subscription);
        return status(userId);
    }

    // Called only by the verified-payment handler, under its invoice lock.
    @Transactional
    public void activatePaidInvoice(InvoiceEntity invoice) {
        if (invoice.getSubscriptionPlanCode() == null || invoice.getSubscriptionDurationDays() == null
                || invoice.getSubscriptionDurationDays() <= 0 || FREE_TRIAL.equals(invoice.getSubscriptionPlanCode())) {
            throw new BadRequestException("Hóa đơn gói đăng ký không hợp lệ.");
        }
        Long userId = invoice.getUser().getId();
        lockUser(userId);
        UserSubscriptionEntity subscription = subscriptions.findByUserIdForUpdate(userId).orElseGet(() -> {
            UserSubscriptionEntity created = new UserSubscriptionEntity();
            created.setUserId(userId);
            return created;
        });
        Instant now = clock.instant();
        boolean extend = subscription.getExpiresAt() != null && subscription.getExpiresAt().isAfter(now)
                && !FREE_TRIAL.equals(subscription.getPlanCode());
        Instant base = extend ? subscription.getExpiresAt() : now;
        if (!extend) subscription.setStartedAt(now);
        subscription.setPlanCode(invoice.getSubscriptionPlanCode());
        subscription.setExpiresAt(base.plus(invoice.getSubscriptionDurationDays(), ChronoUnit.DAYS));
        subscription.setTrialUsed(true);
        subscriptions.save(subscription);
    }

    private boolean isActive(UserSubscriptionEntity subscription) {
        Instant now = clock.instant();
        return !subscription.getStartedAt().isAfter(now) && subscription.getExpiresAt().isAfter(now);
    }

    private void lockUser(Long userId) {
        users.findByIdForUpdate(userId).orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
    }
}
