package com.app.features.model;

import com.app.features.model.UserEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "user_badges", schema = "chinese_online_learning")
public class UserBadgeEntity {
    @EmbeddedId
    private UserBadgeIdEntity id;

    @MapsId("userId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @MapsId("badgeId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "badge_id", nullable = false)
    private BadgeEntity badge;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "earned_at")
    private Instant earnedAt;


}