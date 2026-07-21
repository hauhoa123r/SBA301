package com.app.features.oauth.controller;

import com.app.features.auth.dto.response.AuthUserResponse;
import com.app.features.model.UserEntity;
import com.app.features.oauth.dto.request.OAuthTokenExchangeRequest;
import com.app.features.oauth.dto.response.OAuthTokenExchangeResponse;
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

    @PostMapping("/exchange")
    public ResponseEntity<OAuthTokenExchangeResponse> exchange(@Valid @RequestBody OAuthTokenExchangeRequest request) {
        UserEntity user = codeService.consume(request.code());
        return ResponseEntity.ok(new OAuthTokenExchangeResponse(jwtService.createAccessToken(user),
                jwtService.createRefreshToken(user), AuthUserResponse.from(user)));
    }
}
