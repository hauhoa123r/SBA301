package com.app.features.plans.service;

import com.app.features.model.PlanEntity;


import java.util.List;

public interface IPlanService {
    public List<PlanEntity> findAllById(List<Long> planIds);
}
