package com.app.security.jwt;

import com.app.features.model.UserEntity;
import com.app.security.role.SupportedRolePolicy;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.GeneralSecurityException;
import java.util.Base64;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.List;

@Service
public class JwtService {
    private final SecretKey key;
    private final Duration accessTtl;
    private final Duration refreshTtl;

    public JwtService(@Value("${app.jwt.secret}") String base64Secret,
                      @Value("${app.jwt.access-ttl}") Duration accessTtl,
                      @Value("${app.jwt.refresh-ttl}") Duration refreshTtl) {
        this.key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(base64Secret));
        this.accessTtl = accessTtl;
        this.refreshTtl = refreshTtl;
    }

    public String createAccessToken(UserEntity user) { return create(user, accessTtl, "access"); }
    public String createRefreshToken(UserEntity user) {
        return createRefreshToken(user, java.util.UUID.randomUUID().toString(), Instant.now().plus(refreshTtl));
    }

    public String createRefreshToken(UserEntity user, String sessionId, Instant expiresAt) {
        return builder(user, "refresh").id(java.util.UUID.randomUUID().toString())
                .claim("sid", sessionId).expiration(Date.from(expiresAt)).signWith(key).compact();
    }

    public Claims parse(String token) {
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
    }

    public boolean isType(Claims claims, String type) {
        return type.equals(claims.get("type", String.class)) && claims.getExpiration() != null
                && claims.getExpiration().after(new Date());
    }

    public boolean matchesCredentials(Claims claims, UserEntity user) {
        String stamp = claims.get("pwd", String.class);
        return stamp != null && MessageDigest.isEqual(stamp.getBytes(StandardCharsets.UTF_8),
                credentialStamp(user).getBytes(StandardCharsets.UTF_8));
    }

    private String credentialStamp(UserEntity user) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(key.getEncoded(), "HmacSHA256"));
            String value = user.getId() + ":" + java.util.Objects.toString(user.getPasswordHash(), "");
            return Base64.getUrlEncoder().withoutPadding().encodeToString(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
        } catch (GeneralSecurityException exception) {
            throw new IllegalStateException("Unable to protect token credentials.", exception);
        }
    }

    private String create(UserEntity user, Duration ttl, String type) {
        return builder(user, type).expiration(Date.from(Instant.now().plus(ttl))).signWith(key).compact();
    }

    private io.jsonwebtoken.JwtBuilder builder(UserEntity user, String type) {
        Instant now = Instant.now();
        List<String> roles = SupportedRolePolicy.supportedRoleNames(user);

        return Jwts.builder()
                .subject(user.getId().toString())
                .claim("email", user.getEmail())
                .claim("roles", roles)
                .claim("type", type)
                .claim("pwd", credentialStamp(user))
                .issuedAt(Date.from(now));
    }
}
