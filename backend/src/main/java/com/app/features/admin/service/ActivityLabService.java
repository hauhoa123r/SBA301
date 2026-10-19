package com.app.features.admin.service;

import com.app.exception.*;
import com.app.features.admin.dto.LearningAnalytics.*;
import com.app.features.admin.dto.StudentManagement.*;
import com.app.features.admin.repository.AdminAuditRepository;
import com.app.features.auth.repository.*;
import com.app.features.feedback.dto.FeedbackDto;
import com.app.features.feedback.service.FeedbackService;
import com.app.features.learning.dto.request.*;
import com.app.features.learning.repository.ILessonRepository;
import com.app.features.learning.service.LearningActivityService;
import com.app.features.learning.service.impl.LearningProgressServiceImpl;
import com.app.features.model.*;
import com.app.features.model.enums.UserStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import com.app.security.password.PasswordHashing;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.sql.Date;
import java.time.*;
import java.util.*;

@Service @RequiredArgsConstructor @Transactional(readOnly=true)
public class ActivityLabService {
    public static final Set<String> FEATURES = Set.of("COURSES","LEARNING","QUIZZES","ASSIGNMENTS","SUBSCRIPTION","PROFILE","FEEDBACK");
    private final JdbcTemplate db;
    private final UserRepository users;
    private final RoleRepository roles;
    private final StudentManagementService students;
    private final AdminAuditRepository audit;
    private final LearningActivityService activity;
    private final LearningProgressServiceImpl progress;
    private final ILessonRepository lessons;
    private final FeedbackService feedback;
    private final Clock clock;
    @Value("${app.activity-lab.enabled:false}") private boolean enabled;

