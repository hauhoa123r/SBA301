package com.app.features.payments.repository;

import com.app.features.model.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentUserRepository extends JpaRepository<UserEntity, Long> {
}
