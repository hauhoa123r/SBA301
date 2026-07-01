package com.app.features.manager.repository;

import com.app.features.model.UserEntity;
import com.app.features.model.enums.UserStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AdminUserRepository extends JpaRepository<UserEntity, Long> {

    @Query("""
        SELECT u FROM UserEntity u
        WHERE (:status IS NULL OR u.status = :status)
          AND (:keyword IS NULL OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')))
    """)
    Page<UserEntity> findAllWithFilter(
            @Param("status") UserStatus status,
            @Param("keyword") String keyword,
            Pageable pageable
    );

    @Query("""
        SELECT u FROM UserEntity u
        JOIN u.roles r
        WHERE r.id = :roleId
    """)
    Page<UserEntity> findAllByRoleId(@Param("roleId") Long roleId, Pageable pageable);

    boolean existsByEmail(String email);
}
