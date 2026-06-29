package com.app.features.payments.dto;

import com.app.features.model.enums.PaymentProvider;

import java.math.BigDecimal;

public record PaymentCreateResponse(
        Long invoiceId,
        String invoiceCode,
        PaymentProvider provider,
        BigDecimal amount,
        String paymentUrl,
        String qrCode,
        String paymentLink
) {
}
