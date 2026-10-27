package com.app.features.notifications;

import com.app.features.contact.model.ContactMessage;
import com.app.features.contact.repository.ContactMessageRepository;
import com.app.features.contact.service.*;
import com.app.features.contact.dto.ContactDto.Submit;
import com.app.features.learning.repository.ILearningActivityDailyRepository;
import com.app.features.learning.service.LearningStreakService;
import com.app.features.model.*;
import com.app.features.model.enums.CourseStatus;
import com.app.features.payments.repository.PaymentUserRepository;
import com.app.security.support.InMemoryDatabaseGuard;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.*;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.test.context.*;
import org.springframework.web.server.ResponseStatusException;
import java.time.*;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest(showSql=false) @ActiveProfiles("security-test")
@AutoConfigureTestDatabase(replace=AutoConfigureTestDatabase.Replace.NONE)
@ContextConfiguration(classes=EngagementIntegrationTest.Config.class,initializers=InMemoryDatabaseGuard.class)
class EngagementIntegrationTest {
    @Configuration @EnableAutoConfiguration
    @EntityScan(basePackageClasses={UserEntity.class,ContactMessage.class})
    @EnableJpaRepositories(basePackageClasses={NotificationRepository.class,ContactMessageRepository.class,PaymentUserRepository.class,ILearningActivityDailyRepository.class})
    @Import({NotificationService.class,RecommendationService.class,ContactService.class,ContactReplyService.class,LearningStreakService.class})
    static class Config {
        @Bean Clock clock() { return Clock.fixed(Instant.parse("2026-10-27T00:00:00Z"),ZoneOffset.UTC); }
        @Bean ObjectMapper objectMapper() { return new ObjectMapper(); }
    }
    @Autowired EntityManager em;
    @Autowired NotificationService notifications;
    @Autowired RecommendationService recommendations;
    @Autowired ContactService contacts;
    @Autowired ContactReplyService replies;
    @Autowired NotificationRepository repository;
    @Autowired LearningStreakService streaks;
    @BeforeEach void useTestSchema() { em.createNativeQuery("SET SCHEMA chinese_online_learning").executeUpdate(); }

