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
        UserEntity user = userWithRoles("MODERATOR", "TEACHER");

        assertThrows(UnsupportedAccountRoleException.class,
                () -> SupportedRolePolicy.requireSupported(user));
    }

    @Test
    void mixedAccountExposesOnlySupportedRolesAndAuthorities() {
        UserEntity user = userWithRoles("ADMIN", "STUDENT", "TEACHER");

        assertTrue(SupportedRolePolicy.hasStudentRole(user));
        assertEquals(List.of("ADMIN", "STUDENT"), SupportedRolePolicy.supportedRoleNames(user));
        assertEquals(List.of("ROLE_ADMIN", "ROLE_STUDENT"), SupportedRolePolicy.supportedAuthorities(user).stream()
                .map(authority -> authority.getAuthority())
                .toList());
        assertEquals(List.of("ADMIN", "STUDENT"), AuthUserResponse.from(user).roles());
    }

    @Test
    void adminCanAuthenticateWithoutReceivingStudentAccess() {
        UserEntity user = userWithRoles(" admin ");
        assertEquals(List.of("ADMIN"), SupportedRolePolicy.supportedRoleNames(user));
        assertEquals(List.of("ROLE_ADMIN"), SupportedRolePolicy.supportedAuthorities(user).stream()
                .map(authority -> authority.getAuthority()).toList());
        assertTrue(!SupportedRolePolicy.hasStudentRole(user));
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
