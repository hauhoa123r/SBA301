package com.app.model.user.entity;

import com.app.features.model.Subscription;
import com.app.model.course.entity.CourseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.jspecify.annotations.NonNull;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.Set;

@Table(name = "plans")
@Entity
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class PlanEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "duration_days", nullable = false)
    private Integer durationDays;

    @OneToMany(mappedBy = "plan", cascade = CascadeType.ALL)
    private Set<Subscription> subscriptions = new LinkedHashSet<>();

    @Column(name = "created_at", insertable = false, updatable = false)
    private Instant createdAt;
    @NonNull
    @ManyToMany(mappedBy = "plans")
    private Set<CourseEntity> courses = new LinkedHashSet<>();
    @NonNull
    @OneToMany(mappedBy = "plan")
    private Set<Subscription> subscriptions = new LinkedHashSet<>();
}
