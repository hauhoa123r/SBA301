package com.app.features.coupons.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum VourcherValidationStatus {
    VALID,
    NOT_FOUND,
    EXPIRED,
    OUT_OF_USES,
    NOT_STARTED,
    DISABLED
}
