package com.app.features.learning.service;

import com.app.features.learning.assembler.LearningDetailAssembler;
import com.app.features.learning.assembler.LearningStatsAssembler;
import com.app.features.learning.dto.CourseLearningDetailResponse;
import com.app.features.learning.dto.LearningStatsResponse;
import com.app.features.learning.service.calculator.LearningStatsCalculator;
import com.app.features.learning.service.model.CourseSelectionResult;
import com.app.features.learning.service.model.LearningDetailData;
import com.app.features.learning.service.model.LearningStats;
import com.app.features.learning.service.model.LearningStatsData;
import com.app.features.model.UserEntity;
import com.app.features.users.repository.IUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class LearningQueryService implements ILearningService {

    private final IUserRepository userRepository;
    private final CourseSelectionService courseSelectionService;
    private final LearningStatsLoader learningStatsLoader;
    private final LearningStatsCalculator learningStatsCalculator;
    private final LearningStatsAssembler learningStatsAssembler;
    private final LearningDetailLoader learningDetailLoader;
    private final LearningDetailAssembler learningDetailAssembler;

    @Override
    public LearningStatsResponse getLearningStats(Long userId, Long courseId) {
        UserEntity user = loadUser(userId);
        CourseSelectionResult selection = courseSelectionService.select(userId, courseId);
        LearningStatsData data = learningStatsLoader.load(userId, selection.selectedCourse().getId());
        LearningStats stats = learningStatsCalculator.calculate(user, data);
        return learningStatsAssembler.toResponse(user, selection, stats);
    }

    @Override
    public CourseLearningDetailResponse getCourseLearningDetails(Long courseId) {
        LearningDetailData data = learningDetailLoader.load(courseId);
        return learningDetailAssembler.toResponse(data);
    }

    private UserEntity loadUser(Long userId) {
        return userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));
    }
}
