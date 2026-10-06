package com.app.features.admin;

import com.app.exception.*;
import com.app.features.admin.dto.StudentManagement.*;
import com.app.features.admin.repository.*;
import com.app.features.admin.service.StudentManagementService;
import com.app.features.auth.repository.RoleRepository;
import com.app.features.auth.repository.UserRepository;
import com.app.features.learning.service.CourseAccessService;
import com.app.features.model.*;
import com.app.features.model.enums.*;
import com.app.features.subscriptions.service.SubscriptionService;
import com.app.features.subscriptions.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.*;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.*;
import java.math.BigDecimal;
import java.time.*;
import java.time.temporal.ChronoUnit;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest(properties = {"spring.jpa.hibernate.ddl-auto=none", "spring.jpa.show-sql=false"}, showSql = false)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@EnabledIfEnvironmentVariable(named = "RUN_MYSQL_INTEGRATION_TESTS", matches = "true")
@Import({StudentManagementService.class, StudentManagementRepository.class, AdminAuditRepository.class,
    SubscriptionService.class, CourseAccessService.class, StudentManagementIntegrationTest.Config.class})
class StudentManagementIntegrationTest {
    @TestConfiguration static class Config {
        @Bean Clock clock() { return Clock.fixed(Instant.parse("2026-10-06T07:00:00Z"), ZoneOffset.UTC); }
        @Bean ObjectMapper mapper() { return new ObjectMapper().findAndRegisterModules(); }
    }
    @Autowired TestEntityManager em;
    @Autowired StudentManagementService management;
    @Autowired SubscriptionService subscriptions;
    @Autowired UserSubscriptionRepository userSubscriptions;
    @Autowired SubscriptionPlanRepository plans;
    @Autowired RoleRepository roles;
    @Autowired UserRepository users;
    @Autowired CourseAccessService access;
    @Autowired Clock clock;
    private Long studentId;
    private String code;
    private AuditContext actor;

