package com.app.features.courses.converter;

import com.app.features.courses.dto.response.AnswerResponse;
import com.app.features.courses.dto.response.QuestionResponse;
import com.app.features.courses.dto.response.QuizResponse;
import com.app.features.model.AnswerEntity;
import com.app.features.model.QuestionEntity;
import com.app.features.model.QuizEntity;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component("courseQuizResponseConverter")
public class QuizResponseConverter {

    public QuizResponse toQuizResponse(QuizEntity entity) {
        if (entity == null) return null;
        
        return QuizResponse.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .passScore(entity.getPassScore())
                .timeLimitMinutes(entity.getTimeLimitMinutes())
                .questionsCount(entity.getQuestionEntities() == null ? 0 : entity.getQuestionEntities().size())
                .updatedAt(entity.getCreatedAt())
                .orderIndex(entity.getOrderIndex())
                .questions(List.of())
                .build();
    }

    public QuestionResponse toQuestionResponse(QuestionEntity entity) {
        if (entity == null) return null;
        
        List<AnswerResponse> answers = entity.getAnswerEntities() != null 
            ? entity.getAnswerEntities().stream().map(this::toAnswerResponse).collect(Collectors.toList())
            : List.of();

        return QuestionResponse.builder()
                .id(entity.getId())
                .content(entity.getContent())
                .questionType(entity.getQuestionType())
                .points(entity.getPoints())
                .explanation(entity.getExplanation())
                .orderIndex(entity.getOrderIndex())
                .answers(answers)
                .build();
    }

    public AnswerResponse toAnswerResponse(AnswerEntity entity) {
        if (entity == null) return null;
        
        return AnswerResponse.builder()
                .id(entity.getId())
                .content(entity.getContent())
                .isCorrect(entity.getIsCorrect())
                .matchingPair(entity.getMatchingPair())
                .orderIndex(entity.getOrderIndex())
                .build();
    }
}
