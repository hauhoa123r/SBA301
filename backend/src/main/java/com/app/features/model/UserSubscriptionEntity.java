package com.app.features.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.Instant;

@Entity
@Table(name = "user_subscriptions")
@Getter
@Setter
public class UserSubscriptionEntity {
    @Id
    @Column(name = "user_id")
    private Long userId;
    @Column(name = "plan_code", nullable = false, length = 30)
    private String planCode;
    @Column(name = "started_at", nullable = false)
    private Instant startedAt;
    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;
    @Column(name = "trial_used", nullable = false)
    private boolean trialUsed;
}
