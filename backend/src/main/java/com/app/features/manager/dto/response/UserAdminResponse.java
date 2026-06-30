package com.app.features.manager.dto.response;

import com.app.features.model.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserAdminResponse {
    private Long id;
    private String fullName;
    private String email;
    private UserStatus status;
    private Integer totalLearningPoints;
    private String referralCode;
    private Instant createdAt;
    private Instant updatedAt;
    private List<RoleResponse> roles;
}
