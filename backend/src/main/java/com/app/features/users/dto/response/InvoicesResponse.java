package com.app.features.users.dto.response;


import com.app.features.model.enums.InvoiceStatus;

import java.math.BigDecimal;
import java.time.Instant;

public record InvoicesResponse (
    Long id,
    Long courseId,
    String courseTitle,
    BigDecimal originalAmount,
    BigDecimal discountAmount,
    BigDecimal amount,
    InvoiceStatus status,
    Instant createdAt,
    Instant updatedAt
){}
