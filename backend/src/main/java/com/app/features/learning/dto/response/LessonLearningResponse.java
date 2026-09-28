package com.app.features.learning.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LessonLearningResponse {
    private Long id;
    private Long chapterId;
    private String title;
    private String videoUrl;
    private String content;
    private Integer durationSeconds;
    private Integer orderIndex;
    private String summary;
    private List<DocumentResponse> documents;
    private List<VocabularyResponse> vocabularies;
    private List<SentencePatternResponse> sentencePatterns;
    private QuizResponse quiz;
}
