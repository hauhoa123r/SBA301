package com.app.security.jwt;

import jakarta.servlet.http.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;
import java.time.Duration;
import java.time.Instant;

@Component
public class RefreshCookie {
    public static final String NAME = "refresh_session";
    public static final String PATH = "/api/auth";
    private final boolean secure;
    private final String sameSite;
    private final JwtService jwt;

    public RefreshCookie(@Value("${app.auth.cookie-secure:true}") boolean secure,
                         @Value("${app.auth.cookie-same-site:Lax}") String sameSite, JwtService jwt) {
        if (!java.util.Set.of("Lax", "Strict", "None").contains(sameSite) || (!secure && "None".equals(sameSite)))
            throw new IllegalArgumentException("Invalid refresh cookie policy");
        this.secure = secure; this.sameSite = sameSite; this.jwt = jwt;
    }
    public String read(HttpServletRequest request) {
        if (request.getCookies() != null)
            for (Cookie cookie : request.getCookies()) if (NAME.equals(cookie.getName())) return cookie.getValue();
        return null;
    }
    public String header(String rawToken) {
        Duration age = Duration.between(Instant.now(), jwt.parse(rawToken).getExpiration().toInstant());
        return cookie(rawToken, Duration.ofSeconds(Math.max(0, age.getSeconds()))).toString();
    }
    public void clear(HttpServletResponse response) {
        response.addHeader(HttpHeaders.SET_COOKIE, cookie("", Duration.ZERO).toString());
    }
    private ResponseCookie cookie(String value, Duration age) {
        return ResponseCookie.from(NAME, value).httpOnly(true).secure(secure)
                .sameSite(sameSite).path(PATH).maxAge(age).build();
    }
}
