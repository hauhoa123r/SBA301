package com.app.features.manager.repository;

import com.app.features.model.PermissionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PermissionRepository extends JpaRepository<PermissionEntity, Long> {
    boolean existsByCode(String code);
    List<PermissionEntity> findAllByIdIn(List<Long> ids);
}
