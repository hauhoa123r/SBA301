package com.app.features.courses.repository.projection;

public interface CourseLessonStats {
    Long getCourseId();

    Long getTotalLessons();

    Long getTotalDurationSeconds();
}
