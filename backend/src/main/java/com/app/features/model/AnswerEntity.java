package com.app.features.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "answers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnswerEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private QuestionEntity questionEntity;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "is_correct", nullable = false)
    private Boolean isCorrect = false;
    @Lob
    @Column(name = "matching_pair")
    private String matchingPair;

    @Builder.Default
    @Column(name = "order_index", nullable = false)
    private Integer orderIndex = 0;
}
