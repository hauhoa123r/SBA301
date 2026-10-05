package com.app.security.role;

import com.app.features.auth.exception.UnsupportedAccountRoleException;
import com.app.features.model.RoleEntity;
import com.app.features.model.UserEntity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.List;
import java.util.Locale;

public final class SupportedRolePolicy {
    public static final String STUDENT_ROLE = "STUDENT";
    public static final String STUDENT_AUTHORITY = "ROLE_STUDENT";
    public static final String ADMIN_ROLE = "ADMIN";

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
        if (!hasSupportedRole(user)) {
            throw new UnsupportedAccountRoleException();
        }
    }

    public static List<String> supportedRoleNames(UserEntity user) {
        requireSupported(user);
        return roleNames(user);
    }

    public static List<SimpleGrantedAuthority> supportedAuthorities(UserEntity user) {
        requireSupported(user);
        return roleNames(user).stream().map(role -> new SimpleGrantedAuthority("ROLE_" + role)).toList();
    }

    public static boolean hasSupportedRole(UserEntity user) {
        return !roleNames(user).isEmpty();
    }

    private static List<String> roleNames(UserEntity user) {
        if (user == null || user.getRoles() == null) return List.of();
        return user.getRoles().stream().map(RoleEntity::getName)
                .filter(name -> name != null).map(name -> name.trim().toUpperCase(Locale.ROOT))
                .filter(name -> STUDENT_ROLE.equals(name) || ADMIN_ROLE.equals(name))
                .distinct().sorted().toList();
    }
}
