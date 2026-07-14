package com.app.features.learning.converter;

import com.app.features.learning.dto.record.ActivityStats;
import com.app.features.learning.dto.record.CourseSelectionResult;
import com.app.features.learning.dto.record.CupStats;
import com.app.features.learning.dto.record.LearningStats;
import com.app.features.learning.dto.response.LearningCourseDTO;
import com.app.features.learning.dto.response.LearningStatsResponse;
import com.app.features.model.CourseEntity;
import com.app.features.model.UserEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class LearningStatsResponseConverter {

    private final LearningCourseConverter learningCourseConverter;

    public LearningStatsResponse toResponse(UserEntity user, CourseSelectionResult selection, LearningStats stats) {
        if (user == null || selection.selectedCourse() == null) {
            return null;
        }

        CourseEntity selectedCourse = selection.selectedCourse();
        ActivityStats activityStats = stats.activityStats();
        CupStats cupStats = stats.cupStats();
        List<LearningCourseDTO> availableCourses = selection.availableCourses().stream().map(learningCourseConverter::toResponse).toList();
        LearningStatsResponse.LearningStatsResponseBuilder builder = LearningStatsResponse.builder();

        builder.courseId(selectedCourse.getId());
        builder.courseTitle(selectedCourse.getTitle());
        builder.studentName(user.getFullName());
        builder.completedActivities(activityStats.completedActivities());
        builder.totalActivities(activityStats.totalActivities());
        builder.openLessons(activityStats.openLessons());
        builder.earnedCups(cupStats.earnedCups());
        builder.totalCups(cupStats.totalCups());
        builder.enrolledCourses(availableCourses);

        return builder.build();
    }
}
