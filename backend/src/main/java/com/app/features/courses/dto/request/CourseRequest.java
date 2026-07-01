package com.app.features.courses.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.validator.constraints.URL;

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

    @NotNull(message = "Please choose at least 1 category.")
    private Long categoryId;

    private String thumbnailUrl;

    private List<Long> tagIds;

    @NotEmpty(message = "PLease choose at least one membership plan.")
    private List<Long> planIds;
}
