package com.app.features.auth.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResetPasswordRequest {
    @NotBlank(message = "Vui lòng nhập email.")
    @Email(message = "Vui lòng nhập địa chỉ email hợp lệ.")
    private String email;

    @NotBlank(message = "Vui lòng nhập mã xác minh.")
    @Pattern(regexp = "\\d{6}", message = "Mã xác minh phải gồm 6 chữ số.")
    private String token;

    @NotBlank(message = "Vui lòng nhập mật khẩu mới.")
    @Size(min = 8, message = "Mật khẩu phải có ít nhất 8 ký tự.")
    @Pattern(regexp = ".*[A-Z].*", message = "Mật khẩu phải có ít nhất một chữ cái viết hoa.")
    @JsonProperty("new_password")
    private String newPassword;

    @NotBlank(message = "Vui lòng xác nhận mật khẩu mới.")
    @JsonProperty("confirm_password")
    private String confirmPassword;
}
