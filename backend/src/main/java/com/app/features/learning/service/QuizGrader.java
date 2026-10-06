package com.app.features.learning.service;

import com.app.exception.BadRequestException;
import com.app.features.learning.dto.request.SubmitQuizRequest;
import com.app.features.model.*;
import org.springframework.stereotype.Component;
import java.text.Normalizer;
import java.util.*;
import java.util.stream.Collectors;

@Component
public class QuizGrader {
    public record GradedQuestion(QuestionEntity question, SubmitQuizRequest.Response response, boolean correct) { }
    public record Grade(int score, boolean passed, List<GradedQuestion> questions) { }

    public Grade grade(QuizEntity quiz, SubmitQuizRequest request) {
        if (quiz.getQuestionEntities().isEmpty()) throw new BadRequestException("Bài kiểm tra chưa có câu hỏi.");
        Map<Long, SubmitQuizRequest.Response> responses = new HashMap<>();
        for (var response : request.answers()) {
            if (responses.put(response.questionId(), response) != null)
                throw new BadRequestException("Câu trả lời bị trùng.");
        }
        if (responses.size() != quiz.getQuestionEntities().size())
            throw new BadRequestException("Vui lòng trả lời đầy đủ các câu hỏi.");
        int total = 0, earned = 0;
        List<GradedQuestion> graded = new ArrayList<>();
        for (QuestionEntity question : quiz.getQuestionEntities()) {
            var response = responses.get(question.getId());
            if (response == null) throw new BadRequestException("Câu hỏi không thuộc bài kiểm tra.");
            boolean correct = check(question, response);
            int points = question.getPoints() == null ? 10 : Math.max(0, question.getPoints());
            total += points;
            if (correct) earned += points;
            graded.add(new GradedQuestion(question, response, correct));
        }
        if (total == 0) throw new BadRequestException("Bài kiểm tra chưa cấu hình điểm.");
        int score = (int) Math.round(earned * 100.0 / total);
        return new Grade(score, score >= (quiz.getPassScore() == null ? 50 : quiz.getPassScore()), graded);
    }

    private boolean check(QuestionEntity question, SubmitQuizRequest.Response response) {
        if (question.getQuestionType() == null) throw new BadRequestException("Loại câu hỏi chưa được cấu hình.");
        Set<Long> selected = new HashSet<>(response.answerIds() == null ? List.of() : response.answerIds());
        Set<Long> allowed = question.getAnswerEntities().stream().map(AnswerEntity::getId).collect(Collectors.toSet());
        if (!allowed.containsAll(selected)) throw new BadRequestException("Đáp án không thuộc câu hỏi.");
        return switch (question.getQuestionType()) {
            case SINGLE_CHOICE, LISTENING_CHOICE, MULTIPLE_CHOICE -> {
                if (selected.isEmpty()) throw new BadRequestException("Vui lòng chọn đáp án.");
                if (question.getQuestionType() != com.app.features.model.enums.QuestionType.MULTIPLE_CHOICE && selected.size() != 1)
                    throw new BadRequestException("Câu hỏi chỉ cho phép chọn một đáp án.");
                Set<Long> expected = question.getAnswerEntities().stream().filter(a -> Boolean.TRUE.equals(a.getIsCorrect()))
                    .map(AnswerEntity::getId).collect(Collectors.toSet());
                yield selected.equals(expected);
            }
            case FILL_IN_BLANK -> {
                requireText(response.text());
                yield question.getAnswerEntities().stream().filter(a -> Boolean.TRUE.equals(a.getIsCorrect()))
                    .anyMatch(a -> normalize(a.getContent()).equals(normalize(response.text())));
            }
            case SPEAKING -> {
                requireText(response.text());
                Object target = question.getMetaData() == null ? null : question.getMetaData().get("speaking_target");
                if (target == null) throw new BadRequestException("Câu luyện nói chưa cấu hình nội dung mẫu.");
                // Text practice only. No pronunciation score is inferred from a browser recording.
                yield normalize(target.toString()).equals(normalize(response.text()));
            }
            case MATCHING -> {
                Map<String, String> matches = response.matches();
                if (matches == null || matches.size() != question.getAnswerEntities().size())
                    throw new BadRequestException("Vui lòng ghép đầy đủ các cặp.");
                yield question.getAnswerEntities().stream().allMatch(a -> a.getMatchingPair() != null
                    && normalize(a.getMatchingPair()).equals(normalize(matches.get(a.getId().toString()))));
            }
        };
    }

    private void requireText(String text) {
        if (text == null || text.isBlank()) throw new BadRequestException("Vui lòng nhập câu trả lời.");
    }

    private String normalize(String text) {
        return text == null ? "" : Normalizer.normalize(text.trim(), Normalizer.Form.NFKC)
            .toLowerCase(Locale.ROOT).replaceAll("\\s+", " ");
    }
}
