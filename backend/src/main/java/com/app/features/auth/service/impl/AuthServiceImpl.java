package com.app.features.auth.service.impl;

import com.app.features.auth.converter.LoginConverter;
import com.app.features.auth.dto.request.LoginRequest;
import com.app.features.auth.dto.response.LoginResponse;
import com.app.features.model.UserEntity;
import com.app.features.auth.exception.InvalidLoginException;
import com.app.features.auth.repository.UserRepository;
import com.app.features.auth.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final UserRepository userRepositoryImpl;
    private final LoginConverter loginConverter;

    @Override
    public LoginResponse IsExistUser(LoginRequest user) {
        UserEntity userEntity = userRepositoryImpl.findByEmail(user.getEmail())
                .orElseThrow(() -> new InvalidLoginException("Email không tồn tại"));
        if (!userEntity.getPasswordHash().equals(user.getPassword())) {
            throw new InvalidLoginException("Sai mật khẩu");
        }
        LoginResponse loginResponse = loginConverter.loginConverter(userEntity);
        return loginResponse;
    }
}
