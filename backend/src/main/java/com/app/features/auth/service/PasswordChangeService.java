package com.app.features.auth.service;

import com.app.features.auth.dto.ChangePasswordRequest;

public interface PasswordChangeService {
    public void processForgotPassword(String email);
    public boolean verifyResetToken(String email, String token);
    public void changePassword(ChangePasswordRequest request);
}
