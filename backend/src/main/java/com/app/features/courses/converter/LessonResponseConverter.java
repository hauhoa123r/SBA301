package com.app.features.courses.converter;

import com.app.features.courses.dto.response.LessonResponse;
import com.app.features.courses.dto.response.LessonDocumentResponse;
import com.app.features.model.LessonEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class LessonResponseConverter {
    private final DurationTextConverter durationTextConverter;

    public LessonResponse toLessonResponse(LessonEntity lesson) {
        Integer durationSeconds = lesson.getDurationSeconds() == null ? 0 : lesson.getDurationSeconds();

        List<LessonDocumentResponse> documents = lesson.getLessonDocuments() == null ? List.of() : lesson.getLessonDocuments().stream()
                .map(doc -> LessonDocumentResponse.builder()
                        .id(doc.getId())
                        .title(doc.getTitle())
                        .fileUrl(doc.getFileUrl())
                        .build())
                .toList();

        return new LessonResponse(
                lesson.getId(),
                lesson.getTitle(),
                lesson.getVideoUrl(),
                durationSeconds,
                durationTextConverter.toDurationText(durationSeconds),
                lesson.getOrderIndex(),
                documents
        );
    }
}
