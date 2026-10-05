package com.app.features.auth.service.impl;

import com.app.features.auth.converter.LoginConverter;
import com.app.features.auth.converter.RegisterConverter;
import com.app.features.auth.dto.request.LoginRequest;
import com.app.features.auth.dto.request.RegisterRequest;
import com.app.features.auth.dto.response.LoginResponse;
import com.app.features.auth.dto.response.AuthUserResponse;
import com.app.features.auth.dto.response.TokenResponse;
import com.app.features.auth.service.AuthService;
import com.app.security.jwt.JwtService;
import com.app.features.auth.exception.InvalidLoginException;
import com.app.features.auth.exception.RegisterException;
import com.app.features.auth.repository.UserRepository;
import com.app.features.auth.service.EmailVerificationService;
import com.app.features.model.UserEntity;
import com.app.features.model.enums.UserStatus;
import com.app.security.role.SupportedRolePolicy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {
    private static final BCryptPasswordEncoder PASSWORD_ENCODER = new BCryptPasswordEncoder();

    private final UserRepository userRepositoryImpl;
    private final LoginConverter loginConverter;
    private final EmailVerificationService emailVerificationServiceImpl;
    private final JwtService jwtService;
    private final RegisterConverter registerConverter;
    @Override
    public TokenResponse login(LoginRequest user) {
        UserEntity userEntity = userRepositoryImpl.findByEmailWithRoles(user.getEmail())
                .orElseThrow(() -> {
                    log.warn("Login failed because email does not exist, email={}", user.getEmail());
                    return new InvalidLoginException("Email không tồn tại");
                });
        if (!matchesPassword(user.getPassword(), userEntity.getPasswordHash())) {
            log.warn("Login failed: invalid password, email={}", user.getEmail());
            throw new InvalidLoginException("Mật khẩu không đúng");
        }
        if (userEntity.getStatus() != UserStatus.ACTIVE) {
            log.warn("Login failed because account is not active, userId={}, status={}",
                    userEntity.getId(), userEntity.getStatus());
            throw new InvalidLoginException("User account is not active");
        }
        SupportedRolePolicy.requireSupported(userEntity);
        log.info("Login successful, userId={}", userEntity.getId());
        return new TokenResponse(jwtService.createAccessToken(userEntity), jwtService.createRefreshToken(userEntity),
                AuthUserResponse.from(userEntity));
    }

    private boolean matchesPassword(String password, String storedPassword) {
        if (storedPassword == null || password == null) return false;
        if (storedPassword.startsWith("$2a$") || storedPassword.startsWith("$2b$") || storedPassword.startsWith("$2y$")) {
            try { return PASSWORD_ENCODER.matches(password, storedPassword); }
            catch (IllegalArgumentException exception) { return false; }
        }
        // Existing registration/reset flows store plaintext. Preserve those accounts for this change.
        return storedPassword.equals(password);
    }

    @Override
    @Transactional
    public LoginResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepositoryImpl.existsByEmail(email)) {
            log.warn("Register failed because email already exists, email={}", email);
            throw new RegisterException("Email đã được sử dụng");
        }
        UserEntity savedUser = userRepositoryImpl.save(registerConverter.convert(request));
        emailVerificationServiceImpl.sendVerificationEmail(savedUser);
        log.info("Register successful, userId={}", savedUser.getId());
        return loginConverter.loginConverter(savedUser);
    }
}

