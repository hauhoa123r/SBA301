package com.app.features.payments.repository;

import com.app.features.model.PlanEntity;
import com.app.features.model.SubscriptionEntity;
import com.app.features.model.UserEntity;
import com.app.features.model.enums.SubscriptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubscriptionRepository extends JpaRepository<SubscriptionEntity, Long> {
    boolean existsByUserAndPlanAndStatus(UserEntity user, PlanEntity plan, SubscriptionStatus status);
}
