package com.app.features.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity @Table(name = "authentication_settings") @Getter @Setter
public class AuthenticationSettingsEntity {
    @Id private Integer id;
    @Column(name = "email_verification_enabled", nullable = false)
    private boolean emailVerificationEnabled = true;
}
