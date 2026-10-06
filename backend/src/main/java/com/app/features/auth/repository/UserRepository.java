package com.app.features.auth.repository;

import com.app.features.model.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository
        extends JpaRepository<UserEntity, Long> {
    Optional<UserEntity> findByEmail(String email);

    @EntityGraph(attributePaths = "roles")
    @org.springframework.data.jpa.repository.Query("select u from UserEntity u where u.email = :email")
    Optional<UserEntity> findByEmailWithRoles(String email);

    boolean existsByEmail(String email);

    @EntityGraph(attributePaths = "roles")
    @org.springframework.data.jpa.repository.Query("select u from UserEntity u where u.id = :id")
    Optional<UserEntity> findByIdWithRoles(Long id);

    @org.springframework.data.jpa.repository.Modifying(flushAutomatically = true, clearAutomatically = true)
    @org.springframework.data.jpa.repository.Query("update UserEntity u set u.status = com.app.features.model.enums.UserStatus.ACTIVE where u.id = :id and u.status in (com.app.features.model.enums.UserStatus.PENDING, com.app.features.model.enums.UserStatus.INACTIVE)")
    int activatePending(Long id);
}
