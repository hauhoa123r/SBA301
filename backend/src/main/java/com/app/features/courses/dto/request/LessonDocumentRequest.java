package com.app.features.courses.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LessonDocumentRequest {
    private Long id;
    
    @NotBlank(message = "Document title is required")
    private String title;
    
    @NotBlank(message = "Document URL is required")
    private String fileUrl;
}
