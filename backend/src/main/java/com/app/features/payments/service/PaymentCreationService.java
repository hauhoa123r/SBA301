package com.app.features.payments.service;

import com.app.features.payments.dto.PaymentCreateRequest;
import com.app.features.payments.dto.PaymentCreateResponse;

public interface PaymentCreationService {
    PaymentCreateResponse createPayment(PaymentCreateRequest request, Long userId);
}
