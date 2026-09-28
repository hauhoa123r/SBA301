package com.app.features.subscriptions;

import com.app.exception.BadRequestException;
import com.app.features.learning.repository.ICourseEnrollmentRepository;
import com.app.features.model.*;
import com.app.features.payments.repository.PaymentUserRepository;
import com.app.features.subscriptions.repository.*;
import com.app.features.subscriptions.service.SubscriptionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.time.*;
import java.time.temporal.ChronoUnit;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;

class SubscriptionServiceTest {
    private final Instant now = Instant.parse("2026-09-28T00:00:00Z");
    private final SubscriptionPlanRepository plans = mock(SubscriptionPlanRepository.class);
    private final UserSubscriptionRepository repository = mock(UserSubscriptionRepository.class);
    private final PaymentUserRepository users = mock(PaymentUserRepository.class);
    private final ICourseEnrollmentRepository enrollments = mock(ICourseEnrollmentRepository.class);
    private final Map<Long,UserSubscriptionEntity> stored = new HashMap<>();
    private final SubscriptionService service = new SubscriptionService(plans,repository,users,enrollments,Clock.fixed(now,ZoneOffset.UTC));

    @BeforeEach
    void setup() {
        when(users.findByIdForUpdate(7L)).thenReturn(Optional.of(new UserEntity()));
        when(repository.findById(anyLong())).thenAnswer(call -> Optional.ofNullable(stored.get(call.getArgument(0))));
        when(repository.findByUserIdForUpdate(anyLong())).thenAnswer(call -> Optional.ofNullable(stored.get(call.getArgument(0))));
        when(repository.save(any())).thenAnswer(call -> { UserSubscriptionEntity s=call.getArgument(0); stored.put(s.getUserId(),s); return s; });
        when(enrollments.findByUser_Id(7L)).thenReturn(List.of());
        SubscriptionPlanEntity trial=new SubscriptionPlanEntity(); trial.setCode("FREE_TRIAL"); trial.setDurationDays(3);
        when(plans.findByCodeAndActiveTrue("FREE_TRIAL")).thenReturn(Optional.of(trial));
    }

    @Test
    void trialGrantsThreeDaysAndCannotBeClaimedAgain() {
        var status=service.startTrial(7L);
        assertTrue(status.active()); assertFalse(status.trialAvailable());
        assertEquals(now.plus(3,ChronoUnit.DAYS),status.expiresAt());
        assertThrows(BadRequestException.class,()->service.startTrial(7L));
        verify(users,times(2)).findByIdForUpdate(7L);
    }

    @Test
    void expiredTrialCannotBeReclaimed() {
        service.startTrial(7L); stored.get(7L).setExpiresAt(now);
        assertFalse(service.hasActiveAccess(7L));
        assertThrows(BadRequestException.class,()->service.startTrial(7L));
    }

    @Test
    void paidPlanStartsThirtyDaysAndBlocksTrial() {
        service.activatePaidInvoice(invoice("STANDARD"));
        assertEquals(now.plus(30,ChronoUnit.DAYS),stored.get(7L).getExpiresAt());
        assertThrows(BadRequestException.class,()->service.startTrial(7L));
    }

    @Test
    void renewalPreservesRemainingPaidDays() {
        service.activatePaidInvoice(invoice("STANDARD"));
        service.activatePaidInvoice(invoice("PREMIUM"));
        assertEquals(now.plus(60,ChronoUnit.DAYS),stored.get(7L).getExpiresAt());
        assertEquals("PREMIUM",stored.get(7L).getPlanCode());
    }

    @Test
    void upgradingTrialStartsThirtyPaidDaysAtPayment() {
        service.startTrial(7L); service.activatePaidInvoice(invoice("PREMIUM"));
        assertEquals(now.plus(30,ChronoUnit.DAYS),stored.get(7L).getExpiresAt());
    }

    @Test
    void renewalAfterExpiryStartsFromNow() {
        service.activatePaidInvoice(invoice("STANDARD"));
        stored.get(7L).setExpiresAt(now.minus(1,ChronoUnit.DAYS));
        assertFalse(service.hasActiveAccess(7L));
        service.activatePaidInvoice(invoice("STANDARD"));
        assertTrue(service.hasActiveAccess(7L));
        assertEquals(now.plus(30,ChronoUnit.DAYS),stored.get(7L).getExpiresAt());
    }

    private InvoiceEntity invoice(String code) {
        UserEntity user=new UserEntity(); user.setId(7L);
        InvoiceEntity invoice=new InvoiceEntity(); invoice.setUser(user);
        invoice.setSubscriptionPlanCode(code); invoice.setSubscriptionDurationDays(30);
        return invoice;
    }
}
