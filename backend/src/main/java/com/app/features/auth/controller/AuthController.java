package com.app.features.auth.controller;

import com.app.features.auth.dto.request.ForgotPasswordRequest;
import com.app.features.auth.dto.request.ResetPasswordRequest;
import com.app.features.auth.dto.request.LoginRequest;
import com.app.features.auth.dto.request.VerifyResetTokenRequest;
import com.app.features.auth.dto.response.LoginResponse;
import com.app.features.auth.service.AuthService;
import com.app.features.auth.service.PasswordResetService;
import com.app.utils.ApiPath;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping(ApiPath.API_AUTH)
@RequiredArgsConstructor
@Slf4j
public class AuthController {
    private final AuthService authService;
    private final PasswordResetService passwordResetService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest user){
        log.info("Login request received, email={}", user.getEmail());
        LoginResponse loginResponse = authService.login(user);
        return ResponseEntity.ok(loginResponse);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        try {
            passwordResetService.processForgotPassword(request.getEmail());
            return ResponseEntity.ok(Map.of("message", "A reset token has been sent."));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", ex.getMessage()));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to send email, please try again later."));
        }
    }

    @PostMapping("/verify-token")
    public ResponseEntity<Map<String, String>> verifyToken(@Valid @RequestBody VerifyResetTokenRequest request) {
        boolean isValid = passwordResetService.verifyResetToken(request.getEmail(), request.getToken());
        if (!isValid) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Invalid or expired token"));
        }
        return ResponseEntity.ok(Map.of("message", "Token verified successfully."));
    }

    @PatchMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            passwordResetService.resetPassword(request);
            return ResponseEntity.ok(Map.of("message", "Password changed successfully."));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", ex.getMessage()));
        }
    }
}
