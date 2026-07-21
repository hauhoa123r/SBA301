package com.app.features.learning.controller;

import com.app.features.learning.dto.request.UpdateLessonProgressRequest;
import com.app.features.learning.dto.response.CourseLearningDetailResponse;
import com.app.features.learning.dto.response.CourseProgressResponse;
import com.app.features.learning.dto.response.LearningStatsResponse;
import com.app.features.learning.service.ILearningService;
import com.app.features.learning.service.ILearningProgressService;
import com.app.features.model.UserEntity;
import com.app.security.oauth.CustomOAuth2User;
import com.app.utils.ApiPath;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@RestController
@RequestMapping(ApiPath.API_LEARNING)
@RequiredArgsConstructor
@PreAuthorize("hasRole('STUDENT')")
public class LearningController {

    private final ILearningService learningService;
    private final ILearningProgressService learningProgressService;

    @GetMapping("/stats")
    public ResponseEntity<LearningStatsResponse> getStats(@RequestParam(required = false) Long courseId,
                                                           Authentication authentication) {
        return ResponseEntity.ok(learningService.getLearningStats(authenticatedUserId(authentication), courseId));
    }

    @GetMapping("/courses/{courseId}")
    public ResponseEntity<CourseLearningDetailResponse> getCourseLearningDetails(@PathVariable Long courseId,
                                                                                   Authentication authentication) {
        return ResponseEntity.ok(learningService.getCourseLearningDetails(authenticatedUserId(authentication), courseId));
    }

    @GetMapping("/courses/{courseId}/progress")
    public ResponseEntity<CourseProgressResponse> getCourseProgress(@PathVariable Long courseId,
                                                                     Authentication authentication) {
        return ResponseEntity.ok(learningProgressService.getCourseProgress(authenticatedUserId(authentication), courseId));
    }

    @PutMapping("/courses/{courseId}/lessons/{lessonId}/progress")
    public ResponseEntity<CourseProgressResponse> updateLessonProgress(@PathVariable Long courseId,
                                                                        @PathVariable Long lessonId,
                                                                        @Valid @RequestBody UpdateLessonProgressRequest request,
                                                                        Authentication authentication) {
        return ResponseEntity.ok(learningProgressService.updateLessonProgress(
                authenticatedUserId(authentication), courseId, lessonId, request));
    }

    private Long authenticatedUserId(Authentication authentication) {
        if (authentication == null) {
            throw new ResponseStatusException(UNAUTHORIZED, "Authentication required");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof UserEntity user) {
            return user.getId();
        }
        if (principal instanceof CustomOAuth2User oauthUser) {
            return oauthUser.getUser().getId();
        }
        throw new ResponseStatusException(UNAUTHORIZED, "Authentication required");
    }
}
