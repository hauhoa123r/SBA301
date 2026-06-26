package com.app.features.auth.repository;

import com.app.features.model.VerificationToken;
import com.app.model.user.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Long> {
    Optional<VerificationToken> findByTokenAndTokenTypeAndUsedFalseAndUserEmail(String token, String tokenType, String email);
    List<VerificationToken> findAllByUserAndTokenTypeAndUsedFalse(UserEntity user, String tokenType);
}
