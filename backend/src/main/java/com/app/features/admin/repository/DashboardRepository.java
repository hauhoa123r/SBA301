package com.app.features.admin.repository;

import com.app.features.admin.dto.DashboardResponse.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.List;

/** Scalar SQL aggregates: never hydrate users, invoices, enrollments or course graphs. */
@Repository
@RequiredArgsConstructor
public class DashboardRepository {
    private final EntityManager entityManager;

    // Application-written subscription/enrollment dates use native Instant parameters, matching
    // Hibernate's existing TIMESTAMP_UTC mapping and the access checks in SubscriptionService.
    // Database-generated user/invoice dates use epoch boundaries converted in the MySQL session.

    public Overview overview(Instant now, Instant dayStart, Instant monthStart) {
        Object[] row = (Object[]) entityManager.createNativeQuery("""
                SELECT
                  (SELECT COUNT(*) FROM users),
                  (SELECT COUNT(*) FROM users WHERE created_at >= FROM_UNIXTIME(:dayStart)
                    AND created_at <= FROM_UNIXTIME(:now)),
                  (SELECT COUNT(*) FROM users WHERE created_at >= FROM_UNIXTIME(:monthStart)
                    AND created_at <= FROM_UNIXTIME(:now)),
                  (SELECT COALESCE(SUM(amount), 0) FROM invoices WHERE status = 'PAID'),
                  (SELECT COALESCE(SUM(amount), 0) FROM invoices WHERE status = 'PAID'
                    AND updated_at >= FROM_UNIXTIME(:monthStart) AND updated_at <= FROM_UNIXTIME(:now)),
                  (SELECT COUNT(*) FROM user_subscriptions
                    WHERE started_at <= :subscriptionNow AND expires_at > :subscriptionNow),
                  COUNT(*), COALESCE(SUM(status = 'PUBLISHED'), 0), COALESCE(SUM(status = 'HIDDEN'), 0),
                  COALESCE(SUM(status = 'DRAFT'), 0), COALESCE(SUM(status = 'PENDING'), 0)
                FROM courses
                """).setParameter("now", now.getEpochSecond())
                .setParameter("subscriptionNow", now)
                .setParameter("dayStart", dayStart.getEpochSecond())
                .setParameter("monthStart", monthStart.getEpochSecond()).getSingleResult();
        return new Overview(number(row[0]), number(row[1]), number(row[2]), money(row[3]), money(row[4]),
                number(row[5]), number(row[0]) - number(row[5]), number(row[6]), number(row[7]),
                number(row[8]), number(row[9]), number(row[10]));
    }

    public List<PlanStats> subscriptions(Instant now) {
        return rows(entityManager.createNativeQuery("""
                SELECT p.code, p.name, p.price, p.duration_days, p.active,
                       COALESCE(s.users, 0), COALESCE(i.revenue, 0)
                FROM subscription_plans p
                LEFT JOIN (SELECT plan_code, COUNT(*) AS users FROM user_subscriptions
                  WHERE started_at <= :now AND expires_at > :now
                  GROUP BY plan_code) s ON s.plan_code = p.code
                LEFT JOIN (SELECT subscription_plan_code, SUM(amount) AS revenue FROM invoices
                  WHERE status = 'PAID' GROUP BY subscription_plan_code) i ON i.subscription_plan_code = p.code
                ORDER BY p.price, p.code
                """).setParameter("now", now)).stream()
                .map(row -> new PlanStats((String) row[0], (String) row[1], money(row[2]),
                        (int) number(row[3]), truth(row[4]), number(row[5]), money(row[6]))).toList();
    }

