package com.app.features.auth.repository;

import com.app.features.model.AuthenticationSettingsEntity;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.*;
import java.util.Optional;

public interface AuthenticationSettingsRepository extends JpaRepository<AuthenticationSettingsEntity, Integer> {
    @Lock(LockModeType.PESSIMISTIC_READ)
    @Query("select s from AuthenticationSettingsEntity s where s.id = 1")
    Optional<AuthenticationSettingsEntity> readPolicy();

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from AuthenticationSettingsEntity s where s.id = 1")
    Optional<AuthenticationSettingsEntity> lockPolicy();
}
