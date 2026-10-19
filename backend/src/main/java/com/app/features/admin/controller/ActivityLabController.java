package com.app.features.admin.controller;

import com.app.features.admin.dto.LearningAnalytics.*;
import com.app.features.admin.service.ActivityLabService;
import com.app.features.feedback.dto.FeedbackDto;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import static com.app.features.admin.controller.LearningAnalyticsController.context;

@RestController @RequestMapping("/api/admin/activity-lab") @RequiredArgsConstructor @PreAuthorize("hasRole('ADMIN')")
public class ActivityLabController {
    private final ActivityLabService service;
    @GetMapping public ResponseEntity<?> overview(@RequestParam(defaultValue="") String search,@RequestParam(defaultValue="0") int page) { return ok(service.overview(search,page)); }
    @PostMapping("/users") public ResponseEntity<?> create(@Valid @RequestBody CreateAccount body,HttpServletRequest r) {
        return ResponseEntity.status(201).cacheControl(CacheControl.noStore()).body(Map.of("id",service.create(body,context(r))));
    }
    @GetMapping("/users/{id}") public ResponseEntity<?> detail(@PathVariable Long id) { return ok(service.detail(id)); }
    @PutMapping("/users/{id}/rule") public ResponseEntity<?> rule(@PathVariable Long id,@Valid @RequestBody Rule body,HttpServletRequest r) { service.rule(id,body,context(r)); return ok(Map.of("saved",true)); }
    @PostMapping("/users/{id}/subscription") public ResponseEntity<?> grant(@PathVariable Long id,@Valid @RequestBody Grant body,HttpServletRequest r) { service.grant(id,body,context(r)); return ok(Map.of("saved",true)); }
    @PostMapping("/users/{id}/run") public ResponseEntity<?> run(@PathVariable Long id,@Valid @RequestBody Reason body,HttpServletRequest r) { return ok(service.run(id,body.reason(),context(r))); }
    @GetMapping("/users/{id}/feedback") public ResponseEntity<?> feedback(@PathVariable Long id) { return ok(service.currentFeedback(id)); }
    @PostMapping("/users/{id}/feedback") public ResponseEntity<?> feedback(@PathVariable Long id,@Valid @RequestBody FeedbackDto.Submit body,HttpServletRequest r) { return ok(service.submitFeedback(id,body,context(r))); }
    private ResponseEntity<?> ok(Object body) { return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(body); }
}
