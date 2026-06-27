package com.app.features.auth.converter;

import com.app.features.auth.dto.response.LoginResponse;
import com.app.features.model.UserEntity;
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
