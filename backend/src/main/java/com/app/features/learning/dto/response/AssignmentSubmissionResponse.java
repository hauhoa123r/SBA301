package com.app.features.learning.dto.response;

import java.time.Instant;

public record AssignmentSubmissionResponse(Long assignmentId, String text, String status, Integer score,
                                            String feedback, Instant submittedAt) { }
