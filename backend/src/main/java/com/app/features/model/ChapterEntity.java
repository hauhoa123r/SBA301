package com.app.features.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.jspecify.annotations.NonNull;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "chapters")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChapterEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private CourseEntity courseEntity;

    @Column(nullable = false)
    private String title;

    @Builder.Default
    @OneToMany(mappedBy = "chapter", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orderIndex ASC")
    private List<LessonEntity> lessonEntities = new java.util.ArrayList<>();

    @NotNull
    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;

    @Builder.Default
    @NonNull
    @OneToMany(mappedBy = "chapter")
    private Set<QuizEntity> quizzes = new LinkedHashSet<>();

    public void addLesson(LessonEntity lessonEntity) {
        lessonEntities.add(lessonEntity);
        lessonEntity.setChapter(this);
    }

    public void removeLesson(LessonEntity lessonEntity) {
        lessonEntities.remove(lessonEntity);
        lessonEntity.setChapter(null);
    }

    public void addQuiz(QuizEntity quiz) {
        quizzes.add(quiz);
        quiz.setChapter(this);
    }

    public void removeQuiz(QuizEntity quiz) {
        quizzes.remove(quiz);
        quiz.setChapter(null);
    }
}
