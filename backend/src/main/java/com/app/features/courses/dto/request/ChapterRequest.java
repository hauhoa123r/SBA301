package com.app.features.courses.dto.request;

import lombok.AllArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChapterRequest {
    private Long id;
    @NotBlank(message = "Chapter title is required")
    private String title;
    @NotNull(message = "Order index is required")
    private Integer orderIndex;
    private List<LessonRequest> lessonRequests;
    private List<Long> quizIds;
}
