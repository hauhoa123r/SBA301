package com.app.features.admin.controller;

import com.app.features.admin.dto.DashboardResponse;
import com.app.features.admin.dto.DashboardResponse.CoursePage;
import com.app.features.admin.service.DashboardService;
import com.app.utils.ApiPath;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(ApiPath.API_ADMIN_DASHBOARD)
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class DashboardController {
    private final DashboardService service;

    @GetMapping
    public ResponseEntity<DashboardResponse> dashboard(@RequestParam(defaultValue = "all") String period,
                                                        @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(service.dashboard(period, limit));
    }

    @GetMapping("/courses")
    public ResponseEntity<CoursePage> courses(@RequestParam(defaultValue = "") String search,
                                              @RequestParam(defaultValue = "") String status,
                                              @RequestParam(defaultValue = "0") int page,
                                              @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(service.courses(search, status, page, size));
    }
}
