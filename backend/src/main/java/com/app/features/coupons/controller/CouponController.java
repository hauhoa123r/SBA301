package com.app.features.coupons.controller;

import com.app.features.coupons.dto.response.VerifiedCouponResponse;
import com.app.features.coupons.service.ICouponService;
import com.app.utils.ApiPath;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(ApiPath.API_COUPON)
@RequiredArgsConstructor
public class CouponController {
    private final ICouponService couponService;

    @GetMapping("/{vourcherCode}")
    public ResponseEntity<VerifiedCouponResponse> verifiedCoupon(@PathVariable String vourcherCode) {
        return ResponseEntity.ok(couponService.verifiedCouponRequest(vourcherCode));
    }
}
