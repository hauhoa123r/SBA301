package com.app.model.course.entity;

import com.app.features.model.StudentAnswer;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.jspecify.annotations.NonNull;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "questions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private QuizEntity quizEntity;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Builder.Default
    @Column(nullable = false)
    private Integer points = 10;

    @Builder.Default
    @OneToMany(mappedBy = "questionEntity", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id ASC")
    private List<AnswerEntity> answerEntities = new java.util.ArrayList<>();
    @Size(max = 500)
    @Column(name = "audio_url", length = 500)
    private String audioUrl;
    @NotNull
    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;
    @Builder.Default
    @NonNull
    @OneToMany(mappedBy = "question")
    private Set<StudentAnswer> studentAnswers = new LinkedHashSet<>();
}
