package com.app.features.user.converter;

import com.app.features.user.dto.response.LoginResponse;
import com.app.features.user.entity.UserEntity;
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
