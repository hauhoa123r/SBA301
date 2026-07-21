package com.app.features.model;

import com.app.features.model.enums.CourseStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.jspecify.annotations.NonNull;

import java.math.BigDecimal;
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

    @NotNull
    @DecimalMin(value = "0.0", inclusive = true)
    @Column(nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal price = BigDecimal.ZERO;

    @Builder.Default
    @OneToMany(mappedBy = "courseEntity", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<ChapterEntity> chapterEntities = new java.util.ArrayList<>();
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "teacher_id", nullable = false)
    private UserEntity teacher;
    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.SET_NULL)
    @JoinColumn(name = "category_id")
    private CategoryEntity category;
    @Size(max = 500)
    @Column(name = "thumbnail_url", length = 500)
    private String thumbnailUrl;
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private CourseStatus status = CourseStatus.DRAFT;

    @Column(name = "created_at", insertable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", insertable = false)
    private Instant updatedAt;

    @Builder.Default
    @NonNull
    @OneToMany(mappedBy = "course")
    private Set<CertificateEntity> certificates = new LinkedHashSet<>();
    @Builder.Default
    @NonNull
    @OneToMany(mappedBy = "course")
    private Set<CourseEnrollmentEntity> courseEnrollments = new LinkedHashSet<>();
    @Builder.Default
    @NonNull
    @OneToMany(mappedBy = "course")
    private Set<CourseReviewEntity> courseReviews = new LinkedHashSet<>();
    @Builder.Default
    @NonNull
    @ManyToMany
    @JoinTable(name = "course_tags", joinColumns = { @JoinColumn(name = "course_id") }, inverseJoinColumns = {
            @JoinColumn(name = "tag_id") })
    private Set<TagEntity> tags = new LinkedHashSet<>();

    public void addTag(TagEntity tag) {
        if (this.tags == null) {
            this.tags = new LinkedHashSet<>();
        }
        this.tags.add(tag);
    }

    public void addChapter(ChapterEntity chapter) {
        chapterEntities.add(chapter);
        chapter.setCourseEntity(this);
    }

    public void removeChapter(ChapterEntity chapter) {
        chapterEntities.remove(chapter);
        chapter.setCourseEntity(null);
    }
}
