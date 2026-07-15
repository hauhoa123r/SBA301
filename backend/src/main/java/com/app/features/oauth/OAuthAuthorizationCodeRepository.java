package com.app.features.oauth;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;

import java.util.Optional;

public interface OAuthAuthorizationCodeRepository extends JpaRepository<OAuthAuthorizationCodeEntity, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<OAuthAuthorizationCodeEntity> findByCodeHash(String codeHash);
}
