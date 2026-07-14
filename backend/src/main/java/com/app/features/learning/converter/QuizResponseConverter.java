package com.app.features.learning.converter;

import com.app.features.learning.dto.response.AnswerResponse;
import com.app.features.learning.dto.response.QuestionResponse;
import com.app.features.learning.dto.response.QuizResponse;
import com.app.features.model.AnswerEntity;
import com.app.features.model.QuestionEntity;
import com.app.features.model.QuizEntity;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;

@Component
public class QuizResponseConverter {

    public QuizResponse toResponse(QuizEntity quiz) {
        if (quiz == null) {
            return null;
        }

        List<QuestionResponse> questions = quiz.getQuestionEntities().stream()
                .sorted(Comparator.comparingInt(QuestionEntity::getOrderIndex))
                .map(this::toQuestionResponse)
                .toList();
        QuizResponse.QuizResponseBuilder builder = QuizResponse.builder();

        builder.id(quiz.getId());
        builder.title(quiz.getTitle());
        builder.timeLimitMinutes(quiz.getTimeLimitMinutes());
        builder.passScore(quiz.getPassScore());
        builder.questions(questions);

        return builder.build();
    }

    private QuestionResponse toQuestionResponse(QuestionEntity question) {
        if (question == null) {
            return null;
        }

        List<AnswerResponse> answers = question.getAnswerEntities().stream()
                .sorted(Comparator.comparingInt(AnswerEntity::getOrderIndex))
                .map(this::toAnswerResponse)
                .toList();
        QuestionResponse.QuestionResponseBuilder builder = QuestionResponse.builder();

        builder.id(question.getId());
        builder.content(question.getContent());
        builder.points(question.getPoints());
        builder.orderIndex(question.getOrderIndex());
        builder.audioUrl(question.getAudioUrl());
        builder.questionType(question.getQuestionType() != null ? question.getQuestionType().name() : null);
        builder.metaData(question.getMetaData());
        builder.explanation(question.getExplanation());
        builder.answers(answers);

        return builder.build();
    }

    private AnswerResponse toAnswerResponse(AnswerEntity answer) {
        AnswerResponse.AnswerResponseBuilder builder = AnswerResponse.builder();

        builder.id(answer.getId());
        builder.content(answer.getContent());
        builder.isCorrect(answer.getIsCorrect());
        builder.matchingPair(answer.getMatchingPair());
        builder.orderIndex(answer.getOrderIndex());

        return builder.build();
    }
}
