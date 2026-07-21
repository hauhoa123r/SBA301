package com.app.features.courses.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.validator.constraints.URL;

import java.math.BigDecimal;
import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CourseRequest {
    @NotBlank(message = "Title can not empty or blank")
    @Size(min = 10, max = 255, message = "Title must be at least 10 character.")
    private String title;

    @NotBlank(message = "Description can not empty or blank.")
    private String description;

    @NotNull(message = "Price is required.")
    @DecimalMin(value = "0.0", inclusive = true, message = "Price must be greater than or equal to 0.")
    private BigDecimal price;

    @NotNull(message = "Please choose at least 1 category.")
    private Long categoryId;

    private String thumbnailUrl;

    private List<Long> tagIds;
}
