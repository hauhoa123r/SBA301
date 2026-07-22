package com.app.features.refunds.dto.response;

import com.app.features.model.enums.PaymentProvider;
import com.app.features.model.enums.PaymentStatus;
import com.app.features.model.enums.RefundStatus;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.Instant;

@Builder
public record RefundResponse(
        Long id,
        Long paymentId,
        Long invoiceId,
        Long userId,
        String learner,
        Long courseId,
        String course,
        BigDecimal amount,
        String reason,
        RefundStatus status,
        PaymentProvider paymentProvider,
        PaymentStatus paymentStatus,
        String transactionId,
        Long processedById,
        String processedByName,
        Instant requestedAt,
        Instant processedAt
) {
}