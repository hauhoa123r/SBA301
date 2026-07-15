package com.app.features.auth.dto;

import com.app.features.auth.dto.request.ResetPasswordRequest;

public record ResetPasswordDto(
        String email,
        String token,
        String newPassword
) {
    public static ResetPasswordDto from(ResetPasswordRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Thiếu thông tin đặt lại mật khẩu.");
        }

        String email = normalize(request.getEmail()).toLowerCase();
        String token = normalize(request.getToken());
        String newPassword = normalize(request.getNewPassword());
        String confirmPassword = normalize(request.getConfirmPassword());

        if (!newPassword.equals(confirmPassword)) {
            throw new IllegalArgumentException("Mật khẩu mới và xác nhận mật khẩu không khớp.");
        }

        return new ResetPasswordDto(email, token, newPassword);
    }

    private static String normalize(String value) {
        return value == null ? "" : value.trim();
    }
}
