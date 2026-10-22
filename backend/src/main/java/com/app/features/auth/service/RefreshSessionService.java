package com.app.features.auth.service;

import com.app.features.auth.dto.response.AuthUserResponse;
import com.app.features.auth.dto.response.TokenResponse;
import com.app.features.auth.repository.RefreshSessionRepository;
import com.app.features.auth.repository.UserRepository;
import com.app.features.model.RefreshSessionEntity;
import com.app.features.model.UserEntity;
import com.app.features.model.enums.UserStatus;
import com.app.security.jwt.JwtService;
import com.app.security.role.SupportedRolePolicy;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.HexFormat;
import static org.springframework.http.HttpStatus.*;

@Service
@RequiredArgsConstructor
public class RefreshSessionService {
    private final RefreshSessionRepository sessions;
    private final UserRepository users;
    private final JwtService jwt;

    @Transactional
    public void register(String rawToken) {
        Claims claims = claims(rawToken);
        // Serialize session creation with admin deletion; a login completed just before deletion
        // must not register a new usable/unrevoked session after revocation has finished.
        UserEntity user = users.findByIdForUpdate(Long.valueOf(claims.getSubject())).orElseThrow(RefreshSessionService::invalid);
        if (user.getStatus() != UserStatus.ACTIVE || !SupportedRolePolicy.hasSupportedRole(user)
                || !jwt.matchesCredentials(claims,user)) throw invalid();
        var session = new RefreshSessionEntity();
        session.setId(claims.get("sid", String.class));
        session.setUser(user);
        session.setTokenHash(hash(rawToken));
        session.setExpiresAt(claims.getExpiration().toInstant());
        sessions.save(session);
    }

    // Replay revocation must commit even though the caller receives 401.
    @Transactional(noRollbackFor = ResponseStatusException.class)
    public TokenResponse rotate(String rawToken) {
        Claims claims = claims(rawToken);
        var session = sessions.findLocked(claims.get("sid", String.class)).orElseThrow(RefreshSessionService::invalid);
        if (session.isRevoked() || !session.getExpiresAt().isAfter(Instant.now())
                || !session.getUser().getId().toString().equals(claims.getSubject())) throw invalid();
        UserEntity user = users.findByIdWithRoles(session.getUser().getId()).orElseThrow(RefreshSessionService::invalid);
        if (user.getStatus() != UserStatus.ACTIVE || !SupportedRolePolicy.hasSupportedRole(user)
                || !jwt.matchesCredentials(claims, user)) {
            session.setRevoked(true);
            throw invalid();
        }
        if (!MessageDigest.isEqual(hash(rawToken).getBytes(StandardCharsets.US_ASCII),
                session.getTokenHash().getBytes(StandardCharsets.US_ASCII))) {
            // The losing simultaneous request gets no credentials and must not erase the winner's cookie.
            if (session.getRotatedAt() != null && session.getRotatedAt().plusSeconds(5).isAfter(Instant.now()))
                throw new ResponseStatusException(CONFLICT, "Session was refreshed concurrently; retry with the current cookie.");
            session.setRevoked(true);
            throw invalid();
        }
        String next = jwt.createRefreshToken(user, session.getId(), session.getExpiresAt());
        session.setTokenHash(hash(next));
        session.setRotatedAt(Instant.now());
        return new TokenResponse(jwt.createAccessToken(user), next, AuthUserResponse.from(user));
    }

    @Transactional
    public void revoke(String rawToken) {
        if (rawToken == null) return;
        try {
            Claims claims = claims(rawToken);
            sessions.findLocked(claims.get("sid", String.class)).ifPresent(session -> session.setRevoked(true));
        } catch (ResponseStatusException ignored) {
            // Invalid/expired cookies are still deleted by the logout handler.
        }
    }

    private Claims claims(String rawToken) {
        try {
            Claims claims = jwt.parse(rawToken);
            if (!jwt.isType(claims, "refresh") || claims.get("sid", String.class) == null) throw invalid();
            return claims;
        } catch (JwtException | IllegalArgumentException ex) { throw invalid(); }
    }
    private static ResponseStatusException invalid() {
        return new ResponseStatusException(UNAUTHORIZED, "Refresh session is invalid or expired.");
    }
    private static String hash(String value) {
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8))); }
        catch (NoSuchAlgorithmException ex) { throw new IllegalStateException(ex); }
    }
}
