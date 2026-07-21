package com.app.features.payments.dto;

import jakarta.validation.constraints.NotNull;

public record PaymentCreateRequest(
        @NotNull Long courseId,
        String couponCode
) {
}
