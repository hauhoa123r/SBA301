package com.app.features.reports.service;

import com.app.features.model.enums.ReportStatus;
import com.app.features.reports.dto.response.ReportResponse;

import java.util.List;

public interface IReportService {
    List<ReportResponse> getReports(ReportStatus status);

    ReportResponse markInvestigating(Long reportId);

    ReportResponse resolveReport(Long reportId);

    ReportResponse dismissReport(Long reportId);
}