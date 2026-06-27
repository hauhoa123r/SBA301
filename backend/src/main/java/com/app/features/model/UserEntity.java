package com.app.features.model;

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
    private Set<SubscriptionEntity> subscriptions = new LinkedHashSet<>();
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
    private Set<AssignmentSubmissionEntity> assignmentSubmissions = new LinkedHashSet<>();
    @NonNull
    @OneToMany
    @JoinColumn(name = "user_id")
    private Set<CertificateEntity> certificates = new LinkedHashSet<>();
    @NonNull
    @OneToMany
    @JoinColumn(name = "created_by")
    private Set<CouponEntity> coupons = new LinkedHashSet<>();
    @NonNull
    @OneToMany
    @JoinColumn(name = "user_id")
    private Set<CourseEnrollmentEntity> courseEnrollments = new LinkedHashSet<>();
    @NonNull
    @OneToMany
    @JoinColumn(name = "user_id")
    private Set<CourseReviewEntity> courseReviews = new LinkedHashSet<>();
    @NonNull
    @OneToMany
    @JoinColumn(name = "teacher_id")
    private Set<CourseEntity> courses = new LinkedHashSet<>();
    @NonNull
    @OneToMany
    @JoinColumn(name = "user_id")
    private Set<InvoiceEntity> invoices = new LinkedHashSet<>();
    @NonNull
    @OneToMany
    @JoinColumn(name = "user_id")
    private Set<LessonProgressEntity> lessonProgresses = new LinkedHashSet<>();
    @NonNull
    @OneToMany
    @JoinColumn(name = "user_id")
    private Set<LessonQaEntity> lessonQas = new LinkedHashSet<>();
    @NonNull
    @OneToMany
    @JoinColumn(name = "user_id")
    private Set<NotificationEntity> notifications = new LinkedHashSet<>();
    @NonNull
    @OneToMany(mappedBy = "user")
    private Set<QuizAttemptEntity> quizAttempts = new LinkedHashSet<>();
    @NonNull
    @OneToMany(mappedBy = "referrer")
    private Set<ReferralEntity> referrals = new LinkedHashSet<>();
    @OneToOne(mappedBy = "referredUser", fetch = FetchType.LAZY)
    private ReferralEntity referral;
    @NonNull
    @OneToMany
    @JoinColumn(name = "user_id")
    private Set<RefundEntity> refunds = new LinkedHashSet<>();
    @NonNull
    @OneToMany
    @JoinColumn(name = "resolved_by")
    private Set<ReportEntity> reports = new LinkedHashSet<>();
    @NonNull
    @OneToMany
    @JoinColumn(name = "user_id")
    private Set<UserBadgeEntity> userBadges = new LinkedHashSet<>();
    @NonNull
    @ManyToMany
    @JoinTable(name = "user_roles", joinColumns = {@JoinColumn(name = "user_id")}, inverseJoinColumns = {@JoinColumn(name = "role_id")})
    private Set<RoleEntity> roles = new LinkedHashSet<>();
    @OneToOne(mappedBy = "user", fetch = FetchType.LAZY)
    private UserStreakEntity userStreak;
}
