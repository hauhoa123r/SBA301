package com.app.features.learning.converter;

import com.app.features.learning.dto.response.LearningCourseDTO;
import com.app.features.model.CourseEntity;
import org.springframework.stereotype.Component;

@Component
public class LearningCourseConverter {

    public LearningCourseDTO toResponse(CourseEntity course) {
        return course == null ? null : new LearningCourseDTO(course.getId(), course.getTitle());
    }
}
