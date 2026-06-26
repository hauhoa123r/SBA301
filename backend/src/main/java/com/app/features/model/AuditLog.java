package com.app.features.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;

@Getter
@Setter
@Entity
@Table(name = "audit_logs", schema = "chinese_online_learning")
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Size(max = 100)
    @NotNull
    @Column(name = "action", nullable = false, length = 100)
    private String action;

    @Size(max = 10)
    @NotNull
    @Column(name = "method", nullable = false, length = 10)
    private String method;

    @Size(max = 255)
    @NotNull
    @Column(name = "endpoint", nullable = false)
    private String endpoint;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "before_data")
    private Map<String, Object> beforeData;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "after_data")
    private Map<String, Object> afterData;

    @Size(max = 45)
    @NotNull
    @Column(name = "ip_address", nullable = false, length = 45)
    private String ipAddress;

    @Size(max = 500)
    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "created_at")
    private Instant createdAt;


}