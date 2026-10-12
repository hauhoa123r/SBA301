package com.app.features.feedback.repository;

import com.app.features.feedback.model.FeedbackForm;
import org.springframework.data.jpa.repository.*;
import jakarta.persistence.LockModeType;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface FeedbackFormRepository extends JpaRepository<FeedbackForm, Long> {
    Optional<FeedbackForm> findByActiveSlot(Integer slot);
    @Lock(LockModeType.PESSIMISTIC_WRITE) @Query("select f from FeedbackForm f where f.id = :id")
    Optional<FeedbackForm> lockById(@Param("id") Long id);
}
