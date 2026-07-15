package com.app.features.auth.service.impl;

import com.app.features.auth.repository.VerificationTokenRepository;
import com.app.features.auth.service.VerificationTokenService;
import com.app.features.model.UserEntity;
import com.app.features.model.VerificationTokenEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VerificationTokenServiceImpl implements VerificationTokenService {
    private static final String TOKEN_TYPE_PASSWORD_RESET = "PASSWORD_RESET";
    private final VerificationTokenRepository verificationTokenRepository;

    @Override
    @Transactional
    public VerificationTokenEntity createToken(UserEntity user, String tokenType, Duration ttl) {
        return createToken(user, tokenType, UUID.randomUUID().toString(), ttl);
    }

    @Override
    @Transactional
    public VerificationTokenEntity createToken(UserEntity user, String tokenType, String token, Duration ttl) {
        if (user == null) {
            throw new IllegalArgumentException("Không tìm thấy người dùng.");
        }
        if (normalize(tokenType).isBlank()) {
            throw new IllegalArgumentException("Loại mã xác minh không hợp lệ.");
        }
        if (normalize(token).isBlank()) {
            throw new IllegalArgumentException("Mã xác minh không hợp lệ.");
        }
        if (ttl == null || ttl.isZero() || ttl.isNegative()) {
            throw new IllegalArgumentException("Thời hạn mã xác minh không hợp lệ.");
        }

        List<VerificationTokenEntity> oldTokens = verificationTokenRepository.findAllByUserAndTokenTypeAndUsedFalse(user, tokenType);
        if (!oldTokens.isEmpty()) {
            oldTokens.forEach(oldToken -> oldToken.setUsed(true));
            verificationTokenRepository.saveAll(oldTokens);
        }

        VerificationTokenEntity verificationToken = VerificationTokenEntity.builder()
                .token(token)
                .tokenType(tokenType)
                .user(user)
                .expiryDate(Instant.now().plus(ttl))
                .used(false)
                .build();
        return verificationTokenRepository.save(verificationToken);
    }

    @Override
    @Transactional
    public Optional<VerificationTokenEntity> findValidToken(String token, String tokenType, String email) {
        String normalizedToken = normalize(token);
        String normalizedTokenType = normalize(tokenType);
        String normalizedEmail = normalize(email).toLowerCase();
        if (normalizedToken.isEmpty() || normalizedTokenType.isBlank() || normalizedEmail.isBlank()) {
            return Optional.empty();
        }

        Optional<VerificationTokenEntity> tokenOTP = verificationTokenRepository
                .findByTokenAndTokenTypeAndUsedFalseAndUserEmail(normalizedToken, normalizedTokenType, normalizedEmail);

        if (tokenOTP.isEmpty()) {
            return Optional.empty();
        }

        VerificationTokenEntity verificationToken = tokenOTP.get();
        if (verificationToken.getExpiryDate() != null && verificationToken.getExpiryDate().isAfter(Instant.now())) {
            return tokenOTP;
        }

        markUsed(verificationToken);
        return Optional.empty();
    }

    @Override
    @Transactional
    public VerificationTokenEntity createPasswordResetToken(UserEntity user, String token) {
        return createToken(user, TOKEN_TYPE_PASSWORD_RESET, token, Duration.ofMinutes(15));
    }

    @Override
    @Transactional
    public Optional<VerificationTokenEntity> findValidPasswordResetToken(String email, String token) {
        return findValidToken(token, TOKEN_TYPE_PASSWORD_RESET, email);
    }

    @Override
    @Transactional
    public void markUsed(VerificationTokenEntity verificationToken) {
        if (verificationToken == null) {
            return;
        }
        verificationToken.setUsed(true);
        verificationTokenRepository.save(verificationToken);
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim();
    }
}
