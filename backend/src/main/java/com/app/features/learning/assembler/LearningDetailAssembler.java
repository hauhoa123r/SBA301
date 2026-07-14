package com.app.features.learning.assembler;

import com.app.features.learning.dto.CourseLearningDetailResponse;
import com.app.features.learning.service.model.LearningDetailData;
import com.app.features.model.AnswerEntity;
import com.app.features.model.AssignmentEntity;
import com.app.features.model.ChapterEntity;
import com.app.features.model.CourseEntity;
import com.app.features.model.LessonDocumentEntity;
import com.app.features.model.LessonEntity;
import com.app.features.model.QuestionEntity;
import com.app.features.model.QuizEntity;
import com.app.features.model.SentencePatternEntity;
import com.app.features.model.VocabularyEntity;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class LearningDetailAssembler {

    public CourseLearningDetailResponse toResponse(LearningDetailData data) {
        if (data == null || data.course() == null) {
            return null;
        }

        CourseEntity course = data.course();
        List<CourseLearningDetailResponse.ChapterDTO> chapters = course.getChapterEntities().stream()
                .sorted(Comparator.comparingInt(ChapterEntity::getOrderIndex))
                .map(chapter -> toChapterDTO(chapter, data))
                .collect(Collectors.toList());
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

    private CourseLearningDetailResponse.ChapterDTO toChapterDTO(ChapterEntity chapter, LearningDetailData data) {
        if (chapter == null) {
            return null;
        }

        List<CourseLearningDetailResponse.LessonDTO> lessons = chapter.getLessonEntities().stream()
                .sorted(Comparator.comparingInt(LessonEntity::getOrderIndex))
                .map(lesson -> toLessonDTO(lesson, data))
                .collect(Collectors.toList());
        AssignmentEntity assignment = findFirstAssignment(chapter);
        CourseLearningDetailResponse.ChapterDTO.ChapterDTOBuilder builder = CourseLearningDetailResponse.ChapterDTO.builder();

        builder.id(chapter.getId());
        builder.courseId(chapter.getCourseEntity().getId());
        builder.title(chapter.getTitle());
        builder.orderIndex(chapter.getOrderIndex());
        builder.lessons(lessons);
        builder.assignment(toAssignmentDTO(assignment));

        return builder.build();
    }

    private AssignmentEntity findFirstAssignment(ChapterEntity chapter) {
        return chapter.getLessonEntities().stream().flatMap(lesson -> lesson.getAssignments().stream()).findFirst().orElse(null);
    }

    private CourseLearningDetailResponse.LessonDTO toLessonDTO(LessonEntity lesson, LearningDetailData data) {
        if (lesson == null) {
            return null;
        }

        List<CourseLearningDetailResponse.DocumentDTO> documents = lesson.getLessonDocuments().stream().map(this::toDocumentDTO).collect(Collectors.toList());
        List<CourseLearningDetailResponse.VocabularyDTO> vocabularies = data.vocabulariesFor(lesson.getId()).stream().map(this::toVocabularyDTO).collect(Collectors.toList());
        List<CourseLearningDetailResponse.SentencePatternDTO> sentencePatterns = data.sentencePatternsFor(lesson.getId()).stream().map(this::toSentencePatternDTO).collect(Collectors.toList());
        QuizEntity quiz = lesson.getQuizzes().stream().findFirst().orElse(null);
        CourseLearningDetailResponse.LessonDTO.LessonDTOBuilder builder = CourseLearningDetailResponse.LessonDTO.builder();

        builder.id(lesson.getId());
        builder.chapterId(lesson.getChapter().getId());
        builder.title(lesson.getTitle());
        builder.videoUrl(lesson.getVideoUrl());
        builder.durationSeconds(lesson.getDurationSeconds());
        builder.orderIndex(lesson.getOrderIndex());
        builder.summary(null);
        builder.documents(documents);
        builder.vocabularies(vocabularies);
        builder.sentencePatterns(sentencePatterns);
        builder.quiz(toQuizDTO(quiz));

        return builder.build();
    }

    private CourseLearningDetailResponse.DocumentDTO toDocumentDTO(LessonDocumentEntity document) {
        return CourseLearningDetailResponse.DocumentDTO.builder().id(document.getId()).title(document.getTitle()).fileUrl(document.getFileUrl()).build();
    }

    private CourseLearningDetailResponse.VocabularyDTO toVocabularyDTO(VocabularyEntity vocabulary) {
        CourseLearningDetailResponse.VocabularyDTO.VocabularyDTOBuilder builder = CourseLearningDetailResponse.VocabularyDTO.builder();

        builder.id(vocabulary.getId());
        builder.hanzi(vocabulary.getHanzi());
        builder.pinyin(vocabulary.getPinyin());
        builder.vietnameseMeaning(vocabulary.getVietnameseMeaning());
        builder.imageUrl(vocabulary.getImageUrl());
        builder.audioUrl(vocabulary.getAudioUrl());
        builder.orderIndex(vocabulary.getOrderIndex());

        return builder.build();
    }

    private CourseLearningDetailResponse.SentencePatternDTO toSentencePatternDTO(SentencePatternEntity pattern) {
        CourseLearningDetailResponse.SentencePatternDTO.SentencePatternDTOBuilder builder = CourseLearningDetailResponse.SentencePatternDTO.builder();

        builder.id(pattern.getId());
        builder.vocabularyId(pattern.getVocabulary() != null ? pattern.getVocabulary().getId() : null);
        builder.chineseText(pattern.getChineseText());
        builder.pinyinText(pattern.getPinyinText());
        builder.vietnameseMeaning(pattern.getVietnameseMeaning());
        builder.audioUrl(pattern.getAudioUrl());
        builder.orderIndex(pattern.getOrderIndex());

        return builder.build();
    }

    private CourseLearningDetailResponse.QuizDTO toQuizDTO(QuizEntity quiz) {
        if (quiz == null) {
            return null;
        }

        List<CourseLearningDetailResponse.QuestionDTO> questions = quiz.getQuestionEntities().stream()
                .sorted(Comparator.comparingInt(QuestionEntity::getOrderIndex))
                .map(this::toQuestionDTO)
                .collect(Collectors.toList());
        CourseLearningDetailResponse.QuizDTO.QuizDTOBuilder builder = CourseLearningDetailResponse.QuizDTO.builder();

        builder.id(quiz.getId());
        builder.title(quiz.getTitle());
        builder.timeLimitMinutes(quiz.getTimeLimitMinutes());
        builder.passScore(quiz.getPassScore());
        builder.questions(questions);

        return builder.build();
    }

    private CourseLearningDetailResponse.QuestionDTO toQuestionDTO(QuestionEntity question) {
        if (question == null) {
            return null;
        }

        List<CourseLearningDetailResponse.AnswerDTO> answers = question.getAnswerEntities().stream()
                .sorted(Comparator.comparingInt(AnswerEntity::getOrderIndex))
                .map(this::toAnswerDTO)
                .collect(Collectors.toList());
        CourseLearningDetailResponse.QuestionDTO.QuestionDTOBuilder builder = CourseLearningDetailResponse.QuestionDTO.builder();

        builder.id(question.getId());
        builder.content(question.getContent());
        builder.points(question.getPoints());
        builder.orderIndex(question.getOrderIndex());
        builder.audioUrl(question.getAudioUrl());
        builder.questionType(question.getQuestionType() != null ? question.getQuestionType().name() : null);
        builder.metaData(question.getMetaData());
        builder.explanation(question.getExplanation());
        builder.answers(answers);

        return builder.build();
    }

    private CourseLearningDetailResponse.AnswerDTO toAnswerDTO(AnswerEntity answer) {
        CourseLearningDetailResponse.AnswerDTO.AnswerDTOBuilder builder = CourseLearningDetailResponse.AnswerDTO.builder();

        builder.id(answer.getId());
        builder.content(answer.getContent());
        builder.isCorrect(answer.getIsCorrect());
        builder.matchingPair(answer.getMatchingPair());
        builder.orderIndex(answer.getOrderIndex());

        return builder.build();
    }

    private CourseLearningDetailResponse.AssignmentDTO toAssignmentDTO(AssignmentEntity assignment) {
        if (assignment == null) {
            return null;
        }

        CourseLearningDetailResponse.AssignmentDTO.AssignmentDTOBuilder builder = CourseLearningDetailResponse.AssignmentDTO.builder();
        builder.id(assignment.getId());
        builder.title(assignment.getTitle());
        builder.description(assignment.getDescription());
        builder.attachmentUrl(assignment.getAttachmentUrl());
        builder.deadlineDays(assignment.getDeadlineDays());
        return builder.build();
    }
}
