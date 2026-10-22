package com.app.features.admin.controller;

import com.app.features.admin.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;

@RestController @RequestMapping("/api/admin/registration-analytics") @RequiredArgsConstructor @PreAuthorize("hasRole('ADMIN')")
public class RegistrationAnalyticsController {
    private final RegistrationAnalyticsService service;
    @GetMapping
    public ResponseEntity<RegistrationAnalyticsService.Report> report(@RequestParam(required=false) LocalDate from,
        @RequestParam(required=false) LocalDate to,@RequestParam(defaultValue="day") String mode,
        @RequestParam(defaultValue="false") boolean includeLab) {
        var end=to==null?service.today():to;
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(service.report(new AnalyticsRange(from==null?end.minusDays(29):from,end,mode),includeLab));
    }
}
