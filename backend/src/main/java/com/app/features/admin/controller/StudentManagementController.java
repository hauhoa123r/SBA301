package com.app.features.admin.controller;

import com.app.features.admin.dto.StudentManagement.*;
import com.app.features.admin.service.StudentManagementService;
import com.app.utils.SecurityUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/api/admin") @RequiredArgsConstructor @PreAuthorize("hasRole('ADMIN')")
public class StudentManagementController {
    private final StudentManagementService service;
    @GetMapping("/students") public ResponseEntity<StudentPage> list(@RequestParam(defaultValue = "") String search,
        @RequestParam(defaultValue = "") String status, @RequestParam(defaultValue = "") String subscription, @RequestParam(defaultValue = "0") int page) {
        return noStore(service.list(search, status, subscription, page));
    }
    @GetMapping("/students/{id}") public ResponseEntity<Detail> detail(@PathVariable Long id) { return noStore(service.detail(id)); }
    @PatchMapping("/students/{id}/status") public ResponseEntity<Detail> status(@PathVariable Long id, @Valid @RequestBody StatusRequest body, HttpServletRequest request) {
        return noStore(service.changeStatus(id, body, context(request)));
    }
    @PostMapping("/students/{id}/subscription/grant") public ResponseEntity<Detail> grant(@PathVariable Long id, @Valid @RequestBody GrantRequest body, HttpServletRequest request) {
        return noStore(service.grant(id, body, context(request)));
    }
    @PostMapping("/students/{id}/subscription/revoke") public ResponseEntity<Detail> revoke(@PathVariable Long id, @Valid @RequestBody ReasonRequest body, HttpServletRequest request) {
        return noStore(service.revoke(id, body, context(request)));
    }
    @GetMapping("/subscription-plans") public ResponseEntity<List<Plan>> plans() { return noStore(service.plans()); }
    @PostMapping("/subscription-plans") public ResponseEntity<Plan> create(@Valid @RequestBody PlanRequest body, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).cacheControl(CacheControl.noStore()).body(service.savePlan(body.code(), body, true, context(request)));
    }
    @PutMapping("/subscription-plans/{code}") public ResponseEntity<Plan> update(@PathVariable String code, @Valid @RequestBody PlanRequest body, HttpServletRequest request) {
        return noStore(service.savePlan(code, body, false, context(request)));
    }
    private AuditContext context(HttpServletRequest request) { return new AuditContext(SecurityUtils.getCurrentUserId(), request.getMethod(), request.getRequestURI(), request.getRemoteAddr(), request.getHeader("User-Agent")); }
    private <T> ResponseEntity<T> noStore(T body) { return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(body); }
}
