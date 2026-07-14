package com.app.features.learning.loader;

import com.app.exception.ResourceNotFoundException;
import com.app.features.courses.repository.ICourseRepository;
import com.app.features.learning.dto.record.LearningDetailData;
import com.app.features.learning.repository.ISentencePatternRepository;
import com.app.features.learning.repository.IVocabularyRepository;
import com.app.features.model.ChapterEntity;
import com.app.features.model.CourseEntity;
import com.app.features.model.LessonEntity;
import com.app.features.model.SentencePatternEntity;
import com.app.features.model.VocabularyEntity;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

class LearningDetailLoaderTest {

    private final ICourseRepository courseRepository = mock(ICourseRepository.class);
    private final IVocabularyRepository vocabularyRepository = mock(IVocabularyRepository.class);
    private final ISentencePatternRepository sentencePatternRepository = mock(ISentencePatternRepository.class);
    private final LearningDetailLoader loader = new LearningDetailLoader(courseRepository, vocabularyRepository, sentencePatternRepository);

    @Test
    void loadFetchesSupplementalDataOnceAndGroupsItByLesson() {
        CourseEntity course = courseWithLessons(11L, 12L);
        LessonEntity firstLesson = course.getChapterEntities().get(0).getLessonEntities().get(0);
        LessonEntity secondLesson = course.getChapterEntities().get(0).getLessonEntities().get(1);
        VocabularyEntity firstVocabulary = vocabulary(101L, firstLesson);
        VocabularyEntity secondVocabulary = vocabulary(102L, secondLesson);
        VocabularyEntity thirdVocabulary = vocabulary(103L, firstLesson);
        SentencePatternEntity firstPattern = sentencePattern(201L, firstLesson);
        SentencePatternEntity secondPattern = sentencePattern(202L, secondLesson);
        when(courseRepository.findById(7L)).thenReturn(Optional.of(course));
        when(vocabularyRepository.findByLessonIds(List.of(11L, 12L))).thenReturn(List.of(firstVocabulary, secondVocabulary, thirdVocabulary));
        when(sentencePatternRepository.findByLessonIds(List.of(11L, 12L))).thenReturn(List.of(secondPattern, firstPattern));

        LearningDetailData result = loader.load(7L);

        assertSame(course, result.course());
        assertEquals(List.of(firstVocabulary, thirdVocabulary), result.vocabulariesFor(11L));
        assertEquals(List.of(secondVocabulary), result.vocabulariesFor(12L));
        assertEquals(List.of(firstPattern), result.sentencePatternsFor(11L));
        assertEquals(List.of(secondPattern), result.sentencePatternsFor(12L));
        verify(vocabularyRepository, times(1)).findByLessonIds(List.of(11L, 12L));
        verify(sentencePatternRepository, times(1)).findByLessonIds(List.of(11L, 12L));
        verifyNoMoreInteractions(vocabularyRepository, sentencePatternRepository);
    }

    @Test
    void loadSkipsSupplementalRepositoriesWhenCourseHasNoLessons() {
        CourseEntity course = courseWithLessons();
        when(courseRepository.findById(7L)).thenReturn(Optional.of(course));

        LearningDetailData result = loader.load(7L);

        assertSame(course, result.course());
        assertEquals(0, result.vocabulariesByLessonId().size());
        assertEquals(0, result.sentencePatternsByLessonId().size());
        verifyNoInteractions(vocabularyRepository, sentencePatternRepository);
    }

    @Test
    void loadThrowsExactMessageWhenCourseDoesNotExist() {
        when(courseRepository.findById(404L)).thenReturn(Optional.empty());

        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> loader.load(404L));

        assertEquals("Course not found with ID: 404", exception.getMessage());
        verifyNoInteractions(vocabularyRepository, sentencePatternRepository);
    }

    private CourseEntity courseWithLessons(Long... lessonIds) {
        CourseEntity course = new CourseEntity();
        ChapterEntity chapter = new ChapterEntity();
        List<LessonEntity> lessons = java.util.Arrays.stream(lessonIds).map(id -> lesson(id, chapter)).toList();
        chapter.setLessonEntities(lessons);
        course.setChapterEntities(List.of(chapter));
        return course;
    }

    private LessonEntity lesson(Long id, ChapterEntity chapter) {
        LessonEntity lesson = new LessonEntity();
        lesson.setId(id);
        lesson.setChapter(chapter);
        return lesson;
    }

    private VocabularyEntity vocabulary(Long id, LessonEntity lesson) {
        VocabularyEntity vocabulary = new VocabularyEntity();
        vocabulary.setId(id);
        vocabulary.setLesson(lesson);
        return vocabulary;
    }

    private SentencePatternEntity sentencePattern(Long id, LessonEntity lesson) {
        SentencePatternEntity pattern = new SentencePatternEntity();
        pattern.setId(id);
        pattern.setLesson(lesson);
        return pattern;
    }
}
