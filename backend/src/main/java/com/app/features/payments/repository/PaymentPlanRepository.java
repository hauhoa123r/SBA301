package com.app.features.payments.repository;

import com.app.features.model.PlanEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentPlanRepository extends JpaRepository<PlanEntity, Long> {
}
