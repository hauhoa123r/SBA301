package com.app.model.user.service;

import com.app.model.user.dto.request.LoginRequest;
import com.app.model.user.dto.response.LoginResponse;

public interface UserService {
    public LoginResponse IsExistUser(LoginRequest user);
}
