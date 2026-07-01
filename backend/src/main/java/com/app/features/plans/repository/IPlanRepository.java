package com.app.features.plans.repository;

import com.app.features.model.PlanEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IPlanRepository extends JpaRepository<PlanEntity,Long> {
}
