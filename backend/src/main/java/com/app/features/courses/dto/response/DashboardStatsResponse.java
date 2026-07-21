package com.app.features.courses.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardStatsResponse {
    private long totalCourses;
    private long totalQuizzes;
    private long activeCourses;
}
