package com.app.features.payments.facade.impl;

import com.app.features.model.enums.PaymentProvider;
import com.app.features.payments.dto.PaymentCreateRequest;
import com.app.features.payments.dto.PaymentCreateResponse;
import com.app.features.payments.dto.PaymentVerifyResponse;
import com.app.features.payments.dto.PaymentSyncResponse;
import com.app.features.payments.facade.PaymentFacade;
import com.app.features.payments.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class PaymentFacadeImpl implements PaymentFacade {
    private final PaymentService paymentService;

    @Override
    public PaymentCreateResponse createPayment(PaymentCreateRequest request, Long userId) {
        return paymentService.createPayment(request, userId);
    }

    @Override
    public PaymentVerifyResponse handlePayosWebhook(Map<String, Object> body) {
        return paymentService.handleCallback(PaymentProvider.PAYOS, stringifyPayosPayload(body));
    }

    @Override
    public PaymentSyncResponse syncPayment(Long invoiceId, Long userId) {
        return paymentService.syncPayment(invoiceId, userId);
    }

    @SuppressWarnings("unchecked")
    private Map<String, String> stringifyPayosPayload(Map<String, Object> body) {
        Map<String, String> params = new LinkedHashMap<>();
        Object data = body.get("data");
        if (data instanceof Map<?, ?> dataMap) {
            dataMap.forEach((key, value) -> params.put(
                    String.valueOf(key),
                    value == null || "null".equals(value) || "undefined".equals(value) ? "" : String.valueOf(value)
            ));
        }
        if (body.get("signature") != null) {
            params.put("signature", String.valueOf(body.get("signature")));
        }
        return params;
    }

}
