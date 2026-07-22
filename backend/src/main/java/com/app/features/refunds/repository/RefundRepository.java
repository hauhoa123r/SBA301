package com.app.features.refunds.repository;

import com.app.features.model.RefundEntity;
import com.app.features.model.enums.RefundStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RefundRepository extends JpaRepository<RefundEntity, Long> {
    @EntityGraph(attributePaths = {
            "user",
            "processedBy",
            "payment",
            "payment.invoice",
            "payment.invoice.course"
    })
    List<RefundEntity> findAllByOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = {
            "user",
            "processedBy",
            "payment",
            "payment.invoice",
            "payment.invoice.course"
    })
    List<RefundEntity> findAllByStatusOrderByCreatedAtDesc(RefundStatus status);

    @Override
    @EntityGraph(attributePaths = {
            "user",
            "processedBy",
            "payment",
            "payment.invoice",
            "payment.invoice.course"
    })
    Optional<RefundEntity> findById(Long id);
}