    public List<MonthStats> trends(YearMonth firstMonth, ZoneId zone, Instant now) {
        // Twelve bounded buckets, including empty months. FROM_UNIXTIME translates epoch boundaries
        // into the connection's timezone, so TIMESTAMP ranges work in both UTC and +07:00 sessions.
        StringBuilder buckets = new StringBuilder();
        for (int index = 0; index < 12; index++) {
            if (index > 0) buckets.append(" UNION ALL ");
            buckets.append("SELECT :label").append(index).append(" AS month, FROM_UNIXTIME(:start")
                    .append(index).append(") AS starts_at, FROM_UNIXTIME(:end").append(index).append(") AS ends_at");
        }
        Query query = entityManager.createNativeQuery("""
                SELECT b.month,
                  (SELECT COUNT(*) FROM users u WHERE u.created_at >= b.starts_at AND u.created_at < b.ends_at),
                  (SELECT COALESCE(SUM(i.amount), 0) FROM invoices i WHERE i.status = 'PAID'
                    AND i.updated_at >= b.starts_at AND i.updated_at < b.ends_at)
                FROM (
                """ + buckets + ") b ORDER BY b.month");
        for (int index = 0; index < 12; index++) {
            YearMonth month = firstMonth.plusMonths(index);
            Instant end = month.plusMonths(1).atDay(1).atStartOfDay(zone).toInstant();
            query.setParameter("label" + index, month.toString());
            query.setParameter("start" + index, month.atDay(1).atStartOfDay(zone).toEpochSecond());
            query.setParameter("end" + index, (end.isAfter(now) ? now.plusSeconds(1) : end).getEpochSecond());
        }
        return rows(query).stream().map(row -> new MonthStats((String) row[0], number(row[1]), money(row[2]))).toList();
    }

    public List<PopularCourse> popular(Instant since, Instant now, int limit) {
        return rows(entityManager.createNativeQuery("""
                SELECT c.id, c.title, COUNT(e.id) AS students
                FROM courses c JOIN course_enrollments e ON e.course_id = c.id
                WHERE e.enrolled_at >= :since AND e.enrolled_at <= :now
                GROUP BY c.id, c.title ORDER BY students DESC, c.id ASC
                """).setParameter("since", since).setParameter("now", now)
                .setMaxResults(limit)).stream()
                .map(row -> new PopularCourse(number(row[0]), (String) row[1], number(row[2]))).toList();
    }

    public CoursePage courses(String search, String status, int page, int size) {
        String filter = " WHERE (:search = '' OR c.title LIKE :pattern ESCAPE '!')"
                + " AND (:status = '' OR c.status = :status)";
        String pattern = "%" + search.replace("!", "!!").replace("%", "!%").replace("_", "!_") + "%";
        long total = number(entityManager.createNativeQuery("SELECT COUNT(*) FROM courses c" + filter)
                .setParameter("search", search).setParameter("pattern", pattern).setParameter("status", status)
                .getSingleResult());
        List<CourseStats> content = rows(entityManager.createNativeQuery("""
                SELECT c.id, c.title, c.price, c.status, COALESCE(e.students, 0), COALESCE(e.learning, 0),
                  COALESCE(e.completed, 0), COALESCE(ROUND(100.0 * e.completed / NULLIF(e.students, 0), 1), 0),
                  COALESCE(i.revenue, 0)
                FROM courses c
                LEFT JOIN (SELECT en.course_id, COUNT(*) AS students,
                  SUM(en.completed_at IS NOT NULL) AS completed,
                  SUM(en.completed_at IS NULL AND EXISTS (
                    SELECT 1 FROM lesson_progress lp JOIN lessons l ON l.id = lp.lesson_id
                    JOIN chapters ch ON ch.id = l.chapter_id
                    WHERE lp.user_id = en.user_id AND ch.course_id = en.course_id
                      AND (lp.watch_seconds > 0 OR lp.is_completed = TRUE))) AS learning
                  FROM course_enrollments en GROUP BY en.course_id) e ON e.course_id = c.id
                LEFT JOIN (SELECT course_id, SUM(amount) AS revenue FROM invoices
                  WHERE status = 'PAID' AND subscription_plan_code IS NULL GROUP BY course_id) i ON i.course_id = c.id
                """ + filter + " ORDER BY c.created_at DESC, c.id DESC")
                .setParameter("search", search).setParameter("pattern", pattern).setParameter("status", status)
                .setFirstResult(page * size).setMaxResults(size)).stream()
                .map(row -> new CourseStats(number(row[0]), (String) row[1], money(row[2]), (String) row[3],
                        number(row[4]), number(row[5]), number(row[6]), money(row[7]), money(row[8]))).toList();
        return new CoursePage(content, total, page, size, (int) ((total + size - 1) / size));
    }

    @SuppressWarnings("unchecked")
    private List<Object[]> rows(Query query) {
        return query.getResultList();
    }

    private long number(Object value) { return ((Number) value).longValue(); }
    private BigDecimal money(Object value) { return new BigDecimal(value.toString()); }
    private boolean truth(Object value) { return value instanceof Boolean flag ? flag : number(value) != 0; }
}
