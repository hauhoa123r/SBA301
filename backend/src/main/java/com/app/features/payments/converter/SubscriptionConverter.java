package com.app.features.payments.converter;

import com.app.features.model.PlanEntity;
import com.app.features.model.SubscriptionEntity;
import com.app.features.model.UserEntity;
import com.app.features.model.enums.SubscriptionStatus;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class SubscriptionConverter {
    private final ModelMapper modelMapper;

    public SubscriptionConverter(ModelMapper modelMapper) {
        this.modelMapper = modelMapper;
    }

    public SubscriptionEntity toActiveSubscription(UserEntity user, PlanEntity plan, LocalDate startDate) {
        SubscriptionEntity source = new SubscriptionEntity();
        source.setStartDate(startDate);
        source.setEndDate(startDate.plusDays(plan.getDurationDays()));
        source.setStatus(SubscriptionStatus.ACTIVE);

        SubscriptionEntity subscription = modelMapper.map(source, SubscriptionEntity.class);
        subscription.setUser(user);
        subscription.setPlan(plan);
        return subscription;
    }
}
