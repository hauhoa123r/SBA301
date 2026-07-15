package com.app.features.auth.controller;

import com.app.features.auth.dto.request.EmailRequest;
import com.app.features.auth.dto.request.VerifyEmailRequest;
import com.app.features.auth.dto.request.VerifyResetTokenRequest;
import com.app.features.auth.service.EmailVerificationService;
import com.app.features.auth.service.VerificationTokenService;
import com.app.features.model.VerificationTokenEntity;
import com.app.utils.ApiPath;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping(ApiPath.API_AUTH)
@RequiredArgsConstructor
@Slf4j
public class TokenController {
    private final EmailVerificationService emailVerificationService;
    private final VerificationTokenService verificationTokenService;

    @PostMapping("/verify-token")
    public ResponseEntity<Map<String, String>> verifyToken(@Valid @RequestBody VerifyResetTokenRequest request) {
        Optional<VerificationTokenEntity> verificationToken =
                verificationTokenService.findValidPasswordResetToken(request.getEmail(), request.getToken());
        if (verificationToken.isEmpty()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Mã xác minh không hợp lệ hoặc đã hết hạn."));
        }
        return ResponseEntity.ok(Map.of("message", "Mã xác minh hợp lệ."));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<Map<String, String>> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        emailVerificationService.verifyEmail(request.getEmail(), request.getToken());
        return ResponseEntity.ok(Map.of("message", "Xác thực email thành công. Bạn có thể đóng tab này."));
    }

    @PostMapping("/resend-verification-email")
    public ResponseEntity<Map<String, String>> resendVerificationEmail(
            @Valid @RequestBody EmailRequest request
    ) {
        emailVerificationService.resendVerificationEmail(request.getEmail());
        return ResponseEntity.ok(Map.of("message", "Đã gửi lại email xác thực."));
    }
}
