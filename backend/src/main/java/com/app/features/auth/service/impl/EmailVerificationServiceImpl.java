package com.app.features.auth.service.impl;

import com.app.exception.BadRequestException;
import com.app.features.auth.repository.UserRepository;
import com.app.features.auth.service.EmailVerificationService;
import com.app.features.auth.service.VerificationTokenService;
import com.app.features.mailSender.service.MailService;
import com.app.features.model.UserEntity;
import com.app.features.model.VerificationTokenEntity;
import com.app.features.model.enums.UserStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.Duration;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailVerificationServiceImpl implements EmailVerificationService {
    private static final String TOKEN_TYPE_EMAIL_VERIFY = "EMAIL_VERIFY";

    private final VerificationTokenService verificationTokenService;
    private final UserRepository userRepository;
    private final MailService mailService;

    @Value("${app.frontend.verify-email-url:http://localhost:5173/verify-email}")
    private String verifyEmailUrl;

    @Override
    public void sendVerificationEmail(UserEntity user) {
        VerificationTokenEntity verificationToken = verificationTokenService.createToken(
                user,
                TOKEN_TYPE_EMAIL_VERIFY,
                Duration.ofMinutes(15)
        );
        String verificationUrl = buildVerificationUrl(user.getEmail(), verificationToken.getToken());
        sendAfterCommit(user.getEmail(), verificationUrl);
    }

    private void sendAfterCommit(String email, String verificationUrl) {
        if (!TransactionSynchronizationManager.isSynchronizationActive()) {
            mailService.sendVerifyEmail(email, verificationUrl);
            return;
        }

        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                mailService.sendVerifyEmail(email, verificationUrl);
            }
        });
    }

    @Override
    @Transactional
    public void verifyEmail(String email, String token) {
        VerificationTokenEntity verificationToken = verificationTokenService
                .findValidToken(token, TOKEN_TYPE_EMAIL_VERIFY, email)
                .orElseThrow(() -> new BadRequestException("Liên kết xác thực không hợp lệ hoặc đã hết hạn."));

        activateUser(verificationToken);
    }

    @Override
    public void resendVerificationEmail(String email) {
        String normalizedEmail = normalize(email).toLowerCase();

        UserEntity user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new BadRequestException("Email không tồn tại."));

        if (user.getStatus() == UserStatus.ACTIVE) {
            throw new BadRequestException("Tài khoản đã được kích hoạt.");
        }

        if (user.getStatus() != UserStatus.PENDING) {
            throw new BadRequestException("Tài khoản không thể gửi lại mã xác thực.");
        }

        sendVerificationEmail(user);
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim();
    }

    private void activateUser(VerificationTokenEntity verificationToken) {
        UserEntity user = verificationToken.getUser();
        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);
        verificationTokenService.markUsed(verificationToken);
        log.info("Email verified successfully, userId={}", user.getId());
    }

    private String buildVerificationUrl(String email, String token) {
        return UriComponentsBuilder.fromUriString(verifyEmailUrl)
                .queryParam("email", email)
                .queryParam("token", token)
                .build()
                .encode()
                .toUriString();
    }
}
