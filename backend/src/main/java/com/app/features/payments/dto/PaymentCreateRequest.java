package com.app.features.payments.dto;

import com.app.features.model.enums.PaymentProvider;
import jakarta.validation.constraints.NotNull;

public record PaymentCreateRequest(
        @NotNull Long courseId,
        @NotNull PaymentProvider provider,
        String couponCode
) {
}
