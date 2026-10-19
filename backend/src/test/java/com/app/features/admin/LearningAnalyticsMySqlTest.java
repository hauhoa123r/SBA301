package com.app.features.admin;

import com.app.exception.BadRequestException;
import com.app.features.admin.dto.LearningAnalytics.*;
import com.app.features.admin.dto.StudentManagement.AuditContext;
import com.app.features.admin.service.*;
import com.app.features.auth.repository.*;
import com.app.features.feedback.dto.FeedbackDto;
import com.app.features.feedback.model.FeedbackQuestion.Type;
import com.app.features.feedback.service.FeedbackService;
import com.app.features.model.*;
import com.app.features.model.enums.*;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import java.sql.Date;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(properties={"app.activity-lab.enabled=true","app.activity-lab.cron=0 0 0 1 1 *"})
@Transactional
@EnabledIfEnvironmentVariable(named="RUN_MYSQL_INTEGRATION_TESTS",matches="true")
class LearningAnalyticsMySqlTest {
    @Autowired ActivityLabService lab;
    @Autowired LearningAnalyticsService analytics;
    @Autowired FeedbackService feedback;
    @Autowired JdbcTemplate db;
    @Autowired EntityManager em;
    @Autowired UserRepository users;
    @Autowired RoleRepository roles;
    private Long userId,courseId;
    private AuditContext actor;
    @BeforeEach void fixture() {
        var admin=new UserEntity(); admin.setEmail(UUID.randomUUID()+"@example.test"); admin.setFullName("Activity admin"); admin.setPasswordHash("hash");
        admin.getRoles().add(roles.findByName("ADMIN").orElseThrow()); users.saveAndFlush(admin);
        actor=new AuditContext(admin.getId(),"POST","/api/admin/activity-lab","127.0.0.1","Regression test");
        userId=lab.create(new CreateAccount("Activity student",UUID.randomUUID()+"@example.test","ValidPassword123!","Regression fixture"),actor);
        var course=new CourseEntity(); course.setTitle("Activity course"); course.setTeacher(admin); course.setStatus(CourseStatus.PUBLISHED); em.persist(course);
        var chapter=new ChapterEntity(); chapter.setCourseEntity(course); chapter.setTitle("Chapter"); chapter.setOrderIndex(1); em.persist(chapter);
        for(int i=1;i<=2;i++) { var lesson=new LessonEntity(); lesson.setChapter(chapter); lesson.setTitle("Lesson "+i); lesson.setOrderIndex(i); lesson.setDurationSeconds(600); em.persist(lesson); }
        em.flush(); courseId=course.getId();
    }
    @Test void normalAccountSubscriptionProgressAndDashboardShareTheSameDataAndRunOnlyOnce() {
        assertEquals(UserStatus.ACTIVE,users.findById(userId).orElseThrow().getStatus());
        lab.grant(userId,new Grant("PREMIUM",30,"Admin grant"),actor);
        lab.rule(userId,new Rule(courseId,10,1,false,List.of("LEARNING","PROFILE"),"Disabled plan"),actor);
        lab.runScheduled(userId,actor);
        assertEquals(0L,db.queryForObject("SELECT COUNT(*) FROM learning_activity_daily WHERE user_id=?",Long.class,userId));
        lab.rule(userId,new Rule(courseId,10,1,true,List.of("LEARNING","PROFILE"),"Daily plan"),actor);
        assertEquals(false,lab.run(userId,"First run",actor).get("alreadyRun"));
        assertEquals(true,lab.run(userId,"Retry",actor).get("alreadyRun"));
        assertEquals(600L,db.queryForObject("SELECT watch_seconds FROM learning_activity_daily WHERE user_id=? AND activity_date=?",Long.class,userId,Date.valueOf(analytics.today())));
        assertEquals(1L,db.queryForObject("SELECT COUNT(*) FROM lesson_progress WHERE user_id=? AND is_completed=TRUE",Long.class,userId));
        assertEquals(1L,db.queryForObject("SELECT COUNT(*) FROM user_chapter_progress WHERE user_id=?",Long.class,userId));
        assertEquals(1L,db.queryForObject("SELECT COUNT(*) FROM course_enrollments WHERE user_id=?",Long.class,userId));
        assertEquals(0L,db.queryForObject("SELECT COUNT(*) FROM invoices WHERE user_id=?",Long.class,userId));
        assertEquals(1L,db.queryForObject("SELECT COUNT(*) FROM audit_logs WHERE action='ACTIVITY_RUN' AND endpoint=?",Long.class,"/api/admin/activity-lab/users/"+userId));
        var report=analytics.report(analytics.today(),analytics.today(),0,10,users.findById(userId).orElseThrow().getEmail());
        assertEquals(1,report.totalLearners()); assertEquals(600,report.learners().get(0).watchSeconds());
        var course=report.courses().stream().filter(c->c.id()==courseId).findFirst().orElseThrow();
        assertEquals(1,course.started()); assertEquals(1,course.completedLessonUsers());
        var registry=new io.micrometer.core.instrument.simple.SimpleMeterRegistry();
        new LearningMetrics(db,java.time.Clock.systemUTC(),registry);
        assertEquals(1,registry.get("learning.daily.threshold.users").tag("minutes","5").gauge().value());
        assertEquals(1,registry.get("learning.daily.threshold.users").tag("minutes","10").gauge().value());
        assertEquals(0,registry.get("learning.daily.threshold.users").tag("minutes","15").gauge().value());
        assertNotNull(lab.detail(userId));
    }
    @Test void thresholdsAreCumulativeAndBoundaryInclusiveAndEmptyDatesArePresent() {
        analytics.saveSettings(new Settings(List.of(15,5,10,5,20)),actor);
        for(int seconds:List.of(299,300,600,900)) {
            Long id=lab.create(new CreateAccount("Boundary "+seconds,UUID.randomUUID()+"@example.test","ValidPassword123!","Fixture"),actor);
            db.update("INSERT INTO learning_activity_daily(user_id,activity_date,watch_seconds,activity_count) VALUES(?,?,?,1)",id,Date.valueOf(analytics.today()),seconds);
        }
        var report=analytics.report(analytics.today().minusDays(1),analytics.today(),0,0,"");
        assertEquals(2,report.days().size()); assertEquals(0,report.days().get(0).users());
        var thresholds=report.days().get(1).thresholds();
        assertEquals(List.of(5,10,15,20),thresholds.stream().map(Threshold::minutes).toList());
        assertEquals(List.of(3L,2L,1L,0L),thresholds.stream().map(Threshold::users).toList());
        assertThrows(BadRequestException.class,()->analytics.report(analytics.today().minusDays(93),analytics.today(),0,0,""));
    }
    @Test void feedbackUsesThePublishedFormValidationAndNormalSubmissionTables() {
        var current=feedback.current(userId);
        if(current!=null) feedback.changeState(current.id(),new FeedbackDto.State(current.revision(),"PAUSE"));
        var question=new FeedbackDto.Question(null,"Your feedback","",Type.SHORT_TEXT,true,null,null,255,null,null,List.of());
        var form=feedback.create(new FeedbackDto.Save(null,"Activity feedback","",true,null,null,List.of(question)));
        form=feedback.changeState(form.id(),new FeedbackDto.State(form.revision(),"PUBLISH"));
        var body=new FeedbackDto.Submit(form.id(),form.revision(),List.of(new FeedbackDto.Answer(form.questions().get(0).id(),"Useful lesson",null,List.of())));
        var receipt=lab.submitFeedback(userId,body,actor);
        assertEquals(1L,db.queryForObject("SELECT COUNT(*) FROM feedback_submissions WHERE id=? AND user_id=?",Long.class,receipt.submissionId(),userId));
        assertEquals(1L,db.queryForObject("SELECT COUNT(*) FROM feedback_visits WHERE form_id=? AND user_id=?",Long.class,form.id(),userId));
        assertTrue(lab.currentFeedback(userId).hasSubmitted()); assertNotNull(lab.detail(userId));
    }
    @Test void activityWithoutLearningAccessCannotCreateProgressAndAdminTargetsAreRejected() {
        lab.rule(userId,new Rule(courseId,5,1,true,List.of(),"Fixture"),actor);
        assertThrows(com.app.exception.AccessDeniedException.class,()->lab.run(userId,"No subscription",actor));
        assertEquals(0L,db.queryForObject("SELECT COUNT(*) FROM lesson_progress WHERE user_id=?",Long.class,userId));
        assertThrows(BadRequestException.class,()->lab.rule(actor.actorId(),new Rule(courseId,5,1,true,List.of(),"Invalid target"),actor));
    }
}
