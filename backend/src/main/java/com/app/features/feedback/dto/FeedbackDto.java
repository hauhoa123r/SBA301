package com.app.features.feedback.dto;

import com.app.features.feedback.model.FeedbackQuestion.Type;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public final class FeedbackDto {
    private FeedbackDto() {}
    public record Option(Long id, @NotBlank @Size(max = 300) String label) {}
    public record Question(Long id, @NotBlank @Size(max = 500) String title,
        @NotNull @Size(max = 2000) String description, @NotNull Type type, boolean required,
        BigDecimal minValue, BigDecimal maxValue, Integer maxLength, Integer minSelections, Integer maxSelections,
        @NotNull @Size(max = 100) List<@NotNull @Valid Option> options) {}
    public record Save(Long revision, @NotBlank @Size(max = 200) String title,
        @NotNull @Size(max = 4000) String description, boolean onePerUser, Instant startsAt, Instant endsAt,
        @NotNull @Size(max = 100) List<@NotNull @Valid Question> questions) {}
    public record Form(Long id, long revision, String title, String description, String status, boolean active,
        boolean onePerUser, Instant startsAt, Instant endsAt, Instant publishedAt, Instant closedAt,
        boolean hasSubmitted, boolean schemaLocked, List<Question> questions) {}
    public record Summary(Long id, String title, String status, boolean active, Instant createdAt, long submissions) {}
    public record FormPage(List<Summary> content, long totalElements, int totalPages, int page) {}
    public record State(@NotNull @PositiveOrZero Long revision, @NotNull String action) {}
    public record Start(@NotNull @Positive Long formId, @NotNull @PositiveOrZero Long revision) {}
    public record Answer(@NotNull @Positive Long questionId, @Size(max = 10000) String text,
        BigDecimal number, @NotNull @Size(max = 100) List<@NotNull @Positive Long> optionIds) {}
    public record Submit(@NotNull @Positive Long formId, @NotNull @PositiveOrZero Long revision,
        @NotNull @Size(max = 100) List<@NotNull @Valid Answer> answers) {}
    public record Receipt(Long submissionId, Instant submittedAt) {}
    public record Bucket(String label, long count, double percentage) {}
    public record Numeric(Double average, Double median, Double min, Double max) {}
    public record QuestionStats(Long questionId, String title, Type type, long answered,
        List<Bucket> distribution, Numeric numeric) {}
    public record Statistics(Form form, long submissions, long participants, long startedUsers,
        double completionRate, int questionCount, long validAnswers, List<QuestionStats> questions) {}
    public record TextAnswer(Long submissionId, String text, Instant submittedAt) {}
    public record TextPage(List<TextAnswer> content, long totalElements, int totalPages, int page) {}
}
