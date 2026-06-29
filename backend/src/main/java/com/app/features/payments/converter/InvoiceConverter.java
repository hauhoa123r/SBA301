package com.app.features.payments.converter;

import com.app.features.model.InvoiceEntity;
import com.app.features.model.PlanEntity;
import com.app.features.model.SubscriptionEntity;
import com.app.features.model.UserEntity;
import com.app.features.model.enums.InvoiceStatus;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class InvoiceConverter {
    private final ModelMapper modelMapper;

    public InvoiceConverter(ModelMapper modelMapper) {
        this.modelMapper = modelMapper;
    }

    public InvoiceEntity toPendingInvoice(UserEntity user, PlanEntity plan) {
        InvoiceEntity source = new InvoiceEntity();
        source.setOriginalAmount(plan.getPrice());
        source.setDiscountAmount(BigDecimal.ZERO);
        source.setAmount(plan.getPrice());
        source.setStatus(InvoiceStatus.PENDING);

        InvoiceEntity invoice = modelMapper.map(source, InvoiceEntity.class);
        invoice.setUser(user);
        return invoice;
    }

    public void applyPaymentResult(InvoiceEntity invoice, boolean success) {
        invoice.setStatus(success ? InvoiceStatus.PAID : InvoiceStatus.FAILED);
    }

    public void attachSubscription(InvoiceEntity invoice, SubscriptionEntity subscription) {
        invoice.setSubscription(subscription);
    }
}
