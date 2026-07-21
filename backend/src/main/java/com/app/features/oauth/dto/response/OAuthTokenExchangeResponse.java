package com.app.features.oauth.dto.response;

import com.app.features.auth.dto.response.AuthUserResponse;

public record OAuthTokenExchangeResponse(String accessToken, String refreshToken, AuthUserResponse user) {}
