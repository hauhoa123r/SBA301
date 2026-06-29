package com.app.features.payments.gateway.impl;

import com.app.features.model.InvoiceEntity;
import com.app.features.model.enums.PaymentProvider;
import com.app.features.payments.dto.PaymentCreateRequest;
import com.app.features.payments.dto.PaymentCreateResponse;
import com.app.features.payments.dto.PaymentVerifyResponse;
import com.app.features.payments.gateway.PaymentGateway;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class MoMoAdapter implements PaymentGateway {
    @Override
    public PaymentCreateResponse createPayment(PaymentCreateRequest request, InvoiceEntity invoice, String invoiceCode) {
        String paymentUrl = "https://test-payment.momo.vn/pay/" + invoiceCode;
        return new PaymentCreateResponse(invoice.getId(), invoiceCode, provider(), invoice.getAmount(), paymentUrl, null, null);
    }

    @Override
    public PaymentVerifyResponse verifyCallback(Map<String, String> params) {
        boolean success = "0".equals(params.get("resultCode"));
        return new PaymentVerifyResponse(true, success, params.get("orderId"), params.get("transId"), success ? "MoMo success" : "MoMo failed");
    }

    @Override
    public PaymentProvider provider() {
        return PaymentProvider.MOMO;
    }
}
