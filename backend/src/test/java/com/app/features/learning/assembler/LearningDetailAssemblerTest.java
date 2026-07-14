package com.app.features.learning.assembler;

import com.app.features.learning.dto.CourseLearningDetailResponse;
import com.app.features.learning.service.model.LearningDetailData;
import com.app.features.model.AnswerEntity;
import com.app.features.model.AssignmentEntity;
import com.app.features.model.ChapterEntity;
import com.app.features.model.CourseEntity;
import com.app.features.model.LessonEntity;
import com.app.features.model.QuestionEntity;
import com.app.features.model.QuizEntity;
import com.app.features.model.SentencePatternEntity;
import com.app.features.model.VocabularyEntity;
import org.junit.jupiter.api.Test;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class LearningDetailAssemblerTest {

    private final LearningDetailAssembler assembler = new LearningDetailAssembler();

    @Test
    void toResponseOrdersNestedContentAndMapsLearningDetails() {
        CourseEntity course = course(1L);
        ChapterEntity firstChapter = chapter(11L, 1, course);
        ChapterEntity secondChapter = chapter(12L, 2, course);
        LessonEntity firstLesson = lesson(111L, 1, firstChapter);
        LessonEntity secondLesson = lesson(112L, 2, firstChapter);
        firstChapter.setLessonEntities(List.of(secondLesson, firstLesson));
        course.setChapterEntities(List.of(secondChapter, firstChapter));

        AssignmentEntity firstEncounteredAssignment = assignment(202L, secondLesson);
        AssignmentEntity laterAssignment = assignment(201L, firstLesson);
        secondLesson.setAssignments(new LinkedHashSet<>(List.of(firstEncounteredAssignment)));
        firstLesson.setAssignments(new LinkedHashSet<>(List.of(laterAssignment)));

        QuizEntity firstQuiz = quiz(301L);
        QuizEntity ignoredQuiz = quiz(302L);
        firstLesson.setQuizzes(new LinkedHashSet<>(List.of(firstQuiz, ignoredQuiz)));
        QuestionEntity firstQuestion = question(401L, 1);
        QuestionEntity secondQuestion = question(402L, 2);
        firstQuiz.setQuestionEntities(List.of(secondQuestion, firstQuestion));
        AnswerEntity firstAnswer = answer(501L, 1);
        AnswerEntity secondAnswer = answer(502L, 2);
        firstQuestion.setAnswerEntities(List.of(secondAnswer, firstAnswer));

        VocabularyEntity firstVocabulary = vocabulary(601L, firstLesson);
        VocabularyEntity secondVocabulary = vocabulary(602L, secondLesson);
        SentencePatternEntity firstPattern = sentencePattern(701L, firstLesson, firstVocabulary);
        SentencePatternEntity secondPattern = sentencePattern(702L, secondLesson, null);
        LearningDetailData data = new LearningDetailData(course, Map.of(111L, List.of(firstVocabulary), 112L, List.of(secondVocabulary)), Map.of(111L, List.of(firstPattern), 112L, List.of(secondPattern)));

        CourseLearningDetailResponse result = assembler.toResponse(data);

        assertEquals(List.of(11L, 12L), result.getChapters().stream().map(CourseLearningDetailResponse.ChapterDTO::getId).toList());
        CourseLearningDetailResponse.ChapterDTO chapter = result.getChapters().get(0);
        assertEquals(List.of(111L, 112L), chapter.getLessons().stream().map(CourseLearningDetailResponse.LessonDTO::getId).toList());
        assertEquals(202L, chapter.getAssignment().getId());

        CourseLearningDetailResponse.LessonDTO mappedFirstLesson = chapter.getLessons().get(0);
        CourseLearningDetailResponse.LessonDTO mappedSecondLesson = chapter.getLessons().get(1);
        assertNull(mappedFirstLesson.getSummary());
        assertEquals(List.of(601L), mappedFirstLesson.getVocabularies().stream().map(CourseLearningDetailResponse.VocabularyDTO::getId).toList());
        assertEquals(List.of(602L), mappedSecondLesson.getVocabularies().stream().map(CourseLearningDetailResponse.VocabularyDTO::getId).toList());
        assertEquals(List.of(701L), mappedFirstLesson.getSentencePatterns().stream().map(CourseLearningDetailResponse.SentencePatternDTO::getId).toList());
        assertEquals(601L, mappedFirstLesson.getSentencePatterns().get(0).getVocabularyId());
        assertEquals(List.of(702L), mappedSecondLesson.getSentencePatterns().stream().map(CourseLearningDetailResponse.SentencePatternDTO::getId).toList());
        assertNull(mappedSecondLesson.getSentencePatterns().get(0).getVocabularyId());

        assertEquals(301L, mappedFirstLesson.getQuiz().getId());
        assertEquals(List.of(401L, 402L), mappedFirstLesson.getQuiz().getQuestions().stream().map(CourseLearningDetailResponse.QuestionDTO::getId).toList());
        assertEquals(List.of(501L, 502L), mappedFirstLesson.getQuiz().getQuestions().get(0).getAnswers().stream().map(CourseLearningDetailResponse.AnswerDTO::getId).toList());
    }

    private CourseEntity course(Long id) {
        CourseEntity course = new CourseEntity();
        course.setId(id);
        return course;
    }

    private ChapterEntity chapter(Long id, int orderIndex, CourseEntity course) {
        ChapterEntity chapter = new ChapterEntity();
        chapter.setId(id);
        chapter.setOrderIndex(orderIndex);
        chapter.setCourseEntity(course);
        return chapter;
    }

    private LessonEntity lesson(Long id, int orderIndex, ChapterEntity chapter) {
        LessonEntity lesson = new LessonEntity();
        lesson.setId(id);
        lesson.setOrderIndex(orderIndex);
        lesson.setChapter(chapter);
        return lesson;
    }

    private AssignmentEntity assignment(Long id, LessonEntity lesson) {
        AssignmentEntity assignment = new AssignmentEntity();
        assignment.setId(id);
        assignment.setLesson(lesson);
        return assignment;
    }

    private QuizEntity quiz(Long id) {
        QuizEntity quiz = new QuizEntity();
        quiz.setId(id);
        return quiz;
    }

    private QuestionEntity question(Long id, int orderIndex) {
        QuestionEntity question = new QuestionEntity();
        question.setId(id);
        question.setOrderIndex(orderIndex);
        return question;
    }

    private AnswerEntity answer(Long id, int orderIndex) {
        AnswerEntity answer = new AnswerEntity();
        answer.setId(id);
        answer.setOrderIndex(orderIndex);
        return answer;
    }

    private VocabularyEntity vocabulary(Long id, LessonEntity lesson) {
        VocabularyEntity vocabulary = new VocabularyEntity();
        vocabulary.setId(id);
        vocabulary.setLesson(lesson);
        return vocabulary;
    }

    private SentencePatternEntity sentencePattern(Long id, LessonEntity lesson, VocabularyEntity vocabulary) {
        SentencePatternEntity pattern = new SentencePatternEntity();
        pattern.setId(id);
        pattern.setLesson(lesson);
        pattern.setVocabulary(vocabulary);
        return pattern;
    }
}
