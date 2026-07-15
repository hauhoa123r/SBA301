package com.app.features.auth.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VerifyEmailRequest {
    @NotBlank(message = "Vui lòng nhập email.")
    @Email(message = "Vui lòng nhập địa chỉ email hợp lệ.")
    private String email;

    @NotBlank(message = "Vui lòng nhập mã xác thực.")
    private String token;
}
