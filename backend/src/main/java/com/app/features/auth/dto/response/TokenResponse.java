package com.app.features.auth.dto.response;

public record TokenResponse(String accessToken, @com.fasterxml.jackson.annotation.JsonIgnore String refreshToken, AuthUserResponse user) {
    @Override public String toString() { return "TokenResponse[credentials redacted]"; }
}
