package com.app.features.payments.service;

import com.app.features.model.enums.PaymentProvider;
import com.app.features.payments.dto.PaymentCreateRequest;
import com.app.features.payments.dto.PaymentCreateResponse;
import com.app.features.payments.dto.PaymentVerifyResponse;

import java.util.Map;

public interface PaymentService {
    PaymentCreateResponse createPayment(PaymentCreateRequest request, Long userId);

    PaymentVerifyResponse handleCallback(PaymentProvider provider, Map<String, String> params);
}
