package com.app.utils;

import com.app.features.model.UserEntity;
import com.app.security.oauth.CustomOAuth2User;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtils {
    public static UserEntity getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new AuthenticationCredentialsNotFoundException("Authentication object is null");
        }
        if (authentication.getPrincipal() instanceof UserEntity user) return user;
        if (authentication.getPrincipal() instanceof CustomOAuth2User oauthUser) return oauthUser.getUser();
        throw new AuthenticationCredentialsNotFoundException("Authenticated user is unavailable");
    }

    public static Long getCurrentUserId() {
        return getCurrentUser().getId();
    }
}
