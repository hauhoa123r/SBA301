package com.app.features.courses.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class LessonRequest {
    private Long id;
    private String title;
    private String videoUrl;
    private Integer durationSecond;
    private Integer orderIndex;
}
