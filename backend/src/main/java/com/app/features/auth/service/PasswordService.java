package com.app.features.auth.service;

import com.app.features.auth.dto.request.ResetPasswordRequest;

public interface PasswordService {
    void processForgotPassword(String email);
    void resetPassword(ResetPasswordRequest request);
}
