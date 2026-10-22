package com.app.features.admin;

import com.app.exception.*;
import com.app.features.admin.dto.StudentManagement.*;
import com.app.features.admin.service.*;
import com.app.features.auth.repository.*;
import com.app.features.auth.service.RefreshSessionService;
import com.app.features.model.*;
import com.app.features.model.enums.*;
import com.app.security.jwt.JwtService;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;
import java.time.*;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** Run only via the private MySQL runner; all domain fixtures roll back after each test. */
@SpringBootTest @AutoConfigureMockMvc @Transactional
@EnabledIfEnvironmentVariable(named="RUN_MYSQL_INTEGRATION_TESTS",matches="true")
class AdminUpgradeMySqlTest {
    @Autowired EntityManager em;
    @Autowired JdbcTemplate db;
    @Autowired UserRepository users;
    @Autowired RoleRepository roles;
    @Autowired StudentManagementService students;
    @Autowired CoursePriceService prices;
    @Autowired RegistrationAnalyticsService registrations;
    @Autowired LearningAnalyticsService learning;
    @Autowired PaymentAnalyticsService payments;
    @Autowired RefreshSessionService sessions;
    @Autowired JwtService jwt;
    @Autowired MockMvc mvc;
    private UserEntity admin;
    private AuditContext actor;
    private final LocalDate date=LocalDate.of(2024,10,1);
    private final Instant paidTime=Instant.parse("2024-09-30T17:00:00Z");
    @BeforeEach void fixture() {
        admin=user("ADMIN");
        actor=new AuditContext(admin.getId(),"PATCH","/api/admin/dashboard","127.0.0.1","Admin upgrade regression");
    }
    @Test void deletePreservesFinancialAndLearningHistoryRevokesSessionsAndRejectsTokens() throws Exception {
        var student=user("STUDENT"); var course=course(); var payment=payment(student,course,"SUCCESS","120",paidTime);
        var enrollment=enroll(student,course); var lesson=lesson(course,1); progress(student,lesson,8,true); em.flush();
        String access=jwt.createAccessToken(student),refresh=jwt.createRefreshToken(student); sessions.register(refresh); em.flush();
        mvc.perform(get("/api/auth/me").header("Authorization","Bearer "+access)).andExpect(status().isOk());
        mvc.perform(delete("/api/admin/students/"+student.getId()).header("Authorization","Bearer "+jwt.createAccessToken(admin))
            .contentType("application/json").content("{\"reason\":\"Confirmed account removal\"}")).andExpect(status().isOk());
        em.flush();em.clear();
        assertEquals(UserStatus.DELETED,users.findById(student.getId()).orElseThrow().getStatus());
        assertEquals(0L,db.queryForObject("SELECT COUNT(*) FROM refresh_sessions WHERE user_id=? AND revoked=FALSE",Long.class,student.getId()));
        assertThrows(ResponseStatusException.class,()->sessions.rotate(refresh));
        assertThrows(ResponseStatusException.class,()->sessions.register(refresh));
        mvc.perform(get("/api/auth/me").header("Authorization","Bearer "+access)).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/auth/login").contentType("application/json").content("{\"email\":\""+student.getEmail()+"\",\"password\":\"Password123!\"}")).andExpect(status().is4xxClientError());
        assertEquals(0,students.list(student.getEmail(),"","",0).totalElements());
        assertEquals(1,students.list(student.getEmail(),"DELETED","",0).totalElements());
        assertEquals("STUDENT_DELETE",students.detail(student.getId()).history().get(0).action());
        assertTrue(students.detail(student.getId()).history().get(0).afterData().contains("Confirmed account removal"));
        assertNotNull(em.find(CourseEnrollmentEntity.class,enrollment.getId()));
        assertEquals(new BigDecimal("120.00"),em.find(PaymentEntity.class,payment.getId()).getAmount());
        assertEquals(1L,db.queryForObject("SELECT COUNT(*) FROM lesson_progress WHERE user_id=?",Long.class,student.getId()));
        assertThrows(BadRequestException.class,()->students.changeStatus(student.getId(),new StatusRequest("ACTIVE","No restore"),actor));
        assertThrows(BadRequestException.class,()->students.grant(student.getId(),new GrantRequest("PREMIUM",30,"REPLACE","No access"),actor));
        students.delete(student.getId(),new ReasonRequest("Idempotent retry"),actor);
        assertEquals(1L,db.queryForObject("SELECT COUNT(*) FROM audit_logs WHERE action='STUDENT_DELETE' AND endpoint=?",Long.class,"/api/admin/students/"+student.getId()));
    }
    @Test void adminAndDualRoleTargetsAndSelfAreProtected() {
        assertThrows(BadRequestException.class,()->students.delete(admin.getId(),new ReasonRequest("Self"),actor));
        var other=user("ADMIN"); assertThrows(BadRequestException.class,()->students.delete(other.getId(),new ReasonRequest("Other admin"),actor));
        other.getRoles().add(roles.findByName("STUDENT").orElseThrow()); users.saveAndFlush(other);
        assertThrows(BadRequestException.class,()->students.delete(other.getId(),new ReasonRequest("Dual roles"),actor));
    }
    @Test void priceUpdateKeepsPendingAndPaidSnapshotsAndPublicationAndDetectsStaleWrite() {
        var c=course(); var s=user("STUDENT");
        var pending=payment(s,c,"CREATED","100",null); var paid=payment(s,c,"SUCCESS","90",paidTime);
        em.flush();
        prices.update(c.getId(),new CoursePriceService.PriceRequest(new BigDecimal("250"),new BigDecimal("100"),"New offer"),actor);
        em.clear();
        assertEquals(new BigDecimal("250.00"),em.find(CourseEntity.class,c.getId()).getPrice());
        assertEquals(CourseStatus.HIDDEN,em.find(CourseEntity.class,c.getId()).getStatus());
        assertEquals(new BigDecimal("100.00"),em.find(PaymentEntity.class,pending.getId()).getAmount());
        assertEquals(new BigDecimal("90.00"),em.find(PaymentEntity.class,paid.getId()).getInvoice().getAmount());
        var stale=assertThrows(ResponseStatusException.class,()->prices.update(c.getId(),new CoursePriceService.PriceRequest(BigDecimal.ZERO,new BigDecimal("100"),"Stale tab"),actor));
        assertEquals(409,stale.getStatusCode().value());
        prices.update(c.getId(),new CoursePriceService.PriceRequest(BigDecimal.ZERO,new BigDecimal("250"),"Catalog free price"),actor);
        em.clear(); assertEquals(CourseStatus.HIDDEN,em.find(CourseEntity.class,c.getId()).getStatus());
        assertEquals(2L,db.queryForObject("SELECT COUNT(*) FROM audit_logs WHERE action='COURSE_PRICE_UPDATE' AND endpoint=?",Long.class,"/api/admin/dashboard/courses/"+c.getId()));
    }
    @Test void simultaneousPriceEditsCannotOverwriteEachOther() throws Exception {
        var c=course();
        // Commit only this test's fixtures so independent transactions can lock the same row.
        org.springframework.test.context.transaction.TestTransaction.flagForCommit();
        org.springframework.test.context.transaction.TestTransaction.end();
        var executor=java.util.concurrent.Executors.newFixedThreadPool(2);
        var start=new java.util.concurrent.CountDownLatch(1);
        try {
            var work=new ArrayList<java.util.concurrent.Future<Integer>>();
            for(int amount:List.of(200,300)) work.add(executor.submit(()->{
                if(!start.await(10,java.util.concurrent.TimeUnit.SECONDS)) throw new IllegalStateException("Race start timeout");
                try { prices.update(c.getId(),new CoursePriceService.PriceRequest(BigDecimal.valueOf(amount),new BigDecimal("100"),"Concurrent edit"),actor);return 200; }
                catch(ResponseStatusException conflict) {return conflict.getStatusCode().value();}
            }));
            start.countDown();
            var results=new ArrayList<Integer>(); for(var f:work) results.add(f.get(20,java.util.concurrent.TimeUnit.SECONDS));
            Collections.sort(results); assertEquals(List.of(200,409),results);
            assertEquals(1L,db.queryForObject("SELECT COUNT(*) FROM audit_logs WHERE action='COURSE_PRICE_UPDATE' AND endpoint=?",Long.class,"/api/admin/dashboard/courses/"+c.getId()));
        } finally {
            executor.shutdownNow();
            // Exact fixture IDs only; this test is gated to the isolated database runner.
            org.springframework.test.context.transaction.TestTransaction.start();
            db.update("DELETE FROM audit_logs WHERE user_id=?",admin.getId());
            db.update("DELETE FROM courses WHERE id=?",c.getId());
            db.update("DELETE FROM user_roles WHERE user_id=?",admin.getId());
            db.update("DELETE FROM users WHERE id=?",admin.getId());
            org.springframework.test.context.transaction.TestTransaction.flagForCommit();
            org.springframework.test.context.transaction.TestTransaction.end();
        }
    }
    @Test void hourlySpikeIsAReviewSignalAndDoesNotChangeAccounts() {
        for(int n=0;n<12;n++) timestamp(user("STUDENT"),paidTime.plusSeconds(3600+n));
        var report=registrations.report(new AnalyticsRange(date,date,"hour"),false);
        assertEquals(1,report.hourlySignals().size());assertEquals(12,report.hourlySignals().get(0).count());
        assertEquals("2024-10-01 01:00",report.hourlySignals().get(0).hour());
        assertEquals(12,report.total());
    }
    @Test void registrationUsesVietnamBoundariesHistoricalStudentsDistinctRolesAndKnownSources() {
        var before=user("STUDENT"); timestamp(before,paidTime.minusSeconds(1));
        var at=user("STUDENT"); timestamp(at,paidTime); at.setStatus(UserStatus.DELETED);
        var lab=user("STUDENT"); timestamp(lab,paidTime.plusSeconds(1));
        db.update("INSERT INTO audit_logs(user_id,action,method,endpoint) VALUES(?,'ADMIN_ACCOUNT_CREATE','POST',?)",admin.getId(),"/api/admin/activity-lab/users/"+lab.getId());
        var dual=user("STUDENT"); dual.getRoles().add(roles.findByName("ADMIN").orElseThrow());timestamp(dual,paidTime);
        var atEnd=user("STUDENT");timestamp(atEnd,paidTime.plusSeconds(86400));em.flush();
        var range=new AnalyticsRange(date,date,"hour");
        for(String tz:List.of("+00:00","+07:00")) {
            db.execute("SET time_zone='"+tz+"'");
            try {
                var report=registrations.report(range,false);
                assertEquals(1,report.total()); assertEquals(1,report.previousTotal()); assertEquals(24,report.buckets().size());
                assertEquals(1,report.buckets().get(0).count()); assertEquals(0,report.buckets().get(23).count());
                assertEquals(2,registrations.report(range,true).total());
                var daily=registrations.report(new AnalyticsRange(date.minusDays(1),date.plusDays(1),"day"),false);
                assertEquals(List.of(1L,1L,1L),daily.buckets().stream().map(RegistrationAnalyticsService.Bucket::count).toList());
                var monthly=registrations.report(new AnalyticsRange(date.minusDays(1),date,"month"),false);
                assertEquals(List.of(1L,1L),monthly.buckets().stream().map(RegistrationAnalyticsService.Bucket::count).toList());
            } finally { db.execute("SET time_zone='+00:00'"); }
        }
    }
    @Test void learningSeparatesEnrollmentsUniqueUsersAndLessonEvidenceAndExcludesLab() {
        var c=course(); var c2=course(); var first=user("STUDENT");var second=user("STUDENT");var third=user("STUDENT");var lab=user("STUDENT");
        enroll(first,c);enroll(first,c2);enroll(second,c);enroll(third,c);enroll(lab,c);
        var l1=lesson(c,1);var l2=lesson(c,2);
        progress(first,l1,5,false);progress(first,l2,12,true);progress(second,l1,0,false);progress(lab,l1,100,true);
        db.update("INSERT INTO audit_logs(user_id,action,method,endpoint) VALUES(?,'ACTIVITY_RUN','POST',?)",admin.getId(),"/api/admin/activity-lab/users/"+lab.getId());
        em.flush();
        var report=learning.report(learning.today(),learning.today(),0,0,"",false);
        assertEquals(4,report.summary().totalEnrollments());assertEquals(3,report.summary().uniqueEnrolledStudents());
        assertEquals(1,report.summary().studentsStarted());assertEquals(1,report.summary().studentsCompletedLesson());
        var course=report.courses().stream().filter(v->v.id()==c.getId()).findFirst().orElseThrow();
        assertEquals(3,course.uniqueStudents());assertEquals(1,course.started());assertEquals(1,course.completedLessonUsers());assertEquals(new BigDecimal("33.3"),course.startRate());
        assertEquals(0,course.courseCompletionCount());assertEquals(4,report.enrollmentTrend().get(0).enrollments());
        assertEquals(2,learning.report(learning.today(),learning.today(),0,0,"",true).summary().studentsStarted());
    }
    @Test void paymentRevenueStatusesPartialRefundsUnknownDatesSearchAndPagination() {
        var s=user("STUDENT");var c=course();
        var success=payment(s,c,"SUCCESS","100",paidTime);var full=payment(s,c,"SUCCESS","50",paidTime.plusSeconds(3600));
        payment(s,c,"CREATED","900",null);payment(s,c,"FAILED","800",null);
        payment(s,c,"CANCELLED","700",null);payment(s,c,"EXPIRED","600",null);
        refund(success,"20",RefundStatus.PROCESSED,paidTime.plusSeconds(7200));
        refund(success,"10",RefundStatus.PROCESSED,paidTime.plusSeconds(7300));
        refund(success,"40",RefundStatus.APPROVED,null);em.flush();
        refund(full,"50",RefundStatus.PROCESSED,paidTime.plusSeconds(7400));em.flush();
        var range=new AnalyticsRange(date,date,"day");
        var report=payments.report(range,"","",0,1);
        assertEquals(new BigDecimal("150.00"),report.totalRevenue()); assertEquals(new BigDecimal("150.00"),report.revenue());
        assertEquals(new BigDecimal("80.00"),report.refundedAmount());assertEquals(new BigDecimal("70.00"),report.netRevenue());
        assertEquals(2,report.successfulPayments());assertEquals(1,report.pendingPayments());assertEquals(3,report.failedPayments());assertEquals(6,report.totalTransactions());
        assertEquals(0,report.unknownPaymentTimes());assertEquals(1,report.content().size());assertEquals(6,report.totalPages());
        assertEquals(1,payments.report(range,success.getTransactionId(),"SUCCESS",0,20).totalElements());
        assertEquals(0,payments.report(range,"","SUCCESS",10,20).content().size());
        assertEquals(new BigDecimal("30.00"),payments.detail(success.getId()).refundedAmount());
        assertEquals(new BigDecimal("150.00"),payments.report(new AnalyticsRange(date,date,"month"),"","",0,20).trend().get(0).amount());
        refund(success,"1",RefundStatus.PROCESSED,null);em.flush();
        assertNull(payments.report(range,"","",0,20).netRevenue());
        db.update("UPDATE refunds SET processed_at=? WHERE payment_id=? AND status='PROCESSED' AND processed_at IS NULL","2024-09-30 19:00:00",success.getId());
        assertEquals(new BigDecimal("69.00"),payments.report(range,"","",0,20).netRevenue());
        var unknown=payment(s,c,"SUCCESS","25",null);em.flush();
        assertNull(payments.detail(unknown.getId()).paymentTime());
        assertEquals(1,payments.report(range,"","",0,20,true).totalElements());
        assertEquals(new BigDecimal("175.00"),payments.report(range,"","",0,20).totalRevenue());
        assertNull(payments.report(range,"","",0,20).netRevenue());
        assertThrows(BadRequestException.class,()->payments.report(range,"","PAID",0,20));
        assertThrows(BadRequestException.class,()->payments.report(range,"","",-1,20));
        assertThrows(ResourceNotFoundException.class,()->payments.detail(Long.MAX_VALUE));
    }
    @Test void emptyRangesAreZeroFilledWithoutInventingNetRevenueOrStartRates() {
        var r=new AnalyticsRange(LocalDate.of(2023,1,1),LocalDate.of(2023,1,3),"day");
        assertEquals(0,registrations.report(r,false).total()); assertEquals(3,registrations.report(r,false).buckets().size());
        var p=payments.report(r,"","",0,20); assertEquals(0,p.revenue().signum());assertEquals(0,p.netRevenue().signum());assertEquals(0,p.totalTransactions());
        var c=course();em.flush(); var report=learning.report(learning.today(),learning.today(),0,0,"",false);
        assertNull(report.courses().stream().filter(x->x.id()==c.getId()).findFirst().orElseThrow().startRate());
    }
    private UserEntity user(String role) {
        var u=new UserEntity();u.setFullName("Upgrade fixture");u.setEmail(UUID.randomUUID()+"@example.test");u.setPasswordHash("Password123!");
        u.getRoles().add(roles.findByName(role).orElseThrow());return users.saveAndFlush(u);
    }
    private CourseEntity course() {
        var c=new CourseEntity();c.setTeacher(admin);c.setTitle("Upgrade "+UUID.randomUUID());c.setPrice(new BigDecimal("100"));c.setStatus(CourseStatus.HIDDEN);em.persist(c);em.flush();return c;
    }
    private CourseEnrollmentEntity enroll(UserEntity u,CourseEntity c) {
        var e=new CourseEnrollmentEntity();e.setUser(u);e.setCourse(c);e.setEnrolledAt(learning.today().atStartOfDay(AnalyticsRange.ZONE).toInstant().plusSeconds(60));em.persist(e);return e;
    }
    private LessonEntity lesson(CourseEntity c,int order) {
        ChapterEntity ch;
        if(order==1) {ch=new ChapterEntity();ch.setCourseEntity(c);ch.setTitle("Chapter");ch.setOrderIndex(1);em.persist(ch);}
        else ch=em.createQuery("select ch from ChapterEntity ch where ch.courseEntity.id=:id",ChapterEntity.class).setParameter("id",c.getId()).getSingleResult();
        var l=new LessonEntity();l.setChapter(ch);l.setTitle("Lesson");l.setOrderIndex(order);em.persist(l);return l;
    }
    private void progress(UserEntity u,LessonEntity l,int seconds,boolean complete) {
        var p=new LessonProgressEntity();p.setUser(u);p.setLesson(l);p.setWatchSeconds(seconds);p.setIsCompleted(complete);em.persist(p);
    }
    private void timestamp(UserEntity u,Instant t) {em.flush();db.update("UPDATE users SET created_at=FROM_UNIXTIME(?) WHERE id=?",t.getEpochSecond(),u.getId());}
    private PaymentEntity payment(UserEntity u,CourseEntity c,String status,String amount,Instant time) {
        var i=new InvoiceEntity();i.setUser(u);i.setCourse(c);i.setOriginalAmount(new BigDecimal(amount));i.setAmount(new BigDecimal(amount));i.setStatus(status.equals("SUCCESS")?InvoiceStatus.PAID:InvoiceStatus.PENDING);em.persist(i);
        var p=new PaymentEntity();p.setInvoice(i);p.setAmount(new BigDecimal(amount));p.setProvider(PaymentProvider.PAYOS);p.setTransactionId(UUID.randomUUID().toString());p.setStatus(PaymentStatus.valueOf(status));p.setPaidAt(time);em.persist(p);em.flush();
        db.update("UPDATE payments SET created_at=FROM_UNIXTIME(?) WHERE id=?",paidTime.getEpochSecond(),p.getId());return p;
    }
    private void refund(PaymentEntity payment,String amount,RefundStatus status,Instant time) {
        var r=new RefundEntity();r.setPayment(payment);r.setUser(payment.getInvoice().getUser());r.setAmount(new BigDecimal(amount));r.setReason("Regression refund");r.setStatus(status);r.setProcessedAt(time);em.persist(r);
    }
}
