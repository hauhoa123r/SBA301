package com.app.features.feedback.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity @Table(name = "feedback_questions") @Getter @Setter
public class FeedbackQuestion {
    public enum Type { SHORT_TEXT, LONG_TEXT, NUMBER, SINGLE_CHOICE, MULTIPLE_CHOICE, DROPDOWN, LIKERT, RATING, YES_NO }
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "form_id") private FeedbackForm form;
    @Column(nullable = false, length = 500) private String title;
    @Column(nullable = false, length = 2000) private String description = "";
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 30) private Type type;
    @Column(nullable = false) private boolean required;
    @Column(nullable = false) private int position;
    @Column(name = "min_value", precision = 18, scale = 4) private BigDecimal minValue;
    @Column(name = "max_value", precision = 18, scale = 4) private BigDecimal maxValue;
    @Column(name = "max_length") private Integer maxLength;
    @Column(name = "min_selections") private Integer minSelections;
    @Column(name = "max_selections") private Integer maxSelections;
    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("position ASC") private List<FeedbackOption> options = new ArrayList<>();
}
