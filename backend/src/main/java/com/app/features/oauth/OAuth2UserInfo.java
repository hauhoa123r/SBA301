package com.app.features.oauth;

public record OAuth2UserInfo(
        AuthProvider provider,
        String providerUserId,
        String email,
        String fullName,
        String avatarUrl,
        boolean emailVerified
) {}
