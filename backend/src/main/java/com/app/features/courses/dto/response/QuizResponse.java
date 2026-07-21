package com.app.features.courses.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizResponse {
    private Long id;
    private String title;
    private Integer passScore;
    private Integer timeLimitMinutes;
    private Integer questionsCount;
    private Instant updatedAt;
    private List<QuestionResponse> questions;
}
