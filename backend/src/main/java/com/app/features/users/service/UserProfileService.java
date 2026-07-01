package com.app.features.users.service;

import com.app.features.users.dto.request.ChangePasswordRequest;
import com.app.features.users.dto.request.UpdateUserProfileRequest;
import com.app.features.users.dto.response.UserProfileResponse;

public interface UserProfileService {
    UserProfileResponse getProfile(Long id);

    UserProfileResponse updateProfile(Long id, UpdateUserProfileRequest request);

    String changePassword(ChangePasswordRequest request);
}
