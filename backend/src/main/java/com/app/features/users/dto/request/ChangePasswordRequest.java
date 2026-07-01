package com.app.features.users.dto.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChangePasswordRequest {
    private String email;

    @NotBlank
    @JsonProperty("current_password")
    @JsonAlias("current-password")
    private String currentPassword;

    @NotBlank
    @JsonProperty("new_password")
    private String newPassword;

    @NotBlank
    @JsonProperty("confirm_password")
    private String confirmPassword;

}

