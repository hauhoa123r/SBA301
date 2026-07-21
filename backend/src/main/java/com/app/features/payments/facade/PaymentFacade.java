package com.app.features.payments.facade;

import com.app.features.model.enums.PaymentProvider;
import com.app.features.payments.dto.PaymentCreateRequest;
import com.app.features.payments.dto.PaymentCreateResponse;
import com.app.features.payments.dto.PaymentVerifyResponse;
import com.app.features.payments.dto.PaymentSyncResponse;

import java.util.Map;

public interface PaymentFacade {
    PaymentCreateResponse createPayment(PaymentCreateRequest request, Long userId);

    String handleRedirectCallback(PaymentProvider provider, Map<String, String> params);

    PaymentVerifyResponse handleWebhook(PaymentProvider provider, Map<String, Object> body);

    PaymentSyncResponse syncPayment(Long invoiceId, Long userId);
}
