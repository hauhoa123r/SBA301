package com.app.features.users.service.impl;

import com.app.features.model.UserEntity;
import com.app.features.payments.repository.InvoiceRepository;
import com.app.features.users.dto.request.ChangePasswordRequest;
import com.app.features.users.dto.request.UpdateUserProfileRequest;
import com.app.features.users.dto.response.InvoicesResponse;
import com.app.features.users.dto.response.UserProfileResponse;
import com.app.features.users.repository.ProfileUserRepository;
import com.app.features.users.service.UserProfileService;
import com.app.utils.SecurityUtils;
import com.app.security.password.PasswordHashing;
import com.app.exception.BadRequestException;
import org.springframework.security.access.AccessDeniedException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserProfileServiceImpl implements UserProfileService {
    private final ProfileUserRepository profileUserRepository;
    private final InvoiceRepository invoiceRepository;

    @Override
    public UserProfileResponse getProfile(Long id) {
        log.info("Loading user profile, userId={}", id);
        return toResponse(findUser(id));
    }

    @Override
    @Transactional
    public UserProfileResponse updateProfile(Long id, UpdateUserProfileRequest request) {
        log.info("User profile update requested, userId={}", id);
        UserEntity user = findUser(id);
        user.setFullName(request.getFullName().trim());
        UserProfileResponse response = toResponse(profileUserRepository.save(user));
        log.info("User profile updated successfully, userId={}", id);
        return response;
    }

    private UserEntity findUser(Long id) {
        if (!java.util.Objects.equals(id, SecurityUtils.getCurrentUserId())) {
            throw new AccessDeniedException("You cannot access another user's profile.");
        }
        return profileUserRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("User profile not found, userId={}", id);
                    return new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found.");
                });
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
        log.info("User password change requested");
        String validationMessage = validateChangePassword(request);
        if (validationMessage != null) {
            log.warn("User password change rejected by request validation");
            throw new BadRequestException(validationMessage);
        }

        String email = normalize(request.getEmail()).trim().toLowerCase();
        String currentPassword = request.getCurrentPassword();
        String newPassword = request.getNewPassword();
        UserEntity user = findUser(SecurityUtils.getCurrentUserId());
        if (!email.isBlank() && !email.equalsIgnoreCase(user.getEmail())) {
            throw new AccessDeniedException("You cannot change another user's password.");
        }
        if (!PasswordHashing.matches(currentPassword, user.getPasswordHash())) {
            log.warn("User password change rejected due to invalid current password, userId={}", user.getId());
            throw new BadRequestException("Current password is incorrect.");
        }

        if (PasswordHashing.matches(newPassword, user.getPasswordHash())) {
            throw new BadRequestException("New password must be different from the current password.");
        }
        user.setPasswordHash(PasswordHashing.encode(newPassword));
        profileUserRepository.save(user);
        log.info("User password changed successfully, userId={}", user.getId());
        return null;
    }

    @Override
    public List<InvoicesResponse> getOrderHistory(Long userId) {
        findUser(userId);
        return invoiceRepository.findAllByUser_IdOrderByCreatedAtDesc(userId)
                .stream()
                .map(invoice -> new InvoicesResponse(
                        invoice.getId(),
                        invoice.getCourse() == null ? null : invoice.getCourse().getId(),
                        invoice.getSubscriptionPlanCode() != null
                                ? "Gói " + invoice.getSubscriptionPlanCode() + " · " + invoice.getSubscriptionDurationDays() + " ngày"
                                : invoice.getCourse().getTitle(),
                        invoice.getOriginalAmount(),
                        invoice.getDiscountAmount(),
                        invoice.getAmount(),
                        invoice.getStatus(),
                        invoice.getCreatedAt(),
                        invoice.getUpdatedAt()
                )).toList();
    }

    private String validateChangePassword(ChangePasswordRequest request) {
        if (request == null) {
            return "Request body is required.";
        }

        String currentPassword = request.getCurrentPassword();
        String newPassword = request.getNewPassword();
        String confirmPassword = request.getConfirmPassword();
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
