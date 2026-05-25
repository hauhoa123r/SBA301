package com.app.model.user.eums;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
@NoArgsConstructor
@AllArgsConstructor
public enum SubscriptionStatus {
    ACTIVE("Hoạt động"),
    EXPRIRED("Hết hạn"),
    CANCELLED("CANCELLED"),;
    private String value;

    public String getValue() {
        return value;
    }
}
