package com.app.features.courses.dto.response;

import com.app.features.model.enums.QuestionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionResponse {
    private Long id;
    private String content;
    private QuestionType questionType;
    private Integer points;
    private String explanation;
    private Integer orderIndex;
    private List<AnswerResponse> answers;
}
