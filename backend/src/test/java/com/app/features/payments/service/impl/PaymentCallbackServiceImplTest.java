package com.app.features.payments.service.impl;

import com.app.features.learning.repository.ICourseEnrollmentRepository;
import com.app.features.model.CourseEnrollmentEntity;
import com.app.features.model.CourseEntity;
import com.app.features.model.InvoiceEntity;
import com.app.features.model.PaymentEntity;
import com.app.features.model.UserEntity;
import com.app.features.model.enums.InvoiceStatus;
import com.app.features.model.enums.PaymentProvider;
import com.app.features.payments.converter.InvoiceConverter;
import com.app.features.payments.converter.PaymentConverter;
import com.app.features.payments.dto.PaymentVerifyResponse;
import com.app.features.payments.gateway.PaymentGateway;
import com.app.features.payments.gateway.PaymentGatewayFactory;
import com.app.features.payments.repository.InvoiceRepository;
import com.app.features.payments.repository.PaymentRepository;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class PaymentCallbackServiceImplTest {

    @Test
    void callbackFindsPaymentByProviderAndGatewayOrderCode() {
        PaymentGatewayFactory gatewayFactory = mock(PaymentGatewayFactory.class);
        InvoiceRepository invoiceRepository = mock(InvoiceRepository.class);
        PaymentRepository paymentRepository = mock(PaymentRepository.class);
        ICourseEnrollmentRepository courseEnrollmentRepository = mock(ICourseEnrollmentRepository.class);
        InvoiceConverter invoiceConverter = mock(InvoiceConverter.class);
        PaymentConverter paymentConverter = mock(PaymentConverter.class);
        PaymentCallbackServiceImpl service = new PaymentCallbackServiceImpl(
                gatewayFactory,
                invoiceRepository,
                paymentRepository,
                courseEnrollmentRepository,
                invoiceConverter,
                paymentConverter
        );

        PaymentGateway gateway = mock(PaymentGateway.class);
        Map<String, String> params = Map.of("orderCode", "175000000000008");
        PaymentVerifyResponse response = new PaymentVerifyResponse(
                true,
                true,
                "175000000000008",
                "bank-reference",
                "payOS success"
        );
        InvoiceEntity invoice = new InvoiceEntity();
        invoice.setStatus(InvoiceStatus.PAID);
        PaymentEntity payment = new PaymentEntity();
        payment.setInvoice(invoice);

        when(gatewayFactory.getGateway(PaymentProvider.PAYOS)).thenReturn(gateway);
        when(gateway.verifyCallback(params)).thenReturn(response);
        when(paymentRepository.findFirstByProviderAndTransactionIdOrderByIdDesc(
                PaymentProvider.PAYOS,
                "175000000000008"
        )).thenReturn(Optional.of(payment));

        PaymentVerifyResponse result = service.handleCallback(PaymentProvider.PAYOS, params);

        assertSame(response, result);
        verify(paymentRepository).findFirstByProviderAndTransactionIdOrderByIdDesc(
                PaymentProvider.PAYOS,
                "175000000000008"
        );
    }

    @Test
    void successfulCallbackEnrollsUserInPurchasedCourse() {
        PaymentGatewayFactory gatewayFactory = mock(PaymentGatewayFactory.class);
        InvoiceRepository invoiceRepository = mock(InvoiceRepository.class);
        PaymentRepository paymentRepository = mock(PaymentRepository.class);
        ICourseEnrollmentRepository courseEnrollmentRepository = mock(ICourseEnrollmentRepository.class);
        InvoiceConverter invoiceConverter = mock(InvoiceConverter.class);
        PaymentConverter paymentConverter = mock(PaymentConverter.class);
        PaymentCallbackServiceImpl service = new PaymentCallbackServiceImpl(
                gatewayFactory,
                invoiceRepository,
                paymentRepository,
                courseEnrollmentRepository,
                invoiceConverter,
                paymentConverter
        );

        PaymentGateway gateway = mock(PaymentGateway.class);
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

        when(gatewayFactory.getGateway(PaymentProvider.PAYOS)).thenReturn(gateway);
        when(gateway.verifyCallback(params)).thenReturn(response);
        when(paymentRepository.findFirstByProviderAndTransactionIdOrderByIdDesc(
                PaymentProvider.PAYOS,
                "175000000000009"
        )).thenReturn(Optional.of(payment));
        when(courseEnrollmentRepository.findByUser_IdAndCourse_Id(7L, 1L)).thenReturn(Optional.empty());

        assertSame(response, service.handleCallback(PaymentProvider.PAYOS, params));

        ArgumentCaptor<CourseEnrollmentEntity> enrollmentCaptor = ArgumentCaptor.forClass(CourseEnrollmentEntity.class);
        verify(courseEnrollmentRepository).save(enrollmentCaptor.capture());
        assertSame(user, enrollmentCaptor.getValue().getUser());
        assertSame(course, enrollmentCaptor.getValue().getCourse());
        verify(invoiceConverter).applyPaymentResult(invoice, true);
        verify(invoiceRepository).save(invoice);
    }
}
