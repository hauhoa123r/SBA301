package com.app.features.admin.repository;

import com.app.features.admin.dto.StudentManagement.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import java.time.Instant;
import java.util.List;

@Repository @RequiredArgsConstructor
public class StudentManagementRepository {
    private final EntityManager em;
    private static final String STUDENT = """
        EXISTS (SELECT 1 FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.user_id = u.id AND r.name = 'STUDENT')
        AND NOT EXISTS (SELECT 1 FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.user_id = u.id AND r.name = 'ADMIN')
        """;
    private static final String SELECT = """
        SELECT u.id, u.full_name, u.email, u.status, UNIX_TIMESTAMP(u.created_at), s.plan_code, p.name,
          DATE_FORMAT(s.started_at, '%Y-%m-%dT%H:%i:%s'), DATE_FORMAT(s.expires_at, '%Y-%m-%dT%H:%i:%s'),
          (SELECT COUNT(*) FROM course_enrollments e WHERE e.user_id = u.id),
          (SELECT COUNT(*) FROM course_enrollments e WHERE e.user_id = u.id AND e.completed_at IS NOT NULL)
        FROM users u LEFT JOIN user_subscriptions s ON s.user_id = u.id
        LEFT JOIN subscription_plans p ON p.code = s.plan_code WHERE
        """;

    public boolean isStudent(Long id) {
        return number(em.createNativeQuery("SELECT COUNT(*) FROM users u WHERE u.id = :id AND " + STUDENT)
            .setParameter("id", id).getSingleResult()) == 1;
    }
    public void insertPlan(com.app.features.model.SubscriptionPlanEntity plan) {
        // Assigned plan codes must INSERT, never merge over a concurrently created offer.
        em.persist(plan); em.flush();
    }
    public StudentPage list(String search, String status, String subscription, int page, Instant now) {
        String filter = STUDENT + """
            AND (:search = '' OR u.full_name LIKE :pattern ESCAPE '!' OR u.email LIKE :pattern ESCAPE '!')
            AND (:status = '' OR u.status = :status)
            AND (:subscription = ''
              OR (:subscription = 'NONE' AND s.user_id IS NULL)
              OR (:subscription = 'ACTIVE' AND s.started_at <= :now AND s.expires_at > :now)
              OR (:subscription = 'EXPIRED' AND s.expires_at <= :now)
              OR (:subscription = 'SCHEDULED' AND s.started_at > :now AND s.expires_at > :now))
            """;
        long total = number(bind(em.createNativeQuery("SELECT COUNT(*) FROM users u LEFT JOIN user_subscriptions s ON s.user_id = u.id WHERE " + filter), search, status, subscription, now).getSingleResult());
        var rows = rows(bind(em.createNativeQuery(SELECT + filter + " ORDER BY u.id DESC"), search, status, subscription, now)
            .setFirstResult(page * 20).setMaxResults(20));
        return new StudentPage(rows.stream().map(row -> student(row, now)).toList(), total, (int) ((total + 19) / 20), page);
    }
    private Query bind(Query query, String search, String status, String subscription, Instant now) {
        return query.setParameter("search", search).setParameter("pattern", "%" + search.replace("!", "!!").replace("%", "!%").replace("_", "!_") + "%")
            .setParameter("status", status).setParameter("subscription", subscription).setParameter("now", now);
    }
    public Student find(Long id, Instant now) {
        var result = rows(em.createNativeQuery(SELECT + "u.id = :id AND " + STUDENT).setParameter("id", id));
        return result.isEmpty() ? null : student(result.get(0), now);
    }
    public List<Course> courses(Long id) {
        return rows(em.createNativeQuery("""
            SELECT c.id, c.title, c.status, DATE_FORMAT(e.enrolled_at, '%Y-%m-%dT%H:%i:%s'), DATE_FORMAT(e.completed_at, '%Y-%m-%dT%H:%i:%s'), e.legacy_access
            FROM course_enrollments e JOIN courses c ON c.id = e.course_id WHERE e.user_id = :id ORDER BY e.id DESC
            """).setParameter("id", id)).stream().map(r -> new Course(number(r[0]), (String) r[1], (String) r[2], applicationInstant(r[3]), applicationInstant(r[4]), truth(r[5]))).toList();
    }
    public List<History> history(Long id) {
        return rows(em.createNativeQuery("""
            SELECT a.id, COALESCE(u.full_name, 'Admin'), a.action, CAST(a.before_data AS CHAR), CAST(a.after_data AS CHAR), UNIX_TIMESTAMP(a.created_at)
            FROM audit_logs a LEFT JOIN users u ON u.id = a.user_id
            WHERE a.endpoint = :endpoint AND a.action IN ('STUDENT_STATUS', 'SUBSCRIPTION_GRANT', 'SUBSCRIPTION_REVOKE')
            ORDER BY a.id DESC
            """).setParameter("endpoint", "/api/admin/students/" + id).setMaxResults(50)).stream()
            .map(r -> new History(number(r[0]), (String) r[1], (String) r[2], (String) r[3], (String) r[4], instant(r[5]))).toList();
    }
    private Student student(Object[] r, Instant now) {
        Instant start = applicationInstant(r[7]), expiry = applicationInstant(r[8]);
        String state = expiry == null ? "NONE" : !expiry.isAfter(now) ? "EXPIRED" : start.isAfter(now) ? "SCHEDULED" : "ACTIVE";
        return new Student(number(r[0]), (String) r[1], (String) r[2], (String) r[3], instant(r[4]),
            new Subscription(state, (String) r[5], (String) r[6], start, expiry), number(r[9]), number(r[10]));
    }
    @SuppressWarnings("unchecked") private List<Object[]> rows(Query query) { return query.getResultList(); }
    private long number(Object value) { return ((Number) value).longValue(); }
    private Instant instant(Object value) { return value == null ? null : Instant.ofEpochSecond(number(value)); }
    // Match Hibernate TIMESTAMP_UTC reads for application-written dates. UNIX_TIMESTAMP
    // would interpret these wall values in the MySQL session timezone and shift access dates.
    private Instant applicationInstant(Object value) { return value == null ? null : Instant.parse(value + "Z"); }
    private boolean truth(Object value) { return value instanceof Boolean flag ? flag : number(value) != 0; }
}
