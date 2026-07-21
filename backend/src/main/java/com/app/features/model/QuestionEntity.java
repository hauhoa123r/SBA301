package com.app.features.model;

import com.app.features.model.StudentAnswerEntity;
import com.app.features.model.enums.QuestionType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.jspecify.annotations.NonNull;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
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

    @Enumerated(EnumType.STRING)
    @Column(name = "question_type", nullable = false, length = 30)
    private QuestionType questionType;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Builder.Default
    @Column(nullable = false)
    private Integer points = 10;

    @Builder.Default
    @OneToMany(mappedBy = "questionEntity", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orderIndex ASC")
    private List<AnswerEntity> answerEntities = new java.util.ArrayList<>();

    @Size(max = 500)
    @Column(name = "audio_url", length = 500)
    private String audioUrl;

    @NotNull
    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "meta_data")
    private Map<String, Object> metaData;

    @Column(name = "explanation", columnDefinition = "TEXT")
    private String explanation;

    @Builder.Default
    @NonNull
    @OneToMany(mappedBy = "question")
    private Set<StudentAnswerEntity> studentAnswers = new LinkedHashSet<>();

    public void addAnswer(AnswerEntity answer) {
        answerEntities.add(answer);
        answer.setQuestionEntity(this);
    }

    public void removeAnswer(AnswerEntity answer) {
        answerEntities.remove(answer);
        answer.setQuestionEntity(null);
    }
}
