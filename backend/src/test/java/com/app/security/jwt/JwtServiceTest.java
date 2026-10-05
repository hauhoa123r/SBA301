package com.app.security.jwt;

import com.app.features.auth.exception.UnsupportedAccountRoleException;
import com.app.features.model.RoleEntity;
import com.app.features.model.UserEntity;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.Test;

import java.time.Duration;
import java.util.Base64;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class JwtServiceTest {
    private final JwtService jwtService = new JwtService(
            Base64.getEncoder().encodeToString(new byte[32]),
            Duration.ofMinutes(15),
            Duration.ofDays(30)
    );

    @Test
    void mixedAccountTokenContainsOnlySupportedRoles() {
        UserEntity user = userWithRoles("ADMIN", "STUDENT", "TEACHER");
        user.setId(7L);
        user.setEmail("student@example.com");

        Claims claims = jwtService.parse(jwtService.createAccessToken(user));

        assertEquals(List.of("ADMIN", "STUDENT"), claims.get("roles", List.class));
        assertEquals("access", claims.get("type", String.class));
    }

    @Test
    void legacyOnlyAccountCannotReceiveToken() {
        UserEntity user = userWithRoles("MODERATOR");
        user.setId(8L);
        user.setEmail("legacy@example.com");

        assertThrows(UnsupportedAccountRoleException.class,
                () -> jwtService.createAccessToken(user));
        assertThrows(UnsupportedAccountRoleException.class,
                () -> jwtService.createRefreshToken(user));
    }

    private UserEntity userWithRoles(String... names) {
        UserEntity user = new UserEntity();
        for (String name : names) {
            RoleEntity role = new RoleEntity();
            role.setName(name);
            user.getRoles().add(role);
        }
        return user;
    }
}
