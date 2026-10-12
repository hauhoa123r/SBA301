package com.app.features.feedback.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity @Table(name = "feedback_answers", uniqueConstraints = @UniqueConstraint(columnNames = {"submission_id", "question_id"}))
@Getter @Setter
public class FeedbackAnswer {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "submission_id") private FeedbackSubmission submission;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "question_id") private FeedbackQuestion question;
    @Column(name = "text_value", length = 10000) private String textValue;
    @Column(name = "number_value", precision = 18, scale = 4) private BigDecimal numberValue;
    @ManyToMany
    @JoinTable(name = "feedback_answer_options", joinColumns = @JoinColumn(name = "answer_id"), inverseJoinColumns = @JoinColumn(name = "option_id"))
    private Set<FeedbackOption> options = new LinkedHashSet<>();
}
