package com.app.features.auth.controller;

import com.app.features.auth.dto.request.ForgotPasswordRequest;
import com.app.features.auth.dto.request.ResetPasswordRequest;
import com.app.features.auth.dto.request.LoginRequest;
import com.app.features.auth.dto.request.RegisterRequest;
import com.app.features.auth.dto.response.LoginResponse;
import com.app.features.auth.dto.response.TokenResponse;
import com.app.features.auth.service.AuthService;
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
    private final AuthService userServiceImpl;
    private final PasswordService passwordServiceImpl;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest user){
        log.info("Login request received, email={}", user.getEmail());
        TokenResponse loginResponse = userServiceImpl.login(user);
        return ResponseEntity.ok(loginResponse);
    }

    @PostMapping("/register")
    public ResponseEntity<LoginResponse> register(@Valid @RequestBody RegisterRequest request) {
        log.info("Register request received, email={}", request.getEmail());
        LoginResponse registerResponse = userServiceImpl.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(registerResponse);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        try {
            passwordServiceImpl.processForgotPassword(request.getEmail());
            return ResponseEntity.ok(Map.of("message", "Đã gửi mã đặt lại mật khẩu đến email của bạn."));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", ex.getMessage()));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Không thể gửi email, vui lòng thử lại sau."));
        }
    }

    @PatchMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            passwordServiceImpl.resetPassword(request);
            return ResponseEntity.ok(Map.of("message", "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại."));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", ex.getMessage()));
        }
    }
}
