package com.app.security.jwt;

import com.app.features.auth.repository.UserRepository;
import com.app.features.auth.exception.UnsupportedAccountRoleException;
import com.app.features.model.UserEntity;
import com.app.features.model.enums.UserStatus;
import com.app.security.handler.SecurityErrorResponseWriter;
import com.app.security.role.SupportedRolePolicy;
import com.app.security.oauth.CustomOAuth2User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final SecurityErrorResponseWriter responseWriter;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            // A rejected bearer token must never fall back to an old OAuth session.
            SecurityContextHolder.clearContext();
            try {
                Claims claims = jwtService.parse(header.substring(7));
                if (jwtService.isType(claims, "access")) {
                    UserEntity user = userRepository.findByIdWithRoles(Long.valueOf(claims.getSubject())).orElse(null);
                    if (user != null && user.getStatus() == UserStatus.ACTIVE) {
                        if (!SupportedRolePolicy.hasSupportedRole(user)) {
                            SecurityContextHolder.clearContext();
                            responseWriter.write(request, response, HttpStatus.UNAUTHORIZED,
                                    UnsupportedAccountRoleException.MESSAGE);
                            return;
                        }
                        List<SimpleGrantedAuthority> authorities = SupportedRolePolicy.supportedAuthorities(user);
                        SecurityContextHolder.getContext().setAuthentication(
                                new UsernamePasswordAuthenticationToken(user, null, authorities));
                    }
                }
            } catch (JwtException | IllegalArgumentException ignored) {
            }
        } else {
            var authentication = SecurityContextHolder.getContext().getAuthentication();
            Object principal = authentication == null ? null : authentication.getPrincipal();
            Long id = principal instanceof UserEntity user ? user.getId()
                : principal instanceof CustomOAuth2User oauth ? oauth.getUser().getId() : null;
            if (id != null) {
                UserEntity current = userRepository.findByIdWithRoles(id).orElse(null);
                if (current == null || current.getStatus() != UserStatus.ACTIVE || !SupportedRolePolicy.hasSupportedRole(current)) {
                    SecurityContextHolder.clearContext();
                    var session = request.getSession(false);
                    if (session != null) session.invalidate();
                } else {
                    SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(
                        current, null, SupportedRolePolicy.supportedAuthorities(current)));
                }
            }
        }
        chain.doFilter(request, response);
    }
}
