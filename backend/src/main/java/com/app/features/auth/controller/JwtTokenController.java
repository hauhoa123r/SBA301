package com.app.features.auth.controller;

import com.app.features.auth.dto.response.AuthUserResponse;
import com.app.features.auth.dto.response.TokenResponse;
import com.app.features.auth.service.RefreshSessionService;
import com.app.features.model.UserEntity;
import com.app.security.jwt.RefreshCookie;
import jakarta.servlet.http.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class JwtTokenController {
    private final RefreshSessionService sessions;
    private final RefreshCookie cookie;

    @GetMapping("/csrf")
    public Map<String, String> csrf(CsrfToken token) { return Map.of("token", token.getToken()); }

    @PostMapping("/refresh")
    public ResponseEntity<TokenResponse> refresh(HttpServletRequest request, HttpServletResponse response) {
        try {
            TokenResponse tokens = sessions.rotate(cookie.read(request));
            return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie.header(tokens.refreshToken())).body(tokens);
        } catch (ResponseStatusException ex) {
            if (ex.getStatusCode().value() == 401) cookie.clear(response);
            throw ex;
        }
    }

    @GetMapping("/me")
    public AuthUserResponse me(@AuthenticationPrincipal UserEntity user) {
        if (user == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        return AuthUserResponse.from(user);
    }
}
