package com.app.features.manager.dto.request;

import com.app.features.model.enums.DiscountType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
public class CouponUpdateRequest {

    @NotBlank(message = "Mã giảm giá là bắt buộc")
    @Size(max = 50, message = "Mã giảm giá không được vượt quá 50 ký tự")
    private String code;

    @NotNull(message = "Loại giảm giá là bắt buộc")
    private DiscountType discountType;

    @NotNull(message = "Giá trị giảm là bắt buộc")
    @DecimalMin(value = "0.01", message = "Giá trị giảm phải lớn hơn 0")
    private BigDecimal discountValue;

    private Integer maxUses;

    private Instant validFrom;

    private Instant validUntil;
}
