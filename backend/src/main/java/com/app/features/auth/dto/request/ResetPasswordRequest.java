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
    @NotBlank(message = "Email is required.")
    @Email(message = "Please enter a valid email address.")
    private String email;

    @NotBlank(message = "Token is required.")
    @Pattern(regexp = "\\d{6}", message = "Token must be 6 digits.")
    private String token;

    @NotBlank(message = "New password is required.")
    @Size(min = 8, message = "Password must be at least 8 characters long.")
    @Pattern(regexp = ".*[A-Z].*", message = "Password must contain at least one uppercase letter.")
    @JsonProperty("new_password")
    private String newPassword;

    @NotBlank(message = "Confirm password is required.")
    @JsonProperty("confirm_password")
    private String confirmPassword;
}
