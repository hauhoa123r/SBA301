package com.app.features.users.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateUserProfileRequest {
    @NotBlank
    @Size(max = 255)
    private String fullName;
}
