package com.app.features.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Entity
@Table(name = "subscription_plans")
@Getter
@Setter
public class SubscriptionPlanEntity {
    @Id
    @Column(length = 30)
    private String code;
    @Column(nullable = false)
    private String name;
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal price;
    @Column(name = "duration_days", nullable = false)
    private Integer durationDays;
    @Column(nullable = false)
    private boolean active = true;
}
