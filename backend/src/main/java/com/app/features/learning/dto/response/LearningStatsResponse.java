package com.app.features.learning.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LearningStatsResponse {
    private Long courseId;
    private String courseTitle;
    private String studentName;
    private int completedActivities;
    private int totalActivities;
    private int openLessons;
    private int earnedCups;
    private int totalCups;
    private List<LearningCourseDTO> enrolledCourses;
}
