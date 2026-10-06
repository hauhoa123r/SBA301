package com.app.features.learning.service;

import com.app.exception.*;
import com.app.features.learning.dto.request.*;
import com.app.features.learning.dto.response.*;
import com.app.features.learning.repository.*;
import com.app.features.learning.service.impl.LearningProgressServiceImpl;
import com.app.features.model.*;
import com.app.features.model.enums.*;
import com.app.features.users.repository.IUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.*;
import java.util.*;

@Service @RequiredArgsConstructor
public class LearningActivityService {
    private final CourseAccessService access;
    private final ILessonRepository lessons;
    private final ILessonProgressRepository playback;
    private final IQuizLearningRepository quizzes;
    private final IQuizAttemptLearningRepository attempts;
    private final IStudentAnswerLearningRepository answers;
    private final IAssignmentLearningRepository assignments;
    private final IAssignmentSubmissionLearningRepository submissions;
    private final ILearningActivityDailyRepository daily;
    private final IUserRepository users;
    private final QuizGrader grader;
    private final LearningProgressServiceImpl progress;

    @Transactional
    public LessonPlaybackResponse savePlayback(Long userId, Long courseId, Long lessonId, SavePlaybackRequest request) {
        access.ensureProgressEnrollment(userId, courseId);
        LessonEntity lesson = lessons.findByIdAndChapter_CourseEntity_Id(lessonId, courseId)
            .orElseThrow(() -> new ResourceNotFoundException("Bài học không thuộc khóa học."));
        LessonProgressEntity saved = playback.findByUser_IdAndLesson_Id(userId, lessonId).orElseGet(() -> {
            LessonProgressEntity created = new LessonProgressEntity();
            created.setUser(users.getReferenceById(userId)); created.setLesson(lesson);
            created.setWatchSeconds(0); created.setIsCompleted(false);
            return created;
        });
        int position = request.positionSeconds();
        if (lesson.getDurationSeconds() != null && lesson.getDurationSeconds() > 0)
            position = Math.min(position, lesson.getDurationSeconds());
        saved.setPositionSeconds(position);
        saved.setWatchSeconds((saved.getWatchSeconds() == null ? 0 : saved.getWatchSeconds()) + request.watchedSeconds());
        saved.setUpdatedAt(Instant.now());
        playback.save(saved);
        if (request.watchedSeconds() > 0) record(userId, request.watchedSeconds(), 0);
        return new LessonPlaybackResponse(lessonId, position, saved.getWatchSeconds());
    }

    @Transactional
    public CourseProgressResponse submitQuiz(Long userId, Long courseId, Long quizId, SubmitQuizRequest request) {
        access.ensureProgressEnrollment(userId, courseId);
        QuizEntity quiz = quizzes.findInCourse(quizId, courseId)
            .orElseThrow(() -> new ResourceNotFoundException("Bài kiểm tra không thuộc khóa học."));
        var grade = grader.grade(quiz, request);
        QuizAttemptEntity attempt = new QuizAttemptEntity();
        attempt.setUser(users.getReferenceById(userId)); attempt.setQuiz(quiz);
        attempt.setScore(grade.score()); attempt.setIsPassed(grade.passed());
        attempt.setStatus(QuizAttemptStatus.SUBMITTED); attempt.setSubmittedAt(Instant.now());
        attempts.saveAndFlush(attempt);
        List<StudentAnswerEntity> saved = grade.questions().stream().map(item -> {
            StudentAnswerEntity answer = new StudentAnswerEntity();
            answer.setAttempt(attempt); answer.setQuestion(item.question()); answer.setIsCorrect(item.correct());
            answer.setInputText(item.response().text());
            Map<String, Object> payload = new HashMap<>();
            payload.put("answerIds", item.response().answerIds() == null ? List.of() : item.response().answerIds());
            payload.put("matches", item.response().matches() == null ? Map.of() : item.response().matches());
            answer.setStudentResponse(payload);
            if (item.response().answerIds() != null && item.response().answerIds().size() == 1)
                answer.setSelectedAnswer(item.question().getAnswerEntities().stream()
                    .filter(a -> a.getId().equals(item.response().answerIds().get(0))).findFirst().orElse(null));
            return answer;
        }).toList();
        answers.saveAllAndFlush(saved);
        record(userId, 0, 1);
        ChapterEntity chapter = quiz.getLessonEntity() == null ? quiz.getChapter() : quiz.getLessonEntity().getChapter();
        return progress.synchronizeActivities(userId, courseId, chapter);
    }

    @Transactional
    public CourseProgressResponse submitAssignment(Long userId, Long courseId, Long assignmentId, SubmitAssignmentRequest request) {
        access.ensureProgressEnrollment(userId, courseId);
        AssignmentEntity assignment = assignments.findByIdAndLesson_Chapter_CourseEntity_Id(assignmentId, courseId)
            .orElseThrow(() -> new ResourceNotFoundException("Bài tập không thuộc khóa học."));
        AssignmentSubmissionEntity saved = submissions.findFirstByUser_IdAndAssignment_IdOrderByIdDesc(userId, assignmentId)
            .orElseGet(AssignmentSubmissionEntity::new);
        if (saved.getStatus() == AssignmentSubmissionStatus.GRADED)
            throw new BadRequestException("Bài đã được chấm; không thể thay đổi nội dung.");
        saved.setAssignment(assignment); saved.setUser(users.getReferenceById(userId));
        saved.setSubmissionText(request.text().trim()); saved.setSubmittedAt(Instant.now());
        saved.setStatus(AssignmentSubmissionStatus.SUBMITTED); saved.setScore(null); saved.setGradedAt(null);
        submissions.saveAndFlush(saved);
        record(userId, 0, 1);
        return progress.synchronizeActivities(userId, courseId, assignment.getLesson().getChapter());
    }

    @Transactional(readOnly = true)
    public List<ActivityDay> activity(Long userId) {
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        LocalDate from = today.minusDays(83);
        Map<LocalDate, ILearningActivityDailyRepository.Day> saved = new HashMap<>();
        daily.findActivity(userId, from, today).forEach(day -> saved.put(day.getDate(), day));
        return from.datesUntil(today.plusDays(1)).map(date -> {
            var day = saved.get(date);
            return new ActivityDay(date, day == null ? 0 : day.getWatchSeconds(), day == null ? 0 : day.getActivityCount());
        }).toList();
    }

    private void record(Long userId, int seconds, int count) {
        daily.record(userId, LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh")), seconds, count);
    }
    public record ActivityDay(LocalDate date, long watchSeconds, long activityCount) { }
}
