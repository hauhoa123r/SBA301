package com.app.features.auth.service.impl;

import com.app.features.auth.dto.request.ResetPasswordRequest;
import com.app.features.auth.repository.PasswordChangeRepository;
import com.app.features.auth.repository.VerificationTokenRepository;
import com.app.features.auth.service.PasswordResetService;
import com.app.features.mailSender.service.MailService;
import com.app.features.model.VerificationTokenEntity;
import com.app.features.model.UserEntity;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PasswordResetServiceImpl implements PasswordResetService {
    private static final String TOKEN_TYPE_RESET = "PASSWORD_RESET";
    private static final int TOKEN_TTL_MINUTES = 15;

    private final MailService mailService;
    private final PasswordChangeRepository passwordChangeRepository;
    private final VerificationTokenRepository verificationTokenRepository;
    private final SecureRandom secureRandom = new SecureRandom();

    @Override
    @Transactional
    public void processForgotPassword(String email) {
        String normalizedEmail = normalize(email).toLowerCase();
        if (isBlank(normalizedEmail)) {
            throw new IllegalArgumentException("Email is required.");
        }
        Optional<UserEntity> userOpt = passwordChangeRepository.findByEmail(normalizedEmail);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("Email does not exist.");
        }
        UserEntity user = userOpt.get();

        List<VerificationTokenEntity> oldTokens = verificationTokenRepository
                .findAllByUserAndTokenTypeAndUsedFalse(user, TOKEN_TYPE_RESET);
        if (!oldTokens.isEmpty()) {
            oldTokens.forEach(oldToken -> oldToken.setUsed(true));
            verificationTokenRepository.saveAll(oldTokens);
        }

        String token = String.format("%06d", secureRandom.nextInt(1_000_000));
        VerificationTokenEntity verificationToken = VerificationTokenEntity.builder()
                .token(token)
                .tokenType(TOKEN_TYPE_RESET)
                .user(user)
                .expiryDate(Instant.now().plus(Duration.ofMinutes(TOKEN_TTL_MINUTES)))
                .used(false)
                .build();
        verificationTokenRepository.save(verificationToken);

        try {
            mailService.sendResetTokenEmail(normalizedEmail, token);
        } catch (RuntimeException ex) {
            verificationTokenRepository.delete(verificationToken);
            throw new RuntimeException("Failed to send email, please try again later.");
        }
    }

    @Override
    @Transactional
    public boolean verifyResetToken(String email, String token) {
        return findValidResetToken(email, token).isPresent();
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Request body is required.");
        }
        String email = normalize(request.getEmail()).trim().toLowerCase();
        String token = normalize(request.getToken()).trim();
        if (isBlank(email)) {
            throw new IllegalArgumentException("Email is required.");
        }
        if (token.isEmpty() && !token.matches("\\d{6}")) {
            throw new IllegalArgumentException("Token must be 6 digits.");
        }
        if (isBlank(request.getNewPassword()) || isBlank(request.getConfirmPassword())) {
            throw new IllegalArgumentException("New password and confirm password are required.");
        }
        if (request.getNewPassword().length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters long.");
        }
        if (!request.getNewPassword().matches(".*[A-Z].*")) {
            throw new IllegalArgumentException("Password must contain at least one uppercase letter.");
        }
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match.");
        }
        VerificationTokenEntity resetToken = findValidResetToken(email, token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired token."));

        UserEntity user = resetToken.getUser();
        if (request.getNewPassword().equals(user.getPasswordHash())) {
            throw new IllegalArgumentException("New password must be different from the current password.");
        }

        user.setPasswordHash(request.getNewPassword());
        passwordChangeRepository.save(user);

        resetToken.setUsed(true);
        verificationTokenRepository.save(resetToken);
    }

    private Optional<VerificationTokenEntity> findValidResetToken(String email, String token) {
        String normalizedEmail = normalize(email).toLowerCase();
        String normalizedToken = normalize(token);
        if (isBlank(normalizedEmail) || normalizedToken.isEmpty() && !normalizedToken.matches("\\d{6}")) {
            return Optional.empty();
        }

        Optional<VerificationTokenEntity> tokenOpt = verificationTokenRepository
                .findByTokenAndTokenTypeAndUsedFalseAndUserEmail(normalizedToken, TOKEN_TYPE_RESET, normalizedEmail);
        if (tokenOpt.isEmpty()) {
            return Optional.empty();
        }

        VerificationTokenEntity verificationToken = tokenOpt.get();
        if (verificationToken.getExpiryDate() != null && verificationToken.getExpiryDate().isAfter(Instant.now())) {
            return tokenOpt;
        }

        verificationToken.setUsed(true);
        verificationTokenRepository.save(verificationToken);
        return Optional.empty();
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim();
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
