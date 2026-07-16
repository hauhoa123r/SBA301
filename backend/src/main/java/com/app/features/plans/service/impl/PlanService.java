package com.app.features.plans.service.impl;

import com.app.exception.BadRequestException;
import com.app.features.model.PlanEntity;
import com.app.features.plans.dto.response.PlanResponse;
import com.app.features.plans.repository.IPlanRepository;
import com.app.features.plans.service.IPlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class PlanService implements IPlanService {
    private final IPlanRepository planRepository;

    @Autowired
    public PlanService(IPlanRepository planRepository) {
        this.planRepository = planRepository;
    }

    @Override
    public List<PlanEntity> findAllByIds(List<Long> planIds) {
        if(planIds == null || planIds.isEmpty()){
            log.debug("Plan lookup skipped because planIds is empty");
            return List.of();
        }
        List<PlanEntity> planEntities = planRepository.findAllById(planIds);
        if(planEntities.size() != planIds.size()){
            log.warn("One or more plans were not found, requestedCount={}, foundCount={}", planIds.size(), planEntities.size());
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
        if (planEntities.isEmpty()) {
            log.warn("Plan list is empty");
        }
        log.info("Plans loaded successfully, planCount={}", planEntities.size());
        return planEntities.stream().map(planEntity -> toPlanResponse(planEntity)).collect(Collectors.toList());
    }

}
