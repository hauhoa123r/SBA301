package com.app.features.payments.controller;

import com.app.features.model.UserEntity;
import com.app.features.model.enums.PaymentProvider;
import com.app.features.payments.dto.PaymentCreateRequest;
import com.app.features.payments.dto.PaymentCreateResponse;
import com.app.features.payments.dto.PaymentVerifyResponse;
import com.app.features.payments.facade.PaymentFacade;
import com.app.security.oauth.CustomOAuth2User;
import com.app.utils.ApiPath;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.RedirectView;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@RestController
@RequestMapping(ApiPath.API_PAYMENTS)
@RequiredArgsConstructor
public class PaymentController {
    private final PaymentFacade paymentFacade;

    @PostMapping("/create")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<PaymentCreateResponse> createPayment(@Valid @RequestBody PaymentCreateRequest request, Authentication authentication) {
        UserEntity user = (UserEntity) authentication.getPrincipal();

        System.out.println(user.getId());
        System.out.println(user.getEmail());
        return ResponseEntity.ok(paymentFacade.createPayment(request, authenticatedUserId(authentication)));
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

    private Long authenticatedUserId(Authentication authentication) {
        if (authentication == null) {
            throw new ResponseStatusException(UNAUTHORIZED, "Authentication required");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof UserEntity user) {
            return user.getId();
        }
        if (principal instanceof CustomOAuth2User oauthUser) {
            return oauthUser.getUser().getId();
        }
        throw new ResponseStatusException(UNAUTHORIZED, "Authentication required");
    }
}
