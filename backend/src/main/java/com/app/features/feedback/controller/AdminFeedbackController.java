package com.app.features.feedback.controller;

import com.app.features.feedback.dto.FeedbackDto.*;
import com.app.features.feedback.service.FeedbackService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/admin/feedback") @PreAuthorize("hasRole('ADMIN')") @RequiredArgsConstructor
public class AdminFeedbackController {
    private final FeedbackService service;
    @GetMapping public ResponseEntity<FormPage> list(@RequestParam(defaultValue = "0") int page) { return response(service.list(page)); }
    @GetMapping("/{id}") public ResponseEntity<Form> get(@PathVariable Long id) { return response(service.get(id)); }
    @PostMapping public ResponseEntity<Form> create(@Valid @RequestBody Save body) { return ResponseEntity.status(HttpStatus.CREATED).body(service.create(body)); }
    @PutMapping("/{id}") public ResponseEntity<Form> update(@PathVariable Long id, @Valid @RequestBody Save body) { return response(service.update(id, body)); }
    @PostMapping("/{id}/state") public ResponseEntity<Form> state(@PathVariable Long id, @Valid @RequestBody State body) { return response(service.changeState(id, body)); }
    @GetMapping("/{id}/statistics") public ResponseEntity<Statistics> statistics(@PathVariable Long id) { return response(service.statistics(id)); }
    @GetMapping("/{id}/questions/{questionId}/text-answers") public ResponseEntity<TextPage> texts(@PathVariable Long id, @PathVariable Long questionId,
            @RequestParam(defaultValue = "0") int page) { return response(service.textAnswers(id, questionId, page)); }
    private <T> ResponseEntity<T> response(T body) { return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(body); }
}
