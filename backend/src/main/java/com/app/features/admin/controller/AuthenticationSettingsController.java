package com.app.features.admin.controller;

import com.app.features.admin.dto.StudentManagement.AuditContext;
import com.app.features.auth.service.AuthenticationSettingsService;
import com.app.features.auth.service.AuthenticationSettingsService.*;
import com.app.utils.SecurityUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/admin/auth-settings") @PreAuthorize("hasRole('ADMIN')") @RequiredArgsConstructor
public class AuthenticationSettingsController {
    private final AuthenticationSettingsService service;
    @GetMapping public ResponseEntity<Policy> get() { return response(service.current()); }
    @PutMapping public ResponseEntity<Policy> update(@Valid @RequestBody Update body, HttpServletRequest request) {
        var context = new AuditContext(SecurityUtils.getCurrentUserId(), request.getMethod(), request.getRequestURI(), request.getRemoteAddr(), request.getHeader("User-Agent"));
        return response(service.update(body, context));
    }
    private ResponseEntity<Policy> response(Policy policy) { return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(policy); }
}
