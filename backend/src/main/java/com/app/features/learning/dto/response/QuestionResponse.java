package com.app.features.learning.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionResponse {
    private Long id;
    private String content;
    private Integer points;
    private Integer orderIndex;
    private String audioUrl;
    private String questionType;
    private Map<String, Object> metaData;
    private String explanation;
    private List<AnswerResponse> answers;
}
