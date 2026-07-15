package com.app.features.auth.service;

import com.app.features.auth.dto.request.LoginRequest;
import com.app.features.auth.dto.request.RegisterRequest;
import com.app.features.auth.dto.response.LoginResponse;

public interface UserService {
    public LoginResponse login(LoginRequest user);
    public LoginResponse register(RegisterRequest request);
}
