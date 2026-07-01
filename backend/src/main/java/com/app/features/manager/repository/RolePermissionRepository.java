package com.app.features.manager.repository;

import com.app.features.model.RolePermissionEntity;
import com.app.features.model.RolePermissionIdEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface RolePermissionRepository extends JpaRepository<RolePermissionEntity, RolePermissionIdEntity> {

    @Modifying
    @Query("DELETE FROM RolePermissionEntity rp WHERE rp.role.id = :roleId")
    void deleteAllByRoleId(@Param("roleId") Long roleId);

    @Query("SELECT COUNT(rp) > 0 FROM RolePermissionEntity rp WHERE rp.role.id = :roleId AND rp.permission.id = :permissionId")
    boolean existsByRoleIdAndPermissionId(@Param("roleId") Long roleId, @Param("permissionId") Long permissionId);
}
