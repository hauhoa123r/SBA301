package com.app.features.courses.service;

import com.app.features.courses.dto.request.ChapterRequest;
import com.app.features.courses.dto.response.ChapterResponse;
import com.app.features.model.LessonEntity;

import java.util.List;

public interface ICurriculumService {

    public void updateCurriculum(Long courseId, List<ChapterRequest> chapterRequests, Long teacherId);

    public List<ChapterResponse> getCurriculumByCourseId(Long courseId);
}
