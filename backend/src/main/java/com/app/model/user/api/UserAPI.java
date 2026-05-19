package com.app.model.user.api;

import com.app.model.user.dto.request.LoginRequest;
import com.app.model.user.dto.response.LoginResponse;
import com.app.model.user.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user")
public class UserAPI {
    private final UserService userService;
    public UserAPI(UserService userService) {
        this.userService = userService;
    }
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest user){
        LoginResponse loginResponse = userService.IsExistUser(user);
        return ResponseEntity.ok(loginResponse);
    }
}
