package com.app.features.model;

import com.app.features.model.QuizAttemptEntity;
import com.app.features.model.enums.QuizType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.jspecify.annotations.NonNull;

import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "quizzes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private QuizType type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id")
    private LessonEntity lessonEntity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chapter_id")
    private ChapterEntity chapter;

    @Builder.Default
    @Column(name = "pass_score", nullable = false)
    private Integer passScore = 50;

    @Builder.Default
    @OneToMany(mappedBy = "quizEntity", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orderIndex ASC")
    private List<QuestionEntity> questionEntities = new java.util.ArrayList<>();

    @Builder.Default
    @NotNull
    @Column(name = "time_limit_minutes", nullable = false)
    private Integer timeLimitMinutes = 0;

    @Column(name = "created_at", insertable = false, updatable = false)
    private Instant createdAt;
    @Builder.Default
    @NonNull
    @OneToMany(mappedBy = "quiz")
    private Set<QuizAttemptEntity> quizAttempts = new LinkedHashSet<>();
}
