package com.app.features.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Entity
@Table(name = "learning_activity_daily", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "activity_date"}))
@Getter @Setter
public class LearningActivityDailyEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "user_id", nullable = false)
    private Long userId;
    @Column(name = "activity_date", nullable = false)
    private LocalDate activityDate;
    @Column(name = "watch_seconds", nullable = false)
    private long watchSeconds;
    @Column(name = "activity_count", nullable = false)
    private long activityCount;
}
