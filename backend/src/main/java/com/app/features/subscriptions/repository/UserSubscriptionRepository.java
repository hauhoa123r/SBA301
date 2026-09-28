package com.app.features.subscriptions.repository;

import com.app.features.model.UserSubscriptionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import java.util.Optional;

public interface UserSubscriptionRepository extends JpaRepository<UserSubscriptionEntity, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from UserSubscriptionEntity s where s.userId = :userId")
    Optional<UserSubscriptionEntity> findByUserIdForUpdate(@Param("userId") Long userId);
}
