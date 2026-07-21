package com.app.features.manager.service;

import com.app.features.manager.dto.response.AuditLogDetailResponse;
import com.app.features.manager.dto.response.AuditLogResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminMonitoringService {
    Page<AuditLogResponse> getAuditLogs(String keyword, Pageable pageable);

    AuditLogDetailResponse getAuditLogDetail(Long id);
}
