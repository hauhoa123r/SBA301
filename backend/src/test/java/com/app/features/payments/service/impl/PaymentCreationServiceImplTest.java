package com.app.features.payments.service.impl;

import com.app.exception.BadRequestException;
import com.app.features.coupons.repository.ICouponRepository;
import com.app.features.model.*;
import com.app.features.model.enums.PaymentProvider;
import com.app.features.payments.converter.*;
import com.app.features.payments.dto.*;
import com.app.features.payments.repository.*;
import com.app.features.payments.service.PayOSService;
import com.app.features.subscriptions.service.SubscriptionService;
import org.junit.jupiter.api.Test;
import org.modelmapper.ModelMapper;
import org.mockito.ArgumentCaptor;
import java.math.BigDecimal;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;

class PaymentCreationServiceImplTest {
    private final PayOSService gateway = mock(PayOSService.class);
    private final InvoiceRepository invoices = mock(InvoiceRepository.class);
    private final PaymentRepository payments = mock(PaymentRepository.class);
    private final PaymentUserRepository users = mock(PaymentUserRepository.class);
    private final SubscriptionService subscriptions = mock(SubscriptionService.class);
    private final InvoiceConverter converter = new InvoiceConverter(new ModelMapper(), mock(ICouponRepository.class));
    private final PaymentCreationServiceImpl service = new PaymentCreationServiceImpl(gateway, invoices, payments, users, subscriptions, converter, new PaymentConverter(new ModelMapper()));

    @Test
    void snapshotsPlanPriceAndDurationInsteadOfCoursePrice() {
        SubscriptionPlanEntity plan = plan("STANDARD", 699000);
        InvoiceEntity invoice = converter.toPendingSubscriptionInvoice(new UserEntity(), plan);
        plan.setPrice(BigDecimal.ONE);
        plan.setDurationDays(90);
        assertNull(invoice.getCourse());
        assertEquals("STANDARD", invoice.getSubscriptionPlanCode());
        assertEquals(30, invoice.getSubscriptionDurationDays());
        assertEquals(BigDecimal.valueOf(699000), invoice.getAmount());
    }

    @Test
    void createsGatewayPaymentForServerPricedPlan() {
        SubscriptionPlanEntity plan = plan("PREMIUM", 899000);
        when(subscriptions.requirePlan("PREMIUM")).thenReturn(plan);
        when(users.findById(7L)).thenReturn(Optional.of(new UserEntity()));
        when(invoices.save(any())).thenAnswer(call -> { InvoiceEntity invoice = call.getArgument(0); invoice.setId(8L); return invoice; });
        PaymentCreateResponse response = new PaymentCreateResponse(8L,"INV-8",PaymentProvider.PAYOS,plan.getPrice(),"https://pay.payos.vn/test","qr","https://pay.payos.vn/test","link","Account","012345","INV-8","12345678");
        when(gateway.createPayment(any(),any(),eq("INV-8"))).thenReturn(response);
        assertSame(response, service.createPayment(new PaymentCreateRequest("PREMIUM",null),7L));
        ArgumentCaptor<PaymentEntity> payment = ArgumentCaptor.forClass(PaymentEntity.class);
        verify(payments).save(payment.capture());
        assertEquals("12345678", payment.getValue().getTransactionId());
        assertEquals(BigDecimal.valueOf(899000), payment.getValue().getAmount());
        assertEquals("PREMIUM", payment.getValue().getInvoice().getSubscriptionPlanCode());
    }

    @Test
    void rejectsFreeTrialThroughPaymentEndpoint() {
        when(subscriptions.requirePlan("FREE_TRIAL")).thenReturn(plan("FREE_TRIAL",0));
        assertThrows(BadRequestException.class, () -> service.createPayment(new PaymentCreateRequest("FREE_TRIAL",null),7L));
        verifyNoInteractions(gateway,invoices,payments);
    }

    private SubscriptionPlanEntity plan(String code, long price) {
        SubscriptionPlanEntity plan = new SubscriptionPlanEntity();
        plan.setCode(code); plan.setPrice(BigDecimal.valueOf(price)); plan.setDurationDays(30);
        return plan;
    }
}
