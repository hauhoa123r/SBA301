package com.app.features.learning.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SubmitAssignmentRequest(@NotBlank @Size(max = 20000) String text) { }
