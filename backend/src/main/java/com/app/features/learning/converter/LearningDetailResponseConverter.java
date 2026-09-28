package com.app.features.learning.converter;

import com.app.features.learning.dto.record.LearningDetailData;
import com.app.features.learning.dto.response.AssignmentResponse;
import com.app.features.learning.dto.response.ChapterLearningResponse;
import com.app.features.learning.dto.response.CourseLearningDetailResponse;
import com.app.features.learning.dto.response.DocumentResponse;
import com.app.features.learning.dto.response.LessonLearningResponse;
import com.app.features.learning.dto.response.SentencePatternResponse;
import com.app.features.learning.dto.response.VocabularyResponse;
import com.app.features.model.AssignmentEntity;
import com.app.features.model.ChapterEntity;
import com.app.features.model.CourseEntity;
import com.app.features.model.LessonEntity;
import com.app.features.model.QuizEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;

@Component
@RequiredArgsConstructor
public class LearningDetailResponseConverter {

    private final LessonContentConverter lessonContentConverter;
    private final QuizResponseConverter quizResponseConverter;

    public CourseLearningDetailResponse toResponse(LearningDetailData data) {
        if (data == null || data.course() == null) {
            return null;
        }

        CourseEntity course = data.course();
        List<ChapterLearningResponse> chapters = course.getChapterEntities().stream()
                .sorted(Comparator.comparingInt(ChapterEntity::getOrderIndex))
                .map(chapter -> toChapterResponse(chapter, data))
                .toList();
        CourseLearningDetailResponse.CourseLearningDetailResponseBuilder builder = CourseLearningDetailResponse.builder();

        builder.id(course.getId());
        builder.teacherId(course.getTeacher() != null ? course.getTeacher().getId() : null);
        builder.teacherName(course.getTeacher() != null ? course.getTeacher().getFullName() : null);
        builder.categoryId(course.getCategory() != null ? course.getCategory().getId() : null);
        builder.title(course.getTitle());
        builder.description(course.getDescription());
        builder.thumbnailUrl(course.getThumbnailUrl());
        builder.status(course.getStatus() != null ? course.getStatus().name() : null);
        builder.chapters(chapters);

        return builder.build();
    }

    private ChapterLearningResponse toChapterResponse(ChapterEntity chapter, LearningDetailData data) {
        if (chapter == null) {
            return null;
        }

        List<LessonLearningResponse> lessons = chapter.getLessonEntities().stream()
                .sorted(Comparator.comparingInt(LessonEntity::getOrderIndex))
                .map(lesson -> toLessonResponse(lesson, data))
                .toList();
        AssignmentEntity assignment = findFirstAssignment(chapter);
        ChapterLearningResponse.ChapterLearningResponseBuilder builder = ChapterLearningResponse.builder();

        builder.id(chapter.getId());
        builder.courseId(chapter.getCourseEntity().getId());
        builder.title(chapter.getTitle());
        builder.orderIndex(chapter.getOrderIndex());
        builder.lessons(lessons);
        builder.assignment(toAssignmentResponse(assignment));

        return builder.build();
    }

    private AssignmentEntity findFirstAssignment(ChapterEntity chapter) {
        // Data-selection logic retained here to preserve the single-assignment response contract; this is not pure mapping.
        return chapter.getLessonEntities().stream().flatMap(lesson -> lesson.getAssignments().stream()).findFirst().orElse(null);
    }

    private LessonLearningResponse toLessonResponse(LessonEntity lesson, LearningDetailData data) {
        if (lesson == null) {
            return null;
        }

        List<DocumentResponse> documents = lessonContentConverter.toDocumentResponses(lesson.getLessonDocuments().stream().toList());
        List<VocabularyResponse> vocabularies = lessonContentConverter.toVocabularyResponses(data.vocabulariesFor(lesson.getId()));
        List<SentencePatternResponse> sentencePatterns = lessonContentConverter.toSentencePatternResponses(data.sentencePatternsFor(lesson.getId()));
        QuizEntity quiz = lesson.getQuizzes().stream().findFirst().orElse(null);
        LessonLearningResponse.LessonLearningResponseBuilder builder = LessonLearningResponse.builder();

        builder.id(lesson.getId());
        builder.chapterId(lesson.getChapter().getId());
        builder.title(lesson.getTitle());
        builder.videoUrl(lesson.getVideoUrl());
        builder.content(lesson.getContent());
        builder.durationSeconds(lesson.getDurationSeconds());
        builder.orderIndex(lesson.getOrderIndex());
        builder.summary(null);
        builder.documents(documents);
        builder.vocabularies(vocabularies);
        builder.sentencePatterns(sentencePatterns);
        builder.quiz(quizResponseConverter.toResponse(quiz));

        return builder.build();
    }

    private AssignmentResponse toAssignmentResponse(AssignmentEntity assignment) {
        if (assignment == null) {
            return null;
        }

        AssignmentResponse.AssignmentResponseBuilder builder = AssignmentResponse.builder();
        builder.id(assignment.getId());
        builder.title(assignment.getTitle());
        builder.description(assignment.getDescription());
        builder.attachmentUrl(assignment.getAttachmentUrl());
        builder.deadlineDays(assignment.getDeadlineDays());
        return builder.build();
    }
}
