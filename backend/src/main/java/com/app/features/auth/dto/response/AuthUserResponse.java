package com.app.features.auth.dto.response;

import com.app.features.model.UserEntity;
import com.app.security.role.SupportedRolePolicy;

import java.util.List;

public record AuthUserResponse(Long id, String email, String fullName, String avatarUrl, List<String> roles) {
    public static AuthUserResponse from(UserEntity user) {
        List<String> roles = SupportedRolePolicy.supportedRoleNames(user);
        return new AuthUserResponse(user.getId(), user.getEmail(), user.getFullName(), user.getAvatarUrl(), roles);
    }
}
