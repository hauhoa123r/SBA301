package com.app.features.refunds.service.impl;
import com.app.exception.BadRequestException;
import com.app.exception.ResourceNotFoundException;
import com.app.features.model.CourseEntity;
import com.app.features.model.InvoiceEntity;
import com.app.features.model.PaymentEntity;
import com.app.features.model.RefundEntity;
import com.app.features.model.UserEntity;
import com.app.features.model.enums.RefundStatus;
import com.app.features.refunds.dto.response.RefundResponse;
import com.app.features.refunds.repository.RefundRepository;
import com.app.features.refunds.service.IRefundService;
import com.app.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RefundServiceImpl implements IRefundService {
    private final RefundRepository refundRepository;

    @Override
    @Transactional(readOnly = true)
    public List<RefundResponse> getRefunds(RefundStatus status) {
        List<RefundEntity> refunds = status == null
                ? refundRepository.findAllByOrderByCreatedAtDesc()
                : refundRepository.findAllByStatusOrderByCreatedAtDesc(status);

        return refunds.stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional
    public RefundResponse approveRefund(Long refundId) {
        RefundEntity refund = getRefund(refundId);

        if (refund.getStatus() != RefundStatus.PENDING) {
            throw new BadRequestException("Only pending refunds can be approved.");
        }

        refund.setStatus(RefundStatus.APPROVED);
        return toResponse(refundRepository.save(refund));
    }

    @Override
    @Transactional
    public RefundResponse rejectRefund(Long refundId) {
        RefundEntity refund = getRefund(refundId);

        if (refund.getStatus() != RefundStatus.PENDING) {
            throw new BadRequestException("Only pending refunds can be rejected.");
        }

        refund.setStatus(RefundStatus.REJECTED);
        refund.setProcessedBy(SecurityUtils.getCurrentUser());
        refund.setProcessedAt(Instant.now());

        return toResponse(refundRepository.save(refund));
    }

    @Override
    @Transactional
    public RefundResponse processRefund(Long refundId) {
        RefundEntity refund = getRefund(refundId);

        if (refund.getStatus() != RefundStatus.APPROVED) {
            throw new BadRequestException("Only approved refunds can be processed.");
        }

        refund.setStatus(RefundStatus.PROCESSED);
        refund.setProcessedBy(SecurityUtils.getCurrentUser());
        refund.setProcessedAt(Instant.now());

        return toResponse(refundRepository.save(refund));
    }

    private RefundEntity getRefund(Long refundId) {
        return refundRepository.findById(refundId)
                .orElseThrow(() -> new ResourceNotFoundException("Refund not found with id: " + refundId));
    }

    private RefundResponse toResponse(RefundEntity refund) {
        UserEntity user = refund.getUser();
        UserEntity processedBy = refund.getProcessedBy();
        PaymentEntity payment = refund.getPayment();
        InvoiceEntity invoice = payment != null ? payment.getInvoice() : null;
        CourseEntity course = invoice != null ? invoice.getCourse() : null;

        return RefundResponse.builder()
                .id(refund.getId())
                .paymentId(payment != null ? payment.getId() : null)
                .invoiceId(invoice != null ? invoice.getId() : null)
                .userId(user != null ? user.getId() : null)
                .learner(user != null ? user.getFullName() : null)
                .courseId(course != null ? course.getId() : null)
                .course(course != null ? course.getTitle() : null)
                .amount(refund.getAmount())
                .reason(refund.getReason())
                .status(refund.getStatus())
                .paymentProvider(payment != null ? payment.getProvider() : null)
                .paymentStatus(payment != null ? payment.getStatus() : null)
                .transactionId(payment != null ? payment.getTransactionId() : null)
                .processedById(processedBy != null ? processedBy.getId() : null)
                .processedByName(processedBy != null ? processedBy.getFullName() : null)
                .requestedAt(refund.getCreatedAt())
                .processedAt(refund.getProcessedAt())
                .build();
    }
}
