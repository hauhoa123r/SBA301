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
public class CourseLearningDetailResponse {
    private Long id;
    private Long teacherId;
    private String teacherName;
    private Long categoryId;
    private String title;
    private String description;
    private String thumbnailUrl;
    private String status;
    private List<ChapterLearningResponse> chapters;
}
