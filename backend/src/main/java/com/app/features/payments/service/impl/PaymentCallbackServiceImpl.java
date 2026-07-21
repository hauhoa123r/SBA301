package com.app.features.payments.service.impl;

import com.app.exception.ResourceNotFoundException;
import com.app.features.learning.repository.ICourseEnrollmentRepository;
import com.app.features.model.CouponEntity;
import com.app.features.model.CourseEntity;
import com.app.features.model.InvoiceEntity;
import com.app.features.model.PaymentEntity;
import com.app.features.model.enums.InvoiceStatus;
import com.app.features.model.enums.PaymentProvider;
import com.app.features.payments.converter.InvoiceConverter;
import com.app.features.payments.converter.PaymentConverter;
import com.app.features.payments.dto.PaymentVerifyResponse;
import com.app.features.payments.repository.InvoiceRepository;
import com.app.features.payments.repository.PaymentRepository;
import com.app.features.payments.service.PaymentCallbackService;
import com.app.features.payments.service.PayOSService;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentCallbackServiceImpl implements PaymentCallbackService {
    private final PayOSService payOSService;
    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final ICourseEnrollmentRepository courseEnrollmentRepository;
    private final InvoiceConverter invoiceConverter;
    private final PaymentConverter paymentConverter;
    private final EntityManager entityManager;

    @Override
    @Transactional
    public PaymentVerifyResponse handleCallback(PaymentProvider provider, Map<String, String> params) {
        log.info("Payment callback received, provider={}", provider);
        if (provider != PaymentProvider.PAYOS) {
            throw new IllegalArgumentException("Unsupported payment provider: " + provider);
        }
        PaymentVerifyResponse verifyResponse = payOSService.verifyCallback(params);

        if (!verifyResponse.valid()) {
            log.warn("Payment callback rejected due to invalid signature, provider={}", provider);
            throw new IllegalArgumentException("Invalid payment signature");
        }

        return applyVerifiedResult(provider, verifyResponse, params);
    }

    @Override
    @Transactional
    public PaymentVerifyResponse applyVerifiedResult(PaymentProvider provider, PaymentVerifyResponse verifyResponse,
                                                     Map<String, ?> details) {
        PaymentEntity payment = paymentRepository
                .findFirstByProviderAndTransactionIdOrderByIdDesc(provider, verifyResponse.invoiceCode())
                .orElseThrow(() -> {
                    log.warn("Payment callback has no matching payment, provider={}, transactionId={}", provider, verifyResponse.invoiceCode());
                    return new ResourceNotFoundException("Payment not found for transaction: " + verifyResponse.invoiceCode());
                });
        InvoiceEntity invoice = invoiceRepository.findByIdForUpdate(payment.getInvoice().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found for payment: " + payment.getId()));
        entityManager.refresh(invoice);
        payment.setInvoice(invoice);

        if (invoice.getStatus() == InvoiceStatus.PAID) {
            log.info("Payment callback ignored because invoice is already paid, paymentId={}, invoiceId={}", payment.getId(), invoice.getId());
            return verifyResponse;
        }

        paymentConverter.applyCallback(payment, provider, verifyResponse, details);
        paymentRepository.save(payment);

        invoiceConverter.applyPaymentResult(invoice, verifyResponse.success());
        if (verifyResponse.success()) {
            increaseCouponUsage(invoice);
            enrollStudent(invoice);
        }
        invoiceRepository.save(invoice);

        log.info("Payment callback processed successfully, paymentId={}, invoiceId={}, provider={}, success={}", payment.getId(), invoice.getId(), provider, verifyResponse.success());
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

    private void enrollStudent(InvoiceEntity invoice) {
        CourseEntity course = invoice.getCourse();
        if (course == null) {
            throw new ResourceNotFoundException("Course not found for invoice: " + invoice.getId());
        }

        Long userId = invoice.getUser().getId();
        Long courseId = course.getId();
        int inserted = courseEnrollmentRepository.insertIfAbsent(userId, courseId, Instant.now());
        if (inserted == 0) {
            log.info("Course enrollment already exists, userId={}, courseId={}", userId, courseId);
            return;
        }
        log.info("Course enrollment activated, userId={}, courseId={}", userId, courseId);
    }
}
