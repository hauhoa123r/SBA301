package com.app.features.courses.dto.response;

import com.app.features.model.enums.CourseStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CourseDetailResponse {
    private Long id;
    private Long teacherId;
    private String instructor;
    private Long categoryId;
    private String category;
    private String title;
    private String description;
    private String thumbnailUrl;
    private CourseStatus status;
    private BigDecimal price;
    private Integer students;
    private Integer totalLessons;
    private Integer totalDurationSeconds;
    private String duration;
    private String durationText;
    private Double rating;
    private String level;
    private List<ChapterResponse> chapters;
    private List<Long> tagIds;
    private List<Long> planIds;
    private Instant createdAt;
    private Instant updatedAt;
}
