package com.app.features.reports.controller;

import com.app.features.model.enums.ReportStatus;
import com.app.features.reports.dto.response.ReportResponse;
import com.app.features.reports.service.IReportService;
import com.app.utils.ApiPath;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(ApiPath.API_REPORTS)
@RequiredArgsConstructor
public class ReportController {
    private final IReportService reportService;

    @GetMapping
    public ResponseEntity<List<ReportResponse>> getReports(
            @RequestParam(required = false) ReportStatus status
    ) {
        return ResponseEntity.ok(reportService.getReports(status));
    }

    @PostMapping("/{reportId}/investigate")
    public ResponseEntity<ReportResponse> markInvestigating(@PathVariable Long reportId) {
        return ResponseEntity.ok(reportService.markInvestigating(reportId));
    }

    @PostMapping("/{reportId}/resolve")
    public ResponseEntity<ReportResponse> resolveReport(@PathVariable Long reportId) {
        return ResponseEntity.ok(reportService.resolveReport(reportId));
    }

    @PostMapping("/{reportId}/dismiss")
    public ResponseEntity<ReportResponse> dismissReport(@PathVariable Long reportId) {
        return ResponseEntity.ok(reportService.dismissReport(reportId));
    }
}
