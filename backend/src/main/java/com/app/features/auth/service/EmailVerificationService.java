package com.app.features.auth.service;

import com.app.features.model.UserEntity;

public interface EmailVerificationService {
    void sendVerificationEmail(UserEntity user);
    boolean verifyEmail(String email, String token);
}
