package com.app.features.courses.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChapterResponse {
    private Long id;
    private String title;
    private Integer orderIndex;
    private List<LessonResponse> lessons;
}
