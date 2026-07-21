package com.app.features.payments.service.impl;

import com.app.exception.AccessDeniedException;
import com.app.features.model.CourseEntity;
import com.app.features.model.InvoiceEntity;
import com.app.features.model.PaymentEntity;
import com.app.features.model.UserEntity;
import com.app.features.model.enums.InvoiceStatus;
import com.app.features.model.enums.PaymentProvider;
import com.app.features.model.enums.PaymentStatus;
import com.app.features.payments.dto.PayOSPaymentStatus;
import com.app.features.payments.dto.PaymentSyncResponse;
import com.app.features.payments.repository.PaymentRepository;
import com.app.features.payments.service.PaymentCallbackService;
import com.app.features.payments.service.PayOSService;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class PaymentStatusServiceImplTest {

    @Test
    void paidPayosStatusCompletesOwnedInvoice() {
        PaymentRepository paymentRepository = mock(PaymentRepository.class);
        PayOSService payOSService = mock(PayOSService.class);
        PaymentCallbackService callbackService = mock(PaymentCallbackService.class);
        PaymentStatusServiceImpl service = new PaymentStatusServiceImpl(paymentRepository, payOSService, callbackService);
        PaymentEntity payment = payment(7L);
        PayOSPaymentStatus gatewayStatus = new PayOSPaymentStatus(
                payment.getTransactionId(),
                "PAID",
                payment.getAmount(),
                "payment-link-id",
                Map.of("status", "PAID")
        );

        when(paymentRepository.findFirstByInvoice_IdOrderByIdDesc(8L)).thenReturn(Optional.of(payment));
        when(payOSService.getPaymentStatus(payment.getTransactionId())).thenReturn(gatewayStatus);
        when(callbackService.applyVerifiedResult(eq(PaymentProvider.PAYOS), any(), anyMap()))
                .thenAnswer(invocation -> {
                    payment.getInvoice().setStatus(InvoiceStatus.PAID);
                    payment.setStatus(PaymentStatus.SUCCESS);
                    return invocation.getArgument(1);
                });

        PaymentSyncResponse response = service.syncPayment(8L, 7L);

        assertTrue(response.paid());
        assertTrue(response.terminal());
        assertEquals(InvoiceStatus.PAID, response.invoiceStatus());
        assertEquals(PaymentStatus.SUCCESS, response.paymentStatus());
        verify(callbackService).applyVerifiedResult(eq(PaymentProvider.PAYOS), any(), anyMap());
    }

    @Test
    void pendingPayosStatusDoesNotCompleteInvoice() {
        PaymentRepository paymentRepository = mock(PaymentRepository.class);
        PayOSService payOSService = mock(PayOSService.class);
        PaymentCallbackService callbackService = mock(PaymentCallbackService.class);
        PaymentStatusServiceImpl service = new PaymentStatusServiceImpl(paymentRepository, payOSService, callbackService);
        PaymentEntity payment = payment(7L);

        when(paymentRepository.findFirstByInvoice_IdOrderByIdDesc(8L)).thenReturn(Optional.of(payment));
        when(payOSService.getPaymentStatus(payment.getTransactionId())).thenReturn(new PayOSPaymentStatus(
                payment.getTransactionId(),
                "PENDING",
                BigDecimal.ZERO,
                "payment-link-id",
                Map.of("status", "PENDING")
        ));

        PaymentSyncResponse response = service.syncPayment(8L, 7L);

        assertFalse(response.paid());
        assertFalse(response.terminal());
        assertEquals(InvoiceStatus.PENDING, response.invoiceStatus());
        verify(callbackService, never()).applyVerifiedResult(any(), any(), anyMap());
    }

    @Test
    void userCannotSyncAnotherUsersInvoice() {
        PaymentRepository paymentRepository = mock(PaymentRepository.class);
        PayOSService payOSService = mock(PayOSService.class);
        PaymentCallbackService callbackService = mock(PaymentCallbackService.class);
        PaymentStatusServiceImpl service = new PaymentStatusServiceImpl(paymentRepository, payOSService, callbackService);

        when(paymentRepository.findFirstByInvoice_IdOrderByIdDesc(8L)).thenReturn(Optional.of(payment(7L)));

        assertThrows(AccessDeniedException.class, () -> service.syncPayment(8L, 99L));
        verify(payOSService, never()).getPaymentStatus(any());
    }

    private PaymentEntity payment(Long userId) {
        UserEntity user = new UserEntity();
        user.setId(userId);
        CourseEntity course = new CourseEntity();
        course.setId(3L);
        InvoiceEntity invoice = new InvoiceEntity();
        invoice.setId(8L);
        invoice.setUser(user);
        invoice.setCourse(course);
        invoice.setStatus(InvoiceStatus.PENDING);

        PaymentEntity payment = new PaymentEntity();
        payment.setId(7L);
        payment.setInvoice(invoice);
        payment.setProvider(PaymentProvider.PAYOS);
        payment.setTransactionId("175000000000008");
        payment.setAmount(new BigDecimal("499000.00"));
        payment.setStatus(PaymentStatus.CREATED);
        return payment;
    }
}
