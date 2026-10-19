package com.app.features.oauth.controller;

import com.app.features.auth.dto.response.AuthUserResponse;
import com.app.features.model.UserEntity;
import com.app.features.oauth.dto.request.OAuthTokenExchangeRequest;
import com.app.features.auth.dto.response.TokenResponse;
import com.app.features.oauth.service.OAuthAuthorizationCodeService;
import com.app.security.jwt.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth/oauth")
@RequiredArgsConstructor
public class OAuthTokenExchangeController {
    private final OAuthAuthorizationCodeService codeService;
    private final JwtService jwtService;
    private final com.app.features.auth.service.RefreshSessionService sessions;
    private final com.app.security.jwt.RefreshCookie cookie;

    @PostMapping("/exchange")
    public ResponseEntity<TokenResponse> exchange(@Valid @RequestBody OAuthTokenExchangeRequest request) {
        UserEntity user = codeService.consume(request.code());
        String refresh = jwtService.createRefreshToken(user);
        sessions.register(refresh);
        return ResponseEntity.ok().header(org.springframework.http.HttpHeaders.SET_COOKIE, cookie.header(refresh))
                .body(new TokenResponse(jwtService.createAccessToken(user), refresh, AuthUserResponse.from(user)));
    }
}
