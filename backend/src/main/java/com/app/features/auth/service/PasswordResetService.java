package com.app.features.auth.service;

import com.app.features.auth.dto.request.ResetPasswordRequest;

public interface PasswordResetService {
    public void processForgotPassword(String email);
    public boolean verifyResetToken(String email, String token);
    public void resetPassword(ResetPasswordRequest request);
}
