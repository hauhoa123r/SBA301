package com.app.security.role;

import com.app.features.auth.dto.response.AuthUserResponse;
import com.app.features.auth.exception.UnsupportedAccountRoleException;
import com.app.features.model.RoleEntity;
import com.app.features.model.UserEntity;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SupportedRolePolicyTest {

    @Test
    void legacyOnlyAccountIsRejected() {
        UserEntity user = userWithRoles("ADMIN", "MODERATOR", "TEACHER");

        assertThrows(UnsupportedAccountRoleException.class,
                () -> SupportedRolePolicy.requireSupported(user));
    }

    @Test
    void mixedAccountOnlyExposesStudentRoleAndAuthority() {
        UserEntity user = userWithRoles("ADMIN", "STUDENT", "TEACHER");

        assertTrue(SupportedRolePolicy.hasStudentRole(user));
        assertEquals(List.of("STUDENT"), SupportedRolePolicy.supportedRoleNames(user));
        assertEquals(List.of("ROLE_STUDENT"), SupportedRolePolicy.supportedAuthorities(user).stream()
                .map(authority -> authority.getAuthority())
                .toList());
        assertEquals(List.of("STUDENT"), AuthUserResponse.from(user).roles());
    }

    @Test
    void studentRoleMatchingIsNormalizedWithoutMappingLegacyRoles() {
        UserEntity user = userWithRoles(" student ");

        assertEquals(List.of("STUDENT"), SupportedRolePolicy.supportedRoleNames(user));
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
