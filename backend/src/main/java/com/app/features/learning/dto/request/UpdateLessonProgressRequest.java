package com.app.features.learning.dto.request;

import jakarta.validation.constraints.NotNull;

public record UpdateLessonProgressRequest(@NotNull Boolean completed) {
}
