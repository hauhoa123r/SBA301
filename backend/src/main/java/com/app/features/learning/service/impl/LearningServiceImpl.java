package com.app.features.learning.service.impl;

import com.app.features.learning.calculator.LearningStatsCalculator;
import com.app.features.learning.converter.LearningDetailResponseConverter;
import com.app.features.learning.converter.LearningStatsResponseConverter;
import com.app.features.learning.dto.record.CourseSelectionResult;
import com.app.features.learning.dto.record.LearningDetailData;
import com.app.features.learning.dto.record.LearningStats;
import com.app.features.learning.dto.record.LearningStatsData;
import com.app.features.learning.dto.response.CourseLearningDetailResponse;
import com.app.features.learning.dto.response.LearningStatsResponse;
import com.app.features.learning.loader.CourseSelector;
import com.app.features.learning.loader.LearningDetailLoader;
import com.app.features.learning.loader.LearningStatsLoader;
import com.app.features.learning.service.ILearningService;
import com.app.features.model.UserEntity;
import com.app.features.users.repository.IUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
@Slf4j
public class LearningServiceImpl implements ILearningService {

    private final IUserRepository userRepository;
    private final CourseSelector courseSelector;
    private final LearningStatsLoader learningStatsLoader;
    private final LearningStatsCalculator learningStatsCalculator;
    private final LearningStatsResponseConverter learningStatsResponseConverter;
    private final LearningDetailLoader learningDetailLoader;
    private final LearningDetailResponseConverter learningDetailResponseConverter;

    @Override
    public LearningStatsResponse getLearningStats(Long userId, Long courseId) {
        log.info("Learning statistics load started, userId={}, requestedCourseId={}", userId, courseId);
        UserEntity user = loadUser(userId);
        CourseSelectionResult selection = courseSelector.select(userId, courseId);
        LearningStatsData data = learningStatsLoader.load(userId, selection.selectedCourse().getId());
        LearningStats stats = learningStatsCalculator.calculate(user, data);
        LearningStatsResponse response = learningStatsResponseConverter.toResponse(user, selection, stats);
        log.info("Learning statistics loaded successfully, userId={}, courseId={}", userId, selection.selectedCourse().getId());
        return response;
    }

    @Override
    public CourseLearningDetailResponse getCourseLearningDetails(Long courseId) {
        log.info("Learning course detail load started, courseId={}", courseId);
        LearningDetailData data = learningDetailLoader.load(courseId);
        CourseLearningDetailResponse response = learningDetailResponseConverter.toResponse(data);
        log.info("Learning course detail loaded successfully, courseId={}", courseId);
        return response;
    }

    private UserEntity loadUser(Long userId) {
        return userRepository.findById(userId).orElseThrow(() -> {
            log.warn("Learning data load failed because user was not found, userId={}", userId);
            return new IllegalArgumentException("User not found with ID: " + userId);
        });
    }
}
