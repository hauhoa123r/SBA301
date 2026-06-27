package com.app.features.auth.controller;

import com.app.features.auth.dto.request.LoginRequest;
import com.app.features.auth.dto.response.LoginResponse;
import com.app.features.auth.service.AuthService;
import com.app.features.auth.service.PasswordChangeService;
import com.app.utils.ApiPath;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping(ApiPath.API_AUTH)
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final PasswordChangeService passwordChangeService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest user){
        LoginResponse loginResponse = authService.IsExistUser(user);
        return ResponseEntity.ok(loginResponse);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email").trim().toLowerCase();
        if (email.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Email is required"));
        }
        try {
            passwordChangeService.processForgotPassword(email);
            return ResponseEntity.ok().build();
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", ex.getMessage()));
        }
    }
    @PostMapping("/verify-token")
    public ResponseEntity<Map<String, String>> verifyToken(@RequestBody Map<String, String> request) {
        String email = request.get("email") != null ? request.get("email").trim().toLowerCase() : "";
        String token = request.get("token");

        if (email.isEmpty() || token == null || token.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Empty Token or Email"));
        }

        boolean isValid = passwordChangeService.verifyResetToken(email, token);
        if (!isValid) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Invalid or expired token"));
        }

        return ResponseEntity.ok(Map.of("message", "Token verified successfully."));
    }
}
