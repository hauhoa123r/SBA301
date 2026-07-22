package com.app.features.refunds.controller;

import com.app.features.model.enums.RefundStatus;
import com.app.features.refunds.dto.response.RefundResponse;
import com.app.features.refunds.service.IRefundService;
import com.app.utils.ApiPath;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(ApiPath.API_REFUNDS)
@RequiredArgsConstructor
public class RefundController {
    private final IRefundService refundService;

    @GetMapping
    public ResponseEntity<List<RefundResponse>> getRefunds(
            @RequestParam(required = false) RefundStatus status
    ) {
        return ResponseEntity.ok(refundService.getRefunds(status));
    }

    @PostMapping("/{refundId}/approve")
    public ResponseEntity<RefundResponse> approveRefund(@PathVariable Long refundId) {
        return ResponseEntity.ok(refundService.approveRefund(refundId));
    }

    @PostMapping("/{refundId}/reject")
    public ResponseEntity<RefundResponse> rejectRefund(@PathVariable Long refundId) {
        return ResponseEntity.ok(refundService.rejectRefund(refundId));
    }

    @PostMapping("/{refundId}/process")
    public ResponseEntity<RefundResponse> processRefund(@PathVariable Long refundId) {
        return ResponseEntity.ok(refundService.processRefund(refundId));
    }
}