package com.app.features.payments.dto;

public record PaymentVerifyResponse(
        boolean valid,
        boolean success,
        String invoiceCode,
        String gatewayTransactionId,
        String message
) {
}
