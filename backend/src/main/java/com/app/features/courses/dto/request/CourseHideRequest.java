package com.app.features.courses.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CourseHideRequest {
    @NotBlank(message = "Hide reason is required.")
    @Size(max = 1000, message = "Hide reason must not exceed 1000 characters.")
    private String reason;
}
