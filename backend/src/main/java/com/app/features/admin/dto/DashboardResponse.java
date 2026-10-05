package com.app.features.admin.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record DashboardResponse(Instant generatedAt, String currency, String timezone,
                                Overview overview, List<PlanStats> subscriptions,
                                List<MonthStats> trends, List<PopularCourse> popularCourses) {
    public record Overview(long totalUsers, long newUsersToday, long newUsersThisMonth,
                           BigDecimal totalRevenue, BigDecimal revenueThisMonth,
                           long activeSubscriptions, long usersWithoutSubscription,
                           long totalCourses, long publishedCourses, long hiddenCourses,
                           long draftCourses, long pendingCourses) {}

    public record PlanStats(String code, String name, BigDecimal price, int durationDays,
                            boolean active, long users, BigDecimal revenue) {}

    public record MonthStats(String month, long users, BigDecimal revenue) {}

    public record PopularCourse(long id, String title, long students) {}

    public record CourseStats(long id, String title, BigDecimal price, String status,
                              long students, long learning, long completed,
                              BigDecimal completionRate, BigDecimal revenue) {}

    public record CoursePage(List<CourseStats> content, long totalElements, int page,
                             int size, int totalPages) {}
}
