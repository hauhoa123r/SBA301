package com.app.features.payments.dto;

import com.app.features.model.enums.InvoiceStatus;
import com.app.features.model.enums.PaymentProvider;
import com.app.features.model.enums.PaymentStatus;

public record PaymentSyncResponse(
        Long invoiceId,
        String invoiceCode,
        Long courseId,
        PaymentProvider provider,
        InvoiceStatus invoiceStatus,
        PaymentStatus paymentStatus,
        String providerStatus,
        boolean paid,
        boolean terminal,
        String message
) {
}
