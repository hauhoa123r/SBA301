package com.app.features.user.entity;

import com.app.features.model.*;
import com.app.features.course.entity.CourseEntity;
import com.app.features.model.enums.UserStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.jspecify.annotations.NonNull;
import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.Set;

@Table(name = "users")
@Entity
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class UserEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "created_at", insertable = false, updatable = false)
    private Instant createdAt;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private Set<Subscription> subscriptions = new LinkedHashSet<>();
    @Size(max = 255)
    @NotNull
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private UserStatus status = UserStatus.ACTIVE;

    @Column(name = "total_learning_points")
    private Integer totalLearningPoints = 0;

    @Size(max = 50)
    @Column(name = "referral_code", length = 50)
    private String referralCode;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private Instant updatedAt;
    @NonNull
    @OneToMany
    @JoinColumn(name = "user_id")
    private Set<AssignmentSubmission> assignmentSubmissions = new LinkedHashSet<>();
    @NonNull
    @OneToMany
    @JoinColumn(name = "user_id")
    private Set<Certificate> certificates = new LinkedHashSet<>();
    @NonNull
    @OneToMany
    @JoinColumn(name = "created_by")
    private Set<Coupon> coupons = new LinkedHashSet<>();
    @NonNull
    @OneToMany
    @JoinColumn(name = "user_id")
    private Set<CourseEnrollment> courseEnrollments = new LinkedHashSet<>();
    @NonNull
    @OneToMany
    @JoinColumn(name = "user_id")
    private Set<CourseReview> courseReviews = new LinkedHashSet<>();
    @NonNull
    @OneToMany
    @JoinColumn(name = "teacher_id")
    private Set<CourseEntity> courses = new LinkedHashSet<>();
    @NonNull
    @OneToMany
    @JoinColumn(name = "user_id")
    private Set<Invoice> invoices = new LinkedHashSet<>();
    @NonNull
    @OneToMany
    @JoinColumn(name = "user_id")
    private Set<LessonProgress> lessonProgresses = new LinkedHashSet<>();
    @NonNull
    @OneToMany
    @JoinColumn(name = "user_id")
    private Set<LessonQa> lessonQas = new LinkedHashSet<>();
    @NonNull
    @OneToMany
    @JoinColumn(name = "user_id")
    private Set<Notification> notifications = new LinkedHashSet<>();
    @NonNull
    @OneToMany(mappedBy = "user")
    private Set<QuizAttempt> quizAttempts = new LinkedHashSet<>();
    @NonNull
    @OneToMany
    @JoinColumn(name = "referrer_id")
    private Set<Referral> referrals = new LinkedHashSet<>();
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "referred_user_id")
    private Referral referral;
    @NonNull
    @OneToMany
    @JoinColumn(name = "user_id")
    private Set<Refund> refunds = new LinkedHashSet<>();
    @NonNull
    @OneToMany
    @JoinColumn(name = "resolved_by")
    private Set<Report> reports = new LinkedHashSet<>();
    @NonNull
    @OneToMany
    @JoinColumn(name = "user_id")
    private Set<UserBadge> userBadges = new LinkedHashSet<>();
    @NonNull
    @ManyToMany
    @JoinTable(name = "user_roles", joinColumns = {@JoinColumn(name = "user_id")}, inverseJoinColumns = {@JoinColumn(name = "role_id")})
    private Set<Role> roles = new LinkedHashSet<>();
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private UserStreak userStreak;
}
