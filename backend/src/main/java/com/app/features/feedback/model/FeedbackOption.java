package com.app.features.feedback.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity @Table(name = "feedback_options") @Getter @Setter
public class FeedbackOption {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "question_id") private FeedbackQuestion question;
    @Column(nullable = false, length = 300) private String label;
    @Column(nullable = false) private int position;
}
