package com.app.features.payments.service.impl;

import com.app.exception.AccessDeniedException;
import com.app.exception.BadRequestException;
import com.app.exception.ResourceNotFoundException;
import com.app.features.model.InvoiceEntity;
import com.app.features.model.PaymentEntity;
import com.app.features.model.enums.InvoiceStatus;
import com.app.features.model.enums.PaymentProvider;
import com.app.features.payments.dto.PayOSPaymentStatus;
import com.app.features.payments.dto.PaymentSyncResponse;
import com.app.features.payments.dto.PaymentVerifyResponse;
import com.app.features.payments.repository.PaymentRepository;
import com.app.features.payments.service.PaymentCallbackService;
import com.app.features.payments.service.PayOSService;
import com.app.features.payments.service.PaymentStatusService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentStatusServiceImpl implements PaymentStatusService {
    private final PaymentRepository paymentRepository;
    private final PayOSService payOSService;
    private final PaymentCallbackService paymentCallbackService;

    @Override
    @Transactional
    public PaymentSyncResponse syncPayment(Long invoiceId, Long userId) {
        PaymentEntity payment = paymentRepository.findFirstByInvoice_IdOrderByIdDesc(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for invoice: " + invoiceId));
        InvoiceEntity invoice = payment.getInvoice();
        if (!invoice.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You cannot access this payment");
        }

        if (invoice.getStatus() == InvoiceStatus.PAID) {
            return response(payment, "PAID", true, true, "Thanh toán đã được xác nhận");
        }
        if (payment.getProvider() != PaymentProvider.PAYOS) {
            throw new BadRequestException("Payment status sync is only supported for PAYOS");
        }

        PayOSPaymentStatus gatewayStatus = payOSService.getPaymentStatus(payment.getTransactionId());
        validateGatewayStatus(payment, gatewayStatus);

        if (gatewayStatus.paid()) {
            Map<String, Object> details = new LinkedHashMap<>(gatewayStatus.rawResponse());
            details.put("source", "status_sync");
            PaymentVerifyResponse verified = new PaymentVerifyResponse(
                    true,
                    true,
                    payment.getTransactionId(),
                    gatewayStatus.gatewayTransactionId(),
                    "payOS status confirmed"
            );
            paymentCallbackService.applyVerifiedResult(payment.getProvider(), verified, details);
            return response(payment, gatewayStatus.status(), true, true, "Thanh toán thành công");
        }

        String message = gatewayStatus.terminal()
                ? "Giao dịch không thành công"
                : "Đang chờ PayOS xác nhận thanh toán";
        return response(payment, gatewayStatus.status(), false, gatewayStatus.terminal(), message);
    }

    private void validateGatewayStatus(PaymentEntity payment, PayOSPaymentStatus gatewayStatus) {
        if (!payment.getTransactionId().equals(gatewayStatus.transactionId())) {
            throw new BadRequestException("payOS order code does not match this payment");
        }
        if (gatewayStatus.paid() && payment.getAmount().compareTo(gatewayStatus.amountPaid()) != 0) {
            log.warn("payOS paid amount mismatch, paymentId={}, expected={}, actual={}",
                    payment.getId(), payment.getAmount(), gatewayStatus.amountPaid());
            throw new BadRequestException("payOS paid amount does not match this payment");
        }
    }

    private PaymentSyncResponse response(PaymentEntity payment, String providerStatus, boolean paid,
                                         boolean terminal, String message) {
        InvoiceEntity invoice = payment.getInvoice();
        return new PaymentSyncResponse(
                invoice.getId(),
                "INV-" + invoice.getId(),
                invoice.getCourse().getId(),
                payment.getProvider(),
                invoice.getStatus(),
                payment.getStatus(),
                providerStatus,
                paid,
                terminal,
                message
        );
    }
}
