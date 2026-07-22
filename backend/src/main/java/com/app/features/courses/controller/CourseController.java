package com.app.features.courses.controller;

import com.app.features.courses.dto.request.CourseHideRequest;
import com.app.features.courses.dto.request.CourseRejectionRequest;
import com.app.features.courses.dto.request.CourseRequest;
import com.app.features.courses.dto.response.CourseCatalogResponse;
import com.app.features.courses.dto.response.CourseDetailResponse;
import com.app.features.courses.dto.response.DashboardStatsResponse;
import com.app.features.courses.service.ICourseService;
import com.app.utils.ApiPath;
import com.app.utils.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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

    @GetMapping("/moderation/pending")
    public ResponseEntity<List<CourseDetailResponse>> getPendingCourses() {
        return ResponseEntity.ok(courseService.getPendingCourses());
    }

    @PostMapping("/moderation/{courseId}/approve")
    public ResponseEntity<CourseDetailResponse> approvePendingCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(courseService.approvePendingCourse(courseId));
    }
    
    @GetMapping("/manage-course")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<List<CourseDetailResponse>> getAllCourseByTeacherId() {
        Long currentTeacherId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(courseService.getAllCourseByTeacherId(currentTeacherId));
    }

    @GetMapping("/manage-course/{id}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<CourseDetailResponse> getCourseByTeacherId(@PathVariable Long id) {
        Long currentTeacherId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(courseService.getCourseByTeacher(id, currentTeacherId));
    }

    @PostMapping
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<Long> createCourse(@Valid @RequestBody CourseRequest courseRequest) {
        Long currentTeacherId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(courseService.createCourse(courseRequest, currentTeacherId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<CourseDetailResponse> updateCourse(@PathVariable Long id, @Valid @RequestBody CourseRequest courseRequest) {
        Long currentTeacherId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(courseService.updateCourse(id, courseRequest, currentTeacherId));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        Long currentTeacherId = SecurityUtils.getCurrentUserId();
        courseService.deleteCourse(id, currentTeacherId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/dashboard/stats")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
        Long currentTeacherId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(courseService.getDashboardStats(currentTeacherId));
    }

    @PostMapping("/moderation/{courseId}/reject")
    public ResponseEntity<CourseDetailResponse> rejectPendingCourse(
            @PathVariable Long courseId,
            @Valid @RequestBody CourseRejectionRequest request
    ) {
        return ResponseEntity.ok(courseService.rejectPendingCourse(courseId, request));
    }

    @GetMapping("/moderation/published")
    public ResponseEntity<List<CourseDetailResponse>> getPublishedCourses() {
        return ResponseEntity.ok(courseService.getPublishedCourses());
    }

    @PostMapping("/moderation/{courseId}/hide")
    public ResponseEntity<CourseDetailResponse> hidePublishedCourse(
            @PathVariable Long courseId,
            @Valid @RequestBody CourseHideRequest request
    ) {
        return ResponseEntity.ok(courseService.hidePublishedCourse(courseId, request));
    }
}
