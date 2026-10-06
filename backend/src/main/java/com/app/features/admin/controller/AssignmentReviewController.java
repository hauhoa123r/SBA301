package com.app.features.admin.controller;

import com.app.features.admin.service.AssignmentReviewService;
import com.app.features.admin.service.AssignmentReviewService.GradeRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/admin/assignments/submissions")
@RequiredArgsConstructor @PreAuthorize("hasRole('ADMIN')")
public class AssignmentReviewController {
    private final AssignmentReviewService service;

    @GetMapping
    public AssignmentReviewService.SubmissionPage list(@RequestParam(defaultValue = "") String status,
            @RequestParam(defaultValue = "0") int page) {
        return service.list(status, page);
    }
    @PutMapping("/{id}/grade")
    public AssignmentReviewService.ReviewResponse grade(@PathVariable Long id, @Valid @RequestBody GradeRequest request) {
        return service.grade(id, request);
    }
}
