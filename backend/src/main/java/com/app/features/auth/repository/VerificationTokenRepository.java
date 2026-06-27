package com.app.features.auth.repository;

import com.app.features.model.VerificationTokenEntity;
import com.app.features.model.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VerificationTokenRepository extends JpaRepository<VerificationTokenEntity, Long> {
    Optional<VerificationTokenEntity> findByTokenAndTokenTypeAndUsedFalseAndUserEmail(String token, String tokenType, String email);
    List<VerificationTokenEntity> findAllByUserAndTokenTypeAndUsedFalse(UserEntity user, String tokenType);
}
