package com.app.features.learning.dto.response;

import java.time.Instant;
import java.util.List;
import com.app.features.learning.dto.request.SubmitQuizRequest;

public record QuizResultResponse(Long quizId, Long attemptId, int score, boolean isPassed,
                                 Instant submittedAt, List<SubmitQuizRequest.Response> answers,
                                 List<QuestionReview> review) {
    public record QuestionReview(Long questionId, boolean correct, List<Long> correctAnswerIds,
                                 String explanation, List<String> correctTexts, java.util.Map<String, String> correctMatches) { }
}
