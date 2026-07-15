package com.app.features.auth.service;

import com.app.features.model.UserEntity;

public interface EmailVerificationService {
    void sendVerificationEmail(UserEntity user);
    void verifyEmail(String email, String token);
    void resendVerificationEmail(String email);
}
