package com.app.features.auth.controller;

import com.app.features.auth.dto.response.AuthUserResponse;
import com.app.features.auth.dto.response.TokenResponse;
import com.app.features.auth.repository.UserRepository;
import com.app.features.model.UserEntity;
import com.app.features.model.enums.UserStatus;
import com.app.security.JwtService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class JwtTokenController {
    private final JwtService jwtService;
    private final UserRepository userRepository;

    @PostMapping("/refresh")
    public TokenResponse refresh(@Valid @RequestBody RefreshRequest request) {
        try {
            Claims claims = jwtService.parse(request.refreshToken());
            if (!jwtService.isType(claims, "refresh")) throw new ResponseStatusException(UNAUTHORIZED);
            UserEntity user = activeUser(Long.valueOf(claims.getSubject()));
            return new TokenResponse(jwtService.createAccessToken(user), jwtService.createRefreshToken(user),
                    AuthUserResponse.from(user));
        } catch (JwtException | IllegalArgumentException exception) {
            throw new ResponseStatusException(UNAUTHORIZED, "Refresh token is invalid or expired");
        }
    }

    @GetMapping("/me")
    public AuthUserResponse me(@AuthenticationPrincipal UserEntity user) {
        if (user == null) throw new ResponseStatusException(UNAUTHORIZED);
        return AuthUserResponse.from(user);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        // The client discards its bearer tokens. Add a hashed refresh-token store for server-side revocation if required.
        return ResponseEntity.noContent().build();
    }

    private UserEntity activeUser(Long id) {
        UserEntity user = userRepository.findById(id).orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED));
        if (user.getStatus() != UserStatus.ACTIVE) throw new ResponseStatusException(UNAUTHORIZED);
        return user;
    }

    public record RefreshRequest(@NotBlank String refreshToken) {}
}
