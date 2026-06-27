package com.app.features.model;

import com.app.features.model.enums.BadgeRequirementType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "badges", schema = "chinese_online_learning")
public class BadgeEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Size(max = 100)
    @NotNull
    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Size(max = 255)
    @NotNull
    @Column(name = "description", nullable = false)
    private String description;

    @Size(max = 500)
    @NotNull
    @Column(name = "icon_url", nullable = false, length = 500)
    private String iconUrl;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "requirement_type", nullable = false, length = 30)
    private BadgeRequirementType requirementType;

    @NotNull
    @Column(name = "requirement_value", nullable = false)
    private Integer requirementValue;


}
