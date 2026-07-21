package com.app.features.auth.dto.response;

import com.app.features.model.UserEntity;

import java.util.List;

public record AuthUserResponse(Long id, String email, String fullName, String avatarUrl, List<String> roles) {
    public static AuthUserResponse from(UserEntity user) {
        List<String> roles = user.getRoles() == null
                ? List.of()
                : user.getRoles().stream().map(role -> role.getName()).toList();
        return new AuthUserResponse(user.getId(), user.getEmail(), user.getFullName(), user.getAvatarUrl(), roles);
    }
}
