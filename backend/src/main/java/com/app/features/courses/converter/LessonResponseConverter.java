package com.app.features.courses.converter;

import com.app.features.courses.dto.response.LessonResponse;
import com.app.features.model.LessonEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class LessonResponseConverter {
    private final DurationTextConverter durationTextConverter;

    public LessonResponse toLessonResponse(LessonEntity lesson) {
        Integer durationSeconds = lesson.getDurationSeconds() == null ? 0 : lesson.getDurationSeconds();

        return new LessonResponse(
                lesson.getId(),
                lesson.getTitle(),
                lesson.getVideoUrl(),
                durationSeconds,
                durationTextConverter.toDurationText(durationSeconds),
                lesson.getOrderIndex()
        );
    }
}
