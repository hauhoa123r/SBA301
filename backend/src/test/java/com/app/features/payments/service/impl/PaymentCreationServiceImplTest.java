package com.app.features.payments.service.impl;

import com.app.features.courses.repository.ICourseRepository;
import com.app.features.model.CourseEntity;
import com.app.features.model.InvoiceEntity;
import com.app.features.model.PaymentEntity;
import com.app.features.model.PlanEntity;
import com.app.features.model.UserEntity;
import com.app.features.model.enums.PaymentProvider;
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
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class PaymentCreationServiceImplTest {

    @Test
    void payosOrderCodeIsStoredAsPaymentTransactionId() {
        PaymentGatewayFactory gatewayFactory = mock(PaymentGatewayFactory.class);
        InvoiceRepository invoiceRepository = mock(InvoiceRepository.class);
        PaymentRepository paymentRepository = mock(PaymentRepository.class);
        ICourseRepository courseRepository = mock(ICourseRepository.class);
        PaymentUserRepository userRepository = mock(PaymentUserRepository.class);
        InvoiceConverter invoiceConverter = mock(InvoiceConverter.class);
        PaymentConverter paymentConverter = mock(PaymentConverter.class);
        PaymentPlanConverter planConverter = mock(PaymentPlanConverter.class);
        PaymentCreationServiceImpl service = new PaymentCreationServiceImpl(
                gatewayFactory,
                invoiceRepository,
                paymentRepository,
                courseRepository,
                userRepository,
                invoiceConverter,
                paymentConverter,
                planConverter
        );

        PaymentCreateRequest request = new PaymentCreateRequest(1L, 2L, PaymentProvider.PAYOS, null);
        CourseEntity course = new CourseEntity();
        PlanEntity plan = new PlanEntity();
        UserEntity user = new UserEntity();
        InvoiceEntity invoice = new InvoiceEntity();
        invoice.setId(8L);
        invoice.setAmount(BigDecimal.valueOf(199_000));
        PaymentEntity payment = new PaymentEntity();
        PaymentGateway gateway = mock(PaymentGateway.class);
        PaymentCreateResponse gatewayResponse = new PaymentCreateResponse(
                8L,
                "INV-8",
                PaymentProvider.PAYOS,
                BigDecimal.valueOf(199_000),
                "https://pay.payos.vn/example",
                "qr-code",
                "https://pay.payos.vn/example",
                "payment-link-id",
                "Account Name",
                "0123456789",
                "INV-8",
                "175000000000008"
        );

        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
        when(planConverter.resolvePurchasablePlan(course, 2L)).thenReturn(plan);
        when(userRepository.findById(7L)).thenReturn(Optional.of(user));
        when(invoiceConverter.toPendingInvoice(user, plan)).thenReturn(invoice);
        when(gatewayFactory.getGateway(PaymentProvider.PAYOS)).thenReturn(gateway);
        when(gateway.createPayment(request, invoice, "INV-8")).thenReturn(gatewayResponse);
        when(paymentConverter.toCreatedPayment(
                invoice,
                PaymentProvider.PAYOS,
                "175000000000008",
                "INV-8",
                course,
                plan
        )).thenReturn(payment);

        PaymentCreateResponse result = service.createPayment(request, 7L);

        assertSame(gatewayResponse, result);
        verify(paymentConverter).toCreatedPayment(
                invoice,
                PaymentProvider.PAYOS,
                "175000000000008",
                "INV-8",
                course,
                plan
        );
        verify(paymentRepository).save(payment);
    }
}
