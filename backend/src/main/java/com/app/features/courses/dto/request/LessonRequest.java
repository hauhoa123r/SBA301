package com.app.features.courses.dto.request;

import lombok.AllArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.List;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class LessonRequest {
    private Long id;
    @NotBlank(message = "Lesson title is required")
    private String title;
    private String videoUrl;
    private Integer durationSecond;
    @NotNull(message = "Order index is required")
    private Integer orderIndex;
    private List<LessonDocumentRequest> documents;
}
