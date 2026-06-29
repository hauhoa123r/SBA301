package com.app.features.payments.converter;

import com.app.features.model.CourseEntity;
import com.app.features.model.InvoiceEntity;
import com.app.features.model.PaymentEntity;
import com.app.features.model.PlanEntity;
import com.app.features.model.enums.PaymentProvider;
import com.app.features.model.enums.PaymentStatus;
import com.app.features.payments.dto.PaymentVerifyResponse;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class PaymentConverter {
    private final ModelMapper modelMapper;

    public PaymentConverter(ModelMapper modelMapper) {
        this.modelMapper = modelMapper;
    }

    public PaymentEntity toCreatedPayment(InvoiceEntity invoice, PaymentProvider provider, String invoiceCode, CourseEntity course, PlanEntity plan) {
        PaymentEntity source = new PaymentEntity();
        source.setProvider(provider);
        source.setTransactionId(invoiceCode);
        source.setAmount(invoice.getAmount());
        source.setStatus(PaymentStatus.CREATED);
        source.setRawResponse(new HashMap<>(Map.of(
                "courseId", course.getId(),
                "planId", plan.getId(),
                "invoiceCode", invoiceCode,
                "demo", true
        )));

        PaymentEntity payment = modelMapper.map(source, PaymentEntity.class);
        payment.setInvoice(invoice);
        return payment;
    }

    public void applyCallback(PaymentEntity payment, PaymentProvider provider, PaymentVerifyResponse verifyResponse, Map<String, String> params
    ) {
        Map<String, Object> rawResponse = payment.getRawResponse() == null
                ? new HashMap<>()
                : new HashMap<>(payment.getRawResponse());
        rawResponse.put("callback", params);
        rawResponse.put("gatewayTransactionId", verifyResponse.gatewayTransactionId() == null ? "" : verifyResponse.gatewayTransactionId());

        payment.setProvider(provider);
        payment.setStatus(verifyResponse.success() ? PaymentStatus.SUCCESS : PaymentStatus.FAILED);
        payment.setRawResponse(rawResponse);
    }
}
