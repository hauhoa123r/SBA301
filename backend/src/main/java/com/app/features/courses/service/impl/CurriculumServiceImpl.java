package com.app.features.courses.service.impl;

import com.app.exception.BadRequestException;
import com.app.exception.ResourceNotFoundException;
import com.app.features.courses.converter.ChapterResponseConverter;
import com.app.features.courses.dto.request.ChapterRequest;
import com.app.features.courses.dto.request.LessonRequest;
import com.app.features.courses.dto.request.QuizReferenceRequest;
import com.app.features.courses.dto.response.ChapterResponse;
import com.app.features.courses.repository.ICourseRepository;
import com.app.features.courses.service.ICurriculumService;
import com.app.features.model.ChapterEntity;
import com.app.features.model.CourseEntity;
import com.app.features.model.LessonEntity;
import com.app.features.model.LessonDocumentEntity;
import com.app.features.courses.dto.request.LessonDocumentRequest;
import com.app.features.model.QuizEntity;
import com.app.features.courses.repository.IQuizRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CurriculumServiceImpl implements ICurriculumService {
    private final ICourseRepository courseRepository;
    private final IQuizRepository quizRepository;
    private final ChapterResponseConverter chapterResponseConverter;


    private void syncLesson(ChapterEntity chapter, List<LessonRequest> lessonRequests) {
        List<LessonRequest> safeLessonRequest = (lessonRequests != null) ? lessonRequests : List.of();

        Map<Long, LessonEntity> existingLessons = new HashMap<>();
        if (chapter.getLessonEntities() != null) {
            for (LessonEntity lessonEntity : chapter.getLessonEntities()) {
                existingLessons.put(lessonEntity.getId(), lessonEntity);
            }
        }

        for (LessonRequest request : safeLessonRequest) {
            LessonEntity lessonEntity;
            if (request.getId() != null && existingLessons.containsKey(request.getId())) {
                lessonEntity = existingLessons.get(request.getId());
                lessonEntity.setTitle(request.getTitle());
                lessonEntity.setVideoUrl(request.getVideoUrl());
                lessonEntity.setDurationSeconds((request.getDurationSecond() != null) ? request.getDurationSecond() : 0);
                lessonEntity.setOrderIndex(request.getOrderIndex());

                existingLessons.remove(request.getId());
            } else {
                lessonEntity = new LessonEntity();
                lessonEntity.setTitle(request.getTitle());
                lessonEntity.setVideoUrl(request.getVideoUrl());
                lessonEntity.setDurationSeconds((request.getDurationSecond() != null) ? request.getDurationSecond() : 0);
                lessonEntity.setOrderIndex(request.getOrderIndex());
                chapter.addLesson(lessonEntity);
            }

            syncDocument(lessonEntity, request.getDocuments());
        }

        existingLessons.values().forEach(existingLesson -> {
            chapter.removeLesson(existingLesson);
        });
    }

    private void syncDocument(LessonEntity lesson, List<LessonDocumentRequest> documentRequests) {
        List<LessonDocumentRequest> safeDocumentRequest = (documentRequests != null) ? documentRequests : List.of();

        Map<Long, LessonDocumentEntity> existingDocuments = new HashMap<>();
        if (lesson.getLessonDocuments() != null) {
            for (LessonDocumentEntity docEntity : lesson.getLessonDocuments()) {
                existingDocuments.put(docEntity.getId(), docEntity);
            }
        }

        for (LessonDocumentRequest request : safeDocumentRequest) {
            if (request.getId() != null && existingDocuments.containsKey(request.getId())) {
                LessonDocumentEntity docEntity = existingDocuments.get(request.getId());
                docEntity.setTitle(request.getTitle());
                docEntity.setFileUrl(request.getFileUrl());
                existingDocuments.remove(request.getId());
            } else {
                LessonDocumentEntity newDocEntity = new LessonDocumentEntity();
                newDocEntity.setTitle(request.getTitle());
                newDocEntity.setFileUrl(request.getFileUrl());
                lesson.addLessonDocument(newDocEntity);
            }
        }

        existingDocuments.values().forEach(existingDoc -> {
            lesson.removeLessonDocument(existingDoc);
        });
    }

    private void syncQuiz(ChapterEntity chapter, List<QuizReferenceRequest> quizRequests) {
        List<QuizReferenceRequest> safeQuizRequests = (quizRequests != null) ? quizRequests : List.of();

        Map<Long, QuizEntity> existingQuizzes = new HashMap<>();
        if (chapter.getQuizzes() != null) {
            for (QuizEntity quizEntity : chapter.getQuizzes()) {
                existingQuizzes.put(quizEntity.getId(), quizEntity);
            }
        }
        for (QuizReferenceRequest req : safeQuizRequests) {
            Long quizId = req.getQuizId();
            if (existingQuizzes.containsKey(quizId)) {
                QuizEntity quizEntity = existingQuizzes.get(quizId);
                quizEntity.setOrderIndex(req.getOrderIndex());
                existingQuizzes.remove(quizId);
            } else {
                quizRepository.findById(quizId).ifPresent(quizEntity -> {
                    if (quizEntity.getCourse() != null && !quizEntity.getCourse().getId().equals(chapter.getCourseEntity().getId())) {
                        throw new BadRequestException("Quiz with ID " + quizId + " is already attached to another course.");
                    }
                    chapter.addQuiz(quizEntity);
                    quizEntity.setCourse(chapter.getCourseEntity());
                    quizEntity.setOrderIndex(req.getOrderIndex());
                });
            }
        }
        existingQuizzes.values().forEach(quizEntity -> {
            chapter.removeQuiz(quizEntity);
            quizEntity.setCourse(null);
            quizEntity.setOrderIndex(null);
        });
    }

    @Override
    @Transactional
    public void updateCurriculum(Long courseId, List<ChapterRequest> chapterRequests, Long teacherId) {
        CourseEntity courseEntity = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
                
        if (!courseEntity.getTeacher().getId().equals(teacherId)) {
            throw new BadRequestException("You are not authorized to update this course curriculum.");
        }
        
        Map<Long, ChapterEntity> existingChapters = new HashMap<>();
        for (ChapterEntity chapterEntity : courseEntity.getChapterEntities()) {
            existingChapters.put(chapterEntity.getId(), chapterEntity);
        }

        if (chapterRequests != null) {
            for (ChapterRequest chapterRequest : chapterRequests) {
                ChapterEntity chapterEntity;

                if (chapterRequest.getId() != null && existingChapters.containsKey(chapterRequest.getId())) {
                    chapterEntity = existingChapters.get(chapterRequest.getId());
                    chapterEntity.setTitle(chapterRequest.getTitle());
                    chapterEntity.setOrderIndex(chapterRequest.getOrderIndex());

                    existingChapters.remove(chapterRequest.getId());
                } else {
                    chapterEntity = new ChapterEntity();
                    chapterEntity.setTitle(chapterRequest.getTitle());
                    chapterEntity.setOrderIndex(chapterRequest.getOrderIndex());

                    courseEntity.addChapter(chapterEntity);
                }

                syncLesson(chapterEntity, chapterRequest.getLessonRequests());
                syncQuiz(chapterEntity, chapterRequest.getQuizzes());
            }
        }

        existingChapters.values().forEach(chapterEntity -> {
            courseEntity.removeChapter(chapterEntity);
        });
        courseRepository.save(courseEntity);
    }

    @Override
    @Transactional
    public List<ChapterResponse> getCurriculumByCourseId(Long courseId) {
        CourseEntity course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        return chapterResponseConverter.toChapterResponses(course);
    }
}
