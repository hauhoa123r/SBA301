package com.app.features.learning;

import com.app.features.admin.service.AssignmentReviewService;
import com.app.features.learning.converter.LearningProgressResponseConverter;
import com.app.features.learning.dto.request.*;
import com.app.features.learning.loader.LearningProgressDetailsLoader;
import com.app.features.learning.repository.*;
import com.app.features.learning.service.*;
import com.app.features.learning.service.impl.LearningProgressServiceImpl;
import com.app.features.model.*;
import com.app.features.model.enums.*;
import com.app.features.subscriptions.service.SubscriptionService;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest(properties = {"spring.jpa.hibernate.ddl-auto=none", "spring.jpa.show-sql=false"}, showSql = false)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@EnabledIfEnvironmentVariable(named = "RUN_MYSQL_INTEGRATION_TESTS", matches = "true")
@Import({CourseAccessService.class, LearningActivityService.class, LearningProgressServiceImpl.class,
        LearningProgressDetailsLoader.class, LearningProgressResponseConverter.class, QuizGrader.class, AssignmentReviewService.class,
        com.app.features.admin.repository.DashboardRepository.class})
class LearningProgressIntegrationTest {
    @Autowired TestEntityManager em;
    @Autowired LearningProgressServiceImpl progress;
    @Autowired LearningActivityService learning;
    @Autowired AssignmentReviewService reviews;
    @Autowired IAssignmentSubmissionLearningRepository submissions;
    @Autowired ICourseEnrollmentRepository enrollments;
    @Autowired ILearningStatsRepository stats;
    @Autowired com.app.features.admin.repository.DashboardRepository dashboard;
    @MockitoBean SubscriptionService subscriptions;
    private Long userId, courseId, lessonId, quizId, chapterQuizId, answerId, chapterAnswerId, assignmentId, secondAssignmentId;

    @BeforeEach void fixture() {
        var student = user(); var teacher = user(); userId = student.getId();
        var course = new CourseEntity(); course.setTeacher(teacher); course.setTitle("Progress regression"); course.setStatus(CourseStatus.PUBLISHED);
        em.persist(course); courseId = course.getId();
        var chapter = new ChapterEntity(); chapter.setCourseEntity(course); chapter.setTitle("Chapter"); chapter.setOrderIndex(1); em.persist(chapter);
        var lesson = new LessonEntity(); lesson.setChapter(chapter); lesson.setTitle("Lesson"); lesson.setOrderIndex(1); lesson.setDurationSeconds(120); em.persist(lesson); lessonId = lesson.getId();
        var quiz = quiz(teacher, lesson, null); quizId = quiz.getId(); answerId = quiz.getQuestionEntities().get(0).getAnswerEntities().get(0).getId();
        var chapterQuiz = quiz(teacher, null, chapter); chapterQuizId = chapterQuiz.getId(); chapterAnswerId = chapterQuiz.getQuestionEntities().get(0).getAnswerEntities().get(0).getId();
        assignmentId = assignment(lesson).getId(); secondAssignmentId = assignment(lesson).getId();
        var enrollment = new CourseEnrollmentEntity(); enrollment.setUser(student); enrollment.setCourse(course); enrollment.setLegacyAccess(true); enrollment.setEnrolledAt(java.time.Instant.now()); em.persist(enrollment);
        em.flush(); em.clear();
    }

    @Test void completeLearningRoundTripAndFailedRetakePreservesEarlierPass() {
        assertEquals(5, progress.getCourseProgress(userId, courseId).getTotalActivities());
        assertEquals(20, progress.updateLessonProgress(userId, courseId, lessonId, new UpdateLessonProgressRequest(true)).getProgressPercent());
        assertEquals(40, learning.submitQuiz(userId, courseId, quizId, answer(quizId, answerId)).getProgressPercent());
        learning.submitAssignment(userId, courseId, assignmentId, new SubmitAssignmentRequest("first response"));
        learning.submitAssignment(userId, courseId, secondAssignmentId, new SubmitAssignmentRequest("second response"));
        var complete = learning.submitQuiz(userId, courseId, chapterQuizId, answer(chapterQuizId, chapterAnswerId));
        assertEquals(100, complete.getProgressPercent()); assertTrue(complete.isCourseCompleted());
        assertEquals(1, complete.getCompletedChapterIds().size());
        assertNotNull(enrollments.findByUser_IdAndCourse_Id(userId, courseId).orElseThrow().getCompletedAt());
        em.flush(); em.clear();
        var restored = progress.getCourseProgress(userId, courseId);
        assertEquals(2, restored.getQuizResults().size()); assertEquals(2, restored.getAssignmentSubmissions().size());
        assertEquals("first response", restored.getAssignmentSubmissions().stream().filter(s -> s.assignmentId().equals(assignmentId)).findFirst().orElseThrow().text());
        assertEquals(2, stats.countQuizzes(courseId)); assertEquals(2, stats.findHighestPassedQuizScores(userId, courseId).size());
        assertEquals(20, stats.sumEarnedQuizQuestionPoints(userId, courseId));
        var wrongId = em.find(QuizEntity.class, quizId).getQuestionEntities().get(0).getAnswerEntities().get(1).getId();
        var retake = learning.submitQuiz(userId, courseId, quizId, answer(quizId, wrongId));
        assertTrue(retake.isCourseCompleted()); assertTrue(retake.getPassedQuizIds().contains(quizId));
        assertFalse(retake.getQuizResults().stream().filter(r -> r.quizId().equals(quizId)).findFirst().orElseThrow().isPassed());
        var undone = progress.updateLessonProgress(userId, courseId, lessonId, new UpdateLessonProgressRequest(false));
        assertEquals(80, undone.getProgressPercent()); assertFalse(undone.isCourseCompleted()); assertTrue(undone.getCompletedChapterIds().isEmpty());
        assertNull(enrollments.findByUser_IdAndCourse_Id(userId, courseId).orElseThrow().getCompletedAt());
    }

