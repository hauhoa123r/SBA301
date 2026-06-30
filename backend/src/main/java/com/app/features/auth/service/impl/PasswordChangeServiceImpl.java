package com.app.features.auth.service.impl;

import com.app.features.auth.dto.ChangePasswordRequest;
import com.app.features.auth.repository.PasswordChangeRepository;
import com.app.features.auth.repository.VerificationTokenRepository;
import com.app.features.auth.service.PasswordChangeService;
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
public class PasswordChangeServiceImpl implements PasswordChangeService {
    private static final String TOKEN_TYPE_RESET = "PASSWORD_RESET";
    private static final String MODE_CHANGE = "change";
    private static final String MODE_RESET = "reset";

    private final MailService mailService;
    private final PasswordChangeRepository passwordChangeRepository;
    private final VerificationTokenRepository verificationTokenRepository;
    private final SecureRandom secureRandom = new SecureRandom();

    @Transactional
    public void processForgotPassword(String email) {
        String normalizedEmail = normalizeEmail(email);
        if (isBlank(normalizedEmail)) {
            throw new IllegalArgumentException("Email is required.");
        }

        Optional<UserEntity> userOpt = passwordChangeRepository.findByEmail(normalizedEmail);
        if (userOpt.isEmpty()) {
            return;
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
                .expiryDate(Instant.now().plus(Duration.ofMinutes(15)))
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

    @Transactional
    public boolean verifyResetToken(String email, String token) {
        return findValidResetToken(email, token).isPresent();
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Request body is required.");
        }
        if (isBlank(request.getNewPassword()) || isBlank(request.getConfirmPassword())) {
            throw new IllegalArgumentException("New password and confirm password are required.");
        }
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match.");
        }

        String mode = request.getMode() != null ? request.getMode().trim() : "";
        if (MODE_RESET.equals(mode)) {
            resetPassword(request);
            return;
        }
        if (MODE_CHANGE.equals(mode)) {
            changeCurrentPassword(request);
            return;
        }

        throw new IllegalArgumentException("Invalid password change mode.");
    }

    private void resetPassword(ChangePasswordRequest request) {
        String email = normalizeEmail(request.getEmail());
        VerificationTokenEntity resetToken = findValidResetToken(email, request.getToken())
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired token."));

        UserEntity user = resetToken.getUser();
        user.setPasswordHash(request.getNewPassword());
        passwordChangeRepository.save(user);

        resetToken.setUsed(true);
        verificationTokenRepository.save(resetToken);
    }

    private void changeCurrentPassword(ChangePasswordRequest request) {
        String email = normalizeEmail(request.getEmail());
        if (isBlank(email)) {
            throw new IllegalArgumentException("Login session is required.");
        }
        if (isBlank(request.getCurrentPassword())) {
            throw new IllegalArgumentException("Current password is required.");
        }

        UserEntity user = passwordChangeRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Email does not exist."));
        if (!user.getPasswordHash().equals(request.getCurrentPassword())) {
            throw new IllegalArgumentException("Current password is incorrect.");
        }

        user.setPasswordHash(request.getNewPassword());
        passwordChangeRepository.save(user);
    }

    private Optional<VerificationTokenEntity> findValidResetToken(String email, String token) {
        String normalizedEmail = normalizeEmail(email);
        String normalizedToken = normalize(token);
        if (isBlank(normalizedEmail) || isBlank(normalizedToken)) {
            return Optional.empty();
        }

        Optional<VerificationTokenEntity> tokenOpt = verificationTokenRepository
                .findByTokenAndTokenTypeAndUsedFalseAndUserEmail(normalizedToken, TOKEN_TYPE_RESET, normalizedEmail);
        if (tokenOpt.isEmpty()) {
            return Optional.empty();
        }

        VerificationTokenEntity verificationToken = tokenOpt.get();
        if (!verificationToken.getExpiryDate().isBefore(Instant.now())) {
            return tokenOpt;
        }

        verificationToken.setUsed(true);
        verificationTokenRepository.save(verificationToken);
        return Optional.empty();
    }

    private String normalizeEmail(String value) {
        return normalize(value).toLowerCase();
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim();
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
