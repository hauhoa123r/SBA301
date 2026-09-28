package com.app.features.payments.service.impl;

import com.app.features.learning.repository.ICourseEnrollmentRepository;
import com.app.features.model.CourseEntity;
import com.app.features.model.InvoiceEntity;
import com.app.features.model.PaymentEntity;
import com.app.features.model.UserEntity;
import com.app.features.model.enums.InvoiceStatus;
import com.app.features.model.enums.PaymentProvider;
import com.app.features.payments.converter.InvoiceConverter;
import com.app.features.payments.converter.PaymentConverter;
import com.app.features.payments.dto.PaymentVerifyResponse;
import com.app.features.payments.repository.InvoiceRepository;
import com.app.features.payments.repository.PaymentRepository;
import com.app.features.payments.service.PayOSService;
import com.app.features.subscriptions.service.SubscriptionService;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;
import java.math.BigDecimal;
import com.app.exception.BadRequestException;
import com.app.features.coupons.repository.ICouponRepository;
import org.modelmapper.ModelMapper;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class PaymentCallbackServiceImplTest {

    @Test
    void subscriptionPaymentActivatesOnlyOnceEvenWhenCallbacksRepeatOrArriveOutOfOrder() {
        var fixture = new SubscriptionCallbackFixture();
        fixture.service.applyVerifiedResult(PaymentProvider.PAYOS, fixture.result(true, true), Map.of("amount", 699000));
        fixture.service.applyVerifiedResult(PaymentProvider.PAYOS, fixture.result(true, true), Map.of("amountPaid", 699000));
        fixture.service.applyVerifiedResult(PaymentProvider.PAYOS, fixture.result(true, false), Map.of());
        verify(fixture.subscriptions, times(1)).activatePaidInvoice(fixture.invoice);
        verifyNoInteractions(fixture.enrollments);
        assertEquals(InvoiceStatus.PAID, fixture.invoice.getStatus());
    }

    @Test
    void incorrectOrMissingAmountCannotActivateSubscription() {
        var fixture = new SubscriptionCallbackFixture();
        for (Map<String, ?> details : java.util.List.<Map<String, ?>>of(Map.of(), Map.of("amount", 1), Map.of("amount", "invalid"))) {
            assertThrows(BadRequestException.class, () -> fixture.service.applyVerifiedResult(
                    PaymentProvider.PAYOS, fixture.result(true, true), details));
        }
        verifyNoInteractions(fixture.subscriptions);
        assertEquals(InvoiceStatus.PENDING, fixture.invoice.getStatus());
    }

    @Test
    void invalidOrFailedPaymentCannotActivateSubscription() {
        var fixture = new SubscriptionCallbackFixture();
        assertThrows(BadRequestException.class, () -> fixture.service.applyVerifiedResult(
                PaymentProvider.PAYOS, fixture.result(false, true), Map.of("amount", 699000)));
        fixture.service.applyVerifiedResult(PaymentProvider.PAYOS, fixture.result(true, false), Map.of());
        verifyNoInteractions(fixture.subscriptions);
        assertEquals(InvoiceStatus.FAILED, fixture.invoice.getStatus());
    }

    private static class SubscriptionCallbackFixture {
        final SubscriptionService subscriptions = mock(SubscriptionService.class);
        final ICourseEnrollmentRepository enrollments = mock(ICourseEnrollmentRepository.class);
        final InvoiceEntity invoice = new InvoiceEntity();
        final PaymentCallbackServiceImpl service;

        SubscriptionCallbackFixture() {
            var invoices = mock(InvoiceRepository.class);
            var payments = mock(PaymentRepository.class);
            invoice.setId(100L);
            invoice.setSubscriptionPlanCode("STANDARD");
            invoice.setSubscriptionDurationDays(30);
            invoice.setStatus(InvoiceStatus.PENDING);
            PaymentEntity payment = new PaymentEntity();
            payment.setInvoice(invoice);
            payment.setAmount(new BigDecimal("699000"));
            when(payments.findFirstByProviderAndTransactionIdOrderByIdDesc(PaymentProvider.PAYOS, "123"))
                    .thenReturn(Optional.of(payment));
            when(invoices.findByIdForUpdate(100L)).thenReturn(Optional.of(invoice));
            service = new PaymentCallbackServiceImpl(mock(PayOSService.class), invoices, payments, enrollments,
                    new InvoiceConverter(new ModelMapper(), mock(ICouponRepository.class)),
                    mock(PaymentConverter.class), mock(EntityManager.class), subscriptions);
        }

        PaymentVerifyResponse result(boolean valid, boolean success) {
            return new PaymentVerifyResponse(valid, success, "123", "bank-ref", "test");
        }
    }

    @Test
    void callbackFindsPaymentByProviderAndGatewayOrderCode() {
        PayOSService payOSService = mock(PayOSService.class);
        InvoiceRepository invoiceRepository = mock(InvoiceRepository.class);
        PaymentRepository paymentRepository = mock(PaymentRepository.class);
        ICourseEnrollmentRepository courseEnrollmentRepository = mock(ICourseEnrollmentRepository.class);
        InvoiceConverter invoiceConverter = mock(InvoiceConverter.class);
        PaymentConverter paymentConverter = mock(PaymentConverter.class);
        EntityManager entityManager = mock(EntityManager.class);
        PaymentCallbackServiceImpl service = new PaymentCallbackServiceImpl(
                payOSService,
                invoiceRepository,
                paymentRepository,
                courseEnrollmentRepository,
                invoiceConverter,
                paymentConverter,
                entityManager,
                mock(SubscriptionService.class)
        );

        Map<String, String> params = Map.of("orderCode", "175000000000008");
        PaymentVerifyResponse response = new PaymentVerifyResponse(
                true,
                true,
                "175000000000008",
                "bank-reference",
                "payOS success"
        );
        InvoiceEntity invoice = new InvoiceEntity();
        invoice.setId(8L);
        invoice.setStatus(InvoiceStatus.PAID);
        PaymentEntity payment = new PaymentEntity();
        payment.setInvoice(invoice);

        when(payOSService.verifyCallback(params)).thenReturn(response);
        when(paymentRepository.findFirstByProviderAndTransactionIdOrderByIdDesc(
                PaymentProvider.PAYOS,
                "175000000000008"
        )).thenReturn(Optional.of(payment));
        when(invoiceRepository.findByIdForUpdate(8L)).thenReturn(Optional.of(invoice));

        PaymentVerifyResponse result = service.handleCallback(PaymentProvider.PAYOS, params);

        assertSame(response, result);
        verify(paymentRepository).findFirstByProviderAndTransactionIdOrderByIdDesc(
                PaymentProvider.PAYOS,
                "175000000000008"
        );
    }

    @Test
    void successfulCallbackEnrollsUserInPurchasedCourse() {
        PayOSService payOSService = mock(PayOSService.class);
        InvoiceRepository invoiceRepository = mock(InvoiceRepository.class);
        PaymentRepository paymentRepository = mock(PaymentRepository.class);
        ICourseEnrollmentRepository courseEnrollmentRepository = mock(ICourseEnrollmentRepository.class);
        InvoiceConverter invoiceConverter = mock(InvoiceConverter.class);
        PaymentConverter paymentConverter = mock(PaymentConverter.class);
        EntityManager entityManager = mock(EntityManager.class);
        PaymentCallbackServiceImpl service = new PaymentCallbackServiceImpl(
                payOSService,
                invoiceRepository,
                paymentRepository,
                courseEnrollmentRepository,
                invoiceConverter,
                paymentConverter,
                entityManager,
                mock(SubscriptionService.class)
        );

        Map<String, String> params = Map.of("orderCode", "175000000000009");
        PaymentVerifyResponse response = new PaymentVerifyResponse(
                true,
                true,
                "175000000000009",
                "bank-reference",
                "payOS success"
        );
        UserEntity user = new UserEntity();
        user.setId(7L);
        CourseEntity course = new CourseEntity();
        course.setId(1L);
        InvoiceEntity invoice = new InvoiceEntity();
        invoice.setId(8L);
        invoice.setStatus(InvoiceStatus.PENDING);
        invoice.setUser(user);
        invoice.setCourse(course);
        PaymentEntity payment = new PaymentEntity();
        payment.setId(9L);
        payment.setInvoice(invoice);

        when(payOSService.verifyCallback(params)).thenReturn(response);
        when(paymentRepository.findFirstByProviderAndTransactionIdOrderByIdDesc(
                PaymentProvider.PAYOS,
                "175000000000009"
        )).thenReturn(Optional.of(payment));
        when(invoiceRepository.findByIdForUpdate(8L)).thenReturn(Optional.of(invoice));
        when(courseEnrollmentRepository.insertIfAbsent(any(), any(), any())).thenReturn(1);

        assertSame(response, service.handleCallback(PaymentProvider.PAYOS, params));

        verify(courseEnrollmentRepository).insertIfAbsent(org.mockito.ArgumentMatchers.eq(7L),
                org.mockito.ArgumentMatchers.eq(1L), any());
        verify(invoiceConverter).applyPaymentResult(invoice, true);
        verify(invoiceRepository).save(invoice);
    }
}
