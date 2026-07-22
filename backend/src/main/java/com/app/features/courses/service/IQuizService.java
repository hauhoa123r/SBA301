package com.app.features.courses.service;

import com.app.features.courses.dto.request.QuizRequest;
import com.app.features.courses.dto.response.QuizResponse;

import java.util.List;

public interface IQuizService {
    List<QuizResponse> getMyQuizzes(Long teacherId);

    QuizResponse getQuizById(Long quizId, Long teacherId);

    QuizResponse createQuiz(QuizRequest request, Long teacherId);

    QuizResponse updateQuiz(Long quizId, QuizRequest request, Long teacherId);

    void deleteQuiz(Long quizId, Long teacherId);
}
