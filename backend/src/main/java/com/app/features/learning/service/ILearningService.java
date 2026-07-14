package com.app.features.learning.service;

import com.app.features.learning.dto.CourseLearningDetailResponse;
import com.app.features.learning.dto.LearningStatsResponse;

public interface ILearningService {
    LearningStatsResponse getLearningStats(Long userId, Long courseId);

    CourseLearningDetailResponse getCourseLearningDetails(Long courseId);
}
