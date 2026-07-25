package com.app.security.role;

import com.app.features.auth.exception.UnsupportedAccountRoleException;
import com.app.features.model.RoleEntity;
import com.app.features.model.UserEntity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.List;

public final class SupportedRolePolicy {
    public static final String STUDENT_ROLE = "STUDENT";
    public static final String STUDENT_AUTHORITY = "ROLE_STUDENT";

    private SupportedRolePolicy() {
    }

    public static boolean hasStudentRole(UserEntity user) {
        return user != null
                && user.getRoles() != null
                && user.getRoles().stream()
                .map(RoleEntity::getName)
                .filter(name -> name != null)
                .map(String::trim)
                .anyMatch(STUDENT_ROLE::equalsIgnoreCase);
    }

    public static void requireSupported(UserEntity user) {
        if (!hasStudentRole(user)) {
            throw new UnsupportedAccountRoleException();
        }
    }

    public static List<String> supportedRoleNames(UserEntity user) {
        requireSupported(user);
        return List.of(STUDENT_ROLE);
    }

    public static List<SimpleGrantedAuthority> supportedAuthorities(UserEntity user) {
        requireSupported(user);
        return List.of(new SimpleGrantedAuthority(STUDENT_AUTHORITY));
    }
}
