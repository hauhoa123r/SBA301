package com.app.features.contact.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.Instant;

@Entity
@Table(name = "contact_messages", indexes = {
    @Index(name = "idx_contact_created", columnList = "created_at,id"),
    @Index(name = "idx_contact_status_created", columnList = "status,created_at,id")
})
@Getter @Setter
public class ContactMessage {
    public enum Status { NEW, RESOLVED }
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "full_name", nullable = false, length = 100) private String fullName;
    @Column(nullable = false, length = 254) private String email;
    @Column(nullable = false, length = 100) private String topic;
    @Column(nullable = false, length = 5000) private String message;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private Status status = Status.NEW;
    @Column(name = "created_at", nullable = false) private Instant createdAt = Instant.now();
    @Column(name = "user_id") private Long userId;
    @Column(name = "reply_text", length = 5000) private String replyText;
    @Column(name = "replied_at") private Instant repliedAt;
    @Column(name = "replied_by") private Long repliedBy;
}
