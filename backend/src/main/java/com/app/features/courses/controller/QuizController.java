package com.app.features.courses.controller;

import com.app.features.courses.dto.request.QuizRequest;
import com.app.features.courses.dto.response.QuizResponse;
import com.app.features.courses.service.IQuizService;
import com.app.utils.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class QuizController {

    private final IQuizService quizService;

    @GetMapping("/quizzes/my-quizzes")
    @PreAuthorize("hasAnyRole('TEACHER', 'MANAGER', 'ADMIN')")
    public ResponseEntity<List<QuizResponse>> getMyQuizzes() {
        return ResponseEntity.ok(quizService.getMyQuizzes(SecurityUtils.getCurrentUserId()));
    }

    @GetMapping("/quizzes/{quizId}")
    @PreAuthorize("hasAnyRole('TEACHER', 'MANAGER', 'ADMIN')")
    public ResponseEntity<QuizResponse> getQuizById(
            @PathVariable Long quizId) {
        return ResponseEntity.ok(quizService.getQuizById(quizId, SecurityUtils.getCurrentUserId()));
    }

    @PostMapping("/quizzes")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<QuizResponse> createQuiz(
            @Valid @RequestBody QuizRequest request) {
        return ResponseEntity.ok(quizService.createQuiz(request, SecurityUtils.getCurrentUserId()));
    }

    @PutMapping("/quizzes/{quizId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<QuizResponse> updateQuiz(
            @PathVariable Long quizId,
            @Valid @RequestBody QuizRequest request) {
        return ResponseEntity.ok(quizService.updateQuiz(quizId, request, SecurityUtils.getCurrentUserId()));
    }

    @DeleteMapping("/quizzes/{quizId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<Void> deleteQuiz(
            @PathVariable Long quizId) {
        quizService.deleteQuiz(quizId, SecurityUtils.getCurrentUserId());
        return ResponseEntity.noContent().build();
    }
}
