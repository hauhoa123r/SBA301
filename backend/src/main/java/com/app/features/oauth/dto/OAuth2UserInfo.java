package com.app.features.oauth.dto;

import com.app.features.oauth.entity.AuthProvider;

public record OAuth2UserInfo(
        AuthProvider provider,
        String providerUserId,
        String email,
        String fullName,
        String avatarUrl,
        boolean emailVerified
) {}
