package com.app.features.feedback.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.Instant;

@Entity @Table(name = "feedback_submissions", uniqueConstraints = @UniqueConstraint(columnNames = {"form_id", "single_user_id"}))
@Getter @Setter
public class FeedbackSubmission {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "form_id") private FeedbackForm form;
    @Column(name = "user_id", nullable = false) private Long userId;
    // NULL for repeatable surveys; MySQL permits multiple NULLs in a unique key.
    @Column(name = "single_user_id") private Long singleUserId;
    @Column(name = "submitted_at", nullable = false) private Instant submittedAt = Instant.now();
}
