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
        return report(from,to,page,minimumMinutes,search,true);
    }
    public Report report(LocalDate from, LocalDate to, int page, int minimumMinutes, String search,boolean includeLab) {
        if (from == null || to == null || from.isAfter(to) || from.plusDays(92).isBefore(to)
            || to.isAfter(today()) || page < 0 || page > 100000 || minimumMinutes < 0 || minimumMinutes > 1440 || search.length()>200)
            throw new BadRequestException("Khoảng ngày tối đa 93 ngày, không chọn tương lai; bộ lọc phải hợp lệ.");
        Settings config = settings();
        String scope=AnalyticsScope.student("u",includeLab);
        // Aggregate in SQL per date/threshold, without loading each user's daily record.
        List<Day> days = new ArrayList<>();
        StringBuilder sql = new StringBuilder("SELECT activity_date, SUM(CASE WHEN watch_seconds>0 OR activity_count>0 THEN 1 ELSE 0 END) users, COALESCE(SUM(watch_seconds),0) seconds");
        for (int n : config.minutes()) sql.append(", SUM(CASE WHEN watch_seconds >= ").append(n*60).append(" THEN 1 ELSE 0 END) m").append(n);
        sql.append(" FROM learning_activity_daily d JOIN users u ON u.id=d.user_id WHERE ").append(scope).append(" AND activity_date BETWEEN ? AND ? GROUP BY activity_date");
        Map<LocalDate, Day> saved = new HashMap<>();
        db.query(sql.toString(), rs -> {
            List<Threshold> thresholds = new ArrayList<>();
            for (int n : config.minutes()) thresholds.add(new Threshold(n, rs.getLong("m"+n)));
            LocalDate date = rs.getDate("activity_date").toLocalDate();
            saved.put(date, new Day(date, rs.getLong("users"), rs.getLong("seconds"), thresholds));
        }, Date.valueOf(from), Date.valueOf(to));
        from.datesUntil(to.plusDays(1)).forEach(d -> days.add(saved.getOrDefault(d,
            new Day(d, 0, 0, config.minutes().stream().map(n -> new Threshold(n,0)).toList()))));
        String evidence=" FROM lesson_progress lp JOIN lessons l ON l.id=lp.lesson_id JOIN chapters ch ON ch.id=l.chapter_id WHERE lp.user_id=e.user_id AND ch.course_id=e.course_id AND ";
        String enrollment=" FROM course_enrollments e JOIN users u ON u.id=e.user_id WHERE "+scope;
        var courses = db.query("""
            SELECT c.id,c.title,COALESCE(en.enrolled,0) enrolled,COALESCE(en.unique_students,0) unique_students,
              COALESCE(en.started,0) started,COALESCE(en.completed,0) completed,COALESCE(en.course_completed,0) course_completed
            FROM courses c LEFT JOIN (SELECT e.course_id,COUNT(*) enrolled,COUNT(DISTINCT e.user_id) unique_students,
            """+"COUNT(DISTINCT CASE WHEN EXISTS(SELECT 1"+evidence+"(lp.watch_seconds>0 OR lp.is_completed=TRUE)) THEN e.user_id END) started,"
            +"COUNT(DISTINCT CASE WHEN EXISTS(SELECT 1"+evidence+"lp.is_completed=TRUE) THEN e.user_id END) completed,"
            +"SUM(CASE WHEN e.completed_at IS NOT NULL THEN 1 ELSE 0 END) course_completed"+enrollment
            +" GROUP BY e.course_id) en ON en.course_id=c.id ORDER BY c.id",
            (rs,i) -> new Course(rs.getLong("id"),rs.getString("title"),rs.getLong("enrolled"),rs.getLong("started"),rs.getLong("completed"),
                rs.getLong("unique_students"),rs.getLong("course_completed"),rs.getLong("unique_students")==0?null:
                java.math.BigDecimal.valueOf(rs.getLong("started")*100).divide(java.math.BigDecimal.valueOf(rs.getLong("unique_students")),1,java.math.RoundingMode.HALF_UP)));
        Summary summary=db.queryForObject("SELECT COUNT(*) enrolled,COUNT(DISTINCT e.user_id) users,"
            +"(SELECT COUNT(DISTINCT lp.user_id) FROM lesson_progress lp JOIN users u ON u.id=lp.user_id WHERE "+scope+" AND (lp.watch_seconds>0 OR lp.is_completed=TRUE)) started,"
            +"(SELECT COUNT(DISTINCT lp.user_id) FROM lesson_progress lp JOIN users u ON u.id=lp.user_id WHERE "+scope+" AND lp.is_completed=TRUE) completed,"
            +"COALESCE(SUM(CASE WHEN e.completed_at IS NOT NULL THEN 1 ELSE 0 END),0) course_completed"+enrollment,
            (rs,i)->new Summary(rs.getLong("enrolled"),rs.getLong("users"),rs.getLong("started"),rs.getLong("completed"),rs.getLong("course_completed")));
        Map<LocalDate,Long> enrollmentDays=new HashMap<>();
        db.query("SELECT DATE(DATE_ADD(e.enrolled_at,INTERVAL 7 HOUR)) day,COUNT(*) n"+enrollment+" AND e.enrolled_at>=? AND e.enrolled_at<? GROUP BY day",
            rs->{enrollmentDays.put(rs.getDate("day").toLocalDate(),rs.getLong("n"));},
            from.atStartOfDay(ZONE).toInstant().toString().replace('T',' ').replace("Z",""),to.plusDays(1).atStartOfDay(ZONE).toInstant().toString().replace('T',' ').replace("Z",""));
        var enrollmentTrend=from.datesUntil(to.plusDays(1)).map(d->new EnrollmentDay(d,enrollmentDays.getOrDefault(d,0L))).toList();
        String pattern = "%" + search.trim().replace("!","!!").replace("%","!%").replace("_","!_") + "%";
        String filter = " FROM learning_activity_daily d JOIN users u ON u.id=d.user_id WHERE "+scope+" AND d.activity_date BETWEEN ? AND ? AND (u.full_name LIKE ? ESCAPE '!' OR u.email LIKE ? ESCAPE '!') GROUP BY u.id,u.full_name,u.email HAVING SUM(d.watch_seconds)>=? AND (SUM(d.watch_seconds)>0 OR SUM(d.activity_count)>0)";
        Object[] params = {Date.valueOf(from),Date.valueOf(to),pattern,pattern,minimumMinutes*60};
        long total = db.queryForObject("SELECT COUNT(*) FROM (SELECT u.id"+filter+") matched", Long.class, params);
        var args = new ArrayList<Object>(Arrays.asList(params)); args.add(page*25);
        var learners = db.query("SELECT u.id,u.full_name,u.email,SUM(d.watch_seconds) seconds,SUM(d.activity_count) activities"+filter+" ORDER BY seconds DESC,u.id LIMIT 25 OFFSET ?",
            (rs,i) -> new Learner(rs.getLong("id"),rs.getString("full_name"),rs.getString("email"),rs.getLong("seconds"),rs.getLong("activities")),args.toArray());
        var features = db.query("SELECT feature,COUNT(DISTINCT user_id) users,SUM(access_count) accesses FROM user_feature_usage f JOIN users u ON u.id=f.user_id WHERE "+scope+" AND activity_date BETWEEN ? AND ? GROUP BY feature ORDER BY accesses DESC",
            (rs,i) -> new Feature(rs.getString("feature"),rs.getLong("users"),rs.getLong("accesses")), Date.valueOf(from),Date.valueOf(to));
        return new Report(ZONE.getId(), config, days, courses, learners, total, page, features,summary,enrollmentTrend,includeLab);
    }
    public LocalDate today() { return LocalDate.now(clock.withZone(ZONE)); }
}
