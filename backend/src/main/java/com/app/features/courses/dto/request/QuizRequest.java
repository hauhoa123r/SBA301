package com.app.features.courses.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class QuizRequest {
    private Long id;

    @NotBlank(message = "Title is required")
    private String title;

    private Integer passScore = 50;

    private Integer timeLimitMinutes = 0;

    private List<QuestionRequest> questions;
}
