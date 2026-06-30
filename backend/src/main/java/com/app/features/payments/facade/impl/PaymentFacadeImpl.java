package com.app.features.payments.facade.impl;

import com.app.features.model.enums.PaymentProvider;
import com.app.features.payments.dto.PaymentCreateRequest;
import com.app.features.payments.dto.PaymentCreateResponse;
import com.app.features.payments.dto.PaymentVerifyResponse;
import com.app.features.payments.facade.PaymentFacade;
import com.app.features.payments.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class PaymentFacadeImpl implements PaymentFacade {
    private static final long DEMO_USER_ID = 1L;

    private final PaymentService paymentService;

    @Value("${app.frontend.payment-result-url:http://localhost:5173/payment/result}")
    private String paymentResultUrl;

    @Override
    public PaymentCreateResponse createPayment(PaymentCreateRequest request, Long userId) {
        Long resolvedUserId = userId == null ? DEMO_USER_ID : userId;
        return paymentService.createPayment(request, resolvedUserId);
    }

    @Override
    public String handleRedirectCallback(PaymentProvider provider, Map<String, String> params) {
        PaymentVerifyResponse response = paymentService.handleCallback(provider, params);
        return paymentResultUrl
                + "?success=" + response.success()
                + "&invoiceCode=" + encode(response.invoiceCode())
                + "&message=" + encode(response.message());
    }

    @Override
    public PaymentVerifyResponse handleWebhook(PaymentProvider provider, Map<String, Object> body) {
        if (provider == PaymentProvider.PAYOS) {
            return paymentService.handleCallback(provider, stringifyPayosPayload(body));
        }
        return paymentService.handleCallback(provider, stringify(body));
    }

    @SuppressWarnings("unchecked")
    private Map<String, String> stringifyPayosPayload(Map<String, Object> body) {
        Map<String, String> params = new LinkedHashMap<>();
        Object data = body.get("data");
        if (data instanceof Map<?, ?> dataMap) {
            dataMap.forEach((key, value) -> params.put(String.valueOf(key), String.valueOf(value)));
        }
        if (body.get("signature") != null) {
            params.put("signature", String.valueOf(body.get("signature")));
        }
        return params;
    }

    private Map<String, String> stringify(Map<String, Object> body) {
        return body.entrySet().stream()
                .collect(Collectors.toMap(Map.Entry::getKey, entry -> String.valueOf(entry.getValue())));
    }

    private String encode(String value) {
        return URLEncoder.encode(value == null ? "" : value, StandardCharsets.UTF_8);
    }
}
