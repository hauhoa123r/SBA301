package com.app.features.feedback.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity @Table(name = "feedback_forms", uniqueConstraints = @UniqueConstraint(columnNames = "active_slot"))
@Getter @Setter
public class FeedbackForm {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, length = 200) private String title;
    @Column(nullable = false, length = 4000) private String description = "";
    @Column(nullable = false, length = 20) private String status = "DRAFT";
    @Column(name = "active_slot") private Integer activeSlot;
    @Column(name = "one_per_user", nullable = false) private boolean onePerUser = true;
    @Column(name = "starts_at") private Instant startsAt;
    @Column(name = "ends_at") private Instant endsAt;
    @Column(name = "published_at") private Instant publishedAt;
    @Column(name = "closed_at") private Instant closedAt;
    @Column(name = "created_at", nullable = false) private Instant createdAt = Instant.now();
    @Column(nullable = false) private long revision = 0;
    @OneToMany(mappedBy = "form", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("position ASC") private List<FeedbackQuestion> questions = new ArrayList<>();
}
