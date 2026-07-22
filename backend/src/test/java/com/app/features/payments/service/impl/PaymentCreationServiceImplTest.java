package com.app.features.payments.service.impl;

import com.app.exception.BadRequestException;
import com.app.features.courses.repository.ICourseRepository;
import com.app.features.coupons.repository.ICouponRepository;
import com.app.features.learning.repository.ICourseEnrollmentRepository;
import com.app.features.model.CourseEntity;
import com.app.features.model.InvoiceEntity;
import com.app.features.model.PaymentEntity;
import com.app.features.model.UserEntity;
import com.app.features.model.enums.PaymentProvider;
import com.app.features.model.enums.InvoiceStatus;
import com.app.features.payments.converter.InvoiceConverter;
import com.app.features.payments.converter.PaymentConverter;
import com.app.features.payments.dto.PaymentCreateRequest;
import com.app.features.payments.dto.PaymentCreateResponse;
import com.app.features.payments.repository.InvoiceRepository;
import com.app.features.payments.repository.PaymentRepository;
import com.app.features.payments.repository.PaymentUserRepository;
import com.app.features.payments.service.PayOSService;
import org.junit.jupiter.api.Test;
import org.modelmapper.ModelMapper;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class PaymentCreationServiceImplTest {

    @Test
    void pendingInvoiceSnapshotsCurrentCoursePrice() {
        InvoiceConverter converter = new InvoiceConverter(new ModelMapper(), mock(ICouponRepository.class));
        UserEntity user = new UserEntity();
        CourseEntity course = new CourseEntity();
        course.setPrice(new BigDecimal("499000.00"));

        InvoiceEntity invoice = converter.toPendingInvoice(user, course);

        assertSame(user, invoice.getUser());
        assertSame(course, invoice.getCourse());
        assertEquals(new BigDecimal("499000.00"), invoice.getOriginalAmount());
        assertEquals(new BigDecimal("499000.00"), invoice.getAmount());
        assertEquals(BigDecimal.ZERO, invoice.getDiscountAmount());
        assertEquals(InvoiceStatus.PENDING, invoice.getStatus());
    }

    @Test
    void payosOrderCodeIsStoredAsPaymentTransactionId() {
        PayOSService payOSService = mock(PayOSService.class);
        InvoiceRepository invoiceRepository = mock(InvoiceRepository.class);
        PaymentRepository paymentRepository = mock(PaymentRepository.class);
        ICourseRepository courseRepository = mock(ICourseRepository.class);
        PaymentUserRepository userRepository = mock(PaymentUserRepository.class);
        ICourseEnrollmentRepository courseEnrollmentRepository = mock(ICourseEnrollmentRepository.class);
        InvoiceConverter invoiceConverter = mock(InvoiceConverter.class);
        PaymentConverter paymentConverter = mock(PaymentConverter.class);
        PaymentCreationServiceImpl service = new PaymentCreationServiceImpl(
                payOSService,
                invoiceRepository,
                paymentRepository,
                courseRepository,
                userRepository,
                courseEnrollmentRepository,
                invoiceConverter,
                paymentConverter
        );

        PaymentCreateRequest request = new PaymentCreateRequest(1L, null);
        CourseEntity course = new CourseEntity();
        UserEntity user = new UserEntity();
        InvoiceEntity invoice = new InvoiceEntity();
        invoice.setId(8L);
        invoice.setAmount(BigDecimal.valueOf(199_000));
        PaymentEntity payment = new PaymentEntity();
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
        when(userRepository.findById(7L)).thenReturn(Optional.of(user));
        when(invoiceConverter.toPendingInvoice(user, course)).thenReturn(invoice);
        when(payOSService.createPayment(request, invoice, "INV-8")).thenReturn(gatewayResponse);
        when(paymentConverter.toCreatedPayment(
                invoice,
                PaymentProvider.PAYOS,
                "175000000000008",
                "INV-8",
                course
        )).thenReturn(payment);

        PaymentCreateResponse result = service.createPayment(request, 7L);

        assertSame(gatewayResponse, result);
        verify(paymentConverter).toCreatedPayment(
                invoice,
                PaymentProvider.PAYOS,
                "175000000000008",
                "INV-8",
                course
        );
        verify(paymentRepository).save(payment);
    }

    @Test
    void paymentCreationRejectsCourseAlreadyOwnedByUser() {
        PayOSService payOSService = mock(PayOSService.class);
        InvoiceRepository invoiceRepository = mock(InvoiceRepository.class);
        PaymentRepository paymentRepository = mock(PaymentRepository.class);
        ICourseRepository courseRepository = mock(ICourseRepository.class);
        PaymentUserRepository userRepository = mock(PaymentUserRepository.class);
        ICourseEnrollmentRepository courseEnrollmentRepository = mock(ICourseEnrollmentRepository.class);
        InvoiceConverter invoiceConverter = mock(InvoiceConverter.class);
        PaymentConverter paymentConverter = mock(PaymentConverter.class);
        PaymentCreationServiceImpl service = new PaymentCreationServiceImpl(
                payOSService,
                invoiceRepository,
                paymentRepository,
                courseRepository,
                userRepository,
                courseEnrollmentRepository,
                invoiceConverter,
                paymentConverter
        );
        CourseEntity course = new CourseEntity();
        course.setId(2L);
        UserEntity user = new UserEntity();
        when(courseRepository.findById(2L)).thenReturn(Optional.of(course));
        when(userRepository.findById(16L)).thenReturn(Optional.of(user));
        when(courseEnrollmentRepository.existsByUser_IdAndCourse_Id(16L, 2L)).thenReturn(true);

        assertThrows(BadRequestException.class,
                () -> service.createPayment(new PaymentCreateRequest(2L, null), 16L));

        verifyNoInteractions(invoiceConverter, payOSService, paymentRepository);
    }
}
