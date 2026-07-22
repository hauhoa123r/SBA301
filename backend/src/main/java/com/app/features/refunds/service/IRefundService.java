package com.app.features.refunds.service;

import com.app.features.model.enums.RefundStatus;
import com.app.features.refunds.dto.response.RefundResponse;

import java.util.List;

public interface IRefundService {
    List<RefundResponse> getRefunds(RefundStatus status);

    RefundResponse approveRefund(Long refundId);

    RefundResponse rejectRefund(Long refundId);

    RefundResponse processRefund(Long refundId);
}
