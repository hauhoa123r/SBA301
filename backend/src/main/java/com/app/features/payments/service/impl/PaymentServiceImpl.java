package com.app.features.payments.service.impl;

import com.app.features.model.enums.PaymentProvider;
import com.app.features.payments.dto.PaymentCreateRequest;
import com.app.features.payments.dto.PaymentCreateResponse;
import com.app.features.payments.dto.PaymentVerifyResponse;
import com.app.features.payments.service.PaymentCallbackService;
import com.app.features.payments.service.PaymentCreationService;
import com.app.features.payments.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {
    private final PaymentCreationService paymentCreationService;
    private final PaymentCallbackService paymentCallbackService;

    @Override
    public PaymentCreateResponse createPayment(PaymentCreateRequest request, Long userId) {
        return paymentCreationService.createPayment(request, userId);
    }

    @Override
    public PaymentVerifyResponse handleCallback(PaymentProvider provider, Map<String, String> params) {
        return paymentCallbackService.handleCallback(provider, params);
    }
}
