package com.app.features.payments.service.impl;

import com.app.exception.ResourceNotFoundException;
import com.app.features.learning.repository.ICourseEnrollmentRepository;
import com.app.features.model.CouponEntity;
import com.app.features.model.CourseEnrollmentEntity;
import com.app.features.model.CourseEntity;
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
    private final PaymentGatewayFactory paymentGatewayFactory;
    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final ICourseEnrollmentRepository courseEnrollmentRepository;
    private final InvoiceConverter invoiceConverter;
    private final PaymentConverter paymentConverter;

    @Override
    @Transactional
    public PaymentVerifyResponse handleCallback(PaymentProvider provider, Map<String, String> params) {
        log.info("Payment callback received, provider={}", provider);
        PaymentGateway gateway = paymentGatewayFactory.getGateway(provider);
        PaymentVerifyResponse verifyResponse = gateway.verifyCallback(params);

        if (!verifyResponse.valid()) {
            log.warn("Payment callback rejected due to invalid signature, provider={}", provider);
            throw new IllegalArgumentException("Invalid payment signature");
        }

        PaymentEntity payment = paymentRepository
                .findFirstByProviderAndTransactionIdOrderByIdDesc(provider, verifyResponse.invoiceCode())
                .orElseThrow(() -> {
                    log.warn("Payment callback has no matching payment, provider={}, transactionId={}", provider, verifyResponse.invoiceCode());
                    return new ResourceNotFoundException("Payment not found for transaction: " + verifyResponse.invoiceCode());
                });
        InvoiceEntity invoice = payment.getInvoice();

        if (invoice.getStatus() == InvoiceStatus.PAID) {
            log.info("Payment callback ignored because invoice is already paid, paymentId={}, invoiceId={}", payment.getId(), invoice.getId());
            return verifyResponse;
        }

        paymentConverter.applyCallback(payment, provider, verifyResponse, params);
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
        if (courseEnrollmentRepository.findByUser_IdAndCourse_Id(userId, courseId).isPresent()) {
            log.info("Course enrollment already exists, userId={}, courseId={}", userId, courseId);
            return;
        }

        CourseEnrollmentEntity enrollment = new CourseEnrollmentEntity();
        enrollment.setUser(invoice.getUser());
        enrollment.setCourse(course);
        enrollment.setEnrolledAt(Instant.now());
        courseEnrollmentRepository.save(enrollment);
        log.info("Course enrollment activated, userId={}, courseId={}", userId, courseId);
    }
}