    public Map<String,Object> overview(String search, int page) {
        if (search.length()>200 || page<0 || page>100000) throw new BadRequestException("Bộ lọc không hợp lệ.");
        return Map.of("enabled",enabled,"features",FEATURES.stream().sorted().toList(),"students",students.list(search,"","",page),
            "courses",db.queryForList("SELECT id,title FROM courses WHERE status='PUBLISHED' ORDER BY id"),"plans",students.plans());
    }
    @Transactional public Long create(CreateAccount body, AuditContext actor) {
        requireEnabled();
        String email = body.email().trim().toLowerCase(Locale.ROOT);
        if (users.existsByEmail(email)) throw new BadRequestException("Email đã tồn tại.");
        UserEntity user = new UserEntity(); user.setEmail(email); user.setFullName(body.fullName().trim());
        user.setPasswordHash(PasswordHashing.encode(body.password())); user.setStatus(UserStatus.ACTIVE);
        user.getRoles().add(roles.findByName("STUDENT").orElseThrow()); users.saveAndFlush(user);
        audit.write(actor,"ADMIN_ACCOUNT_CREATE",target(user.getId()),null,Map.of("id",user.getId(),"email",email),body.reason());
        return user.getId();
    }
    public Map<String,Object> detail(Long id) {
        requireStudent(id);
        return Map.of("student",students.detail(id),"rules",db.queryForList("SELECT * FROM user_learning_rules WHERE user_id=?",id),
            "features",db.queryForList("SELECT feature,SUM(access_count) accesses,MAX(activity_date) last_date FROM user_feature_usage WHERE user_id=? GROUP BY feature",id),
            "feedback",db.queryForList("SELECT s.id,s.form_id,f.title,s.submitted_at FROM feedback_submissions s JOIN feedback_forms f ON f.id=s.form_id WHERE s.user_id=? ORDER BY s.id DESC LIMIT 100",id),
            "answers",db.queryForList("""
                SELECT a.submission_id,q.title,a.text_value,a.number_value,
                  (SELECT GROUP_CONCAT(o.label ORDER BY o.position SEPARATOR ', ') FROM feedback_answer_options ao
                   JOIN feedback_options o ON o.id=ao.option_id WHERE ao.answer_id=a.id) options
                FROM feedback_answers a JOIN feedback_questions q ON q.id=a.question_id
                JOIN feedback_submissions s ON s.id=a.submission_id WHERE s.user_id=? ORDER BY s.id DESC,a.id LIMIT 500
                """,id));
    }
    @Transactional public void rule(Long id, Rule body, AuditContext actor) {
        requireEnabled(); lockStudent(id);
        if (!FEATURES.containsAll(body.features())) throw new BadRequestException("Tính năng không hợp lệ.");
        if (db.queryForObject("SELECT COUNT(*) FROM courses WHERE id=? AND status='PUBLISHED'",Long.class,body.courseId())==0)
            throw new BadRequestException("Chọn khóa học đã xuất bản.");
        var before = db.queryForList("SELECT * FROM user_learning_rules WHERE user_id=?",id);
        String features = String.join(",",body.features().stream().distinct().sorted().toList());
        db.update("""
            INSERT INTO user_learning_rules(user_id,course_id,daily_minutes,lessons_per_day,enabled,features,updated_by)
            VALUES(?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE course_id=VALUES(course_id),daily_minutes=VALUES(daily_minutes),
            lessons_per_day=VALUES(lessons_per_day),enabled=VALUES(enabled),features=VALUES(features),updated_by=VALUES(updated_by)
            """, id,body.courseId(),body.dailyMinutes(),body.lessonsPerDay(),body.enabled(),features,actor.actorId());
        audit.write(actor,"ACTIVITY_RULE_UPDATE",target(id),before,body,body.reason());
    }
    @Transactional public void grant(Long id, Grant body, AuditContext actor) {
        requireEnabled(); students.grant(id,new GrantRequest(body.planCode(),body.days(),"REPLACE",body.reason()),actor);
    }
    @Transactional public Map<String,Object> run(Long id, String reason, AuditContext actor) {
        return execute(id,reason,actor,false);
    }
    @Transactional public void runScheduled(Long id, AuditContext actor) {
        execute(id,"Lịch hoạt động hằng ngày",actor,true);
    }
    private Map<String,Object> execute(Long id,String reason,AuditContext actor,boolean scheduled) {
        requireEnabled(); lockStudent(id);
        var rows=db.queryForList("SELECT * FROM user_learning_rules WHERE user_id=? FOR UPDATE",id);
        if(rows.isEmpty()) throw new BadRequestException("Chưa cấu hình hoạt động cho học viên.");
        var rule=rows.get(0); LocalDate today=LocalDate.now(clock.withZone(LearningAnalyticsService.ZONE));
        Object active=rule.get("enabled");
        if(scheduled && !(Boolean.TRUE.equals(active) || active instanceof Number n && n.intValue()!=0))
            return Map.of("skipped",true);
        Object last=rule.get("last_run_date");
        if(last!=null && Date.valueOf(today).equals(last)) return Map.of("alreadyRun",true,"date",today);
        Long courseId=((Number)rule.get("course_id")).longValue();
        var ids=db.queryForList("""
            SELECT l.id FROM lessons l JOIN chapters ch ON ch.id=l.chapter_id
            LEFT JOIN lesson_progress lp ON lp.lesson_id=l.id AND lp.user_id=?
            WHERE ch.course_id=? ORDER BY COALESCE(lp.is_completed,FALSE),ch.order_index,l.order_index,l.id
            """,Long.class,id,courseId);
        if(ids.isEmpty()) throw new BadRequestException("Khóa học chưa có bài học.");
        int seconds=((Number)rule.get("daily_minutes")).intValue()*60;
        // Use normal playback/progress services so access checks, enrollment, daily totals and
        // chapter/course synchronization match the student flow. Each heartbeat is <=30 seconds.
        Long lessonId=ids.get(0); LessonEntity lesson=lessons.findById(lessonId).orElseThrow();
        for(int watched=0;watched<seconds;watched+=30)
            activity.savePlayback(id,courseId,lessonId,new SavePlaybackRequest(Math.min(watched+30,Math.max(0,lesson.getDurationSeconds()==null?0:lesson.getDurationSeconds())),Math.min(30,seconds-watched)));
        int count=((Number)rule.get("lessons_per_day")).intValue();
        var completed=new HashSet<>(db.queryForList("SELECT lesson_id FROM lesson_progress WHERE user_id=? AND is_completed=TRUE",Long.class,id));
        for(Long item:ids) if(count>0 && !completed.contains(item)) {
            progress.updateLessonProgress(id,courseId,item,new UpdateLessonProgressRequest(true)); count--;
        }
        String features=String.valueOf(rule.get("features"));
        if(!features.isBlank()) for(String feature:features.split(",")) recordFeature(id,feature,today);
        db.update("UPDATE user_learning_rules SET last_run_date=? WHERE user_id=?",Date.valueOf(today),id);
        var result=Map.<String,Object>of("alreadyRun",false,"date",today,"watchSeconds",seconds,"courseId",courseId);
        audit.write(actor,"ACTIVITY_RUN",target(id),null,result,reason);
        return result;
    }
    public FeedbackDto.Form currentFeedback(Long id) { requireStudent(id); return feedback.current(id); }
    @Transactional public FeedbackDto.Receipt submitFeedback(Long id, FeedbackDto.Submit body, AuditContext actor) {
        requireEnabled(); lockStudent(id);
        var result=feedback.submit(body,id);
        recordFeature(id,"FEEDBACK",LocalDate.now(clock.withZone(LearningAnalyticsService.ZONE)));
        audit.write(actor,"ADMIN_FEEDBACK_SUBMIT",target(id),null,result,"Gửi phản hồi qua trang quản trị");
        return result;
    }
    @Transactional public void recordFeature(Long id,String feature,LocalDate date) {
        if(!FEATURES.contains(feature)) throw new BadRequestException("Tính năng không hợp lệ.");
        db.update("INSERT INTO user_feature_usage(user_id,activity_date,feature,access_count) VALUES(?,?,?,1) ON DUPLICATE KEY UPDATE access_count=access_count+1",id,Date.valueOf(date),feature);
    }
    private void lockStudent(Long id) {
        if(db.queryForList("SELECT id FROM users WHERE id=? FOR UPDATE",id).isEmpty()) throw new ResourceNotFoundException("Không tìm thấy học viên.");
        requireStudent(id);
    }
    private void requireStudent(Long id) {
        var user=users.findByIdWithRoles(id).orElseThrow(()->new ResourceNotFoundException("Không tìm thấy học viên."));
        if(user.getStatus()!=UserStatus.ACTIVE || user.getRoles().stream().noneMatch(r->"STUDENT".equals(r.getName()))
            || user.getRoles().stream().anyMatch(r->"ADMIN".equals(r.getName()))) throw new BadRequestException("Chỉ thao tác với tài khoản STUDENT đang hoạt động.");
    }
    private void requireEnabled() { if(!enabled) throw new BadRequestException("Trang hoạt động đang tắt. Bật ACTIVITY_LAB_ENABLED trên server."); }
    private String target(Long id) { return "/api/admin/activity-lab/users/"+id; }
}
