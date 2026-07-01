package com.app.features.plans.service;

import com.app.features.model.PlanEntity;
import com.app.features.plans.dto.response.PlanResponse;


import java.util.List;

public interface IPlanService {
    public List<PlanEntity> findAllByIds(List<Long> planIds);

    public List<PlanResponse> getAllPlans();
}
