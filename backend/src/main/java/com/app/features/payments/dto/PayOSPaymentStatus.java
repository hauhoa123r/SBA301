package com.app.features.payments.dto;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

public record PayOSPaymentStatus(
        String transactionId,
        String status,
        BigDecimal amountPaid,
        String gatewayTransactionId,
        Map<String, Object> rawResponse
) {
    private static final Set<String> TERMINAL_STATUSES = Set.of("PAID", "CANCELLED", "EXPIRED");

    public PayOSPaymentStatus {
        status = status == null ? "UNKNOWN" : status.trim().toUpperCase(Locale.ROOT);
        amountPaid = amountPaid == null ? BigDecimal.ZERO : amountPaid;
        rawResponse = rawResponse == null ? Map.of() : new LinkedHashMap<>(rawResponse);
    }

    public boolean paid() {
        return "PAID".equals(status);
    }

    public boolean terminal() {
        return TERMINAL_STATUSES.contains(status);
    }
}
