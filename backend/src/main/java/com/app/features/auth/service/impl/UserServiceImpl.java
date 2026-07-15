package com.app.features.auth.service.impl;

import com.app.features.auth.converter.LoginConverter;
import com.app.features.auth.dto.request.LoginRequest;
import com.app.features.auth.dto.request.RegisterRequest;
import com.app.features.auth.dto.response.LoginResponse;
import com.app.features.auth.exception.InvalidLoginException;
import com.app.features.auth.exception.RegisterException;
import com.app.features.auth.repository.UserRepository;
import com.app.features.auth.service.EmailVerificationService;
import com.app.features.auth.service.UserService;
import com.app.features.manager.repository.RoleRepository;
import com.app.features.model.RoleEntity;
import com.app.features.model.UserEntity;
import com.app.features.model.enums.UserStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepositoryImpl;
    private final RoleRepository roleRepository;
    private final LoginConverter loginConverter;
    private final EmailVerificationService emailVerificationService;

    @Override
    public LoginResponse login(LoginRequest user) {
        UserEntity userEntity = userRepositoryImpl.findByEmail(user.getEmail())
                .orElseThrow(() -> {
                    log.warn("Login failed because email does not exist, email={}", user.getEmail());
                    return new InvalidLoginException("Email không tồn tại");
                });
        if (!userEntity.getPasswordHash().equals(user.getPassword())) {
            log.warn("Login failed: invalid password, email={}", user.getEmail());
            throw new InvalidLoginException("Mật khẩu không đúng");
        }
        if (userEntity.getStatus() != UserStatus.ACTIVE) {
            log.warn("Login failed: user is not active, email={}, status={}", user.getEmail(), userEntity.getStatus());
            throw new InvalidLoginException("Tài khoản chưa được kích hoạt, hãy kiểm tra lại mail");
        }
        log.info("Login successful, userId={}", userEntity.getId());
        return loginConverter.loginConverter(userEntity);
    }

    @Override
    @Transactional
    public LoginResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepositoryImpl.existsByEmail(email)) {
            log.warn("Register failed because email already exists, email={}", email);
            throw new RegisterException("Email đã được sử dụng");
        }

        UserEntity user = new UserEntity();
        user.setFullName(request.getFullName().trim());
        user.setEmail(email);
        user.setPasswordHash(request.getPassword());
        user.setStatus(UserStatus.PENDING);
        user.setTotalLearningPoints(0);
        RoleEntity studentRole = roleRepository.findByName("STUDENT")
                .orElseThrow(() -> new RegisterException("Role STUDENT is not confined"));
        user.getRoles().add(studentRole);

        UserEntity savedUser = userRepositoryImpl.save(user);
        emailVerificationService.sendVerificationEmail(savedUser);

        log.info("Register successful, userId={}", savedUser.getId());
        return loginConverter.loginConverter(savedUser);
    }
}
