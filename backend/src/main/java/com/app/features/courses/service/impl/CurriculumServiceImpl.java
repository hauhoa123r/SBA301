package com.app.features.courses.service.impl;

import com.app.exception.ResourceNotFoundException;
import com.app.features.courses.converter.ChapterResponseConverter;
import com.app.features.courses.dto.request.ChapterRequest;
import com.app.features.courses.dto.request.LessonRequest;
import com.app.features.courses.dto.response.ChapterResponse;
import com.app.features.courses.repository.ICourseRepository;
import com.app.features.courses.service.ICurriculumService;
import com.app.features.model.ChapterEntity;
import com.app.features.model.CourseEntity;
import com.app.features.model.LessonEntity;
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
    private final ChapterResponseConverter chapterResponseConverter;


    private void syncLesson(ChapterEntity chapter, List<LessonRequest> lessonRequests) {
        List<LessonRequest> safeLessonRequest = (lessonRequests != null) ? lessonRequests : List.of();

        Map<Long, LessonEntity> existingLessons = new HashMap<>();
        for (LessonEntity lessonEntity : chapter.getLessonEntities()) {
            existingLessons.put(lessonEntity.getId(), lessonEntity);
        }

        for (LessonRequest request : safeLessonRequest) {
            if (request.getId() != null && existingLessons.containsKey(request.getId())) {
                LessonEntity lessonEntity = existingLessons.get(request.getId());
                lessonEntity.setTitle(request.getTitle());
                lessonEntity.setVideoUrl(request.getVideoUrl());
                lessonEntity
                        .setDurationSeconds((request.getDurationSecond() != null) ? request.getDurationSecond() : 0);
                lessonEntity.setOrderIndex(request.getOrderIndex());

                existingLessons.remove(request.getId());
            } else {
                LessonEntity newLessonEntity = new LessonEntity();
                newLessonEntity.setTitle(request.getTitle());
                newLessonEntity.setVideoUrl(request.getVideoUrl());
                newLessonEntity
                        .setDurationSeconds((request.getDurationSecond() != null) ? request.getDurationSecond() : 0);
                newLessonEntity.setOrderIndex(request.getOrderIndex());

                chapter.addLesson(newLessonEntity);
            }
        }

        existingLessons.values().forEach(existingLesson -> {
            chapter.removeLesson(existingLesson);
        });
    }

    @Override
    @Transactional
    public void updateCurriculum(Long courseId, List<ChapterRequest> chapterRequests) {
        CourseEntity courseEntity = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
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
