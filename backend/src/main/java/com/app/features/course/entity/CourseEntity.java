package com.app.features.course.entity;

import com.app.features.model.*;
import com.app.features.model.enums.CourseStatus;
import com.app.features.user.entity.PlanEntity;
import com.app.features.user.entity.UserEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.jspecify.annotations.NonNull;

import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "courses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Builder.Default
    @OneToMany(mappedBy = "courseEntity", cascade = CascadeType.ALL)
    private java.util.List<ChapterEntity> chapterEntities = new java.util.ArrayList<>();
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "teacher_id", nullable = false)
    private UserEntity teacher;
    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.SET_NULL)
    @JoinColumn(name = "category_id")
    private Category category;
    @Size(max = 500)
    @Column(name = "thumbnail_url", length = 500)
    private String thumbnailUrl;
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private CourseStatus status = CourseStatus.DRAFT;

    @Column(name = "created_at", insertable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private Instant updatedAt;
    @Builder.Default
    @NonNull
    @OneToMany(mappedBy = "course")
    private Set<Certificate> certificates = new LinkedHashSet<>();
    @Builder.Default
    @NonNull
    @OneToMany(mappedBy = "course")
    private Set<CourseEnrollment> courseEnrollments = new LinkedHashSet<>();
    @Builder.Default
    @NonNull
    @ManyToMany
    @JoinTable(name = "course_plan_access", joinColumns = {@JoinColumn(name = "course_id")}, inverseJoinColumns = {@JoinColumn(name = "plan_id")})
    private Set<PlanEntity> plans = new LinkedHashSet<>();
    @Builder.Default
    @NonNull
    @OneToMany(mappedBy = "course")
    private Set<CourseReview> courseReviews = new LinkedHashSet<>();
    @Builder.Default
    @NonNull
    @ManyToMany
    @JoinTable(name = "course_tags", joinColumns = {@JoinColumn(name = "course_id")}, inverseJoinColumns = {@JoinColumn(name = "tag_id")})
    private Set<Tag> tags = new LinkedHashSet<>();
}