    @Test void feedbackGoesToAuthenticatedOwnerOnlyAndRetryDoesNotDuplicate() {
        var sender=user();var other=user();var admin=user();
        var receipt=contacts.submit(new Submit("Student",other.getEmail(),"Góp ý về website","Help"),sender.getId());
        assertTrue(contacts.inbox(null,0).content().get(0).registeredSender());
        replies.reply(receipt.id(),admin.getId(),"  Xin cảm ơn!  ");em.flush();em.clear();
        var inbox=notifications.inbox(sender.getId(),0);
        assertEquals(1,inbox.unreadCount());assertEquals("FEEDBACK_REPLY",inbox.content().get(0).type());
        assertTrue(inbox.content().get(0).content().endsWith("Xin cảm ơn!"));
        assertEquals(0,notifications.inbox(other.getId(),0).unreadCount());
        replies.reply(receipt.id(),admin.getId(),"Xin cảm ơn!");em.flush();
        assertEquals(1,notifications.inbox(sender.getId(),0).content().size());
        assertEquals(409,assertThrows(ResponseStatusException.class,()->replies.reply(receipt.id(),admin.getId(),"Changed")).getStatusCode().value());
        var notice=inbox.content().get(0);
        assertEquals(404,assertThrows(ResponseStatusException.class,()->notifications.read(other.getId(),notice.id())).getStatusCode().value());
        notifications.read(sender.getId(),notice.id());em.flush();assertEquals(0,notifications.inbox(sender.getId(),0).unreadCount());
    }
    @Test void guestAndLegacyMessagesDoNotNotifyAnAccountSharingTheSuppliedEmail() {
        var account=user();var admin=user();
        var receipt=contacts.submit(new Submit("Guest",account.getEmail(),"Khác","Question"));
        replies.reply(receipt.id(),admin.getId(),"Saved internally");em.flush();
        assertEquals(0,repository.count());assertFalse(contacts.inbox(null,0).content().get(0).registeredSender());
    }
    @Test void suggestionResumesUnfinishedAccessibleLessonAndDailyRequestDoesNotFabricateLearning() {
        var student=user();var stranger=user();var teacher=user();
        var course=course(teacher,"Published",CourseStatus.PUBLISHED);var first=lesson(course,1);var second=lesson(course,2);
        legacy(student,course);
        var progress=new LessonProgressEntity();progress.setUser(student);progress.setLesson(first);progress.setIsCompleted(true);progress.setWatchSeconds(30);progress.setUpdatedAt(Instant.parse("2026-10-26T02:00:00Z"));em.persist(progress);
        var hidden=course(teacher,"Hidden",CourseStatus.HIDDEN);lesson(hidden,1);legacy(student,hidden);em.flush();
        assertNull(recommendations.next(stranger.getId()));
        assertEquals(second.getId(),recommendations.next(student.getId()).lessonId());
        assertTrue(notifications.daily(student.getId()).created());assertFalse(notifications.daily(student.getId()).created());
        assertEquals(1,notifications.inbox(student.getId(),0).content().size());
        assertEquals(0,streaks.get(student.getId()).current());assertFalse(streaks.get(student.getId()).activeToday());
        assertEquals(0,((Number)em.createNativeQuery("select count(*) from learning_activity_daily").getSingleResult()).intValue());
        progress.setIsCompleted(true);
        var p2=new LessonProgressEntity();p2.setUser(student);p2.setLesson(second);p2.setIsCompleted(true);p2.setWatchSeconds(0);em.persist(p2);em.flush();
        assertNull(recommendations.next(student.getId()));
    }
    @Test void zeroActivityAndFutureRowsDoNotCountAndStreakUsesVietnamDay() {
        var student=user();
        day(student,LocalDate.of(2026,10,25),60,0);day(student,LocalDate.of(2026,10,26),0,1);
        day(student,LocalDate.of(2026,10,27),0,0);day(student,LocalDate.of(2026,10,28),60,1);em.flush();
        var result=streaks.get(student.getId());assertEquals(2,result.current());assertEquals(2,result.longest());assertFalse(result.activeToday());
    }
    @Test void dailyDedupeUsesVietnamMidnightRatherThanUtcMidnight() {
        var student=user();var course=course(user(),"Course",CourseStatus.PUBLISHED);lesson(course,1);legacy(student,course);em.flush();
        var row=new NotificationEntity();row.setUser(student);row.setType("STUDY_REMINDER");row.setTitle("Earlier today");row.setContent("Text");row.setIsRead(true);
        row.setCreatedAt(Instant.parse("2026-10-26T18:00:00Z"));em.persist(row);em.flush();
        assertFalse(notifications.daily(student.getId()).created());assertEquals(1,repository.count());
        row.setCreatedAt(Instant.parse("2026-10-26T16:59:59Z"));em.flush();
        assertTrue(notifications.daily(student.getId()).created());assertEquals(2,repository.count());
    }
    private UserEntity user() { var row=new UserEntity();row.setFullName("Engagement test");row.setEmail(UUID.randomUUID()+"@example.test");row.setPasswordHash("unused");em.persist(row);return row; }
    private CourseEntity course(UserEntity teacher,String title,CourseStatus status) { var c=new CourseEntity();c.setTeacher(teacher);c.setTitle(title);c.setStatus(status);em.persist(c);return c; }
    private LessonEntity lesson(CourseEntity course,int order) { var ch=em.createQuery("select c from ChapterEntity c where c.courseEntity.id=:id",ChapterEntity.class).setParameter("id",course.getId()).getResultStream().findFirst().orElseGet(()->{var c=new ChapterEntity();c.setCourseEntity(course);c.setTitle("Chapter");c.setOrderIndex(1);em.persist(c);return c;});var l=new LessonEntity();l.setChapter(ch);l.setTitle("Lesson "+order);l.setOrderIndex(order);em.persist(l);return l; }
    private void legacy(UserEntity user,CourseEntity course) { var e=new CourseEnrollmentEntity();e.setUser(user);e.setCourse(course);e.setLegacyAccess(true);e.setEnrolledAt(Instant.parse("2026-10-01T00:00:00Z"));em.persist(e); }
    private void day(UserEntity user,LocalDate date,long seconds,long count) { var d=new LearningActivityDailyEntity();d.setUserId(user.getId());d.setActivityDate(date);d.setWatchSeconds(seconds);d.setActivityCount(count);em.persist(d); }
}
