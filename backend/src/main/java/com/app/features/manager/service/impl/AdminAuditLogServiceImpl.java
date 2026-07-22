package com.app.features.manager.service.impl;

import com.app.features.manager.repository.AuditLogRepository;
import com.app.features.manager.service.AdminAuditLogService;
import com.app.features.model.AuditLogEntity;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminAuditLogServiceImpl implements AdminAuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void writeLog(Long userId, String action, String fallbackMethod, String fallbackEndpoint,
                         Map<String, Object> beforeData, Map<String, Object> afterData) {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        HttpServletRequest request = attributes == null ? null : attributes.getRequest();

        AuditLogEntity auditLog = new AuditLogEntity();
        auditLog.setUserId(userId);
        auditLog.setAction(action);
        auditLogRepository.save(auditLog);
        log.info("Admin audit log saved, userId={}, action={}", userId, action);
    }

    private String resolveIpAddress(HttpServletRequest request) {
        if (request == null) {
            return "127.0.0.1";
        }

        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }

        return request.getRemoteAddr() == null || request.getRemoteAddr().isBlank()
                ? "127.0.0.1"
                : request.getRemoteAddr();
    }
}
