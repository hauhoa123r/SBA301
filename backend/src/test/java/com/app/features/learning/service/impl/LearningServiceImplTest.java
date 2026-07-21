package com.app.features.learning.service.impl;

import com.app.exception.AccessDeniedException;
import com.app.features.learning.calculator.LearningStatsCalculator;
import com.app.features.learning.converter.LearningDetailResponseConverter;
import com.app.features.learning.converter.LearningStatsResponseConverter;
import com.app.features.learning.dto.record.CourseSelectionResult;
import com.app.features.learning.dto.record.LearningDetailData;
import com.app.features.learning.dto.response.CourseLearningDetailResponse;
import com.app.features.learning.dto.response.LearningStatsResponse;
import com.app.features.learning.loader.CourseSelector;
import com.app.features.learning.loader.LearningDetailLoader;
import com.app.features.learning.loader.LearningStatsLoader;
import com.app.features.learning.repository.ICourseEnrollmentRepository;
import com.app.features.model.CourseEnrollmentEntity;
import com.app.features.model.CourseEntity;
import com.app.features.model.UserEntity;
import com.app.features.users.repository.IUserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LearningServiceImplTest {

    @Mock
    private IUserRepository userRepository;
    @Mock
    private CourseSelector courseSelector;
    @Mock
    private LearningStatsLoader learningStatsLoader;
    @Mock
    private LearningStatsCalculator learningStatsCalculator;
    @Mock
    private LearningStatsResponseConverter learningStatsResponseConverter;
    @Mock
    private LearningDetailLoader learningDetailLoader;
    @Mock
    private LearningDetailResponseConverter learningDetailResponseConverter;
    @Mock
    private ICourseEnrollmentRepository courseEnrollmentRepository;

    @InjectMocks
    private LearningServiceImpl learningService;

    @Test
    void statsReturnsEmptyResponseWithoutLoadingCourseDataWhenUserHasNoEnrollments() {
        UserEntity user = new UserEntity();
        CourseSelectionResult selection = new CourseSelectionResult(null, List.of());
        LearningStatsResponse expected = new LearningStatsResponse();
        when(userRepository.findById(16L)).thenReturn(Optional.of(user));
        when(courseSelector.select(16L, null)).thenReturn(selection);
        when(learningStatsResponseConverter.toResponse(user, selection, null)).thenReturn(expected);

        LearningStatsResponse actual = learningService.getLearningStats(16L, null);

        assertSame(expected, actual);
        verifyNoInteractions(learningStatsLoader, learningStatsCalculator);
    }

    @Test
    void courseDetailsRejectUserWithoutEnrollment() {
        when(courseEnrollmentRepository.findByUser_IdAndCourse_Id(16L, 9L)).thenReturn(Optional.empty());

        assertThrows(AccessDeniedException.class,
                () -> learningService.getCourseLearningDetails(16L, 9L));

        verifyNoInteractions(learningDetailLoader, learningDetailResponseConverter);
    }

    @Test
    void courseDetailsLoadForEnrolledUser() {
        CourseEntity course = new CourseEntity();
        CourseEnrollmentEntity enrollment = new CourseEnrollmentEntity();
        LearningDetailData data = new LearningDetailData(course, Map.of(), Map.of());
        CourseLearningDetailResponse expected = new CourseLearningDetailResponse();
        when(courseEnrollmentRepository.findByUser_IdAndCourse_Id(16L, 9L))
                .thenReturn(Optional.of(enrollment));
        when(learningDetailLoader.load(9L)).thenReturn(data);
        when(learningDetailResponseConverter.toResponse(data)).thenReturn(expected);

        CourseLearningDetailResponse actual = learningService.getCourseLearningDetails(16L, 9L);

        assertSame(expected, actual);
    }
}
