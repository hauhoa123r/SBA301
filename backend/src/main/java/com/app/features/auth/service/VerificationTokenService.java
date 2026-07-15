package com.app.features.auth.service;

import com.app.features.model.UserEntity;
import com.app.features.model.VerificationTokenEntity;

import java.time.Duration;
import java.util.Optional;

public interface VerificationTokenService {
    VerificationTokenEntity createToken(UserEntity user, String tokenType, Duration ttl);

    VerificationTokenEntity createToken(UserEntity user, String tokenType, String token, Duration ttl);

    Optional<VerificationTokenEntity> findValidToken(String token, String tokenType, String email);

    VerificationTokenEntity createPasswordResetToken(UserEntity user, String token);

    Optional<VerificationTokenEntity> findValidPasswordResetToken(String email, String token);

    void markUsed(VerificationTokenEntity verificationToken);
}
