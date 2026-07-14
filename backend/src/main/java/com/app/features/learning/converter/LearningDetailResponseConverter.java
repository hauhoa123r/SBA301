package com.app.features.learning.converter;

import com.app.features.learning.dto.CourseLearningDetailResponse;
import com.app.features.learning.repository.ISentencePatternRepository;
import com.app.features.learning.repository.IVocabularyRepository;
import com.app.features.model.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class LearningDetailResponseConverter {

    private final IVocabularyRepository vocabularyRepository;
    private final ISentencePatternRepository sentencePatternRepository;

    public CourseLearningDetailResponse toCourseLearningDetailResponse(CourseEntity course) {
        if (course == null) {
            return null;
        }

        List<CourseLearningDetailResponse.ChapterDTO> chapters = course.getChapterEntities().stream()
                .sorted(Comparator.comparingInt(ChapterEntity::getOrderIndex))
                .map(this::toChapterDTO)
                .collect(Collectors.toList());

        return CourseLearningDetailResponse.builder()
                .id(course.getId())
                .teacherId(course.getTeacher() != null ? course.getTeacher().getId() : null)
                .teacherName(course.getTeacher() != null ? course.getTeacher().getFullName() : null)
                .categoryId(course.getCategory() != null ? course.getCategory().getId() : null)
                .title(course.getTitle())
                .description(course.getDescription())
                .thumbnailUrl(course.getThumbnailUrl())
                .status(course.getStatus() != null ? course.getStatus().name() : null)
                .chapters(chapters)
                .build();
    }

    private CourseLearningDetailResponse.ChapterDTO toChapterDTO(ChapterEntity chapter) {
        if (chapter == null) {
            return null;
        }

        List<CourseLearningDetailResponse.LessonDTO> lessons = chapter.getLessonEntities().stream()
                .sorted(Comparator.comparingInt(LessonEntity::getOrderIndex))
                .map(this::toLessonDTO)
                .collect(Collectors.toList());

        // Find assignment associated with any lesson in this chapter
        AssignmentEntity assignmentEntity = chapter.getLessonEntities().stream()
                .flatMap(l -> l.getAssignments().stream())
                .findFirst()
                .orElse(null);

        return CourseLearningDetailResponse.ChapterDTO.builder()
                .id(chapter.getId())
                .courseId(chapter.getCourseEntity().getId())
                .title(chapter.getTitle())
                .orderIndex(chapter.getOrderIndex())
                .lessons(lessons)
                .assignment(toAssignmentDTO(assignmentEntity))
                .build();
    }

    private CourseLearningDetailResponse.LessonDTO toLessonDTO(LessonEntity lesson) {
        if (lesson == null) {
            return null;
        }

        List<CourseLearningDetailResponse.DocumentDTO> documents = lesson.getLessonDocuments().stream()
                .map(doc -> CourseLearningDetailResponse.DocumentDTO.builder()
                        .id(doc.getId())
                        .title(doc.getTitle())
                        .fileUrl(doc.getFileUrl())
                        .build())
                .collect(Collectors.toList());

        // Fetch vocabularies and sentence patterns
        List<CourseLearningDetailResponse.VocabularyDTO> vocabularies = vocabularyRepository
                .findByLessonIdOrderByOrderIndexAsc(lesson.getId())
                .stream()
                .map(v -> CourseLearningDetailResponse.VocabularyDTO.builder()
                        .id(v.getId())
                        .hanzi(v.getHanzi())
                        .pinyin(v.getPinyin())
                        .vietnameseMeaning(v.getVietnameseMeaning())
                        .imageUrl(v.getImageUrl())
                        .audioUrl(v.getAudioUrl())
                        .orderIndex(v.getOrderIndex())
                        .build())
                .collect(Collectors.toList());

        List<CourseLearningDetailResponse.SentencePatternDTO> sentencePatterns = sentencePatternRepository
                .findByLessonIdOrderByOrderIndexAsc(lesson.getId())
                .stream()
                .map(sp -> CourseLearningDetailResponse.SentencePatternDTO.builder()
                        .id(sp.getId())
                        .vocabularyId(sp.getVocabulary() != null ? sp.getVocabulary().getId() : null)
                        .chineseText(sp.getChineseText())
                        .pinyinText(sp.getPinyinText())
                        .vietnameseMeaning(sp.getVietnameseMeaning())
                        .audioUrl(sp.getAudioUrl())
                        .orderIndex(sp.getOrderIndex())
                        .build())
                .collect(Collectors.toList());

        // Find quiz linked to this lesson
        QuizEntity quizEntity = lesson.getQuizzes().stream().findFirst().orElse(null);

        return CourseLearningDetailResponse.LessonDTO.builder()
                .id(lesson.getId())
                .chapterId(lesson.getChapter().getId())
                .title(lesson.getTitle())
                .videoUrl(lesson.getVideoUrl())
                .durationSeconds(lesson.getDurationSeconds())
                .orderIndex(lesson.getOrderIndex())
                .summary(null) // Can be populated if needed
                .documents(documents)
                .vocabularies(vocabularies)
                .sentencePatterns(sentencePatterns)
                .quiz(toQuizDTO(quizEntity))
                .build();
    }

    private CourseLearningDetailResponse.QuizDTO toQuizDTO(QuizEntity quiz) {
        if (quiz == null) {
            return null;
        }

        List<CourseLearningDetailResponse.QuestionDTO> questions = quiz.getQuestionEntities().stream()
                .sorted(Comparator.comparingInt(QuestionEntity::getOrderIndex))
                .map(this::toQuestionDTO)
                .collect(Collectors.toList());

        return CourseLearningDetailResponse.QuizDTO.builder()
                .id(quiz.getId())
                .title(quiz.getTitle())
                .timeLimitMinutes(quiz.getTimeLimitMinutes())
                .passScore(quiz.getPassScore())
                .questions(questions)
                .build();
    }

    private CourseLearningDetailResponse.QuestionDTO toQuestionDTO(QuestionEntity question) {
        if (question == null) {
            return null;
        }

        List<CourseLearningDetailResponse.AnswerDTO> answers = question.getAnswerEntities().stream()
                .sorted(Comparator.comparingInt(AnswerEntity::getOrderIndex))
                .map(a -> CourseLearningDetailResponse.AnswerDTO.builder()
                        .id(a.getId())
                        .content(a.getContent())
                        .isCorrect(a.getIsCorrect())
                        .matchingPair(a.getMatchingPair())
                        .orderIndex(a.getOrderIndex())
                        .build())
                .collect(Collectors.toList());

        return CourseLearningDetailResponse.QuestionDTO.builder()
                .id(question.getId())
                .content(question.getContent())
                .points(question.getPoints())
                .orderIndex(question.getOrderIndex())
                .audioUrl(question.getAudioUrl())
                .questionType(question.getQuestionType() != null ? question.getQuestionType().name() : null)
                .metaData(question.getMetaData())
                .explanation(question.getExplanation())
                .answers(answers)
                .build();
    }

    private CourseLearningDetailResponse.AssignmentDTO toAssignmentDTO(AssignmentEntity assignment) {
        if (assignment == null) {
            return null;
        }

        return CourseLearningDetailResponse.AssignmentDTO.builder()
                .id(assignment.getId())
                .title(assignment.getTitle())
                .description(assignment.getDescription())
                .attachmentUrl(assignment.getAttachmentUrl())
                .deadlineDays(assignment.getDeadlineDays())
                .build();
    }
}
