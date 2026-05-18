package com.app.model.user.service.impl;

import com.app.model.user.dto.request.LoginRequest;
import com.app.model.user.dto.response.LoginResponse;
import com.app.model.user.entity.UserEntity;
import com.app.model.user.repository.UserRepository;
import com.app.model.user.service.UserService;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {
    private UserRepository userRepositoryImpl;

    UserServiceImpl(UserRepository userRepositoryImpl) {
        this.userRepositoryImpl = userRepositoryImpl;
    }

    @Override
    public LoginResponse IsExistUser(LoginRequest user) {
        UserEntity userEntity = userRepositoryImpl.findByUsernameAndPassword(user.getUsername(), user.getPassword());
        LoginResponse loginResponse = new LoginResponse();
        loginResponse.setUsername(userEntity.getUsername());
        return loginResponse;
    }
}
