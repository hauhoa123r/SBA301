package com.app.features.learning.converter;

import com.app.features.learning.dto.LearningCourseDTO;
import com.app.features.learning.dto.LearningStatsResponse;
import com.app.features.model.CourseEntity;
import com.app.features.model.UserEntity;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class LearningStatsResponseConverter {

    public LearningStatsResponse toLearningStatsResponse(
            UserEntity user,
            CourseEntity selectedCourse,
            List<LearningCourseDTO> enrolledCourses,
            int completedActivities,
            int totalActivities,
            int openLessons,
            int earnedCups,
            int totalCups
    ) {
        if (user == null || selectedCourse == null) {
            return null;
        }
        return LearningStatsResponse.builder()
                .courseId(selectedCourse.getId())
                .courseTitle(selectedCourse.getTitle())
                .studentName(user.getFullName())
                .completedActivities(completedActivities)
                .totalActivities(totalActivities)
                .openLessons(openLessons)
                .earnedCups(earnedCups)
                .totalCups(totalCups)
                .enrolledCourses(enrolledCourses)
                .build();
    }
}
