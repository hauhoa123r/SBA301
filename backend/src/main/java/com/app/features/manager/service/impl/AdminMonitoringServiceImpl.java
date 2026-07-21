package com.app.features.manager.service.impl;

import com.app.features.manager.dto.response.AuditLogResponse;
import com.app.features.manager.repository.AuditLogRepository;
import com.app.features.manager.service.AdminMonitoringService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminMonitoringServiceImpl implements AdminMonitoringService {

    private final AuditLogRepository auditLogRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<AuditLogResponse> getAuditLogs(String keyword, Pageable pageable) {
        String normalizedKeyword = normalize(keyword);

        log.info("Loading audit logs, keyword={}", normalizedKeyword);

        return auditLogRepository.findAuditLogSummaries(
                normalizedKeyword,
                pageable
        ).map(this::toAuditLogResponse);
    }

    private String normalize(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private AuditLogResponse toAuditLogResponse(Object[] row) {
        return AuditLogResponse.builder()
                .id(toLong(row[0]))
                .userId(toLong(row[1]))
                .actorName(toStringValue(row[2]))
                .roleName(toStringValue(row[3]))
                .action(toStringValue(row[4]))
                .build();
    }

    private Long toLong(Object value) {
        if (value == null) {
            return null;
        }
        return ((Number) value).longValue();
    }

    private String toStringValue(Object value) {
        return value == null ? null : String.valueOf(value);
    }
}
