package com.app.features.feedback.controller;

import com.app.features.feedback.dto.FeedbackDto.*;
import com.app.features.feedback.service.FeedbackService;
import com.app.utils.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/feedback") @RequiredArgsConstructor
public class FeedbackController {
    private final FeedbackService service;
    @GetMapping("/current") public ResponseEntity<Form> current(Authentication auth) {
        Long userId = auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal()) ? SecurityUtils.getCurrentUserId() : null;
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(service.current(userId));
    }
    @GetMapping("/current/participation") @PreAuthorize("hasAnyRole('STUDENT','ADMIN')")
    public ResponseEntity<Form> participation() {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(service.current(SecurityUtils.getCurrentUserId()));
    }
    @PostMapping("/current/start") @PreAuthorize("hasAnyRole('STUDENT','ADMIN')")
    public ResponseEntity<Void> start(@Valid @RequestBody Start body) {
        service.start(body, SecurityUtils.getCurrentUserId()); return ResponseEntity.noContent().build();
    }
    @PostMapping("/current/submissions") @PreAuthorize("hasAnyRole('STUDENT','ADMIN')")
    public ResponseEntity<Receipt> submit(@Valid @RequestBody Submit body) {
        return ResponseEntity.status(HttpStatus.CREATED).cacheControl(CacheControl.noStore()).body(service.submit(body, SecurityUtils.getCurrentUserId()));
    }
}
