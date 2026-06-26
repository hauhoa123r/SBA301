package com.app.features.model;

import com.app.model.user.entity.UserEntity;
import com.app.features.model.enums.AssignmentSubmissionStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "assignment_submissions", schema = "chinese_online_learning")
public class AssignmentSubmission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "assignment_id", nullable = false)
    private Assignment assignment;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @Lob
    @Column(name = "submission_text")
    private String submissionText;

    @Size(max = 500)
    @Column(name = "file_url", length = 500)
    private String fileUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private AssignmentSubmissionStatus status = AssignmentSubmissionStatus.SUBMITTED;

    @Column(name = "score")
    private Integer score;

    @Lob
    @Column(name = "teacher_feedback")
    private String teacherFeedback;

    @Column(name = "submitted_at", insertable = false, updatable = false)
    private Instant submittedAt;

    @Column(name = "graded_at")
    private Instant gradedAt;


}
