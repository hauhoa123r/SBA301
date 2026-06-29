package com.app.features.payments.converter;

import com.app.exception.ResourceNotFoundException;
import com.app.features.model.CourseEntity;
import com.app.features.model.PlanEntity;
import org.springframework.stereotype.Component;

import java.util.Comparator;

@Component
public class PaymentPlanConverter {
    public PlanEntity resolvePurchasablePlan(CourseEntity course, Long planId) {
        if (course.getPlans() == null || course.getPlans().isEmpty()) {
            throw new ResourceNotFoundException("Course has no purchasable plan");
        }

        if (planId != null) {
            return course.getPlans()
                    .stream()
                    .filter(plan -> plan.getId().equals(planId))
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("Plan not found in this course: " + planId));
        }

        return course.getPlans()
                .stream()
                .min(Comparator.comparing(PlanEntity::getPrice))
                .orElseThrow(() -> new ResourceNotFoundException("Course has no purchasable plan"));
    }
}
