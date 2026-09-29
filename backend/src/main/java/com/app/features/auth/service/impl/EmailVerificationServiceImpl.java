package com.app.features.auth.service.impl;

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

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailVerificationServiceImpl implements EmailVerificationService {
    private static final String TOKEN_TYPE_EMAIL_VERIFY = "EMAIL_VERIFY";

    private final VerificationTokenService verificationTokenService;
    private final UserRepository userRepository;
    private final MailService mailService;

    @Value("${app.frontend.verify-email-url}")
    private String verifyEmailUrl;

    @Override
    public void sendVerificationEmail(UserEntity user) {
        log.info("Verification email requested, userId={}", user.getId());
        VerificationTokenEntity verificationToken = verificationTokenService.createToken(
                user,
                TOKEN_TYPE_EMAIL_VERIFY,
                Duration.ofMinutes(15)
        );
        mailService.sendVerifyEmail(
                user.getEmail(),
                buildVerificationUrl(user.getEmail(), verificationToken.getToken())
        );
        log.info("Verification email sent successfully, userId={}", user.getId());
    }

    @Override
    @Transactional
    public boolean verifyEmail(String email, String token) {
        log.info("Email verification requested, email={}", email);
        boolean verified = verificationTokenService
                .findValidToken(token, TOKEN_TYPE_EMAIL_VERIFY, email)
                .map(this::activateUser)
                .orElse(false);
        if (!verified) {
            log.warn("Email verification failed due to invalid or expired verification token, email={}", email);
        }
        return verified;
    }

    private boolean activateUser(VerificationTokenEntity verificationToken) {
        UserEntity user = verificationToken.getUser();
        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);
        verificationTokenService.markUsed(verificationToken);
        log.info("Email verified successfully, userId={}", user.getId());
        return true;
    }

    private String buildVerificationUrl(String email, String token) {
        return verifyEmailUrl
                + "?email=" + URLEncoder.encode(email, StandardCharsets.UTF_8)
                + "&token=" + URLEncoder.encode(token, StandardCharsets.UTF_8);
    }
}
