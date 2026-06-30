package com.app.features.coupons.service;

import com.app.features.coupons.dto.response.VerifiedCouponResponse;

public interface ICouponService {
    VerifiedCouponResponse verifiedCouponRequest(String vourcherCode);
}
