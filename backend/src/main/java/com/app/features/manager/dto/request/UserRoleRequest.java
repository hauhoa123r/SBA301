package com.app.features.manager.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class UserRoleRequest {

    @NotNull(message = "Role IDs must not be null")
    private List<Long> roleIds;
}
