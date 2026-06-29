package com.app.features.payments.service;

import com.app.features.model.InvoiceEntity;
import com.app.features.model.PaymentEntity;

public interface PaymentSubscriptionService {
    void activateFromPaidInvoice(InvoiceEntity invoice, PaymentEntity payment);
}
