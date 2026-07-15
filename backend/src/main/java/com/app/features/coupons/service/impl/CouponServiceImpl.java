package com.app.features.coupons.service.impl;

import com.app.features.coupons.converter.VerifiedCouponConverter;
import com.app.features.coupons.dto.response.VerifiedCouponResponse;
import com.app.features.coupons.repository.ICouponRepository;
import com.app.features.coupons.service.ICouponService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class CouponServiceImpl implements ICouponService {
    private final ICouponRepository couponRepository;
    private final VerifiedCouponConverter verifiedCouponConverter;

    @Override
    public VerifiedCouponResponse verifiedCouponRequest(String vourcherCode) {
        log.info("Coupon verification requested");
        VerifiedCouponResponse response = verifiedCouponConverter.toVerifiedVoucher(vourcherCode);
        log.info("Coupon verification completed");
        return response;
    }

}
