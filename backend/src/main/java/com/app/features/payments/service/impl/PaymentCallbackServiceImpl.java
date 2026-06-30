package com.app.features.payments.service.impl;

import com.app.exception.ResourceNotFoundException;
import com.app.features.model.CouponEntity;
import com.app.features.model.InvoiceEntity;
import com.app.features.model.PaymentEntity;
import com.app.features.model.enums.InvoiceStatus;
import com.app.features.model.enums.PaymentProvider;
import com.app.features.payments.converter.InvoiceConverter;
import com.app.features.payments.converter.PaymentConverter;
import com.app.features.payments.dto.PaymentVerifyResponse;
import com.app.features.payments.gateway.PaymentGateway;
import com.app.features.payments.gateway.PaymentGatewayFactory;
import com.app.features.payments.repository.InvoiceRepository;
import com.app.features.payments.repository.PaymentRepository;
import com.app.features.payments.service.PaymentCallbackService;
import com.app.features.payments.service.PaymentSubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class PaymentCallbackServiceImpl implements PaymentCallbackService {
    private final PaymentGatewayFactory paymentGatewayFactory;
    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final PaymentSubscriptionService paymentSubscriptionService;
    private final InvoiceConverter invoiceConverter;
    private final PaymentConverter paymentConverter;

    @Override
    @Transactional
    public PaymentVerifyResponse handleCallback(PaymentProvider provider, Map<String, String> params) {
        PaymentGateway gateway = paymentGatewayFactory.getGateway(provider);
        PaymentVerifyResponse verifyResponse = gateway.verifyCallback(params);

        if (!verifyResponse.valid()) {
            throw new IllegalArgumentException("Invalid payment signature");
        }

        PaymentEntity payment = paymentRepository.findFirstByTransactionIdOrderByIdDesc(verifyResponse.invoiceCode())
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for invoice: " + verifyResponse.invoiceCode()));
        InvoiceEntity invoice = payment.getInvoice();

        if (invoice.getStatus() == InvoiceStatus.PAID) {
            return verifyResponse;
        }

        paymentConverter.applyCallback(payment, provider, verifyResponse, params);
        paymentRepository.save(payment);

        invoiceConverter.applyPaymentResult(invoice, verifyResponse.success());
        if (verifyResponse.success()) {
            increaseCouponUsage(invoice);
            paymentSubscriptionService.activateFromPaidInvoice(invoice, payment);
        }
        invoiceRepository.save(invoice);

        return verifyResponse;
    }

    private void increaseCouponUsage(InvoiceEntity invoice) {
        CouponEntity coupon = invoice.getCoupon();
        if (coupon == null) {
            return;
        }

        int usedCount = coupon.getUsedCount() == null ? 0 : coupon.getUsedCount();
        coupon.setUsedCount(usedCount + 1);
    }
}
