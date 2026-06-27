package com.app.features.auth.service;

import com.app.features.auth.dto.request.LoginRequest;
import com.app.features.auth.dto.response.LoginResponse;

public interface AuthService {
    public LoginResponse IsExistUser(LoginRequest user);
}
