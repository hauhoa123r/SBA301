package com.app.features.learning.dto;

import lombok.*;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseLearningDetailResponse {
    private Long id;
    private Long teacherId;
    private String teacherName;
    private Long categoryId;
    private String title;
    private String description;
    private String thumbnailUrl;
    private String status;
    private List<ChapterDTO> chapters;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ChapterDTO {
        private Long id;
        private Long courseId;
        private String title;
        private Integer orderIndex;
        private List<LessonDTO> lessons;
        private AssignmentDTO assignment;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LessonDTO {
        private Long id;
        private Long chapterId;
        private String title;
        private String videoUrl;
        private Integer durationSeconds;
        private Integer orderIndex;
        private String summary;
        private List<DocumentDTO> documents;
        private List<VocabularyDTO> vocabularies;
        private List<SentencePatternDTO> sentencePatterns;
        private QuizDTO quiz;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DocumentDTO {
        private Long id;
        private String title;
        private String fileUrl;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class VocabularyDTO {
        private Long id;
        private String hanzi;
        private String pinyin;
        private String vietnameseMeaning;
        private String imageUrl;
        private String audioUrl;
        private Integer orderIndex;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SentencePatternDTO {
        private Long id;
        private Long vocabularyId;
        private String chineseText;
        private String pinyinText;
        private String vietnameseMeaning;
        private String audioUrl;
        private Integer orderIndex;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class QuizDTO {
        private Long id;
        private String title;
        private Integer timeLimitMinutes;
        private Integer passScore;
        private List<QuestionDTO> questions;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class QuestionDTO {
        private Long id;
        private String content;
        private Integer points;
        private Integer orderIndex;
        private String audioUrl;
        private String questionType;
        private Map<String, Object> metaData;
        private String explanation;
        private List<AnswerDTO> answers;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AnswerDTO {
        private Long id;
        private String content;
        private Boolean isCorrect;
        private String matchingPair;
        private Integer orderIndex;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AssignmentDTO {
        private Long id;
        private String title;
        private String description;
        private String attachmentUrl;
        private Integer deadlineDays;
    }
}
