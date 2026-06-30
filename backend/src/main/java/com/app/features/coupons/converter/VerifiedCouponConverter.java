package com.app.features.coupons.converter;

import com.app.features.coupons.dto.response.VerifiedCouponResponse;
import com.app.features.coupons.enums.VourcherValidationStatus;
import com.app.features.coupons.repository.ICouponRepository;
import com.app.features.model.CouponEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
@RequiredArgsConstructor
public class VerifiedCouponConverter {
    private final ICouponRepository couponRepositoryImpl;

    public VerifiedCouponResponse toVerifiedVoucher(String vourcherCode) {
        if (vourcherCode == null || vourcherCode.trim().isEmpty()) {
            return new VerifiedCouponResponse(VourcherValidationStatus.NOT_FOUND);
        }
        CouponEntity couponEntity = couponRepositoryImpl.findByCodeIgnoreCase(vourcherCode.trim()).orElse(null);
        return toVerifiedCouponResponse(couponEntity);
    }

    private VerifiedCouponResponse toVerifiedCouponResponse(CouponEntity couponEntity) {
        Instant dateValid = Instant.now();
        if (couponEntity == null) {
            return new VerifiedCouponResponse(VourcherValidationStatus.NOT_FOUND);
        }
        if (couponEntity.getValidFrom() != null && dateValid.isBefore(couponEntity.getValidFrom())) {
            return new VerifiedCouponResponse(VourcherValidationStatus.NOT_STARTED);
        }
        if (couponEntity.getValidUntil() != null && dateValid.isAfter(couponEntity.getValidUntil())) {
            return new VerifiedCouponResponse(VourcherValidationStatus.EXPIRED);
        }
        int maxUses = couponEntity.getMaxUses() == null ? Integer.MAX_VALUE : couponEntity.getMaxUses();
        int usedCount = couponEntity.getUsedCount() == null ? 0 : couponEntity.getUsedCount();
        if (maxUses <= usedCount) {
            return new VerifiedCouponResponse(VourcherValidationStatus.OUT_OF_USES);
        }
        return new VerifiedCouponResponse(
                VourcherValidationStatus.VALID,
                couponEntity.getCode(),
                couponEntity.getDiscountType(),
                couponEntity.getDiscountValue()
        );
    }
}
