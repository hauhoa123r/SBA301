package com.app.features.manager.service;

import java.util.Map;

public interface AdminAuditLogService {
    void writeLog(Long userId, String action, String fallbackMethod, String fallbackEndpoint,
                  Map<String, Object> beforeData, Map<String, Object> afterData);
}
