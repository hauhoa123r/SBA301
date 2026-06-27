package com.app.features.user.service.impl;

import com.app.features.user.converter.LoginConverter;
import com.app.features.user.dto.request.LoginRequest;
import com.app.features.user.dto.response.LoginResponse;
import com.app.features.user.entity.UserEntity;
import com.app.features.user.exception.InvalidLoginException;
import com.app.features.user.repository.UserRepository;
import com.app.features.user.service.UserService;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {
    private final UserRepository userRepositoryImpl;
    private final LoginConverter loginConverter;
    UserServiceImpl(UserRepository userRepositoryImpl, LoginConverter loginConverter) {
        this.userRepositoryImpl = userRepositoryImpl;
        this.loginConverter = loginConverter;
    }
    private Boolean DTOConverter(String a){
        return true;
    }
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
