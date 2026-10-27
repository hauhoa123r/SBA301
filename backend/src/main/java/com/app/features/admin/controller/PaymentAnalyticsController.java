package com.app.features.admin.controller;

import com.app.features.admin.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;

@RestController @RequestMapping("/api/admin/payments") @RequiredArgsConstructor @PreAuthorize("hasRole('ADMIN')")
public class PaymentAnalyticsController {
    private final PaymentAnalyticsService service;
    @GetMapping public ResponseEntity<PaymentAnalyticsService.Report> report(@RequestParam(required=false) LocalDate from,
        @RequestParam(required=false) LocalDate to,@RequestParam(defaultValue="day") String mode,
        @RequestParam(defaultValue="") String search,@RequestParam(defaultValue="") String status,
        @RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="20") int size,
        @RequestParam(defaultValue="false") boolean unknownOnly) {
        var end=to==null?service.today():to;
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(service.report(new AnalyticsRange(from==null?end.minusDays(29):from,end,mode),search,status,page,size,unknownOnly));
    }
    @GetMapping("/{id}") public ResponseEntity<PaymentAnalyticsService.Transaction> detail(@PathVariable long id) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(service.detail(id));
    }
}
