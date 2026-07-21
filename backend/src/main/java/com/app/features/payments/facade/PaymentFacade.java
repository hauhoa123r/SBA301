package com.app.features.payments.facade;

import com.app.features.payments.dto.PaymentCreateRequest;
import com.app.features.payments.dto.PaymentCreateResponse;
import com.app.features.payments.dto.PaymentVerifyResponse;
import com.app.features.payments.dto.PaymentSyncResponse;

import java.util.Map;

public interface PaymentFacade {
    PaymentCreateResponse createPayment(PaymentCreateRequest request, Long userId);

    PaymentVerifyResponse handlePayosWebhook(Map<String, Object> body);

    PaymentSyncResponse syncPayment(Long invoiceId, Long userId);
}
