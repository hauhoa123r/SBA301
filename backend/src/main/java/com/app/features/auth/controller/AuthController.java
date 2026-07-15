package com.app.features.auth.controller;

import com.app.features.auth.dto.request.EmailRequest;
import com.app.features.auth.dto.request.ResetPasswordRequest;
import com.app.features.auth.dto.request.LoginRequest;
import com.app.features.auth.dto.request.RegisterRequest;
import com.app.features.auth.dto.response.LoginResponse;
import com.app.features.auth.service.UserService;
import com.app.features.auth.service.PasswordService;
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
    private final UserService userService;
    private final PasswordService passwordService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest user) {
        log.info("Login request received, email={}", user.getEmail());
        LoginResponse loginResponse = userService.login(user);
        return ResponseEntity.ok(loginResponse);
    }

    @PostMapping("/register")
    public ResponseEntity<LoginResponse> register(@Valid @RequestBody RegisterRequest request) {
        log.info("Register request received, email={}", request.getEmail());
        LoginResponse registerResponse = userService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(registerResponse);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody EmailRequest request) {
        passwordService.processForgotPassword(request.getEmail());
        return ResponseEntity.ok(Map.of("message", "Đã gửi mã đặt lại mật khẩu đến email của bạn."));
    }

    @PatchMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            passwordService.resetPassword(request);
            return ResponseEntity.ok(Map.of("message", "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại."));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", ex.getMessage()));
        }
    }
}
