package com.app.security.ratelimit;

import com.app.security.handler.SecurityErrorResponseWriter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.io.IOException;
import java.time.Duration;
import java.util.Set;

public class AuthenticationRateLimitFilter extends OncePerRequestFilter {
    private static final Set<String> ENDPOINTS = Set.of("/api/auth/login", "/api/auth/register",
        "/api/auth/forgot-password", "/api/auth/verify-token", "/api/auth/verify-email",
        "/api/auth/reset-password", "/api/auth/refresh", "/api/auth/oauth/exchange");
    private final AuthenticationAttemptLimiter attempts;
    private final SecurityErrorResponseWriter writer;
    public AuthenticationRateLimitFilter(AuthenticationAttemptLimiter attempts, SecurityErrorResponseWriter writer) {
        this.attempts = attempts; this.writer = writer;
    }
    @Override protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath().isEmpty() ? request.getRequestURI().substring(request.getContextPath().length()) : request.getServletPath();
        return !ENDPOINTS.contains(path) && !path.startsWith("/api/oauth2/authorization/");
    }
    @Override protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        try {
            // ForwardedHeaderFilter may replace this only behind the deployment's trusted Nginx proxy.
            attempts.check("auth-ip", request.getRemoteAddr(), 60, Duration.ofMinutes(1));
        } catch (ResponseStatusException exception) {
            response.setHeader("Retry-After", "60");
            writer.write(request, response, HttpStatus.TOO_MANY_REQUESTS, "Too many authentication requests. Try again later.");
            return;
        }
        chain.doFilter(request, response);
    }
}