    @BeforeEach void fixture() {
        var admin = user("ADMIN"); var student = user("STUDENT"); studentId = student.getId();
        actor = new AuditContext(admin.getId(), "POST", "", "127.0.0.1", "Regression test");
        code = "TEST_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
        var plan = new SubscriptionPlanEntity(); plan.setCode(code); plan.setName("Management fixture");
        plan.setPrice(BigDecimal.valueOf(99000)); plan.setDurationDays(30); em.persistAndFlush(plan);
    }
    @Test void grantRenewReplaceAndRevokePersistWithHistoryAndNoInvoices() {
        var initial = management.grant(studentId, grant(30, "EXTEND"), actor);
        assertEquals("ACTIVE", initial.student().subscription().state());
        Instant firstExpiry = clock.instant().plus(30, ChronoUnit.DAYS);
        assertEquals(firstExpiry, initial.student().subscription().expiresAt());
        assertEquals(firstExpiry.plus(10, ChronoUnit.DAYS), management.grant(studentId, grant(10, "EXTEND"), actor).student().subscription().expiresAt());
        assertEquals(clock.instant().plus(5, ChronoUnit.DAYS), management.grant(studentId, grant(5, "REPLACE"), actor).student().subscription().expiresAt());
        em.flush(); em.clear(); assertTrue(subscriptions.hasActiveAccess(studentId));
        var revoked = management.revoke(studentId, new ReasonRequest("Request from student"), actor);
        assertEquals("EXPIRED", revoked.student().subscription().state());
        assertEquals(4, revoked.history().size()); assertTrue(revoked.history().get(0).afterData().contains("Request from student"));
        em.flush(); em.clear(); assertFalse(subscriptions.hasActiveAccess(studentId));
        assertFalse(subscriptions.status(studentId).trialAvailable());
        assertThrows(BadRequestException.class, () -> subscriptions.startTrial(studentId));
        assertEquals(0L, ((Number) em.getEntityManager().createNativeQuery("SELECT COUNT(*) FROM invoices WHERE user_id = :id").setParameter("id", studentId).getSingleResult()).longValue());
    }
    @Test void immediateRevocationPreservesCourseProgressAndLegacyAccess() {
        var teacher = user("ADMIN");
        var course = new CourseEntity(); course.setTeacher(teacher); course.setTitle("Admin managed access"); course.setStatus(CourseStatus.PUBLISHED); em.persistAndFlush(course);
        var enrollment = new CourseEnrollmentEntity(); enrollment.setUser(em.find(UserEntity.class, studentId)); enrollment.setCourse(course);
        enrollment.setEnrolledAt(clock.instant().minus(1, ChronoUnit.DAYS)); enrollment.setCompletedAt(clock.instant()); enrollment.setLegacyAccess(false); em.persistAndFlush(enrollment);
        management.grant(studentId, grant(30, "EXTEND"), actor);
        assertDoesNotThrow(() -> access.requireAccess(studentId, course.getId()));
        management.revoke(studentId, new ReasonRequest("End entitlement"), actor);
        assertThrows(com.app.exception.AccessDeniedException.class, () -> access.requireAccess(studentId, course.getId()));
        assertNotNull(management.detail(studentId).courses().get(0).completedAt());
        assertEquals(clock.instant(), management.detail(studentId).courses().get(0).completedAt());
        enrollment.setLegacyAccess(true); em.flush();
        assertDoesNotThrow(() -> access.requireAccess(studentId, course.getId()));
    }
    @Test void onlyActivatedStudentsCanBeLockedAndAdminAccountsAreProtected() {
        management.changeStatus(studentId, new StatusRequest("DISABLE", "Account moderation"), actor);
        em.clear(); assertEquals(UserStatus.DISABLE, users.findById(studentId).orElseThrow().getStatus());
        management.changeStatus(studentId, new StatusRequest("ACTIVE", "Resolved"), actor);
        assertEquals("ACTIVE", management.detail(studentId).student().status());
        assertThrows(BadRequestException.class, () -> management.changeStatus(actor.actorId(), new StatusRequest("DISABLE", "Invalid target"), actor));
        assertThrows(BadRequestException.class, () -> management.grant(actor.actorId(), grant(30, "EXTEND"), actor));
        var pending = em.find(UserEntity.class, studentId); pending.setStatus(UserStatus.PENDING); em.flush();
        assertThrows(BadRequestException.class, () -> management.changeStatus(studentId, new StatusRequest("ACTIVE", "Do not skip verification"), actor));
    }
    @Test void literalSearchPaginationAndSubscriptionFiltersAreAccurate() {
        var student = em.find(UserEntity.class, studentId); student.setFullName("Search_100% " + code); em.flush();
        assertEquals(1, management.list("Search_100% " + code, "", "NONE", 0).totalElements());
        management.grant(studentId, grant(30, "EXTEND"), actor);
        assertEquals(0, management.list(code, "", "NONE", 0).totalElements());
        assertEquals(1, management.list(code, "ACTIVE", "ACTIVE", 0).totalElements());
        assertEquals(0, management.list(code, "DISABLE", "ACTIVE", 0).totalElements());
        assertTrue(management.list(code, "", "ACTIVE", 1).content().isEmpty());
        management.revoke(studentId, new ReasonRequest("Filter regression"), actor);
        assertEquals(1, management.list(code, "", "EXPIRED", 0).totalElements());
    }
    @Test void planChangesDoNotRewriteExistingSubscriptionsOrPaidInvoiceSnapshots() {
        management.grant(studentId, grant(30, "EXTEND"), actor);
        Instant expiry = subscriptions.status(studentId).expiresAt();
        management.savePlan(code, new PlanRequest(code, "Edited plan", BigDecimal.valueOf(199000), 60, false, "Stop new sales"), false, actor);
        assertTrue(subscriptions.hasActiveAccess(studentId)); assertEquals(expiry, subscriptions.status(studentId).expiresAt());
        assertThrows(BadRequestException.class, () -> subscriptions.requirePlan(code));
        assertThrows(BadRequestException.class, () -> management.grant(studentId, grant(30, "EXTEND"), actor));
        var invoice = new InvoiceEntity(); invoice.setUser(em.find(UserEntity.class, studentId)); invoice.setSubscriptionPlanCode(code); invoice.setSubscriptionDurationDays(7);
        subscriptions.activatePaidInvoice(invoice);
        assertEquals(expiry.plus(7, ChronoUnit.DAYS), subscriptions.status(studentId).expiresAt());
        assertThrows(BadRequestException.class, () -> management.savePlan(code, new PlanRequest(code, "Duplicate", BigDecimal.ONE, 30, true, "Duplicate"), true, actor));
        assertThrows(BadRequestException.class, () -> management.savePlan(code, new PlanRequest("OTHER", "Rename", BigDecimal.ONE, 30, true, "Invalid"), false, actor));
    }
    @Test void createPlanAndTrialRestrictionsAndTimestampLimit() {
        String next = code + "_NEW";
        assertEquals(next, management.savePlan(next, new PlanRequest(next, "New offer", BigDecimal.TEN, 90, true, "Launch"), true, actor).code());
        assertTrue(subscriptions.requirePlan(next).isActive());
        assertThrows(BadRequestException.class, () -> management.grant(studentId, new GrantRequest("FREE_TRIAL", 3, "EXTEND", "No repeated trial"), actor));
        assertThrows(BadRequestException.class, () -> management.savePlan("FREE_TRIAL", new PlanRequest("FREE_TRIAL", "Trial", BigDecimal.ONE, 3, true, "Invalid price"), false, actor));
        management.grant(studentId, grant(3650, "EXTEND"), actor);
        assertThrows(BadRequestException.class, () -> management.grant(studentId, grant(3650, "EXTEND"), actor));
    }
    @Test void verificationCannotReactivateDisabledStudent() {
        management.changeStatus(studentId, new StatusRequest("DISABLE", "Moderation"), actor);
        assertEquals(0, users.activatePending(studentId));
        assertEquals(UserStatus.DISABLE, users.findById(studentId).orElseThrow().getStatus());
        var user = em.find(UserEntity.class, studentId); user.setStatus(UserStatus.PENDING); em.flush();
        assertEquals(1, users.activatePending(studentId));
        assertEquals(UserStatus.ACTIVE, users.findById(studentId).orElseThrow().getStatus());
    }
    @Test void nearExpiryUsesTheSameInstantForDetailFilterAndAccess() {
        var s = new UserSubscriptionEntity(); s.setUserId(studentId); s.setPlanCode(code); s.setTrialUsed(true);
        s.setStartedAt(clock.instant().minusSeconds(60)); s.setExpiresAt(clock.instant().plusSeconds(60));
        em.persistAndFlush(s); em.clear();
        assertTrue(subscriptions.hasActiveAccess(studentId));
        assertEquals("ACTIVE", management.detail(studentId).student().subscription().state());
        assertEquals(clock.instant().plusSeconds(60), management.detail(studentId).student().subscription().expiresAt());
        var student = em.find(UserEntity.class, studentId); student.setFullName(code); em.flush();
        assertEquals(1, management.list(code, "", "ACTIVE", 0).totalElements());
        assertEquals(clock.instant().plusSeconds(60), management.list(code, "", "ACTIVE", 0).content().get(0).subscription().expiresAt());
        management.revoke(studentId, new ReasonRequest("Boundary check"), actor);
        assertEquals("EXPIRED", management.detail(studentId).student().subscription().state());
        assertEquals(0, management.list(code, "", "ACTIVE", 0).totalElements());
        assertFalse(subscriptions.hasActiveAccess(studentId));
    }
    private GrantRequest grant(int days, String mode) { return new GrantRequest(code, days, mode, "Manual entitlement regression"); }
    private UserEntity user(String roleName) {
        var role = roles.findByName(roleName).orElseGet(() -> { var r = new RoleEntity(); r.setName(roleName); return em.persistAndFlush(r); });
        var user = new UserEntity(); user.setFullName("Management test user"); user.setEmail("management-" + UUID.randomUUID() + "@example.test"); user.setPasswordHash("unused"); user.getRoles().add(role);
        return em.persistAndFlush(user);
    }
}
