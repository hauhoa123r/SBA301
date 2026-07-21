package com.app.features.courses.dto.request;

import com.app.features.model.enums.QuestionType;
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
public class QuestionRequest {
    private Long id;

    @NotBlank(message = "Question content is required")
    private String content;

    @NotNull(message = "Question type is required")
    private QuestionType questionType;

    private Integer points = 10;
    
    private String explanation;
    
    private Integer orderIndex;

    private List<AnswerRequest> answers;
}
