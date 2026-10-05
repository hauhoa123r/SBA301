package com.app.features.admin;

import com.app.features.admin.repository.DashboardRepository;
import com.app.features.model.*;
import com.app.features.model.enums.CourseStatus;
import com.app.features.model.enums.InvoiceStatus;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.context.annotation.Import;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/** Uses the existing MySQL schema. All fixtures and timestamp changes roll back. */
@DataJpaTest(properties = {"spring.jpa.hibernate.ddl-auto=none", "spring.jpa.show-sql=false"}, showSql = false)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(DashboardRepository.class)
@EnabledIfEnvironmentVariable(named = "RUN_MYSQL_INTEGRATION_TESTS", matches = "true")
class DashboardRepositoryIntegrationTest {
    @Autowired TestEntityManager em;
    @Autowired DashboardRepository repository;
    private final Instant now = Instant.parse("2026-10-03T12:00:00Z");
    private final ZoneId zone = ZoneId.of("Asia/Ho_Chi_Minh");

    @Test
    void overviewIncludesAllUsersAndStatusesButOnlyPaidInvoiceAmounts() {
        Instant day = Instant.parse("2026-10-02T17:00:00Z"), month = Instant.parse("2026-09-30T17:00:00Z");
        var before = repository.overview(now, day, month);
        UserEntity teacher = user();
        timestamp(teacher, now.minusSeconds(60));
        for (CourseStatus status : java.util.List.of(CourseStatus.PUBLISHED, CourseStatus.HIDDEN)) {
            CourseEntity course = new CourseEntity();
            course.setTeacher(teacher); course.setTitle("Overview fixture"); course.setStatus(status); em.persist(course);
        }
        InvoiceEntity paid = invoice(teacher, null, "850", InvoiceStatus.PAID);
        invoice(teacher, null, "990", InvoiceStatus.PENDING);
        invoice(teacher, null, "100", InvoiceStatus.REFUNDED);
        em.flush();
        em.getEntityManager().createNativeQuery("UPDATE invoices SET updated_at = FROM_UNIXTIME(:instant) WHERE id = :id")
                .setParameter("instant", now.minusSeconds(60).getEpochSecond()).setParameter("id", paid.getId()).executeUpdate();
        var after = repository.overview(now, day, month);
        assertEquals(before.totalUsers() + 1, after.totalUsers());
        assertEquals(before.newUsersToday() + 1, after.newUsersToday());
        assertEquals(before.newUsersThisMonth() + 1, after.newUsersThisMonth());
        assertEquals(before.totalCourses() + 2, after.totalCourses());
        assertEquals(before.publishedCourses() + 1, after.publishedCourses());
        assertEquals(before.hiddenCourses() + 1, after.hiddenCourses());
        assertEquals(0, before.totalRevenue().add(new BigDecimal("850")).compareTo(after.totalRevenue()));
        assertEquals(0, before.revenueThisMonth().add(new BigDecimal("850")).compareTo(after.revenueThisMonth()));
    }

    @Test
    void invoicesAndEnrollmentsDoNotMultiplyCourseRevenueAndSearchEscapesWildcards() {
        UserEntity teacher = user();
        CourseEntity course = new CourseEntity();
        course.setTeacher(teacher);
        String title = "Dashboard_100%_" + UUID.randomUUID();
        course.setTitle(title);
        course.setStatus(CourseStatus.HIDDEN);
        em.persistAndFlush(course);
        enrollment(course, user(), true);
        UserEntity learner = user();
        enrollment(course, learner, false);
        ChapterEntity chapter = new ChapterEntity();
        chapter.setCourseEntity(course); chapter.setTitle("Progress fixture"); chapter.setOrderIndex(1); em.persist(chapter);
        for (int index = 1; index <= 2; index++) {
            LessonEntity lesson = new LessonEntity();
            lesson.setChapter(chapter); lesson.setTitle("Progress lesson " + index); lesson.setOrderIndex(index); em.persist(lesson);
            LessonProgressEntity progress = new LessonProgressEntity();
            progress.setLesson(lesson); progress.setUser(learner); progress.setWatchSeconds(10); em.persist(progress);
        }
        invoice(teacher, course, "900", InvoiceStatus.PAID);
        invoice(teacher, course, "700", InvoiceStatus.PENDING);
        invoice(teacher, course, "300", InvoiceStatus.REFUNDED);
        em.flush(); em.clear();

        var result = repository.courses(title, "HIDDEN", 0, 10);
        assertEquals(1, result.totalElements());
        var row = result.content().get(0);
        assertEquals(2, row.students());
        assertEquals(1, row.completed());
        assertEquals(1, row.learning());
        assertEquals(0, new BigDecimal("50.0").compareTo(row.completionRate()));
        assertEquals(0, new BigDecimal("900").compareTo(row.revenue()));
        assertEquals(0, repository.courses(title.replace("100%", "100_"), "", 0, 10).totalElements());
        assertEquals(0, repository.courses(title, "PUBLISHED", 0, 10).totalElements());
        assertEquals(0, repository.courses(title, "", 1, 1).content().size());
    }

