package com.app.features.notifications;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Clock;
import java.util.List;

@Service @RequiredArgsConstructor
public class RecommendationService {
    private final EntityManager em;
    private final Clock clock;
    public record Recommendation(Long courseId, Long lessonId, String courseTitle, String lessonTitle, String path) {}

    @Transactional(readOnly = true)
    public Recommendation next(Long userId) {
        // Same published/subscription/legacy rules as CourseAccessService; no enrollment or progress writes.
        List<?> rows = em.createNativeQuery("""
            SELECT c.id,l.id,c.title,l.title FROM courses c
            JOIN chapters ch ON ch.course_id=c.id JOIN lessons l ON l.chapter_id=ch.id
            LEFT JOIN lesson_progress p ON p.lesson_id=l.id AND p.user_id=:userId
            LEFT JOIN (SELECT ch2.course_id,MAX(p2.updated_at) AS recent FROM lesson_progress p2
              JOIN lessons l2 ON l2.id=p2.lesson_id JOIN chapters ch2 ON ch2.id=l2.chapter_id
              WHERE p2.user_id=:userId GROUP BY ch2.course_id) recent ON recent.course_id=c.id
            WHERE c.status='PUBLISHED' AND COALESCE(p.is_completed,0)=0 AND (
              EXISTS (SELECT 1 FROM user_subscriptions s WHERE s.user_id=:userId AND s.started_at<=:now AND s.expires_at>:now)
              OR EXISTS (SELECT 1 FROM course_enrollments e WHERE e.user_id=:userId AND e.course_id=c.id AND e.legacy_access=1))
            ORDER BY CASE WHEN recent.recent IS NULL THEN 1 ELSE 0 END,recent.recent DESC,c.id,
              CASE WHEN COALESCE(p.watch_seconds,0)>0 OR COALESCE(p.position_seconds,0)>0 THEN 0 ELSE 1 END,
              p.updated_at DESC,ch.order_index,l.order_index,l.id
            """).setParameter("userId", userId).setParameter("now", clock.instant()).setMaxResults(1).getResultList();
        if (rows.isEmpty()) return null;
        Object[] row = (Object[]) rows.get(0);
        long course = ((Number) row[0]).longValue(), lesson = ((Number) row[1]).longValue();
        return new Recommendation(course, lesson, (String) row[2], (String) row[3], "/learning/courses/"+course+"/lessons/"+lesson);
    }
}
