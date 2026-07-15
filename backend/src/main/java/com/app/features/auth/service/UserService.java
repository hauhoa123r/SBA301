package com.app.features.auth.service;

import com.app.features.auth.dto.request.LoginRequest;
import com.app.features.auth.dto.request.RegisterRequest;
import com.app.features.auth.dto.response.LoginResponse;
import com.app.features.auth.dto.response.TokenResponse;

public interface UserService {
    TokenResponse login(LoginRequest user);
    public LoginResponse register(RegisterRequest request);
}
