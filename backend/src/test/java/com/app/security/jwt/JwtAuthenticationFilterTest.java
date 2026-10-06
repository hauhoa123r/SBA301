package com.app.security.jwt;

import com.app.features.auth.repository.UserRepository;
import com.app.features.model.*;
import com.app.features.model.enums.UserStatus;
import com.app.security.handler.SecurityErrorResponseWriter;
import com.app.security.oauth.CustomOAuth2User;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.*;
import org.springframework.mock.web.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class JwtAuthenticationFilterTest {
    private final JwtService jwt = mock(JwtService.class);
    private final UserRepository users = mock(UserRepository.class);
    private final JwtAuthenticationFilter filter = new JwtAuthenticationFilter(jwt, users, mock(SecurityErrorResponseWriter.class));
    @AfterEach void clear() { SecurityContextHolder.clearContext(); }
    @Test void disabledBearerCannotFallBackToActiveSession() throws Exception {
        var stale = student(UserStatus.ACTIVE); var disabled = student(UserStatus.DISABLE);
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(stale, null, List.of()));
        var claims = mock(Claims.class); when(claims.getSubject()).thenReturn("1"); when(jwt.parse("token")).thenReturn(claims); when(jwt.isType(claims, "access")).thenReturn(true);
        when(users.findByIdWithRoles(1L)).thenReturn(Optional.of(disabled));
        var request = new MockHttpServletRequest(); request.addHeader("Authorization", "Bearer token");
        filter.doFilter(request, new MockHttpServletResponse(), new MockFilterChain());
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }
    @Test void blockedOAuthSessionIsInvalidatedOnNextRequest() throws Exception {
        var stale = new CustomOAuth2User(mock(OAuth2User.class), student(UserStatus.ACTIVE));
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(stale, null, List.of()));
        when(users.findByIdWithRoles(1L)).thenReturn(Optional.of(student(UserStatus.DISABLE)));
        var request = new MockHttpServletRequest(); var session = new MockHttpSession(); request.setSession(session);
        filter.doFilter(request, new MockHttpServletResponse(), new MockFilterChain());
        assertNull(SecurityContextHolder.getContext().getAuthentication()); assertTrue(session.isInvalid());
    }
    @Test void activeSessionReloadsCurrentUserAndRoles() throws Exception {
        var old = student(UserStatus.ACTIVE); var current = student(UserStatus.ACTIVE); current.setFullName("Updated student");
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(old, null, List.of()));
        when(users.findByIdWithRoles(1L)).thenReturn(Optional.of(current));
        filter.doFilter(new MockHttpServletRequest(), new MockHttpServletResponse(), new MockFilterChain());
        assertSame(current, SecurityContextHolder.getContext().getAuthentication().getPrincipal());
        assertEquals("ROLE_STUDENT", SecurityContextHolder.getContext().getAuthentication().getAuthorities().iterator().next().getAuthority());
    }
    private UserEntity student(UserStatus status) {
        var user = new UserEntity(); user.setId(1L); user.setStatus(status); var role = new RoleEntity(); role.setName("STUDENT"); user.getRoles().add(role); return user;
    }
}
