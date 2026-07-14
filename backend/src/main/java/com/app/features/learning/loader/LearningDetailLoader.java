package com.app.features.learning.loader;

import com.app.exception.ResourceNotFoundException;
import com.app.features.courses.repository.ICourseRepository;
import com.app.features.learning.dto.record.LearningDetailData;
import com.app.features.learning.repository.ISentencePatternRepository;
import com.app.features.learning.repository.IVocabularyRepository;
import com.app.features.model.ChapterEntity;
import com.app.features.model.CourseEntity;
import com.app.features.model.LessonEntity;
import com.app.features.model.QuizEntity;
import com.app.features.model.SentencePatternEntity;
import com.app.features.model.VocabularyEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class LearningDetailLoader {

    private final ICourseRepository courseRepository;
    private final IVocabularyRepository vocabularyRepository;
    private final ISentencePatternRepository sentencePatternRepository;

    public LearningDetailData load(Long courseId) {
        CourseEntity course = courseRepository.findById(courseId).orElseThrow(() -> new ResourceNotFoundException("Course not found with ID: " + courseId));
        List<Long> lessonIds = getLessonIds(course);
        initializeCourseContent(course);

        if (lessonIds.isEmpty()) {
            return new LearningDetailData(course, Map.of(), Map.of());
        }

        List<VocabularyEntity> vocabularies = vocabularyRepository.findByLessonIds(lessonIds);
        List<SentencePatternEntity> sentencePatterns = sentencePatternRepository.findByLessonIds(lessonIds);
        return new LearningDetailData(course, groupByLesson(vocabularies, vocabulary -> vocabulary.getLesson().getId()), groupByLesson(sentencePatterns, pattern -> pattern.getLesson().getId()));
    }

    private List<Long> getLessonIds(CourseEntity course) {
        return course.getChapterEntities().stream()
                .flatMap(chapter -> chapter.getLessonEntities().stream())
                .map(lesson -> lesson.getId())
                .toList();
    }

    private void initializeCourseContent(CourseEntity course) {
        course.getChapterEntities().forEach(this::initializeChapter);
    }

    private void initializeChapter(ChapterEntity chapter) {
        chapter.getLessonEntities().forEach(this::initializeLesson);
    }

    private void initializeLesson(LessonEntity lesson) {
        lesson.getAssignments().size();
        lesson.getLessonDocuments().size();
        lesson.getQuizzes().forEach(this::initializeQuiz);
    }

    private void initializeQuiz(QuizEntity quiz) {
        quiz.getQuestionEntities().forEach(question -> question.getAnswerEntities().size());
    }

    private <T> Map<Long, List<T>> groupByLesson(List<T> items, Function<T, Long> lessonIdExtractor) {
        return items.stream().collect(Collectors.groupingBy(lessonIdExtractor, LinkedHashMap::new, Collectors.toList()));
    }
}
