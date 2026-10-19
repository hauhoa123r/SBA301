package com.app.security.jwt;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.web.util.matcher.RequestMatcher;
import java.util.Set;

/** These mutations accept or establish cookie credentials. Other API mutations require Bearer. */
public class AuthCookieRequestMatcher implements RequestMatcher {
    private static final Set<String> PATHS = Set.of("/api/auth/login", "/api/auth/oauth/exchange",
            "/api/auth/refresh", "/api/auth/logout");
    @Override public boolean matches(HttpServletRequest request) {
        return "POST".equals(request.getMethod())
                && PATHS.contains(request.getRequestURI().substring(request.getContextPath().length()));
    }
}
