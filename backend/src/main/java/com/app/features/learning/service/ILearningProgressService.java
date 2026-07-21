package com.app.features.learning.service;

import com.app.features.learning.dto.request.UpdateLessonProgressRequest;
import com.app.features.learning.dto.response.CourseProgressResponse;

public interface ILearningProgressService {
    CourseProgressResponse getCourseProgress(Long userId, Long courseId);

    CourseProgressResponse updateLessonProgress(Long userId, Long courseId, Long lessonId,
                                                UpdateLessonProgressRequest request);
}
