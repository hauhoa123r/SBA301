package com.app.features.payments.service;

import com.app.features.model.enums.PaymentProvider;
import com.app.features.payments.dto.PaymentVerifyResponse;

import java.util.Map;

public interface PaymentCallbackService {
    PaymentVerifyResponse handleCallback(PaymentProvider provider, Map<String, String> params);
}
