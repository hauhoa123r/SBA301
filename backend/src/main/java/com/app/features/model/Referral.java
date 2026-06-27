package com.app.features.model;

import com.app.model.user.entity.UserEntity;
import com.app.features.model.enums.ReferralStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "referrals", schema = "chinese_online_learning")
public class Referral {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "referrer_id", nullable = false)
    private UserEntity referrer;

    @NotNull
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "referred_user_id", nullable = false)
    private UserEntity referredUser;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ReferralStatus status = ReferralStatus.REGISTERED;

    @Column(name = "reward_granted")
    private Boolean rewardGranted = false;

    @Column(name = "created_at", insertable = false, updatable = false)
    private Instant createdAt;


}
