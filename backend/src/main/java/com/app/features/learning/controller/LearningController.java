package com.app.features.learning.controller;

import com.app.features.learning.dto.LearningStatsResponse;
import com.app.features.learning.service.ILearningService;
import com.app.utils.ApiPath;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(ApiPath.API_LEARNING)
@RequiredArgsConstructor
public class LearningController {

    private final ILearningService learningService;

    @GetMapping("/stats")
    public ResponseEntity<LearningStatsResponse> getStats(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestParam(required = false) Long courseId
    ) {
        // Safe fallback to first user (ID 7) in seed database if no header is present
        Long finalUserId = userId != null ? userId : 7L;
        return ResponseEntity.ok(learningService.getLearningStats(finalUserId, courseId));
    }
}
