package com.app.features.payments.service.impl;

import com.app.exception.BadRequestException;
import com.app.exception.ResourceNotFoundException;
import com.app.features.model.*;
import com.app.features.payments.converter.InvoiceConverter;
import com.app.features.payments.converter.PaymentConverter;
import com.app.features.payments.dto.PaymentCreateRequest;
import com.app.features.payments.dto.PaymentCreateResponse;
import com.app.features.payments.repository.*;
import com.app.features.payments.service.PaymentCreationService;
import com.app.features.payments.service.PayOSService;
import com.app.features.subscriptions.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PaymentCreationServiceImpl implements PaymentCreationService {
    private final PayOSService payOSService;
    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final PaymentUserRepository paymentUserRepository;
    private final SubscriptionService subscriptions;
    private final InvoiceConverter invoiceConverter;
    private final PaymentConverter paymentConverter;

    @Override
    @Transactional
    public PaymentCreateResponse createPayment(PaymentCreateRequest request, Long userId) {
        SubscriptionPlanEntity plan = subscriptions.requirePlan(request.planCode());
        if (SubscriptionService.FREE_TRIAL.equals(plan.getCode()) || plan.getPrice().signum() <= 0) {
            throw new BadRequestException("Dùng chức năng học thử để kích hoạt gói miễn phí.");
        }
        UserEntity user = paymentUserRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        InvoiceEntity invoice = invoiceConverter.toPendingSubscriptionInvoice(user, plan);
        invoiceConverter.applyCoupon(invoice, request.couponCode());
        if (invoice.getAmount().signum() <= 0) {
            throw new BadRequestException("Mã giảm giá không áp dụng cho giao dịch có số tiền bằng 0.");
        }
        invoiceRepository.save(invoice);
        String invoiceCode = "INV-" + invoice.getId();
        PaymentCreateResponse response = payOSService.createPayment(request, invoice, invoiceCode);
        String transactionId = response.orderCode() == null || response.orderCode().isBlank()
                ? invoiceCode : response.orderCode();
        paymentRepository.save(paymentConverter.toSubscriptionPayment(invoice, transactionId, invoiceCode));
        return response;
    }
}
