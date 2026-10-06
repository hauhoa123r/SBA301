package com.app.features.admin.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public final class StudentManagement {
    private StudentManagement() {}
    public record Subscription(String state, String planCode, String planName, Instant startedAt, Instant expiresAt) {}
    public record Student(long id, String fullName, String email, String status, Instant createdAt,
                          Subscription subscription, long enrolledCourses, long completedCourses) {}
    public record StudentPage(List<Student> content, long totalElements, int totalPages, int page) {}
    public record Course(long id, String title, String status, Instant enrolledAt, Instant completedAt, boolean legacyAccess) {}
    public record History(long id, String actor, String action, String beforeData, String afterData, Instant createdAt) {}
    public record Detail(Student student, List<Course> courses, List<History> history) {}
    public record StatusRequest(@NotBlank @Pattern(regexp = "ACTIVE|DISABLE") String status,
                                @NotBlank @Size(max = 500) String reason) {}
    public record GrantRequest(@NotBlank @Size(max = 30) String planCode, @NotNull @Min(1) @Max(3650) Integer days,
                               @NotBlank @Pattern(regexp = "EXTEND|REPLACE") String mode,
                               @NotBlank @Size(max = 500) String reason) {}
    public record ReasonRequest(@NotBlank @Size(max = 500) String reason) {}
    public record PlanRequest(@NotBlank @Pattern(regexp = "[A-Z][A-Z0-9_]{1,29}") String code,
                              @NotBlank @Size(max = 100) String name,
                              @NotNull @DecimalMin("0.00") @Digits(integer = 13, fraction = 0) BigDecimal price,
                              @NotNull @Min(1) @Max(3650) Integer durationDays, @NotNull Boolean active,
                              @NotBlank @Size(max = 500) String reason) {}
    public record Plan(String code, String name, BigDecimal price, int durationDays, boolean active) {}
    public record AuditContext(Long actorId, String method, String endpoint, String ip, String userAgent) {}
}
