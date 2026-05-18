package com.app.model.user.repository;

import com.app.model.user.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository
        extends JpaRepository<UserEntity, Integer> {

    UserEntity findByUsernameAndPassword(
            String username,
            String password
    );
}