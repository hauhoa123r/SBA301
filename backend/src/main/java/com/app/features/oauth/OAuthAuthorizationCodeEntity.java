package com.app.features.oauth;

import com.app.features.model.UserEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "oauth_authorization_codes")
@Getter
@Setter
@NoArgsConstructor
public class OAuthAuthorizationCodeEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "code_hash", nullable = false, unique = true, length = 64)
    private String codeHash;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;
    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;
    @Column(name = "created_at", insertable = false, updatable = false)
    private Instant createdAt;
}
