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

        if (email.isBlank()) {
            throw new IllegalArgumentException("Vui lòng nhập email.");
        }
        if (token.isBlank() || !token.matches("\\d{6}")) {
            throw new IllegalArgumentException("Mã xác minh phải gồm 6 chữ số.");
        }
        if (newPassword.isBlank() || confirmPassword.isBlank()) {
            throw new IllegalArgumentException("Vui lòng nhập mật khẩu mới và xác nhận mật khẩu.");
        }
        if (newPassword.length() < 8) {
            throw new IllegalArgumentException("Mật khẩu phải có ít nhất 8 ký tự.");
        }
        if (!newPassword.matches(".*[A-Z].*")) {
            throw new IllegalArgumentException("Mật khẩu phải có ít nhất một chữ cái viết hoa.");
        }
        if (!newPassword.equals(confirmPassword)) {
            throw new IllegalArgumentException("Mật khẩu mới và xác nhận mật khẩu không khớp.");
        }

        return new ResetPasswordDto(email, token, newPassword);
    }

    private static String normalize(String value) {
        return value == null ? "" : value.trim();
    }
}
