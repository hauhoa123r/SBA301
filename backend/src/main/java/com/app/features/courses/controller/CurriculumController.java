package com.app.features.courses.controller;

import com.app.features.courses.dto.request.ChapterRequest;
import com.app.features.courses.dto.response.ChapterResponse;
import com.app.features.courses.service.ICurriculumService;
import com.app.utils.ApiPath;
import com.app.utils.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

    @RestController
    @RequiredArgsConstructor
    public class CurriculumController {
        private final ICurriculumService curriculumService;

        @PutMapping(ApiPath.API_COURSE_CURRICULUM)
        public ResponseEntity<?> updateCurriculum(
                @PathVariable("courseId") Long courseId,
                @Valid @RequestBody List<ChapterRequest> chapterRequests) {
            Long currentTeacherId = SecurityUtils.getCurrentUserId();
            curriculumService.updateCurriculum(courseId, chapterRequests, currentTeacherId);
            return ResponseEntity.ok(Map.of("message", "Curriculum updated"));
        }

        @GetMapping(ApiPath.API_COURSE_CURRICULUM)
        public ResponseEntity<List<ChapterResponse>> getCurriculum(@PathVariable(name = "courseId")  Long courseId) {
            List<ChapterResponse> curriculum = curriculumService.getCurriculumByCourseId(courseId);
            return ResponseEntity.ok(curriculum);
        }
    }
