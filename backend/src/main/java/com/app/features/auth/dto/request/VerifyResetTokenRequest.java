package com.app.features.auth.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VerifyResetTokenRequest {
    @NotBlank(message = "Vui lòng nhập email.")
    @Email(message = "Vui lòng nhập địa chỉ email hợp lệ.")
    private String email;

    @NotBlank(message = "Vui lòng nhập mã xác minh.")
    @Pattern(regexp = "\\d{6}", message = "Mã xác minh phải gồm 6 chữ số.")
    private String token;
}
