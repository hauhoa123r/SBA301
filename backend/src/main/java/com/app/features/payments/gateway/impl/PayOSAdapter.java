package com.app.features.payments.gateway.impl;

import com.app.features.model.InvoiceEntity;
import com.app.features.model.enums.PaymentProvider;
import com.app.features.payments.dto.PaymentCreateRequest;
import com.app.features.payments.dto.PaymentCreateResponse;
import com.app.features.payments.dto.PaymentVerifyResponse;
import com.app.features.payments.gateway.PaymentGateway;
import org.springframework.stereotype.Component;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Component
public class PayOSAdapter implements PaymentGateway {
    @Override
    public PaymentCreateResponse createPayment(PaymentCreateRequest request, InvoiceEntity invoice, String invoiceCode) {
        String paymentLink = "https://pay.payos.vn/web/" + invoiceCode;
        String qrCode = "https://api.qrserver.com/v1/create-qr-code/?size=260x260&data="
                + URLEncoder.encode(paymentLink, StandardCharsets.UTF_8);
        return new PaymentCreateResponse(invoice.getId(), invoiceCode, provider(), invoice.getAmount(), null, qrCode, paymentLink);
    }

    @Override
    public PaymentVerifyResponse verifyCallback(Map<String, String> params) {
        boolean success = "PAID".equalsIgnoreCase(params.get("status"));
        return new PaymentVerifyResponse(true, success, params.get("orderCode"), params.get("paymentLinkId"), success ? "payOS success" : "payOS failed");
    }

    @Override
    public PaymentProvider provider() {
        return PaymentProvider.PAYOS;
    }
}
