package com.app.features.payments.service.impl;

import com.app.exception.ResourceNotFoundException;
import com.app.features.courses.repository.ICourseRepository;
import com.app.features.model.CourseEntity;
import com.app.features.model.InvoiceEntity;
import com.app.features.model.PaymentEntity;
import com.app.features.model.PlanEntity;
import com.app.features.model.UserEntity;
import com.app.features.payments.converter.InvoiceConverter;
import com.app.features.payments.converter.PaymentConverter;
import com.app.features.payments.converter.PaymentPlanConverter;
import com.app.features.payments.dto.PaymentCreateRequest;
import com.app.features.payments.dto.PaymentCreateResponse;
import com.app.features.payments.gateway.PaymentGateway;
import com.app.features.payments.gateway.PaymentGatewayFactory;
import com.app.features.payments.repository.InvoiceRepository;
import com.app.features.payments.repository.PaymentRepository;
import com.app.features.payments.repository.PaymentUserRepository;
import com.app.features.payments.service.PaymentCreationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentCreationServiceImpl implements PaymentCreationService {
    private final PaymentGatewayFactory paymentGatewayFactory;
    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final ICourseRepository courseRepository;
    private final PaymentUserRepository paymentUserRepository;
    private final InvoiceConverter invoiceConverter;
    private final PaymentConverter paymentConverter;
    private final PaymentPlanConverter paymentPlanConverter;

    @Override
    @Transactional
    public PaymentCreateResponse createPayment(PaymentCreateRequest request, Long userId) {
        log.info("Payment creation requested, userId={}, courseId={}, provider={}", userId, request.courseId(), request.provider());
        CourseEntity course = courseRepository.findById(request.courseId())
                .orElseThrow(() -> {
                    log.warn("Payment creation failed because course was not found, courseId={}", request.courseId());
                    return new ResourceNotFoundException("Course not found with id: " + request.courseId());
                });
        PlanEntity plan = paymentPlanConverter.resolvePurchasablePlan(course, request.planId());
        UserEntity user = paymentUserRepository.findById(userId)
                .orElseThrow(() -> {
                    log.warn("Payment creation failed because user was not found, userId={}", userId);
                    return new ResourceNotFoundException("User not found with id: " + userId);
                });

        InvoiceEntity invoice = invoiceConverter.toPendingInvoice(user, plan);
        invoiceConverter.applyCoupon(invoice, request.couponCode());
        invoiceRepository.save(invoice);

        String invoiceCode = "INV-" + invoice.getId();
        PaymentGateway gateway = paymentGatewayFactory.getGateway(request.provider());
        PaymentCreateResponse gatewayResponse = gateway.createPayment(request, invoice, invoiceCode);

        String transactionId = gatewayResponse.orderCode() == null || gatewayResponse.orderCode().isBlank()
                ? invoiceCode
                : gatewayResponse.orderCode();
        PaymentEntity payment = paymentConverter.toCreatedPayment(
                invoice,
                request.provider(),
                transactionId,
                invoiceCode,
                course,
                plan
        );
        paymentRepository.save(payment);

        log.info("Payment created successfully, paymentId={}, invoiceId={}, userId={}, provider={}", payment.getId(), invoice.getId(), userId, request.provider());
        return gatewayResponse;
    }
}
