package com.app.features.reports.dto.response;

import com.app.features.model.enums.ReportStatus;
import com.app.features.model.enums.ReportTargetType;
import lombok.Builder;

import java.time.Instant;

@Builder
public record ReportResponse(
        Long id,
        Long reporterId,
        String reporterName,
        ReportTargetType targetType,
        Long targetId,
        String target,
        String reason,
        ReportStatus status,
        Long resolvedById,
        String resolvedByName,
        Instant createdAt,
        Instant resolvedAt
) {

}