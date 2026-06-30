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
public class VNPayAdapter implements PaymentGateway {
    @Override
    public PaymentCreateResponse createPayment(PaymentCreateRequest request, InvoiceEntity invoice, String invoiceCode) {
        String paymentUrl = "/api/payments/vnpay-return?vnp_TxnRef=%s&vnp_ResponseCode=00&vnp_TransactionNo=DEMO-VNPAY-%s"
                .formatted(invoiceCode, invoice.getId());
        return new PaymentCreateResponse(invoice.getId(), invoiceCode, provider(), invoice.getAmount(), paymentUrl, null, null, null, null, null, null, null);
    }

    @Override
    public PaymentVerifyResponse verifyCallback(Map<String, String> params) {
        String invoiceCode = params.get("vnp_TxnRef");
        boolean success = "00".equals(params.get("vnp_ResponseCode"));
        return new PaymentVerifyResponse(true, success, invoiceCode, params.get("vnp_TransactionNo"), success ? "VNPay success" : "VNPay failed");
    }

    @Override
    public PaymentProvider provider() {
        return PaymentProvider.VNPAY;
    }
}
