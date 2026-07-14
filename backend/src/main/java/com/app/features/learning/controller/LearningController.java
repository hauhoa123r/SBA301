package com.app.features.learning.controller;

import com.app.features.learning.dto.CourseLearningDetailResponse;
import com.app.features.learning.dto.LearningStatsResponse;
import com.app.features.learning.service.ILearningService;
import com.app.utils.ApiPath;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(ApiPath.API_LEARNING)
@RequiredArgsConstructor
public class LearningController {

    private static final Long DEFAULT_USER_ID = 7L;

    private final ILearningService learningService;

    @GetMapping("/stats")
    public ResponseEntity<LearningStatsResponse> getStats(@RequestHeader(value = "X-User-Id", required = false) Long userId, @RequestParam(required = false) Long courseId) {
        Long finalUserId = userId != null ? userId : DEFAULT_USER_ID;
        return ResponseEntity.ok(learningService.getLearningStats(finalUserId, courseId));
    }

    @GetMapping("/courses/{courseId}")
    public ResponseEntity<CourseLearningDetailResponse> getCourseLearningDetails(@PathVariable Long courseId) {
        return ResponseEntity.ok(learningService.getCourseLearningDetails(courseId));
    }
}
