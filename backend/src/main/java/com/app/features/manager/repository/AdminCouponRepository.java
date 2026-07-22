package com.app.features.manager.repository;

import com.app.features.model.CouponEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdminCouponRepository extends JpaRepository<CouponEntity, Long> {

    @Query("""
        SELECT c FROM CouponEntity c
        WHERE (:keyword IS NULL OR LOWER(c.code) LIKE LOWER(CONCAT('%', :keyword, '%')))
    """)
    Page<CouponEntity> findAllWithFilter(@Param("keyword") String keyword, Pageable pageable);

    Optional<CouponEntity> findByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCase(String code);
}
