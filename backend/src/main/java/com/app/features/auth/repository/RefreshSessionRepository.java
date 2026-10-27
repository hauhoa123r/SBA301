package com.app.features.auth.repository;

import com.app.features.model.RefreshSessionEntity;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface RefreshSessionRepository extends JpaRepository<RefreshSessionEntity, String> {
    @Modifying
    @Query("update RefreshSessionEntity s set s.revoked = true where s.user.id = :userId and s.revoked = false")
    int revokeAllForUser(@Param("userId") Long userId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from RefreshSessionEntity s where s.id = :id")
    Optional<RefreshSessionEntity> findLocked(@Param("id") String id);
}
