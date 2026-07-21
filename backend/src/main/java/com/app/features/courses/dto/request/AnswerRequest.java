package com.app.features.courses.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AnswerRequest {
    private Long id;

    @NotBlank(message = "Answer content is required")
    private String content;

    @NotNull(message = "isCorrect is required")
    private Boolean isCorrect;

    private String matchingPair;
    
    private Integer orderIndex;
}
