package com.app.features.oauth.converter;

import com.app.features.model.RoleEntity;
import com.app.features.model.UserEntity;
import com.app.features.model.enums.UserStatus;
import com.app.features.oauth.dto.OAuth2UserInfo;
import com.app.features.oauth.entity.OAuthAccountEntity;
import org.springframework.stereotype.Component;

@Component
public class OAuthAccountConverter {
    public OAuthAccountEntity toOAuthAccount(UserEntity user, OAuth2UserInfo info, String email) {
        OAuthAccountEntity account = new OAuthAccountEntity();
        account.setUser(user);
        account.setProvider(info.provider());
        account.setProviderUserId(info.providerUserId());
        account.setProviderEmail(email);
        return account;
    }

    public UserEntity toOAuthUser(OAuth2UserInfo info, String email, RoleEntity role) {
        UserEntity user = new UserEntity();
        user.setEmail(email);
        user.setFullName(nonBlank(info.fullName(), email.substring(0, email.indexOf('@'))));
        user.setAvatarUrl(info.avatarUrl());
        user.setPasswordHash("{oauth}");
        user.setStatus(UserStatus.ACTIVE);
        user.setTotalLearningPoints(0);
        user.getRoles().add(role);
        return user;
    }

    public void updateProfile(UserEntity user, OAuth2UserInfo info) {
        if (info.fullName() != null && !info.fullName().isBlank()) user.setFullName(info.fullName().trim());
        if (info.avatarUrl() != null && !info.avatarUrl().isBlank()) user.setAvatarUrl(info.avatarUrl());
    }

    private String nonBlank(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.trim();
    }
}
