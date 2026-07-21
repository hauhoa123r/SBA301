package com.app.features.courses.controller;

import com.app.features.courses.dto.request.CourseRequest;
import com.app.features.courses.dto.response.CourseCatalogResponse;
import com.app.features.courses.dto.response.CourseDetailResponse;
import com.app.features.courses.service.ICourseService;
import com.app.utils.ApiPath;
import com.app.utils.SecurityUtils;
import jakarta.validation.Valid;
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
        Long currentTeacherId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(courseService.getAllCourseByTeacherId(currentTeacherId));
    }

    @GetMapping("/manage-course/{id}")
    public ResponseEntity<CourseDetailResponse> getCourseByTeacherId(@PathVariable Long id) {
        Long currentTeacherId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(courseService.getCourseByTeacher(id, currentTeacherId));
    }

    @PostMapping
    public ResponseEntity<Long> createCourse(@Valid @RequestBody CourseRequest courseRequest) {
        Long currentTeacherId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(courseService.createCourse(courseRequest, currentTeacherId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CourseDetailResponse> updateCourse(@PathVariable Long id, @Valid @RequestBody CourseRequest courseRequest) {
        Long currentTeacherId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(courseService.updateCourse(id, courseRequest, currentTeacherId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        Long currentTeacherId = SecurityUtils.getCurrentUserId();
        courseService.deleteCourse(id, currentTeacherId);
        return ResponseEntity.noContent().build();
    }
}
