package com.app.features.admin.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.util.List;

public final class LearningAnalytics {
    private LearningAnalytics() {}
    public record Settings(@NotNull @Size(min=1, max=12) List<@NotNull @Min(1) @Max(1440) Integer> minutes) {}
    public record Threshold(int minutes, long users) {}
    public record Day(LocalDate date, long users, long watchSeconds, List<Threshold> thresholds) {}
    public record Course(long id, String title, long enrolled, long started, long completedLessonUsers) {}
    public record Learner(long id, String fullName, String email, long watchSeconds, long activities) {}
    public record Feature(String feature, long users, long accesses) {}
    public record Report(String timezone, Settings settings, List<Day> days, List<Course> courses,
                         List<Learner> learners, long totalLearners, int page, List<Feature> features) {}
    public record CreateAccount(@NotBlank @Size(max=255) String fullName,
        @NotBlank @Email @Size(max=255) String email, @NotBlank @Size(min=12, max=72) String password,
        @NotBlank @Size(max=500) String reason) {}
    public record Rule(@NotNull @Positive Long courseId, @Min(1) @Max(180) int dailyMinutes,
        @Min(0) @Max(20) int lessonsPerDay, boolean enabled,
        @NotNull @Size(max=8) List<@NotBlank String> features,
        @NotBlank @Size(max=500) String reason) {}
    public record Grant(@NotBlank @Size(max=30) String planCode, @Min(1) @Max(365) int days,
                        @NotBlank @Size(max=500) String reason) {}
    public record Reason(@NotBlank @Size(max=500) String reason) {}
}
