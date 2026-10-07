package com.app.features.auth.service;

import com.app.features.admin.dto.StudentManagement.AuditContext;
import com.app.features.admin.repository.AdminAuditRepository;
import com.app.features.auth.repository.AuthenticationSettingsRepository;
import com.app.features.model.AuthenticationSettingsEntity;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service @RequiredArgsConstructor
public class AuthenticationSettingsService {
    private final AuthenticationSettingsRepository settings;
    private final AdminAuditRepository audit;
    public record Policy(boolean emailVerificationEnabled) {}
    public record Update(@NotNull Boolean emailVerificationEnabled, @NotBlank @Size(max = 500) String reason) {}

    @Transactional(readOnly = true)
    public Policy current() { return policy(settings.findById(1).orElseThrow(this::missing)); }

    // Shared policy lock serializes an Admin toggle with in-flight registrations.
    @Transactional
    public boolean requiresVerification() { return settings.readPolicy().orElseThrow(this::missing).isEmailVerificationEnabled(); }

    @Transactional
    public Policy update(Update request, AuditContext context) {
        var entity = settings.lockPolicy().orElseThrow(this::missing);
        var before = policy(entity);
        if (entity.isEmailVerificationEnabled() != request.emailVerificationEnabled()) {
            entity.setEmailVerificationEnabled(request.emailVerificationEnabled());
            settings.saveAndFlush(entity);
            audit.write(context, "AUTH_SETTINGS_UPDATE", "/api/admin/auth-settings", before, policy(entity), request.reason());
        }
        return policy(entity);
    }
    private Policy policy(AuthenticationSettingsEntity entity) { return new Policy(entity.isEmailVerificationEnabled()); }
    private IllegalStateException missing() { return new IllegalStateException("Cần chạy migration 20261007_auth_settings.sql trước khi sử dụng."); }
}
