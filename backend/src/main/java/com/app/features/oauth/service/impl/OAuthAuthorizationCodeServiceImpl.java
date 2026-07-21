package com.app.features.oauth.service.impl;

import com.app.features.model.UserEntity;
import com.app.features.oauth.entity.OAuthAuthorizationCodeEntity;
import com.app.features.oauth.repository.OAuthAuthorizationCodeRepository;
import com.app.features.oauth.service.OAuthAuthorizationCodeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;

@Service
@RequiredArgsConstructor
@Slf4j
public class OAuthAuthorizationCodeServiceImpl implements OAuthAuthorizationCodeService {
    private static final Duration TTL = Duration.ofSeconds(60);
    private final OAuthAuthorizationCodeRepository repository;
    private final SecureRandom secureRandom = new SecureRandom();

    @Override
    @Transactional
    public String create(UserEntity user) {
        byte[] random = new byte[32];
        secureRandom.nextBytes(random);
        String rawCode = Base64.getUrlEncoder().withoutPadding().encodeToString(random);
        OAuthAuthorizationCodeEntity entity = new OAuthAuthorizationCodeEntity();
        entity.setCodeHash(hash(rawCode));
        entity.setUser(user);
        entity.setExpiresAt(Instant.now().plus(TTL));
        repository.save(entity);
        return rawCode;
    }

    @Override
    @Transactional
    public UserEntity consume(String rawCode) {
        if (rawCode == null || rawCode.isBlank()) throw invalidCode();
        OAuthAuthorizationCodeEntity entity = repository.findByCodeHash(hash(rawCode)).orElseThrow(this::invalidCode);
        repository.delete(entity);
        repository.flush();
        if (!entity.getExpiresAt().isAfter(Instant.now())) {
            log.warn("OAuth authorization code expired");
            throw new OAuth2AuthenticationException(new OAuth2Error("authorization_code_expired"));
        }
        UserEntity user = entity.getUser();
        user.getRoles().size();
        return user;
    }

    private OAuth2AuthenticationException invalidCode() {
        return new OAuth2AuthenticationException(new OAuth2Error("invalid_authorization_code"));
    }

    private String hash(String value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));
            return java.util.HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }
}

