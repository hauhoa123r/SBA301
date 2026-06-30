package com.app.features.manager.dto.request;

import com.app.features.model.enums.UserStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserStatusRequest {

    @NotNull(message = "Status is required")
    private UserStatus status;
}
