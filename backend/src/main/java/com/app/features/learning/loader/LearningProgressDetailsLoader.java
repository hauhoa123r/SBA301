package com.app.features.learning.loader;

import com.app.features.learning.dto.request.SubmitQuizRequest;
import com.app.features.learning.dto.response.*;
import com.app.features.learning.repository.*;
import com.app.features.model.*;
import com.app.features.model.enums.AssignmentSubmissionStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.util.*;
import java.util.stream.Collectors;

@Component @RequiredArgsConstructor
public class LearningProgressDetailsLoader {
    private final ILessonProgressRepository lessons;
    private final IQuizAttemptLearningRepository attempts;
    private final IStudentAnswerLearningRepository answers;
    private final IAssignmentSubmissionLearningRepository submissions;
    private final IActivityCompletionRepository activities;

    public void enrich(CourseProgressResponse response, Long userId, Long courseId) {
        response.setLessonPlayback(lessons.findByUser_IdAndLesson_Chapter_CourseEntity_Id(userId, courseId).stream()
            .map(p -> new LessonPlaybackResponse(p.getLesson().getId(), number(p.getPositionSeconds()), number(p.getWatchSeconds()))).toList());
        response.setPassedQuizIds(attempts.findPassedQuizIds(userId, courseId));
        var latest = attempts.findLatestInCourse(userId, courseId);
        Map<Long, List<StudentAnswerEntity>> byAttempt = latest.isEmpty() ? Map.of() : answers.findByAttempt_IdIn(
            latest.stream().map(QuizAttemptEntity::getId).toList()).stream().collect(Collectors.groupingBy(a -> a.getAttempt().getId()));
        response.setQuizResults(latest.stream().map(a -> quizResult(a, byAttempt.getOrDefault(a.getId(), List.of()))).toList());
        var saved = submissions.findLatestInCourse(userId, courseId);
        response.setSubmittedAssignmentIds(saved.stream().filter(s -> s.getStatus() != AssignmentSubmissionStatus.NEEDS_REVISION)
            .map(s -> s.getAssignment().getId()).toList());
        response.setAssignmentSubmissions(saved.stream().map(this::assignmentResult).toList());
        var counts = activities.countActivities(userId, courseId, null);
        response.setTotalActivities((int) counts.getTotal());
        response.setCompletedActivities((int) counts.getCompleted());
        response.setProgressPercent(counts.getTotal() == 0 ? 0 : (int) (counts.getCompleted() * 100 / counts.getTotal()));
    }

    public QuizResultResponse quizResult(QuizAttemptEntity attempt, List<StudentAnswerEntity> saved) {
        var responses = saved.stream().map(a -> {
            Map<String, Object> data = a.getStudentResponse();
            List<Long> ids = data != null && data.get("answerIds") instanceof List<?> list
                ? list.stream().map(v -> Long.valueOf(v.toString())).toList()
                : a.getSelectedAnswer() == null ? List.<Long>of() : List.of(a.getSelectedAnswer().getId());
            Map<String, String> matches = new HashMap<>();
            if (data != null && data.get("matches") instanceof Map<?, ?> map)
                map.forEach((key, value) -> matches.put(key.toString(), Objects.toString(value, "")));
            return new SubmitQuizRequest.Response(a.getQuestion().getId(), ids, a.getInputText(), matches);
        }).toList();
        var review = saved.stream().map(a -> new QuizResultResponse.QuestionReview(a.getQuestion().getId(),
            Boolean.TRUE.equals(a.getIsCorrect()), a.getQuestion().getAnswerEntities().stream()
                .filter(option -> Boolean.TRUE.equals(option.getIsCorrect())).map(AnswerEntity::getId).toList(),
            a.getQuestion().getExplanation(), a.getQuestion().getAnswerEntities().stream()
                .filter(option -> Boolean.TRUE.equals(option.getIsCorrect())).map(AnswerEntity::getContent).toList(),
            a.getQuestion().getAnswerEntities().stream().filter(option -> option.getMatchingPair() != null)
                .collect(Collectors.toMap(AnswerEntity::getContent, AnswerEntity::getMatchingPair, (first, second) -> first)))).toList();
        return new QuizResultResponse(attempt.getQuiz().getId(), attempt.getId(), attempt.getScore(),
            Boolean.TRUE.equals(attempt.getIsPassed()), attempt.getSubmittedAt(), responses, review);
    }

    public AssignmentSubmissionResponse assignmentResult(AssignmentSubmissionEntity submission) {
        return new AssignmentSubmissionResponse(submission.getAssignment().getId(), submission.getSubmissionText(),
            submission.getStatus().name(), submission.getScore(), submission.getTeacherFeedback(), submission.getSubmittedAt());
    }

    private int number(Integer value) { return value == null ? 0 : value; }
}
