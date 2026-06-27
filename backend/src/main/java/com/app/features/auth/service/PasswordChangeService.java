package com.app.features.auth.service;

import com.app.features.auth.repository.PasswordChangeRepository;
import com.app.features.auth.repository.VerificationTokenRepository;
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
public class PasswordChangeService {
    private static final String TOKEN_TYPE_RESET = "PASSWORD_RESET";

    private final MailService mailService;
    private final PasswordChangeRepository passwordChangeRepository;
    private final VerificationTokenRepository verificationTokenRepository;
    private final SecureRandom secureRandom = new SecureRandom();

    @Transactional
    public void processForgotPassword(String email) {
        UserEntity user = passwordChangeRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Email does not exist."));

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
            mailService.sendResetTokenEmail(email, token);
        } catch (RuntimeException ex) {
            verificationTokenRepository.delete(verificationToken);
            throw new RuntimeException("Failed to send email, please try again later.");
        }
    }

    @Transactional
    public boolean verifyResetToken(String email, String token) {
        Optional<VerificationTokenEntity> tokenOpt = verificationTokenRepository
                .findByTokenAndTokenTypeAndUsedFalseAndUserEmail(token.trim(), TOKEN_TYPE_RESET, email);
        if (tokenOpt.isEmpty()) {
            return false;
        }

        VerificationTokenEntity verificationToken = tokenOpt.get();
        if (verificationToken.getExpiryDate().isBefore(Instant.now())) {
            verificationToken.setUsed(true);
            verificationTokenRepository.save(verificationToken);
            return false;
        }

        verificationToken.setUsed(true);
        verificationTokenRepository.save(verificationToken);
        return true;
    }
}
