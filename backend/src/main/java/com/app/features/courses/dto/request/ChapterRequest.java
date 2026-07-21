package com.app.features.courses.dto.request;

import lombok.AllArgsConstructor;
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
    private String title;
    private Integer orderIndex;
    private List<LessonRequest> lessonRequests;
}
