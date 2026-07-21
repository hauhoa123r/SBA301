package com.app.features.learning.service;

import com.app.features.learning.dto.response.CourseLearningDetailResponse;
import com.app.features.learning.dto.response.LearningStatsResponse;

public interface ILearningService {
    LearningStatsResponse getLearningStats(Long userId, Long courseId);

    CourseLearningDetailResponse getCourseLearningDetails(Long userId, Long courseId);
}
