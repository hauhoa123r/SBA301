package com.app.features.courses.dto.response;

import com.app.features.model.enums.CourseStatus;

import java.math.BigDecimal;

public class CourseResponse {
    private Long id;
    private Long categoryId;
    private String title;
    private String description;
    private String thumbnailUrl;
    private CourseStatus status;
    private BigDecimal price;

}
