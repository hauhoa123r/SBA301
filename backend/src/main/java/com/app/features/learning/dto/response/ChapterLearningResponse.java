package com.app.features.learning.dto.response;

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
public class ChapterLearningResponse {
    private Long id;
    private Long courseId;
    private String title;
    private Integer orderIndex;
    private List<LessonLearningResponse> lessons;
    private AssignmentResponse assignment;
}
