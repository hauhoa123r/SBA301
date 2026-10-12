package com.app.security.password;

import com.app.exception.BadRequestException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

public final class PasswordHashing {
    private static final BCryptPasswordEncoder ENCODER = new BCryptPasswordEncoder();
    private PasswordHashing() {}

    public static boolean isBcrypt(String value) {
        return value != null && (value.startsWith("$2a$") || value.startsWith("$2b$") || value.startsWith("$2y$"));
    }

    public static String encode(String password) {
        if (password == null || password.getBytes(StandardCharsets.UTF_8).length > 72)
            throw new BadRequestException("Password must not exceed 72 UTF-8 bytes.");
        return ENCODER.encode(password);
    }

    public static boolean matches(String password, String stored) {
        if (password == null || stored == null || stored.isBlank()) return false;
        if (isBcrypt(stored)) {
            try { return ENCODER.matches(password, stored); }
            catch (IllegalArgumentException exception) { return false; }
        }
        // OAuth markers and unsupported encoded-password formats are never login credentials.
        if (stored.startsWith("{") || stored.startsWith("$")) return false;
        // Legacy plaintext is accepted only for migration after a successful login.
        return MessageDigest.isEqual(password.getBytes(StandardCharsets.UTF_8), stored.getBytes(StandardCharsets.UTF_8));
    }
}
