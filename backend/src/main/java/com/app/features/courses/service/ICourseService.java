package com.app.features.courses.service;

import com.app.features.courses.dto.request.CourseRequest;
import com.app.features.courses.dto.response.CourseCatalogResponse;
import com.app.features.courses.dto.response.CourseDetailResponse;

import java.util.List;

public interface ICourseService {
    List<CourseCatalogResponse> getAllCourses();

    CourseDetailResponse getCourseById(Long id);

    List<CourseDetailResponse> getAllCourseByTeacherId(Long teacherId);

    CourseDetailResponse getCourseByTeacher(Long courseId, Long teacherId);

    Long createCourse(CourseRequest course, Long teacherId);

    CourseDetailResponse updateCourse(Long courseId, CourseRequest courseRequest, Long teacherId);

    void deleteCourse(Long courseId, Long teacherId);
    com.app.features.courses.dto.response.DashboardStatsResponse getDashboardStats(Long teacherId);
}
