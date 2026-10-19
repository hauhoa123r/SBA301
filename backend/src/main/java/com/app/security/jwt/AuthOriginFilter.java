package com.app.security.jwt;

import com.app.config.properties.CorsProperties;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

public class AuthOriginFilter extends OncePerRequestFilter {
    private final CorsProperties cors;
    private final AuthCookieRequestMatcher matcher = new AuthCookieRequestMatcher();
    public AuthOriginFilter(CorsProperties cors) { this.cors = cors; }
    @Override protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String origin = request.getHeader("Origin");
        if (matcher.matches(request) && (origin == null || !cors.allowedOrigins().contains(origin))) {
            response.setStatus(403);
            response.setContentType("application/json");
            response.getWriter().write("{\"status\":403,\"message\":\"Trusted Origin is required.\"}");
            return;
        }
        chain.doFilter(request, response);
    }
}
