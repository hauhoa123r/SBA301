package com.app.features.payments.service;

import com.app.features.model.InvoiceEntity;
import com.app.features.payments.dto.PayOSPaymentStatus;
import com.app.features.payments.dto.PaymentCreateRequest;
import com.app.features.payments.dto.PaymentCreateResponse;
import com.app.features.payments.dto.PaymentVerifyResponse;

import java.util.Map;

public interface PayOSService {
    PaymentCreateResponse createPayment(PaymentCreateRequest request, InvoiceEntity invoice, String invoiceCode);

    PaymentVerifyResponse verifyCallback(Map<String, String> params);

    PayOSPaymentStatus getPaymentStatus(String transactionId);
}
