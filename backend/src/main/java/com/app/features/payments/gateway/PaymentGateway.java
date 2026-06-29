package com.app.features.payments.gateway;

import com.app.features.model.InvoiceEntity;
import com.app.features.model.enums.PaymentProvider;
import com.app.features.payments.dto.PaymentCreateRequest;
import com.app.features.payments.dto.PaymentCreateResponse;
import com.app.features.payments.dto.PaymentVerifyResponse;

import java.util.Map;

public interface PaymentGateway {
    PaymentCreateResponse createPayment(PaymentCreateRequest request, InvoiceEntity invoice, String invoiceCode);

    PaymentVerifyResponse verifyCallback(Map<String, String> params);

    PaymentProvider provider();
}
