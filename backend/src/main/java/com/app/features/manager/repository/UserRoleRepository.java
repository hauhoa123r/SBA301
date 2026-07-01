package com.app.features.manager.repository;

import com.app.features.model.UserRoleEntity;
import com.app.features.model.UserRoleIdEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRoleRepository extends JpaRepository<UserRoleEntity, UserRoleIdEntity> {

    @Modifying
    @Query("DELETE FROM UserRoleEntity ur WHERE ur.user.id = :userId")
    void deleteAllByUserId(@Param("userId") Long userId);
}
