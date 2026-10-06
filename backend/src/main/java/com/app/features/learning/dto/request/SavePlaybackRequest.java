package com.app.features.learning.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record SavePlaybackRequest(@NotNull @Min(0) @Max(86400) Integer positionSeconds,
                                  @NotNull @Min(0) @Max(30) Integer watchedSeconds) { }
