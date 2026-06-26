package com.app.model.course.entity;

import com.app.features.model.Assignment;
import com.app.features.model.LessonDocument;
import com.app.features.model.LessonProgress;
import com.app.features.model.LessonQa;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.jspecify.annotations.NonNull;

import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "lessons")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LessonEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chapter_id", nullable = false)
    private ChapterEntity chapter;

    @Column(nullable = false)
    private String title;

    @Column(name = "video_url", length = 500)
    private String videoUrl;

    @Builder.Default
    @Column(name = "duration_seconds")
    private Integer durationSeconds = 0;
    @NotNull
    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;
    @Builder.Default
    @NonNull
    @OneToMany(mappedBy = "lesson")
    private Set<Assignment> assignments = new LinkedHashSet<>();
    @Builder.Default
    @NonNull
    @OneToMany(mappedBy = "lesson")
    private Set<LessonDocument> lessonDocuments = new LinkedHashSet<>();
    @Builder.Default
    @NonNull
    @OneToMany(mappedBy = "lesson")
    private Set<LessonProgress> lessonProgresses = new LinkedHashSet<>();
    @Builder.Default
    @NonNull
    @OneToMany(mappedBy = "lesson")
    private Set<LessonQa> lessonQas = new LinkedHashSet<>();
    @Builder.Default
    @NonNull
    @OneToMany(mappedBy = "lessonEntity")
    private Set<QuizEntity> quizzes = new LinkedHashSet<>();
}
