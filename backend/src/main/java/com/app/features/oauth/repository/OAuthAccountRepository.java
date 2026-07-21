package com.app.features.oauth.repository;

import com.app.features.oauth.entity.AuthProvider;
import com.app.features.oauth.entity.OAuthAccountEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OAuthAccountRepository extends JpaRepository<OAuthAccountEntity, Long> {
    Optional<OAuthAccountEntity> findByProviderAndProviderUserId(AuthProvider provider, String providerUserId);
}
