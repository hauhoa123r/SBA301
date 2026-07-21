package com.app.features.payments.service;

import com.app.features.payments.dto.PaymentSyncResponse;

public interface PaymentStatusService {
    PaymentSyncResponse syncPayment(Long invoiceId, Long userId);
}
