package com.app.features.auth.service.impl;

import com.app.features.auth.converter.LoginConverter;
import com.app.features.auth.converter.RegisterConverter;
import com.app.features.auth.dto.request.LoginRequest;
import com.app.features.auth.dto.response.TokenResponse;
import com.app.features.auth.exception.InvalidLoginException;
import com.app.features.auth.exception.UnsupportedAccountRoleException;
import com.app.features.auth.repository.UserRepository;
import com.app.features.auth.service.EmailVerificationService;
import com.app.features.model.RoleEntity;
import com.app.features.model.UserEntity;
import com.app.features.model.enums.UserStatus;
import com.app.security.jwt.JwtService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class AuthServiceImplTest {

    @Test
    void studentLoginSucceeds() {
        TestContext context = contextFor(userWithRoles(UserStatus.ACTIVE, "STUDENT"));
        when(context.jwtService().createAccessToken(context.user())).thenReturn("access-token");
        when(context.jwtService().createRefreshToken(context.user())).thenReturn("refresh-token");

        TokenResponse response = context.service().login(loginRequest());

        assertEquals("access-token", response.accessToken());
        assertEquals("refresh-token", response.refreshToken());
        assertEquals(List.of("STUDENT"), response.user().roles());
        verify(context.jwtService()).createAccessToken(context.user());
        verify(context.jwtService()).createRefreshToken(context.user());
    }

    @ParameterizedTest
    @ValueSource(strings = {"ADMIN", "MODERATOR", "TEACHER"})
    void legacyOnlyAccountIsRejectedWithoutIssuingTokens(String legacyRole) {
        TestContext context = contextFor(userWithRoles(UserStatus.ACTIVE, legacyRole));

        UnsupportedAccountRoleException exception = assertThrows(
                UnsupportedAccountRoleException.class,
                () -> context.service().login(loginRequest())
        );

        assertTrue(exception.getMessage().contains("UNSUPPORTED_ACCOUNT_ROLE"));
        verifyNoInteractions(context.jwtService());
    }

    @Test
    void mixedAccountLoginSucceedsAndResponseIsSanitized() {
        TestContext context = contextFor(userWithRoles(
                UserStatus.ACTIVE,
                "ADMIN",
                "STUDENT",
                "MODERATOR",
                "TEACHER"
        ));
        when(context.jwtService().createAccessToken(context.user())).thenReturn("access-token");
        when(context.jwtService().createRefreshToken(context.user())).thenReturn("refresh-token");

        TokenResponse response = context.service().login(loginRequest());

        assertEquals(List.of("STUDENT"), response.user().roles());
        verify(context.jwtService()).createAccessToken(context.user());
        verify(context.jwtService()).createRefreshToken(context.user());
    }

    @Test
    void inactiveStudentIsRejectedWithoutIssuingTokens() {
        TestContext context = contextFor(userWithRoles(UserStatus.LOCKED, "STUDENT"));

        assertThrows(InvalidLoginException.class, () -> context.service().login(loginRequest()));

        verifyNoInteractions(context.jwtService());
    }

    private TestContext contextFor(UserEntity user) {
        UserRepository userRepository = mock(UserRepository.class);
        JwtService jwtService = mock(JwtService.class);
        when(userRepository.findByEmailWithRoles("student@example.com")).thenReturn(Optional.of(user));
        AuthServiceImpl service = new AuthServiceImpl(
                userRepository,
                mock(LoginConverter.class),
                mock(EmailVerificationService.class),
                jwtService,
                mock(RegisterConverter.class)
        );
        return new TestContext(service, user, jwtService);
    }

    private LoginRequest loginRequest() {
        return new LoginRequest("student@example.com", "Password1");
    }

    private UserEntity userWithRoles(UserStatus status, String... names) {
        UserEntity user = new UserEntity();
        user.setId(7L);
        user.setEmail("student@example.com");
        user.setFullName("Student User");
        user.setPasswordHash("Password1");
        user.setStatus(status);
        for (String name : names) {
            RoleEntity role = new RoleEntity();
            role.setName(name);
            user.getRoles().add(role);
        }
        return user;
    }

    private record TestContext(AuthServiceImpl service, UserEntity user, JwtService jwtService) {
    }
}
