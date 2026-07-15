package com.app.features.auth.dto.response;

public record TokenResponse(String accessToken, String refreshToken, AuthUserResponse user) {}
