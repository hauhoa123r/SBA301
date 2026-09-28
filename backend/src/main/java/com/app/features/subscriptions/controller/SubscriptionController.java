package com.app.features.subscriptions.controller;

import com.app.features.model.SubscriptionPlanEntity;
import com.app.features.subscriptions.service.SubscriptionService;
import com.app.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {
    private final SubscriptionService subscriptions;

    @GetMapping("/plans")
    public List<SubscriptionPlanEntity> plans() { return subscriptions.listPlans(); }

    @GetMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public SubscriptionService.Status status() {
        return subscriptions.status(SecurityUtils.getCurrentUser().getId());
    }

    @PostMapping("/trial")
    @PreAuthorize("hasRole('STUDENT')")
    public SubscriptionService.Status trial() {
        return subscriptions.startTrial(SecurityUtils.getCurrentUser().getId());
    }
}
