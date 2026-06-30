package com.app.features.coupons.dto.response;

import com.app.features.coupons.enums.VourcherValidationStatus;
import com.app.features.model.enums.DiscountType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class VerifiedCouponResponse {
    private VourcherValidationStatus status;
    private String code;
    private DiscountType discountType;
    private BigDecimal discountValue;

    public VerifiedCouponResponse(VourcherValidationStatus status) {
        this.status = status;
    }
}
