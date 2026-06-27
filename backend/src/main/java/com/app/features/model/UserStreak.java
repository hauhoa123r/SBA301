package com.app.features.model;

import com.app.features.user.entity.UserEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "user_streaks", schema = "chinese_online_learning")
public class UserStreak {
    @Id
    @Column(name = "user_id", nullable = false)
    private Long id;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity users;

    @ColumnDefault("0")
    @Column(name = "current_streak")
    private Integer currentStreak;

    @ColumnDefault("0")
    @Column(name = "longest_streak")
    private Integer longestStreak;

    @Column(name = "last_activity_date")
    private LocalDate lastActivityDate;


}