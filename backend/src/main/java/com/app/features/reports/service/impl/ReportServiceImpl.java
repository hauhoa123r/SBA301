package com.app.features.reports.service.impl;

import com.app.exception.BadRequestException;
import com.app.exception.ResourceNotFoundException;
import com.app.features.model.ReportEntity;
import com.app.features.model.UserEntity;
import com.app.features.model.enums.ReportStatus;
import com.app.features.reports.dto.response.ReportResponse;
import com.app.features.reports.repository.ReportRepository;
import com.app.features.reports.service.IReportService;
import com.app.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements IReportService {
    private final ReportRepository reportRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ReportResponse> getReports(ReportStatus status) {
        List<ReportEntity> reports = status == null
                ? reportRepository.findAllByOrderByCreatedAtDesc()
                : reportRepository.findAllByStatusOrderByCreatedAtDesc(status);

        return reports.stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional
    public ReportResponse markInvestigating(Long reportId) {
        ReportEntity report = getReport(reportId);

        if (report.getStatus() != ReportStatus.PENDING) {
            throw new BadRequestException("Only pending reports can be marked as investigating.");
        }

        report.setStatus(ReportStatus.INVESTIGATING);
        return toResponse(reportRepository.save(report));
    }

    @Override
    @Transactional
    public ReportResponse resolveReport(Long reportId) {
        return closeReport(reportId, ReportStatus.RESOLVED);
    }

    @Override
    @Transactional
    public ReportResponse dismissReport(Long reportId) {
        return closeReport(reportId, ReportStatus.DISMISSED);
    }

    private ReportResponse closeReport(Long reportId, ReportStatus nextStatus) {
        ReportEntity report = getReport(reportId);

        if (report.getStatus() == ReportStatus.RESOLVED || report.getStatus() == ReportStatus.DISMISSED) {
            throw new BadRequestException("This report has already been closed.");
        }

        report.setStatus(nextStatus);
        report.setResolvedBy(SecurityUtils.getCurrentUser());
        report.setResolvedAt(Instant.now());

        return toResponse(reportRepository.save(report));
    }

    private ReportEntity getReport(Long reportId) {
        return reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found with id: " + reportId));
    }

    private ReportResponse toResponse(ReportEntity report) {
        UserEntity reporter = report.getReporter();
        UserEntity resolvedBy = report.getResolvedBy();

        return ReportResponse.builder()
                .id(report.getId())
                .reporterId(reporter != null ? reporter.getId() : null)
                .reporterName(reporter != null ? reporter.getFullName() : null)
                .targetType(report.getTargetType())
                .targetId(report.getTargetId())
                .target(report.getTargetType() + " #" + report.getTargetId())
                .reason(report.getReason())
                .status(report.getStatus())
                .resolvedById(resolvedBy != null ? resolvedBy.getId() : null)
                .resolvedByName(resolvedBy != null ? resolvedBy.getFullName() : null)
                .createdAt(report.getCreatedAt())
                .resolvedAt(report.getResolvedAt())
                .build();
    }
}