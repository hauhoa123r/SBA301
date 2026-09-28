package com.app.features.payments.dto;

import jakarta.validation.constraints.NotBlank;

public record PaymentCreateRequest(
        @NotBlank String planCode,
        String couponCode
) {
}
