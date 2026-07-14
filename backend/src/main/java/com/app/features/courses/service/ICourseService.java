package com.app.features.courses.service;

import com.app.features.courses.dto.request.CourseRequest;
import com.app.features.courses.dto.response.CourseCatalogResponse;
import com.app.features.courses.dto.response.CourseDetailResponse;

import java.util.List;

public interface ICourseService {
    List<CourseCatalogResponse> getAllCourses();

    CourseDetailResponse getCourseById(Long id);

    List<CourseDetailResponse> getAllCourseByTeacherId(Long teacherId);

    Long createCourse(CourseRequest course, Long teacherId);


}
