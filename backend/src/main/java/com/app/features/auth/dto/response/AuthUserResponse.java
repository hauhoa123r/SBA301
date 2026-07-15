package com.app.features.auth.dto.response;

import com.app.features.model.UserEntity;

public record AuthUserResponse(Long id, String email, String fullName, String avatarUrl) {
    public static AuthUserResponse from(UserEntity user) {
        return new AuthUserResponse(user.getId(), user.getEmail(), user.getFullName(), user.getAvatarUrl());
    }
}
