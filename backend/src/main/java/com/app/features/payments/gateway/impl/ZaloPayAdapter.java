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
public class ZaloPayAdapter implements PaymentGateway {
    @Override
    public PaymentCreateResponse createPayment(PaymentCreateRequest request, InvoiceEntity invoice, String invoiceCode) {
        String paymentUrl = "https://sb-openapi.zalopay.vn/pay/" + invoiceCode;
        return new PaymentCreateResponse(invoice.getId(), invoiceCode, provider(), invoice.getAmount(), paymentUrl, null, null, null, null, null, null, null);
    }

    @Override
    public PaymentVerifyResponse verifyCallback(Map<String, String> params) {
        boolean success = "1".equals(params.get("return_code"));
        return new PaymentVerifyResponse(true, success, params.get("app_trans_id"), params.get("zp_trans_id"), success ? "ZaloPay success" : "ZaloPay failed");
    }

    @Override
    public PaymentProvider provider() {
        return PaymentProvider.ZALOPAY;
    }
}
