package com.app.features.payments.controller;

import com.app.features.model.enums.PaymentProvider;
import com.app.features.payments.dto.PaymentCreateRequest;
import com.app.features.payments.dto.PaymentCreateResponse;
import com.app.features.payments.dto.PaymentVerifyResponse;
import com.app.features.payments.facade.PaymentFacade;
import com.app.utils.ApiPath;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.RedirectView;

import java.util.Map;

@RestController
@RequestMapping(ApiPath.API_PAYMENTS)
@RequiredArgsConstructor
public class PaymentController {
    private final PaymentFacade paymentFacade;

    @PostMapping("/create")
    public ResponseEntity<PaymentCreateResponse> createPayment(@Valid @RequestBody PaymentCreateRequest request, @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        return ResponseEntity.ok(paymentFacade.createPayment(request, userId));
    }

    @GetMapping("/vnpay-return")
    public RedirectView vnpayReturn(@RequestParam Map<String, String> params) {
        return new RedirectView(paymentFacade.handleRedirectCallback(PaymentProvider.VNPAY, params));
    }

    @PostMapping("/momo-ipn")
    public ResponseEntity<PaymentVerifyResponse> momoIpn(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(paymentFacade.handleWebhook(PaymentProvider.MOMO, body));
    }

    @PostMapping("/payos-webhook")
    public ResponseEntity<PaymentVerifyResponse> payosWebhook(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(paymentFacade.handleWebhook(PaymentProvider.PAYOS, body));
    }

    @PostMapping("/zalopay-callback")
    public ResponseEntity<PaymentVerifyResponse> zalopayCallback(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(paymentFacade.handleWebhook(PaymentProvider.ZALOPAY, body));
    }
}
