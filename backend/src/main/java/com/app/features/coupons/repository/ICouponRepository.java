package com.app.features.coupons.repository;

import com.app.features.model.CouponEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ICouponRepository extends JpaRepository<CouponEntity, Long> {
    CouponEntity findByCode(String code);
    Optional<CouponEntity> findByCodeIgnoreCase(String code);
}
