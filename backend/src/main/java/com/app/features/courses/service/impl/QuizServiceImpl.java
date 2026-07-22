package com.app.features.courses.service.impl;

import com.app.exception.BadRequestException;
import com.app.exception.ResourceNotFoundException;
import com.app.features.courses.converter.QuizResponseConverter;
import com.app.features.courses.dto.request.AnswerRequest;
import com.app.features.courses.dto.request.QuestionRequest;
import com.app.features.courses.dto.request.QuizRequest;
import com.app.features.courses.dto.response.QuizResponse;
import com.app.features.courses.repository.ICourseRepository;
import com.app.features.courses.repository.IQuizRepository;
import com.app.features.courses.service.IQuizService;
import com.app.features.model.AnswerEntity;
import com.app.features.model.QuestionEntity;
import com.app.features.model.QuizEntity;
import com.app.features.users.repository.IUserRepository;
import com.app.features.model.UserEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuizServiceImpl implements IQuizService {
    private final IQuizRepository quizRepository;
    private final IUserRepository userRepository;
    private final QuizResponseConverter quizResponseConverter;

    @Override
    @Transactional(readOnly = true)
    public List<QuizResponse> getMyQuizzes(Long teacherId, Long courseId) {
        List<QuizEntity> quizzes = quizRepository.findByTeacherId(teacherId);
        
        // Filter out quizzes that belong to other courses
        if (courseId != null) {
            quizzes = quizzes.stream()
                .filter(q -> q.getCourse() == null || q.getCourse().getId().equals(courseId))
                .collect(Collectors.toList());
        }

        return quizzes.stream()
                .map(quizResponseConverter::toQuizResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public QuizResponse getQuizById(Long quizId, Long teacherId) {
        QuizEntity quiz = getQuizAndVerifyOwnership(quizId, teacherId);
        return quizResponseConverter.toQuizResponse(quiz);
    }

    @Override
    @Transactional
    public QuizResponse createQuiz(QuizRequest request, Long teacherId) {
        UserEntity teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));

        QuizEntity quizEntity = new QuizEntity();
        quizEntity.setTitle(request.getTitle());
        quizEntity.setPassScore(request.getPassScore() != null ? request.getPassScore() : 50);
        quizEntity.setTimeLimitMinutes(request.getTimeLimitMinutes() != null ? request.getTimeLimitMinutes() : 0);
        quizEntity.setTeacher(teacher);

        syncQuestions(quizEntity, request.getQuestions());

        quizEntity = quizRepository.save(quizEntity);
        return quizResponseConverter.toQuizResponse(quizEntity);
    }

    @Override
    @Transactional
    public QuizResponse updateQuiz(Long quizId, QuizRequest request, Long teacherId) {
        QuizEntity quizEntity = getQuizAndVerifyOwnership(quizId, teacherId);

        quizEntity.setTitle(request.getTitle());
        quizEntity.setPassScore(request.getPassScore() != null ? request.getPassScore() : 50);
        quizEntity.setTimeLimitMinutes(request.getTimeLimitMinutes() != null ? request.getTimeLimitMinutes() : 0);

        syncQuestions(quizEntity, request.getQuestions());

        quizEntity = quizRepository.save(quizEntity);
        return quizResponseConverter.toQuizResponse(quizEntity);
    }

    @Override
    @Transactional
    public void deleteQuiz(Long quizId, Long teacherId) {
        QuizEntity quiz = getQuizAndVerifyOwnership(quizId, teacherId);
        quizRepository.delete(quiz);
    }

    private void syncQuestions(QuizEntity quiz, List<QuestionRequest> questionRequests) {
        List<QuestionRequest> safeRequests = (questionRequests != null) ? questionRequests : List.of();

        Map<Long, QuestionEntity> existingQuestions = new HashMap<>();
        if (quiz.getQuestionEntities() != null) {
            for (QuestionEntity question : quiz.getQuestionEntities()) {
                existingQuestions.put(question.getId(), question);
            }
        }

        for (QuestionRequest req : safeRequests) {
            QuestionEntity questionEntity;
            if (req.getId() != null && existingQuestions.containsKey(req.getId())) {
                questionEntity = existingQuestions.get(req.getId());
                existingQuestions.remove(req.getId());
            } else {
                questionEntity = new QuestionEntity();
                quiz.addQuestion(questionEntity);
            }

            questionEntity.setContent(req.getContent());
            questionEntity.setQuestionType(req.getQuestionType());
            questionEntity.setPoints(req.getPoints() != null ? req.getPoints() : 10);
            questionEntity.setExplanation(req.getExplanation());
            questionEntity.setOrderIndex(req.getOrderIndex() != null ? req.getOrderIndex() : 0);

            syncAnswers(questionEntity, req.getAnswers());
        }

        existingQuestions.values().forEach(quiz::removeQuestion);
    }

    private void syncAnswers(QuestionEntity question, List<AnswerRequest> answerRequests) {
        List<AnswerRequest> safeRequests = (answerRequests != null) ? answerRequests : List.of();

        Map<Long, AnswerEntity> existingAnswers = new HashMap<>();
        if (question.getAnswerEntities() != null) {
            for (AnswerEntity answer : question.getAnswerEntities()) {
                existingAnswers.put(answer.getId(), answer);
            }
        }

        for (AnswerRequest req : safeRequests) {
            AnswerEntity answerEntity;
            if (req.getId() != null && existingAnswers.containsKey(req.getId())) {
                answerEntity = existingAnswers.get(req.getId());
                existingAnswers.remove(req.getId());
            } else {
                answerEntity = new AnswerEntity();
                question.addAnswer(answerEntity);
            }

            answerEntity.setContent(req.getContent());
            answerEntity.setIsCorrect(req.getIsCorrect() != null ? req.getIsCorrect() : false);
            answerEntity.setMatchingPair(req.getMatchingPair());
            answerEntity.setOrderIndex(req.getOrderIndex() != null ? req.getOrderIndex() : 0);
        }

        existingAnswers.values().forEach(question::removeAnswer);
    }

    private QuizEntity getQuizAndVerifyOwnership(Long quizId, Long teacherId) {
        QuizEntity quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));
        if (!quiz.getTeacher().getId().equals(teacherId)) {
            throw new BadRequestException("You do not have permission to access this quiz.");
        }
        return quiz;
    }
}
