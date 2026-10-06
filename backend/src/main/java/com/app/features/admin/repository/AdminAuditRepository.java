package com.app.features.admin.repository;

import com.app.features.admin.dto.StudentManagement.AuditContext;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import java.util.LinkedHashMap;

@Repository @RequiredArgsConstructor
public class AdminAuditRepository {
    private final EntityManager em;
    private final ObjectMapper mapper;
    public void write(AuditContext context, String action, String target, Object before, Object after, String reason) {
        var data = new LinkedHashMap<String, Object>(); data.put("value", after); data.put("reason", reason.trim());
        try {
            em.createNativeQuery("""
                INSERT INTO audit_logs (user_id, action, method, endpoint, before_data, after_data, ip_address, user_agent)
                VALUES (:actor, :action, :method, :target, :before, :after, :ip, :agent)
                """).setParameter("actor", context.actorId()).setParameter("action", action)
                .setParameter("method", context.method()).setParameter("target", target)
                .setParameter("before", mapper.writeValueAsString(before)).setParameter("after", mapper.writeValueAsString(data))
                .setParameter("ip", truncate(context.ip(), 45)).setParameter("agent", truncate(context.userAgent(), 500)).executeUpdate();
        } catch (JsonProcessingException e) { throw new IllegalStateException("Không thể ghi lịch sử quản trị.", e); }
    }
    private String truncate(String value, int limit) { return value == null ? "" : value.substring(0, Math.min(value.length(), limit)); }
}
