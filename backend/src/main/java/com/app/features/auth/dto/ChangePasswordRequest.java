package com.app.features.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChangePasswordRequest {
    @NotBlank
    private String mode;

    private String email;

    private String token;

    @JsonProperty("current_password")
    private String currentPassword;

    @NotBlank
    @JsonProperty("new_password")
    private String newPassword;

    @NotBlank
    @JsonProperty("confirm_password")
    private String confirmPassword;

}
