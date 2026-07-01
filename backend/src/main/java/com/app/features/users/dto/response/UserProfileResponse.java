package com.app.features.users.dto.response;

import com.app.features.model.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    private Long id;
    private String fullName;
    private String email;
    private UserStatus status;
    private Integer totalLearningPoints;
    private String referralCode;
    private Instant createdAt;
    private Instant updatedAt;
}
