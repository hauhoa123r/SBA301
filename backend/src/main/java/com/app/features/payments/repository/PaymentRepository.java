package com.app.features.payments.repository;

import com.app.features.model.PaymentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentRepository extends JpaRepository<PaymentEntity, Long> {
    Optional<PaymentEntity> findFirstByTransactionIdOrderByIdDesc(String transactionId);
}
