package com.app.features.learning.converter;

import com.app.features.learning.dto.response.CourseProgressResponse;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class LearningProgressResponseConverter {
    public CourseProgressResponse toResponse(Long courseId,
                                             List<Long> completedLessonIds,
                                             List<Long> completedChapterIds,
                                             boolean courseCompleted) {
        return CourseProgressResponse.builder()
                .courseId(courseId)
                .completedLessonIds(completedLessonIds)
                .completedChapterIds(completedChapterIds)
                .courseCompleted(courseCompleted)
                .build();
    }
}
