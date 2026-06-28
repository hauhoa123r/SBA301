package com.app.features.courses.service;

import com.app.features.courses.dto.response.CourseResponse;

import java.util.List;

public interface ICourseService {
    List<CourseResponse> getAllCourses();

    CourseResponse getCourseById(Long id);
}
