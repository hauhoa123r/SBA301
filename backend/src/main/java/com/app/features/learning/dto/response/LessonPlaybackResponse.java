package com.app.features.learning.dto.response;

public record LessonPlaybackResponse(Long lessonId, int positionSeconds, int watchSeconds) { }
