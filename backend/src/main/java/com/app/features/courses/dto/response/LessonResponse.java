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
    public class LessonResponse {
        private Long id;
        private String title;
        private String videoUrl;
        private Integer durationSeconds;
        private String duration;
        private Integer orderIndex;
        private List<LessonDocumentResponse> documents;
    }
