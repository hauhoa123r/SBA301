package com.app.features.learning.assembler;

import com.app.features.learning.dto.LearningCourseDTO;
import com.app.features.learning.dto.LearningStatsResponse;
import com.app.features.learning.service.model.ActivityStats;
import com.app.features.learning.service.model.CourseSelectionResult;
import com.app.features.learning.service.model.CupStats;
import com.app.features.learning.service.model.LearningStats;
import com.app.features.model.CourseEntity;
import com.app.features.model.UserEntity;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class LearningStatsAssembler {

    public LearningStatsResponse toResponse(UserEntity user, CourseSelectionResult selection, LearningStats stats) {
        if (user == null || selection.selectedCourse() == null) {
            return null;
        }

        CourseEntity selectedCourse = selection.selectedCourse();
        ActivityStats activityStats = stats.activityStats();
        CupStats cupStats = stats.cupStats();
        List<LearningCourseDTO> availableCourses = selection.availableCourses().stream().map(this::toCourseDTO).collect(Collectors.toList());
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

    private LearningCourseDTO toCourseDTO(CourseEntity course) {
        return course == null ? null : new LearningCourseDTO(course.getId(), course.getTitle());
    }
}
