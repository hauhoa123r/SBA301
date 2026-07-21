package com.app.features.courses.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnswerResponse {
    private Long id;
    private String content;
    private Boolean isCorrect;
    private String matchingPair;
    private Integer orderIndex;
}
