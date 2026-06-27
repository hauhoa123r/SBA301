package com.app.features.user.repository;

import com.app.features.user.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository
        extends JpaRepository<UserEntity, Integer> {
    Optional<UserEntity> findByEmail(String email);
}