package com.app.features.plans.service.impl;

import com.app.exception.BadRequestException;
import com.app.features.model.PlanEntity;
import com.app.features.plans.dto.response.PlanResponse;
import com.app.features.plans.repository.IPlanRepository;
import com.app.features.plans.service.IPlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PlanService implements IPlanService {
    private final IPlanRepository planRepository;

    @Autowired
    public PlanService(IPlanRepository planRepository) {
        this.planRepository = planRepository;
    }

    @Override
    public List<PlanEntity> findAllByIds(List<Long> planIds) {
        if(planIds == null || planIds.isEmpty()){
            return List.of();
        }
        List<PlanEntity> planEntities = planRepository.findAllById(planIds);
        if(planEntities.size() != planIds.size()){
            throw new BadRequestException("Have planId in list does not exist.");
        }
        return planEntities;
    }

    private PlanResponse toPlanResponse(PlanEntity planEntity){
        PlanResponse planResponse = new PlanResponse();
        planResponse.setId(planEntity.getId());
        planResponse.setName(planEntity.getName());
        planResponse.setPrice(planEntity.getPrice());
        planResponse.setDurationDay(planResponse.getDurationDay());
        return planResponse;
    }

    @Override
    public List<PlanResponse> getAllPlans() {
        List<PlanEntity> planEntities = planRepository.findAll();
        return planEntities.stream().map(planEntity -> toPlanResponse(planEntity)).collect(Collectors.toList());
    }

}
