package com.app.features.payments.repository;

import com.app.features.model.PaymentEntity;
import com.app.features.model.enums.PaymentProvider;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentRepository extends JpaRepository<PaymentEntity, Long> {
    Optional<PaymentEntity> findFirstByProviderAndTransactionIdOrderByIdDesc(PaymentProvider provider, String transactionId);
}