    @Test
    void subscriptionsCountOnlyCurrentAccessAndRevenueUsesActualInvoiceAmount() {
        String code = "TEST_" + UUID.randomUUID().toString().substring(0, 12);
        SubscriptionPlanEntity plan = new SubscriptionPlanEntity();
        plan.setCode(code); plan.setName("Dashboard integration plan");
        plan.setPrice(new BigDecimal("1200")); plan.setDurationDays(30);
        em.persist(plan);
        UserEntity current = user();
        subscription(current, code, now.minusSeconds(60), now.plusSeconds(60));
        subscription(user(), code, now.minusSeconds(120), now);
        subscription(user(), code, now.plusSeconds(1), now.plusSeconds(100));
        InvoiceEntity invoice = invoice(current, null, "900", InvoiceStatus.PAID);
        invoice.setSubscriptionPlanCode(code); invoice.setSubscriptionDurationDays(30);
        em.flush();
        var stats = repository.subscriptions(now).stream().filter(row -> row.code().equals(code)).findFirst().orElseThrow();
        assertEquals(1, stats.users());
        assertEquals(0, new BigDecimal("900").compareTo(stats.revenue()));
    }

    @Test
    void twelveMonthlyBucketsHandleVietnamMonthBoundaryAndEmptyMonths() {
        var before = repository.trends(YearMonth.of(2025, 11), zone, now);
        UserEntity september = user(), october = user();
        timestamp(september, Instant.parse("2026-09-30T16:59:59Z"));
        timestamp(october, Instant.parse("2026-09-30T17:00:00Z"));
        var after = repository.trends(YearMonth.of(2025, 11), zone, now);
        assertEquals(12, after.size());
        assertEquals("2026-09", after.get(10).month());
        assertEquals(before.get(10).users() + 1, after.get(10).users());
        assertEquals(before.get(11).users() + 1, after.get(11).users());
    }

    @Test
    void popularCoursesUseEnrollmentDatesAndReturnTopFromDatabase() {
        UserEntity teacher = user();
        CourseEntity course = new CourseEntity();
        course.setTeacher(teacher); course.setTitle("Popular integration fixture");
        em.persistAndFlush(course);
        CourseEnrollmentEntity old = enrollment(course, user(), false);
        old.setEnrolledAt(now.minusSeconds(40 * 86400));
        CourseEnrollmentEntity recent = enrollment(course, user(), false);
        recent.setEnrolledAt(now.minusSeconds(60));
        em.flush();
        // The short window isolates these fixtures from dated seed enrollments.
        var rows = repository.popular(now.minusSeconds(120), now, 10);
        assertEquals(1, rows.stream().filter(row -> row.id() == course.getId()).findFirst().orElseThrow().students());
        assertTrue(repository.popular(now.plusSeconds(1), now.plusSeconds(2), 5).isEmpty());
    }

    private void timestamp(UserEntity user, Instant instant) {
        em.getEntityManager().createNativeQuery("UPDATE users SET created_at = FROM_UNIXTIME(:instant) WHERE id = :id")
                .setParameter("instant", instant.getEpochSecond()).setParameter("id", user.getId()).executeUpdate();
    }
    private UserEntity user() {
        UserEntity user = new UserEntity();
        user.setFullName("Dashboard integration fixture"); user.setEmail(UUID.randomUUID() + "@example.test");
        user.setPasswordHash("unused-test-hash"); return em.persistAndFlush(user);
    }
    private CourseEnrollmentEntity enrollment(CourseEntity course, UserEntity user, boolean completed) {
        CourseEnrollmentEntity enrollment = new CourseEnrollmentEntity();
        enrollment.setCourse(course); enrollment.setUser(user); enrollment.setEnrolledAt(now.minusSeconds(60));
        if (completed) enrollment.setCompletedAt(now);
        return em.persist(enrollment);
    }
    private InvoiceEntity invoice(UserEntity user, CourseEntity course, String amount, InvoiceStatus status) {
        InvoiceEntity invoice = new InvoiceEntity();
        invoice.setUser(user); invoice.setCourse(course); invoice.setOriginalAmount(new BigDecimal("1200"));
        invoice.setDiscountAmount(new BigDecimal("1200").subtract(new BigDecimal(amount)));
        invoice.setAmount(new BigDecimal(amount)); invoice.setStatus(status);
        return em.persist(invoice);
    }
    private void subscription(UserEntity user, String code, Instant start, Instant end) {
        UserSubscriptionEntity subscription = new UserSubscriptionEntity();
        subscription.setUserId(user.getId()); subscription.setPlanCode(code);
        subscription.setStartedAt(start); subscription.setExpiresAt(end); em.persist(subscription);
    }
}
