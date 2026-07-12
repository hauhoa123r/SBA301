package com.app.features.learning.converter;

import com.app.features.learning.dto.LearningCourseDTO;
import com.app.features.model.CourseEntity;
import com.app.features.model.CourseEnrollmentEntity;
import org.springframework.stereotype.Component;

@Component
public class LearningCourseConverter {

    public LearningCourseDTO toLearningCourseDTO(CourseEntity course) {
        if (course == null) {
            return null;
        }
        return new LearningCourseDTO(course.getId(), course.getTitle());
    }

    public LearningCourseDTO toLearningCourseDTO(CourseEnrollmentEntity enrollment) {
        if (enrollment == null) {
            return null;
        }
        return toLearningCourseDTO(enrollment.getCourse());
    }
}
