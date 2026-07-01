package com.app.features.courses.controller;

import com.app.features.courses.dto.request.CourseRequest;
import com.app.features.courses.dto.response.CourseCatalogResponse;
import com.app.features.courses.dto.response.CourseDetailResponse;
import com.app.features.courses.service.ICourseService;
import com.app.utils.ApiPath;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(ApiPath.API_COURSES)
@RequiredArgsConstructor
public class CourseController {
    private final ICourseService courseService;

    @GetMapping
    public ResponseEntity<List<CourseCatalogResponse>> getAllCourses() {
        return ResponseEntity.ok(courseService.getAllCourses());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseDetailResponse> getCourseById(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getCourseById(id));
    }

    @GetMapping("/manage-course")
    public ResponseEntity<List<CourseDetailResponse>> getCourseByTeacherId() {
        // Xử lí lấy id ở token sau
        // Tạm thời hard code id
        return ResponseEntity.ok(courseService.getAllCourseByTeacherId(4L));
    }

    @PostMapping
    public ResponseEntity<Long> getCourseByTeacherId(@RequestBody CourseRequest courseRequest) {
        // Xử lí lấy id ở token sau
        // Tạm thời hard code id
        return ResponseEntity.ok(courseService.createCourse(courseRequest, 4l));
    }
}
