package com.app.features.users.controller;

import com.app.features.users.dto.request.ChangePasswordRequest;
import com.app.features.users.dto.request.UpdateUserProfileRequest;
import com.app.features.users.dto.response.InvoicesResponse;
import com.app.features.users.dto.response.UserProfileResponse;
import com.app.features.users.service.UserProfileService;
import com.app.utils.ApiPath;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping(ApiPath.API_USERS)
@RequiredArgsConstructor
public class UserController {
    private final UserProfileService userProfileService;

    @GetMapping("/{id}")
    public ResponseEntity<UserProfileResponse> getProfile(@PathVariable Long id) {
        return ResponseEntity.ok(userProfileService.getProfile(id));
    }

    @GetMapping("/{id}/orders")
    public ResponseEntity<List<InvoicesResponse>> getOrderHistory(@PathVariable Long id) {
        return ResponseEntity.ok(userProfileService.getOrderHistory(id));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<UserProfileResponse> updateProfile(@PathVariable Long id, @Valid @RequestBody UpdateUserProfileRequest request) {
        return ResponseEntity.ok(userProfileService.updateProfile(id, request));
    }

    @PatchMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        userProfileService.changePassword(request);
        return ResponseEntity.ok(Map.of("message", "Password updated successfully."));
    }

}
