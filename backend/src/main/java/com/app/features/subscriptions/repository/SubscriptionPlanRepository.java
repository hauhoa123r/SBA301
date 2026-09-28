package com.app.features.subscriptions.repository;

import com.app.features.model.SubscriptionPlanEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlanEntity, String> {
    List<SubscriptionPlanEntity> findByActiveTrueOrderByPriceAsc();
    Optional<SubscriptionPlanEntity> findByCodeAndActiveTrue(String code);
}
