package com.app.model.user.converter;

import com.app.model.user.dto.response.LoginResponse;
import com.app.model.user.entity.UserEntity;
import com.app.model.user.service.UserService;
import org.springframework.stereotype.Component;

@Component
public class LoginConverter {
    private final UserService userService;
    public LoginConverter(UserService userService) {
        this.userService = userService;
    }

    LoginResponse LoginConverter(UserEntity userEntity) {
        LoginResponse loginResponse = new LoginResponse();
        loginResponse.setUsername(userEntity.getUsername());
        return loginResponse;
    }
}
