package com.app.features.learning.service;
import com.app.exception.BadRequestException;
import com.app.features.learning.dto.request.SubmitQuizRequest;
import com.app.features.model.*;
import com.app.features.model.enums.QuestionType;
import org.junit.jupiter.api.Test;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;

class QuizGraderTest {
    private final QuizGrader grader = new QuizGrader();
    @Test void weightsQuestionsAndUsesServerPassThreshold() {
        var quiz = quiz(question(1L, QuestionType.SINGLE_CHOICE, 10), question(2L, QuestionType.SINGLE_CHOICE, 30));
        quiz.setPassScore(80);
        var result = grader.grade(quiz, request(choice(1L, 11L), choice(2L, 22L)));
        assertEquals(25, result.score()); assertFalse(result.passed());
    }
    @Test void rejectsForeignAnswerAndDuplicateQuestions() {
        var quiz = quiz(question(1L, QuestionType.SINGLE_CHOICE, 10));
        assertThrows(BadRequestException.class, () -> grader.grade(quiz, request(choice(1L, 99L))));
        assertThrows(BadRequestException.class, () -> grader.grade(quiz, request(choice(1L, 11L), choice(1L, 11L))));
    }
    @Test void rejectsMissingAndForeignQuestions() {
        var quiz = quiz(question(1L, QuestionType.SINGLE_CHOICE, 10));
        assertThrows(BadRequestException.class, () -> grader.grade(quiz, request()));
        assertThrows(BadRequestException.class, () -> grader.grade(quiz, request(choice(2L, 11L))));
    }
    @Test void multipleChoiceRequiresExactSet() {
        var q = question(1L, QuestionType.MULTIPLE_CHOICE, 10);
        q.getAnswerEntities().get(1).setIsCorrect(true);
        assertFalse(grader.grade(quiz(q), request(choice(1L, 11L))).passed());
        assertTrue(grader.grade(quiz(q), request(new SubmitQuizRequest.Response(1L, List.of(12L, 11L), null, null))).passed());
    }
    @Test void normalizesFillTextAndDoesNotTrustForgedPronunciationScore() {
        var fill = question(1L, QuestionType.FILL_IN_BLANK, 10);
        fill.getAnswerEntities().get(0).setContent("你好");
        assertTrue(grader.grade(quiz(fill), request(text(1L, " 你好 "))).passed());
        var speech = question(2L, QuestionType.SPEAKING, 10);
        speech.setMetaData(Map.of("speaking_target", "你好"));
        assertFalse(grader.grade(quiz(speech), request(text(2L, "recorded-99"))).passed());
        assertTrue(grader.grade(quiz(speech), request(text(2L, "你好"))).passed());
    }
    @Test void matchingChecksAllPairs() {
        var q = question(1L, QuestionType.MATCHING, 10);
        q.getAnswerEntities().get(0).setMatchingPair("A"); q.getAnswerEntities().get(1).setMatchingPair("B");
        assertTrue(grader.grade(quiz(q), request(new SubmitQuizRequest.Response(1L, null, null, Map.of("11", "A", "12", "B")))).passed());
        assertFalse(grader.grade(quiz(q), request(new SubmitQuizRequest.Response(1L, null, null, Map.of("11", "B", "12", "A")))).passed());
    }
    @Test void emptyQuizCannotBePassed() { assertThrows(BadRequestException.class, () -> grader.grade(quiz(), request())); }
    private QuizEntity quiz(QuestionEntity... questions) {
        var quiz = new QuizEntity(); quiz.setQuestionEntities(List.of(questions)); quiz.setPassScore(50); return quiz;
    }
    private QuestionEntity question(Long id, QuestionType type, int points) {
        var q = new QuestionEntity(); q.setId(id); q.setQuestionType(type); q.setPoints(points);
        var correct = new AnswerEntity(); correct.setId(id * 10 + 1); correct.setIsCorrect(true);
        var wrong = new AnswerEntity(); wrong.setId(id * 10 + 2); wrong.setIsCorrect(false);
        q.setAnswerEntities(List.of(correct, wrong)); return q;
    }
    private SubmitQuizRequest request(SubmitQuizRequest.Response... responses) { return new SubmitQuizRequest(List.of(responses)); }
    private SubmitQuizRequest.Response choice(Long questionId, Long answerId) { return new SubmitQuizRequest.Response(questionId, List.of(answerId), null, null); }
    private SubmitQuizRequest.Response text(Long questionId, String text) { return new SubmitQuizRequest.Response(questionId, null, text, null); }
}

