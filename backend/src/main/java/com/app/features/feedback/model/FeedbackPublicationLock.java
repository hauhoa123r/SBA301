package com.app.features.feedback.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

/** A seeded singleton serializes publication across backend instances. */
@Entity @Table(name = "feedback_publication_lock") @Getter @Setter
public class FeedbackPublicationLock {
    @Id private Integer id;
}
