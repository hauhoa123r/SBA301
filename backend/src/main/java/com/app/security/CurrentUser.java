package com.app.security;

import com.app.features.model.UserEntity;
import com.app.security.oauth.CustomOAuth2User;
import org.springframework.security.core.Authentication;
import org.springframework.web.server.ResponseStatusException;
import static org.springframework.http.HttpStatus.UNAUTHORIZED;

public final class CurrentUser {
    private CurrentUser() {}
    public static Long optionalId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) return null;
        if (authentication.getPrincipal() instanceof UserEntity user) return user.getId();
        if (authentication.getPrincipal() instanceof CustomOAuth2User user) return user.getUser().getId();
        return null;
    }
    public static Long id(Authentication authentication) {
        Long id = optionalId(authentication);
        if (id == null) throw new ResponseStatusException(UNAUTHORIZED, "Vui lòng đăng nhập.");
        return id;
    }
}
