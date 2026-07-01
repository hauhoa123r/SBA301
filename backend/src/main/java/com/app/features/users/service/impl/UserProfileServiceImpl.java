package com.app.features.users.service.impl;

import com.app.features.model.UserEntity;
import com.app.features.users.dto.request.ChangePasswordRequest;
import com.app.features.users.dto.request.UpdateUserProfileRequest;
import com.app.features.users.dto.response.UserProfileResponse;
import com.app.features.users.repository.ProfileUserRepository;
import com.app.features.users.service.UserProfileService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserProfileServiceImpl implements UserProfileService {
    private final ProfileUserRepository profileUserRepository;

    @Override
    public UserProfileResponse getProfile(Long id) {
        return toResponse(findUser(id));
    }

    @Override
    @Transactional
    public UserProfileResponse updateProfile(Long id, UpdateUserProfileRequest request) {
        UserEntity user = findUser(id);
        user.setFullName(request.getFullName().trim());
        return toResponse(profileUserRepository.save(user));
    }

    private UserEntity findUser(Long id) {
        return profileUserRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));
    }

    private UserProfileResponse toResponse(UserEntity user) {
        return new UserProfileResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getStatus(),
                user.getTotalLearningPoints(),
                user.getReferralCode(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }

    @Override
    @Transactional
    public String changePassword(ChangePasswordRequest request) {
        String validationMessage = validateChangePassword(request);
        if (validationMessage != null) {
            return validationMessage;
        }

        String email = normalize(request.getEmail()).toLowerCase();
        String currentPassword = normalize(request.getCurrentPassword());
        String newPassword = normalize(request.getNewPassword());

        Optional<UserEntity> userOptional = profileUserRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            return "Email does not exist.";
        }

        UserEntity user = userOptional.get();
        if (!user.getPasswordHash().equals(currentPassword)) {
            return "Current password is incorrect.";
        }

        user.setPasswordHash(newPassword);
        profileUserRepository.save(user);
        return null;
    }

    private String validateChangePassword(ChangePasswordRequest request) {
        if (request == null) {
            return "Request body is required.";
        }

        String email = normalize(request.getEmail()).toLowerCase();
        String currentPassword = normalize(request.getCurrentPassword());
        String newPassword = normalize(request.getNewPassword());
        String confirmPassword = normalize(request.getConfirmPassword());

        if (isBlank(email)) {
            return "Login session is required.";
        }
        if (isBlank(currentPassword)) {
            return "Current password is required.";
        }
        if (isBlank(newPassword) || isBlank(confirmPassword)) {
            return "New password and confirm password are required.";
        }
        if (newPassword.length() < 8) {
            return "Password must be at least 8 characters long.";
        }
        if (!newPassword.matches(".*[A-Z].*")) {
            return "Password must contain at least one uppercase letter.";
        }
        if (!newPassword.equals(confirmPassword)) {
            return "Passwords do not match.";
        }
        if (currentPassword.equals(newPassword)) {
            return "New password must be different from the current password.";
        }

        return null;
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim();
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
