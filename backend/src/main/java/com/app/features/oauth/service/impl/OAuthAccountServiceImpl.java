package com.app.features.oauth.service.impl;

import com.app.features.auth.repository.UserRepository;
import com.app.features.manager.repository.RoleRepository;
import com.app.features.model.RoleEntity;
import com.app.features.model.UserEntity;
import com.app.features.model.enums.UserStatus;
import com.app.features.oauth.converter.OAuthAccountConverter;
import com.app.features.oauth.dto.OAuth2UserInfo;
import com.app.features.oauth.repository.OAuthAccountRepository;
import com.app.features.oauth.service.OAuthAccountService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
public class OAuthAccountServiceImpl implements OAuthAccountService {
    private final OAuthAccountRepository oauthAccountRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final OAuthAccountConverter oauthAccountConverter;

    @Override
    @Transactional
    public UserEntity findOrCreate(OAuth2UserInfo info) {
        if (info.providerUserId() == null || info.providerUserId().isBlank()) {
            throw oauthError("invalid_provider_response", "Provider did not return a user id");
        }

        return oauthAccountRepository.findByProviderAndProviderUserId(info.provider(), info.providerUserId())
                .map(account -> updateExisting(account.getUser(), info))
                .orElseGet(() -> linkOrCreate(info));
    }

    private UserEntity linkOrCreate(OAuth2UserInfo info) {
        String email = normalizeEmail(info.email());
        if (email == null) {
            log.warn("OAuth2 login rejected because email is missing, provider={}", info.provider());
            throw oauthError("email_missing", "Provider did not return an email address");
        }
        if (!info.emailVerified()) {
            log.warn("OAuth2 login rejected because email is not verified, provider={}", info.provider());
            throw oauthError("email_not_verified", "Provider email is not verified");
        }

        UserEntity user = userRepository.findByEmailWithRoles(email).orElseGet(() -> createUser(info, email));
        ensureLoginAllowed(user);

        oauthAccountRepository.save(oauthAccountConverter.toOAuthAccount(user, info, email));
        log.info("OAuth account linked, provider={}, userId={}", info.provider(), user.getId());
        return updateExisting(user, info);
    }

    private UserEntity createUser(OAuth2UserInfo info, String email) {
        RoleEntity role = roleRepository.findByName("STUDENT")
                .orElseThrow(() -> oauthError("configuration_error", "Default role STUDENT is missing"));
        return userRepository.save(oauthAccountConverter.toOAuthUser(info, email, role));
    }

    private UserEntity updateExisting(UserEntity user, OAuth2UserInfo info) {
        ensureLoginAllowed(user);
        oauthAccountConverter.updateProfile(user, info);
        return userRepository.save(user);
    }

    private void ensureLoginAllowed(UserEntity user) {
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw oauthError("account_disabled", "User account is not active");
        }
    }

    private String normalizeEmail(String email) {
        if (email == null || email.isBlank() || !email.contains("@")) return null;
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private OAuth2AuthenticationException oauthError(String code, String description) {
        return new OAuth2AuthenticationException(new OAuth2Error(code), description);
    }
}

