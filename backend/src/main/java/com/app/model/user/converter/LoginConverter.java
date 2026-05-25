package com.app.model.user.converter;

import com.app.model.user.dto.response.LoginResponse;
import com.app.model.user.entity.UserEntity;
import com.app.model.user.service.UserService;
import org.springframework.stereotype.Component;

@Component
public class LoginConverter {
    public LoginResponse loginConverter(UserEntity userEntity) {
        LoginResponse loginResponse = new LoginResponse();
        loginResponse.setId(userEntity.getId());
        loginResponse.setEmail(userEntity.getEmail());
        return loginResponse;
    }
}
