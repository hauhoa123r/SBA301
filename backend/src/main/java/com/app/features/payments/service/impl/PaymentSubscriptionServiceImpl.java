package com.app.features.payments.service.impl;

import com.app.exception.ResourceNotFoundException;
import com.app.features.model.InvoiceEntity;
import com.app.features.model.PaymentEntity;
import com.app.features.model.PlanEntity;
import com.app.features.model.SubscriptionEntity;
import com.app.features.model.enums.SubscriptionStatus;
import com.app.features.payments.converter.InvoiceConverter;
import com.app.features.payments.converter.SubscriptionConverter;
import com.app.features.payments.repository.PaymentPlanRepository;
import com.app.features.payments.repository.SubscriptionRepository;
import com.app.features.payments.service.PaymentSubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

import static com.app.utils.NumberUtils.toLong;

@Service
@RequiredArgsConstructor
public class PaymentSubscriptionServiceImpl implements PaymentSubscriptionService {
    private final PaymentPlanRepository paymentPlanRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final InvoiceConverter invoiceConverter;
    private final SubscriptionConverter subscriptionConverter;

    @Override
    public void activateFromPaidInvoice(InvoiceEntity invoice, PaymentEntity payment) {
        Long planId = resolvePlanId(payment);
        if (planId == null) {
            return;
        }

        PlanEntity plan = paymentPlanRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("Plan not found with id: " + planId));
        if (subscriptionRepository.existsByUserAndPlanAndStatus(invoice.getUser(), plan, SubscriptionStatus.ACTIVE)) {
            return;
        }

        SubscriptionEntity subscription = subscriptionConverter.toActiveSubscription(invoice.getUser(), plan, LocalDate.now());
        subscriptionRepository.save(subscription);
        invoiceConverter.attachSubscription(invoice, subscription);
    }

    private Long resolvePlanId(PaymentEntity payment) {
        Object planIdValue = payment.getRawResponse() == null ? null : payment.getRawResponse().get("planId");
        return toLong(planIdValue);
    }
}
