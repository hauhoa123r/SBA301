package com.app.features.auth.dto.request;

import com.app.utils.valid.email.CustomEmail;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    @NotBlank(message = "Hãy nhập Họ và Tên.")
    private String fullName;

    @NotBlank(message = "Hãy nhập email của bạn.")
    @CustomEmail(message = "Định dạng Email chưa đúng.")
    private String email;

    @NotBlank(message = "Hãy nhập mật khẩu của bạn.")
    @Size(min = 8, message = "Mật khẩu cần ít nhất 8 ký tự và chứa 1 ký tự in hoa")
    @Pattern(regexp = ".*[A-Z].*", message = "Mật khẩu cần ít nhất 8 ký tự và chứa 1 ký tự in hoa")
    private String password;

}
