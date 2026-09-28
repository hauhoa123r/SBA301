package com.app.features.subscriptions;

import com.app.exception.AccessDeniedException;
import com.app.features.learning.service.CourseAccessService;
import com.app.features.model.*;
import com.app.features.model.enums.CourseStatus;
import com.app.features.subscriptions.service.SubscriptionService;
import com.app.features.subscriptions.repository.UserSubscriptionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.context.annotation.Import;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest(properties = {"spring.jpa.hibernate.ddl-auto=none", "spring.jpa.show-sql=false"}, showSql = false)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import({SubscriptionService.class, SubscriptionConfiguration.class, CourseAccessService.class})
@EnabledIfEnvironmentVariable(named = "RUN_MYSQL_INTEGRATION_TESTS", matches = "true")
class SubscriptionIntegrationTest {
    @Autowired TestEntityManager em;
    @Autowired SubscriptionService service;
    @Autowired CourseAccessService access;
    @Autowired UserSubscriptionRepository subscriptions;

    @Test
    void trialPersistsAndProgressEnrollmentDoesNotKeepAccessAfterExpiry() {
        UserEntity user = user();
        CourseEntity course = course(user);
        Long userId = user.getId(), courseId = course.getId();
        assertFalse(service.hasActiveAccess(userId));
        assertTrue(service.startTrial(userId).active());
        em.flush(); em.clear();
        assertTrue(service.hasActiveAccess(userId));
        assertFalse(access.ensureProgressEnrollment(userId, courseId).isLegacyAccess());
        em.flush(); em.clear();
        UserSubscriptionEntity subscription = subscriptions.findById(userId).orElseThrow();
        subscription.setStartedAt(Instant.now().minus(4, ChronoUnit.DAYS));
        subscription.setExpiresAt(Instant.now().minus(1, ChronoUnit.DAYS));
        em.flush(); em.clear();
        assertFalse(service.status(userId).trialAvailable());
        assertThrows(AccessDeniedException.class, () -> access.requireAccess(userId, courseId));
    }

    @Test
    void paidSubscriptionPersistsRenewalAndIncludesCoursePublishedLater() {
        UserEntity user = user();
        InvoiceEntity invoice = new InvoiceEntity();
        invoice.setUser(user);
        invoice.setSubscriptionPlanCode("STANDARD");
        invoice.setSubscriptionDurationDays(30);
        service.activatePaidInvoice(invoice);
        em.flush(); em.clear();
        Instant firstExpiry = service.status(user.getId()).expiresAt();
        invoice.setSubscriptionPlanCode("PREMIUM");
        service.activatePaidInvoice(invoice);
        em.flush(); em.clear();
        assertEquals(firstExpiry.plus(30, ChronoUnit.DAYS), service.status(user.getId()).expiresAt());
        CourseEntity laterCourse = course(em.find(UserEntity.class, user.getId()));
        assertDoesNotThrow(() -> access.requireAccess(user.getId(), laterCourse.getId()));
    }

    private UserEntity user() {
        UserEntity user = new UserEntity();
        user.setFullName("Subscription test fixture");
        user.setEmail("subscription-" + UUID.randomUUID() + "@example.test");
        user.setPasswordHash("unused-test-hash");
        return em.persistAndFlush(user);
    }

    private CourseEntity course(UserEntity teacher) {
        CourseEntity course = new CourseEntity();
        course.setTeacher(teacher);
        course.setTitle("Subscription test course");
        course.setStatus(CourseStatus.PUBLISHED);
        return em.persistAndFlush(course);
    }
}
