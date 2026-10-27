package com.app.features.admin.controller;

import com.app.features.admin.dto.LearningAnalytics.*;
import com.app.features.admin.dto.StudentManagement.AuditContext;
import com.app.features.admin.service.LearningAnalyticsService;
import com.app.utils.SecurityUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;

@RestController @RequestMapping("/api/admin/learning-analytics") @RequiredArgsConstructor @PreAuthorize("hasRole('ADMIN')")
public class LearningAnalyticsController {
    private final LearningAnalyticsService service;
    @GetMapping public ResponseEntity<Report> report(@RequestParam(required=false) LocalDate from,
        @RequestParam(required=false) LocalDate to, @RequestParam(defaultValue="0") int page,
        @RequestParam(defaultValue="0") int minimumMinutes,@RequestParam(defaultValue="") String search,
        @RequestParam(defaultValue="false") boolean includeLab) {
        LocalDate end=to==null?service.today():to;
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(service.report(from==null?end.minusDays(6):from,end,page,minimumMinutes,search,includeLab));
    }
    @PutMapping("/settings") public ResponseEntity<Settings> settings(@Valid @RequestBody Settings body,HttpServletRequest request) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(service.saveSettings(body,context(request)));
    }
    static AuditContext context(HttpServletRequest r) { return new AuditContext(SecurityUtils.getCurrentUserId(),r.getMethod(),r.getRequestURI(),r.getRemoteAddr(),r.getHeader("User-Agent")); }
}
