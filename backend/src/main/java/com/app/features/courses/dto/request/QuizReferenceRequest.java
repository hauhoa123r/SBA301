package com.app.features.courses.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class QuizReferenceRequest {
    private Long quizId;
    private Integer orderIndex;
}
