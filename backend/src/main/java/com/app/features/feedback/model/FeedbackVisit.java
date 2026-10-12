package com.app.features.feedback.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.Instant;

@Entity @Table(name = "feedback_visits", uniqueConstraints = @UniqueConstraint(columnNames = {"form_id", "user_id"}))
@Getter @Setter
public class FeedbackVisit {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "form_id", nullable = false) private Long formId;
    @Column(name = "user_id", nullable = false) private Long userId;
    @Column(name = "started_at", nullable = false) private Instant startedAt = Instant.now();
}
