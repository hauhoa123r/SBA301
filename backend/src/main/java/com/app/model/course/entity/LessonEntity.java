package com.app.model.course.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

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

    @Column(name = "`order`", nullable = false)
    private Integer order;

    @OneToMany(mappedBy = "lesson", cascade = CascadeType.ALL)
    private List<ExerciseEntity> exerciseEntities;
}
