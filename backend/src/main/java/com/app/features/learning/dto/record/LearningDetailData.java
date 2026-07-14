package com.app.features.learning.dto.record;

import com.app.features.model.CourseEntity;
import com.app.features.model.SentencePatternEntity;
import com.app.features.model.VocabularyEntity;

import java.util.List;
import java.util.Map;

public record LearningDetailData(CourseEntity course, Map<Long, List<VocabularyEntity>> vocabulariesByLessonId, Map<Long, List<SentencePatternEntity>> sentencePatternsByLessonId) {

    public List<VocabularyEntity> vocabulariesFor(Long lessonId) {
        return vocabulariesByLessonId.getOrDefault(lessonId, List.of());
    }

    public List<SentencePatternEntity> sentencePatternsFor(Long lessonId) {
        return sentencePatternsByLessonId.getOrDefault(lessonId, List.of());
    }
}
