package com.app.model.user.entity;

import com.app.model.course.entity.CourseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.jspecify.annotations.NonNull;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.List;
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

    @Column(nullable = false)
    private String password;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "userEntity", cascade = CascadeType.ALL)
    private List<UserSubcriptionEntity> subscriptions;
    @Size(max = 255)
    @NotNull
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;
    @ColumnDefault("'ACTIVE'")
    @Lob
    @Column(name = "status")
    private String status;
    @ColumnDefault("0")
    @Column(name = "total_learning_points")
    private Integer totalLearningPoints;
    @Size(max = 50)
    @Column(name = "referral_code", length = 50)
    private String referralCode;
    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "updated_at")
    private Instant updatedAt;
    @NonNull
    @OneToMany
    @JoinColumn(name = "user_id")
    private Set<com.app.model.user.entity.AssignmentSubmission> assignmentSubmissions = new LinkedHashSet<>();
    @NonNull
    @OneToMany
    @JoinColumn(name = "user_id")
    private Set<com.app.model.user.entity.Certificate> certificates = new LinkedHashSet<>();
    @NonNull
    @OneToMany
    @JoinColumn(name = "created_by")
    private Set<com.app.model.user.entity.Coupon> coupons = new LinkedHashSet<>();
    @NonNull
    @OneToMany
    @JoinColumn(name = "user_id")
    private Set<com.app.model.user.entity.CourseEnrollment> courseEnrollments = new LinkedHashSet<>();
    @NonNull
    @OneToMany
    @JoinColumn(name = "user_id")
    private Set<com.app.model.user.entity.CourseReview> courseReviews = new LinkedHashSet<>();
    @NonNull
    @OneToMany
    @JoinColumn(name = "teacher_id")
    private Set<CourseEntity> courses = new LinkedHashSet<>();
    @NonNull
    @OneToMany
    @JoinColumn(name = "user_id")
    private Set<com.app.model.user.entity.Invoice> invoices = new LinkedHashSet<>();
    @NonNull
    @OneToMany
    @JoinColumn(name = "user_id")
    private Set<com.app.model.user.entity.LessonProgress> lessonProgresses = new LinkedHashSet<>();
    @NonNull
    @OneToMany
    @JoinColumn(name = "user_id")
    private Set<com.app.model.user.entity.LessonQa> lessonQas = new LinkedHashSet<>();
    @NonNull
    @OneToMany
    @JoinColumn(name = "user_id")
    private Set<com.app.model.user.entity.Notification> notifications = new LinkedHashSet<>();
    @NonNull
    @OneToMany
    @JoinColumn(name = "user_id")
    private Set<com.app.model.user.entity.QuizAttempt> quizAttempts = new LinkedHashSet<>();
    @NonNull
    @OneToMany
    @JoinColumn(name = "referrer_id")
    private Set<com.app.model.user.entity.Referral> referrals = new LinkedHashSet<>();
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "referred_user_id")
    private com.app.model.user.entity.Referral referral;
    @NonNull
    @OneToMany
    @JoinColumn(name = "user_id")
    private Set<com.app.model.user.entity.Refund> refunds = new LinkedHashSet<>();
    @NonNull
    @OneToMany
    @JoinColumn(name = "resolved_by")
    private Set<com.app.model.user.entity.Report> reports = new LinkedHashSet<>();
    @NonNull
    @OneToMany
    @JoinColumn(name = "user_id")
    private Set<com.app.model.user.entity.UserBadge> userBadges = new LinkedHashSet<>();
    @NonNull
    @ManyToMany
    @JoinTable(name = "user_roles", joinColumns = {@JoinColumn(name = "user_id")}, inverseJoinColumns = {@JoinColumn(name = "role_id")})
    private Set<com.app.model.user.entity.Role> roles = new LinkedHashSet<>();
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private com.app.model.user.entity.UserStreak userStreak;
}