    @Test void videoPositionTimeAndDailyActivitySurviveReloadWithoutCompletingLesson() {
        learning.savePlayback(userId, courseId, lessonId, new SavePlaybackRequest(23, 15));
        learning.savePlayback(userId, courseId, lessonId, new SavePlaybackRequest(85, 12));
        em.flush(); em.clear();
        var restored = progress.getCourseProgress(userId, courseId);
        assertEquals(85, restored.getLessonPlayback().get(0).positionSeconds());
        assertEquals(27, restored.getLessonPlayback().get(0).watchSeconds());
        assertTrue(restored.getCompletedLessonIds().isEmpty());
        var days = learning.activity(userId); assertEquals(84, days.size());
        assertEquals(27, days.get(83).watchSeconds()); assertEquals(0, days.get(83).activityCount());
        progress.updateLessonProgress(userId, courseId, lessonId, new UpdateLessonProgressRequest(true));
        assertEquals(1, learning.activity(userId).get(83).activityCount());
    }

    @Test void revisionAndGradingUpdateProgressAndProtectGradedWork() {
        progress.updateLessonProgress(userId, courseId, lessonId, new UpdateLessonProgressRequest(true));
        learning.submitQuiz(userId, courseId, quizId, answer(quizId, answerId));
        learning.submitQuiz(userId, courseId, chapterQuizId, answer(chapterQuizId, chapterAnswerId));
        learning.submitAssignment(userId, courseId, assignmentId, new SubmitAssignmentRequest("initial"));
        learning.submitAssignment(userId, courseId, secondAssignmentId, new SubmitAssignmentRequest("second"));
        Long id = submissions.findFirstByUser_IdAndAssignment_IdOrderByIdDesc(userId, assignmentId).orElseThrow().getId();
        reviews.grade(id, new AssignmentReviewService.GradeRequest("NEEDS_REVISION", null, "Please revise"));
        assertEquals(80, progress.getCourseProgress(userId, courseId).getProgressPercent());
        assertNull(enrollments.findByUser_IdAndCourse_Id(userId, courseId).orElseThrow().getCompletedAt());
        assertEquals(100, learning.submitAssignment(userId, courseId, assignmentId, new SubmitAssignmentRequest("revised")).getProgressPercent());
        assertEquals(1, reviews.list("SUBMITTED", 0).content().stream().filter(s -> s.id().equals(id)).count());
        var enrollment = enrollments.findByUser_IdAndCourse_Id(userId, courseId).orElseThrow(); enrollment.setLegacyAccess(false); em.flush();
        // Admin review is allowed after student entitlement expires.
        assertEquals(75, reviews.grade(id, new AssignmentReviewService.GradeRequest("GRADED", 75, "Good")).score());
        enrollment.setLegacyAccess(true); em.flush();
        assertThrows(com.app.exception.BadRequestException.class, () -> learning.submitAssignment(userId, courseId, assignmentId, new SubmitAssignmentRequest("edit graded")));
    }

    @Test void anotherStudentCannotReadCourseProgress() {
        assertThrows(com.app.exception.AccessDeniedException.class, () -> progress.getCourseProgress(user().getId(), courseId));
    }

    private SubmitQuizRequest answer(Long quizId, Long selectedId) {
        Long questionId = em.find(QuizEntity.class, quizId).getQuestionEntities().get(0).getId();
        return new SubmitQuizRequest(List.of(new SubmitQuizRequest.Response(questionId, List.of(selectedId), null, null)));
    }
    private QuizEntity quiz(UserEntity teacher, LessonEntity lesson, ChapterEntity chapter) {
        var quiz = new QuizEntity(); quiz.setTeacher(teacher); quiz.setLessonEntity(lesson); quiz.setChapter(chapter); quiz.setTitle("Quiz");
        var question = new QuestionEntity(); question.setContent("Select A"); question.setQuestionType(QuestionType.SINGLE_CHOICE); question.setOrderIndex(1);
        var correct = new AnswerEntity(); correct.setContent("A"); correct.setIsCorrect(true); question.addAnswer(correct);
        var wrong = new AnswerEntity(); wrong.setContent("B"); question.addAnswer(wrong);
        quiz.addQuestion(question); return em.persistAndFlush(quiz);
    }
    private AssignmentEntity assignment(LessonEntity lesson) {
        var assignment = new AssignmentEntity(); assignment.setLesson(lesson); assignment.setTitle("Assignment"); assignment.setDescription("Write a response"); return em.persist(assignment);
    }
    private UserEntity user() {
        var user = new UserEntity(); user.setFullName("Progress test student"); user.setEmail("progress-" + UUID.randomUUID() + "@example.test"); user.setPasswordHash("unused"); return em.persist(user);
    }

    @Test void adminCountsQuizAndAssignmentActivityBeforeLessonsAreMarkedComplete() {
        var wrongId = em.find(QuizEntity.class, quizId).getQuestionEntities().get(0).getAnswerEntities().get(1).getId();
        learning.submitQuiz(userId, courseId, quizId, answer(quizId, wrongId));
        em.flush();
        var result = dashboard.courses("Progress regression", "PUBLISHED", 0, 20).content().stream()
            .filter(row -> row.id() == courseId).findFirst().orElseThrow();
        assertEquals(1, result.learning()); assertEquals(0, result.completed());
    }
}
