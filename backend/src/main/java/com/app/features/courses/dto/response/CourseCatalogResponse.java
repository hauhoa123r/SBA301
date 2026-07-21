package com.app.features.courses.dto.response;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CourseCatalogResponse {
    private Long id;
    private String instructor;
    private String category;
    private String title;
    private String description;
    private String thumbnailUrl;
    private BigDecimal price;
    private Integer totalLessons;
    private String durationText;
    private Double rating;
}
