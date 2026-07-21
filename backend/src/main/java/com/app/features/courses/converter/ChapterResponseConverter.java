package com.app.features.courses.converter;

import com.app.features.courses.dto.response.ChapterResponse;
import com.app.features.courses.dto.response.LessonResponse;
import com.app.features.model.ChapterEntity;
import com.app.features.model.CourseEntity;
import com.app.features.model.LessonEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;

@Component
@RequiredArgsConstructor
public class ChapterResponseConverter {
    private final LessonResponseConverter lessonResponseConverter;

    public List<ChapterResponse> toChapterResponses(CourseEntity course) {
        if (course.getChapterEntities() == null) {
            return List.of();
        }

        return course.getChapterEntities()
                .stream()
                .sorted(Comparator.comparing(ChapterEntity::getOrderIndex, Comparator.nullsLast(Integer::compareTo)))
                .map(this::toChapterResponse)
                .toList();
    }

    private ChapterResponse toChapterResponse(ChapterEntity chapter) {
        List<LessonResponse> lessons = chapter.getLessonEntities() == null ? List.of() : chapter.getLessonEntities()
                .stream()
                .sorted(Comparator.comparing(LessonEntity::getOrderIndex, Comparator.nullsLast(Integer::compareTo)))
                .map(lessonResponseConverter::toLessonResponse)
                .toList();

        return new ChapterResponse(
                chapter.getId(),
                chapter.getTitle(),
                chapter.getOrderIndex(),
                lessons
        );
    }
}
