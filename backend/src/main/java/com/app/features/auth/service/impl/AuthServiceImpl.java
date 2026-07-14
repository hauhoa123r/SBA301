package com.app.features.auth.service.impl;

import com.app.features.auth.converter.LoginConverter;
import com.app.features.auth.dto.request.LoginRequest;
import com.app.features.auth.dto.response.LoginResponse;
import com.app.features.model.UserEntity;
import com.app.features.auth.exception.InvalidLoginException;
import com.app.features.auth.repository.UserRepository;
import com.app.features.auth.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {
    private final UserRepository userRepositoryImpl;
    private final LoginConverter loginConverter;

    @Override
    public LoginResponse IsExistUser(LoginRequest user) {
        UserEntity userEntity = userRepositoryImpl.findByEmail(user.getEmail())
                .orElseThrow(() -> {
                    log.warn("Login failed because email does not exist, email={}", user.getEmail());
                    return new InvalidLoginException("Email not exist");
                });
        if (!userEntity.getPasswordHash().equals(user.getPassword())) {
            log.warn("Login failed because password is invailid, email={}", user.getEmail());
            throw new InvalidLoginException("Wrong password");
        }
        log.info("Login successful, email={}", user.getEmail());
        LoginResponse loginResponse = loginConverter.loginConverter(userEntity);
        return loginResponse;
    }
}
