package com.app.schema;

import com.app.features.courses.repository.ICourseRepository;
import com.app.features.learning.service.CourseAccessService;
import com.app.features.model.*;
import com.app.features.subscriptions.service.SubscriptionService;
import com.app.features.subscriptions.SubscriptionConfiguration;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/** Exercises the actual consolidated seed with production access services on private MySQL. */
@DataJpaTest(showSql = false, properties = "spring.jpa.hibernate.ddl-auto=validate")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@EnabledIfEnvironmentVariable(named = "RUN_FRESH_SCHEMA_TESTS", matches = "true")
@Import({CourseAccessService.class, SubscriptionService.class, SubscriptionConfiguration.class})
class FreshCatalogMySqlTest {
    @Autowired EntityManager em;
    @Autowired ICourseRepository courses;
    @Autowired CourseAccessService access;
    @Autowired SubscriptionService subscriptions;

    @Test
    void realSeedProvidesSubscriptionAccessAndPreservesLegacyPurchases() {
        var published = courses.findAllByStatusOrderByCreatedAtDesc(com.app.features.model.enums.CourseStatus.PUBLISHED);
        assertEquals(3, published.size());
        assertEquals(2, subscriptions.listPlans().size());
        assertEquals(0, subscriptions.requirePlan("PREMIUM").getPrice().compareTo(new BigDecimal("99000")));
        assertEquals(3, subscriptions.requirePlan("FREE_TRIAL").getDurationDays());
        assertEquals(30, subscriptions.requirePlan("PREMIUM").getDurationDays());
        UserEntity learner = new UserEntity();
        learner.setFullName("Private subscription regression");
        learner.setEmail(UUID.randomUUID() + "@example.test");
        learner.setPasswordHash("unused-test-hash");
        em.persist(learner); em.flush();
        for (CourseEntity course : published)
            assertThrows(com.app.exception.AccessDeniedException.class, () -> access.requireAccess(learner.getId(), course.getId()));
        assertTrue(subscriptions.startTrial(learner.getId()).active());
        for (CourseEntity course : published)
            assertDoesNotThrow(() -> access.requireAccess(learner.getId(), course.getId()));
        CourseEnrollmentEntity progress = access.ensureProgressEnrollment(learner.getId(), published.get(0).getId());
        assertFalse(progress.isLegacyAccess());
        var trial = em.find(UserSubscriptionEntity.class, learner.getId());
        trial.setStartedAt(Instant.now().minus(4, ChronoUnit.DAYS));
        trial.setExpiresAt(Instant.now().minus(1, ChronoUnit.DAYS));
        em.flush();
        assertThrows(com.app.exception.AccessDeniedException.class, () -> access.requireAccess(learner.getId(), published.get(0).getId()));
        // Historical purchases remain permanent; a progress enrollment alone does not grant access.
        progress.setLegacyAccess(true); em.flush();
        assertDoesNotThrow(() -> access.requireAccess(learner.getId(), published.get(0).getId()));
    }
}
