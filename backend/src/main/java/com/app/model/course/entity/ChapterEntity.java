package com.app.model.course.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

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

    @Column(name = "`order`", nullable = false)
    private Integer order;

    @OneToMany(mappedBy = "chapter", cascade = CascadeType.ALL)
    private List<LessonEntity> lessonEntities;
}