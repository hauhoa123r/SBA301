package com.app.features.auth.converter;

import com.app.features.auth.dto.request.RegisterRequest;
import com.app.features.auth.exception.RegisterException;
import com.app.features.auth.repository.RoleRepository;
import com.app.features.model.RoleEntity;
import com.app.features.model.UserEntity;
import com.app.features.model.enums.UserStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RegisterConverter {
    private final RoleRepository roleRepository;

    public UserEntity convert(RegisterRequest request) {
        UserEntity userEntity = new UserEntity();
        userEntity.setFullName(request.getFullName().trim());
        userEntity.setEmail(request.getEmail().trim().toLowerCase());
        userEntity.setPasswordHash(request.getPassword());
        userEntity.setStatus(UserStatus.PENDING);
        userEntity.setTotalLearningPoints(0);
        RoleEntity studentRole = roleRepository.findByName("STUDENT")
                .orElseThrow(() -> new RegisterException("Role STUDENT is not confined"));
        userEntity.getRoles().add(studentRole);
        return userEntity;
    }
}
