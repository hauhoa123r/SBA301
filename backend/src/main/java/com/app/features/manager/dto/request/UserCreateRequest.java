package com.app.features.manager.dto.request;

import com.app.utils.valid.email.CustomEmail;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserCreateRequest {

    @NotBlank(message = "Họ và tên là bắt buộc")
    @Size(max = 255, message = "Họ và tên không được vượt quá 255 ký tự")
    private String fullName;

    @NotBlank(message = "Email là bắt buộc")
    @CustomEmail(message = "Định dạng email chưa đúng")
    private String email;

    @NotBlank(message = "Mật khẩu là bắt buộc")
    @Size(min = 8, message = "Mật khẩu cần ít nhất 8 ký tự")
    private String password;

    @NotNull(message = "Vai trò là bắt buộc")
    private Long roleId;
}
