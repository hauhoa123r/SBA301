package com.app.features.oauth;

import com.app.features.auth.dto.response.AuthUserResponse;
import com.app.features.auth.dto.response.TokenResponse;
import com.app.features.model.UserEntity;
import com.app.security.jwt.JwtService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/oauth")
@RequiredArgsConstructor
public class OAuthTokenExchangeController {
    private final OAuthAuthorizationCodeService codeService;
    private final JwtService jwtService;

    @PostMapping("/exchange")
    public ResponseEntity<TokenResponse> exchange(@Valid @RequestBody ExchangeRequest request) {
        UserEntity user = codeService.consume(request.code());
        return ResponseEntity.ok(new TokenResponse(jwtService.createAccessToken(user),
                jwtService.createRefreshToken(user), AuthUserResponse.from(user)));
    }

    public record ExchangeRequest(@NotBlank String code) {}
}
