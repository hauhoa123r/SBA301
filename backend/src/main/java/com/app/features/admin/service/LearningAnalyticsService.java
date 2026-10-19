package com.app.features.admin.service;

import com.app.exception.BadRequestException;
import com.app.features.admin.dto.LearningAnalytics.*;
import com.app.features.admin.dto.StudentManagement.AuditContext;
import com.app.features.admin.repository.AdminAuditRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.sql.Date;
import java.time.*;
import java.util.*;

@Service @RequiredArgsConstructor @Transactional(readOnly=true)
public class LearningAnalyticsService {
    public static final ZoneId ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
    private final JdbcTemplate db;
    private final Clock clock;
    private final AdminAuditRepository audit;

    public Settings settings() {
        var rows = db.queryForList("SELECT minute_thresholds FROM learning_analytics_settings WHERE id=1", String.class);
        return new Settings(Arrays.stream((rows.isEmpty() ? "5,10,15" : rows.get(0)).split(",")).map(Integer::valueOf).toList());
    }
    @Transactional public Settings saveSettings(Settings body, AuditContext actor) {
        var values = body.minutes().stream().distinct().sorted().toList();
        var before = settings();
        String csv = String.join(",", values.stream().map(String::valueOf).toList());
        db.update("UPDATE learning_analytics_settings SET minute_thresholds=? WHERE id=1", csv);
        audit.write(actor, "LEARNING_THRESHOLDS", actor.endpoint(), before, new Settings(values), "Cập nhật mốc thời gian học");
        return new Settings(values);
    }
    public Report report(LocalDate from, LocalDate to, int page, int minimumMinutes, String search) {
        if (from == null || to == null || from.isAfter(to) || from.plusDays(92).isBefore(to)
            || to.isAfter(today()) || page < 0 || page > 100000 || minimumMinutes < 0 || minimumMinutes > 1440 || search.length()>200)
            throw new BadRequestException("Khoảng ngày tối đa 93 ngày, không chọn tương lai; bộ lọc phải hợp lệ.");
        Settings config = settings();
        // Aggregate in SQL per date/threshold, without loading each user's daily record.
        List<Day> days = new ArrayList<>();
        StringBuilder sql = new StringBuilder("SELECT activity_date, SUM(CASE WHEN watch_seconds>0 OR activity_count>0 THEN 1 ELSE 0 END) users, COALESCE(SUM(watch_seconds),0) seconds");
        for (int n : config.minutes()) sql.append(", SUM(CASE WHEN watch_seconds >= ").append(n*60).append(" THEN 1 ELSE 0 END) m").append(n);
        sql.append(" FROM learning_activity_daily WHERE activity_date BETWEEN ? AND ? GROUP BY activity_date");
        Map<LocalDate, Day> saved = new HashMap<>();
        db.query(sql.toString(), rs -> {
            List<Threshold> thresholds = new ArrayList<>();
            for (int n : config.minutes()) thresholds.add(new Threshold(n, rs.getLong("m"+n)));
            LocalDate date = rs.getDate("activity_date").toLocalDate();
            saved.put(date, new Day(date, rs.getLong("users"), rs.getLong("seconds"), thresholds));
        }, Date.valueOf(from), Date.valueOf(to));
        from.datesUntil(to.plusDays(1)).forEach(d -> days.add(saved.getOrDefault(d,
            new Day(d, 0, 0, config.minutes().stream().map(n -> new Threshold(n,0)).toList()))));
        var courses = db.query("""
            SELECT c.id,c.title,(SELECT COUNT(*) FROM course_enrollments e WHERE e.course_id=c.id) enrolled,
              COUNT(DISTINCT CASE WHEN lp.watch_seconds>0 OR lp.is_completed=TRUE THEN lp.user_id END) started,
              COUNT(DISTINCT CASE WHEN lp.is_completed=TRUE THEN lp.user_id END) completed
            FROM courses c LEFT JOIN chapters ch ON ch.course_id=c.id LEFT JOIN lessons l ON l.chapter_id=ch.id
            LEFT JOIN lesson_progress lp ON lp.lesson_id=l.id GROUP BY c.id,c.title ORDER BY c.id
            """, (rs,i) -> new Course(rs.getLong("id"),rs.getString("title"),rs.getLong("enrolled"),rs.getLong("started"),rs.getLong("completed")));
        String pattern = "%" + search.trim().replace("!","!!").replace("%","!%").replace("_","!_") + "%";
        String filter = " FROM learning_activity_daily d JOIN users u ON u.id=d.user_id WHERE d.activity_date BETWEEN ? AND ? AND (u.full_name LIKE ? ESCAPE '!' OR u.email LIKE ? ESCAPE '!') GROUP BY u.id,u.full_name,u.email HAVING SUM(d.watch_seconds)>=? AND (SUM(d.watch_seconds)>0 OR SUM(d.activity_count)>0)";
        Object[] params = {Date.valueOf(from),Date.valueOf(to),pattern,pattern,minimumMinutes*60};
        long total = db.queryForObject("SELECT COUNT(*) FROM (SELECT u.id"+filter+") matched", Long.class, params);
        var args = new ArrayList<Object>(Arrays.asList(params)); args.add(page*25);
        var learners = db.query("SELECT u.id,u.full_name,u.email,SUM(d.watch_seconds) seconds,SUM(d.activity_count) activities"+filter+" ORDER BY seconds DESC,u.id LIMIT 25 OFFSET ?",
            (rs,i) -> new Learner(rs.getLong("id"),rs.getString("full_name"),rs.getString("email"),rs.getLong("seconds"),rs.getLong("activities")),args.toArray());
        var features = db.query("SELECT feature,COUNT(DISTINCT user_id) users,SUM(access_count) accesses FROM user_feature_usage WHERE activity_date BETWEEN ? AND ? GROUP BY feature ORDER BY accesses DESC",
            (rs,i) -> new Feature(rs.getString("feature"),rs.getLong("users"),rs.getLong("accesses")), Date.valueOf(from),Date.valueOf(to));
        return new Report(ZONE.getId(), config, days, courses, learners, total, page, features);
    }
    public LocalDate today() { return LocalDate.now(clock.withZone(ZONE)); }
}
