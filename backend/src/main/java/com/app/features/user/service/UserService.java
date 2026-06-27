package com.app.features.user.service;

import com.app.features.user.dto.request.LoginRequest;
import com.app.features.user.dto.response.LoginResponse;

public interface UserService {
    public LoginResponse IsExistUser(LoginRequest user);
}
