package com.app.features.auth.service.impl;

import com.app.features.auth.dto.ResetPasswordDto;
import com.app.features.auth.dto.request.ResetPasswordRequest;
import com.app.features.auth.repository.PasswordChangeRepository;
import com.app.features.auth.service.PasswordService;
import com.app.features.auth.service.VerificationTokenService;
import com.app.features.mailSender.service.MailService;
import com.app.features.model.UserEntity;
import com.app.features.model.VerificationTokenEntity;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordServiceImpl implements PasswordService {
    private final MailService mailService;
    private final PasswordChangeRepository passwordChangeRepository;
    private final VerificationTokenService verificationTokenService;
    private final SecureRandom secureRandom = new SecureRandom();

    @Override
    @Transactional
    public void processForgotPassword(String email) {
        String normalizedEmail = normalize(email).toLowerCase();
        log.info("Password reset requested, email={}", normalizedEmail);
        if (normalizedEmail.isBlank()) {
            log.warn("Password reset rejected because email is blank");
            throw new IllegalArgumentException("Vui lòng nhập email.");
        }

        UserEntity user = passwordChangeRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> {
                    log.warn("Password reset requested for unknown email, email={}", normalizedEmail);
                    return new IllegalArgumentException("Email không tồn tại.");
                });

        String token = String.format("%06d", secureRandom.nextInt(1_000_000));
        verificationTokenService.createPasswordResetToken(user, token);

        try {
            mailService.sendResetTokenEmail(normalizedEmail, token);
        } catch (RuntimeException ex) {
            log.error("Failed to send password reset email, userId={}", user.getId(), ex);
            throw new RuntimeException("Không thể gửi email, vui lòng thử lại sau.", ex);
        }
        log.info("Password reset email sent successfully, userId={}", user.getId());
    }


    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        log.info("Password reset confirmation requested, email={}", request == null ? null : request.getEmail());
        ResetPasswordDto resetPassword = ResetPasswordDto.from(request);
        VerificationTokenEntity resetToken = findValidResetToken(resetPassword.email(), resetPassword.token())
                .orElseThrow(() -> {
                    log.warn("Password reset confirmation rejected due to invalid or expired verification code, email={}", resetPassword.email());
                    return new IllegalArgumentException("Mã xác minh không hợp lệ hoặc đã hết hạn.");
                });

        UserEntity user = resetToken.getUser();
        if (resetPassword.newPassword().equals(user.getPasswordHash())) {
            log.warn("Password reset rejected because new password matches current password, userId={}", user.getId());
            throw new IllegalArgumentException("Mật khẩu mới phải khác mật khẩu hiện tại.");
        }

        user.setPasswordHash(resetPassword.newPassword());
        passwordChangeRepository.save(user);
        verificationTokenService.markUsed(resetToken);
        log.info("Password reset successfully, userId={}", user.getId());
    }

    private Optional<VerificationTokenEntity> findValidResetToken(String email, String token) {
        String normalizedEmail = normalize(email).toLowerCase();
        String normalizedToken = normalize(token);
        if (normalizedToken.isEmpty() || !normalizedToken.matches("\\d{6}")) {
            return Optional.empty();
        }

        return verificationTokenService.findValidPasswordResetToken(normalizedEmail, normalizedToken);
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim();
    }
}
