package com.app.features.manager.service;

import com.app.features.manager.dto.request.RoleRequest;
import com.app.features.manager.dto.request.UserRoleRequest;
import com.app.features.manager.dto.request.UserStatusRequest;
import com.app.features.manager.dto.request.UserUpdateRequest;
import com.app.features.manager.dto.response.PermissionResponse;
import com.app.features.manager.dto.response.RoleResponse;
import com.app.features.manager.dto.response.UserAdminResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface AdminService {

    // ---- User Management ----
    Page<UserAdminResponse> getAllUsers(String keyword, String status, Pageable pageable);

    UserAdminResponse getUserById(Long id);

    UserAdminResponse updateUser(Long id, UserUpdateRequest request);

    UserAdminResponse changeUserStatus(Long id, UserStatusRequest request);

    void deleteUser(Long id);

    UserAdminResponse updateUserRoles(Long id, UserRoleRequest request);

    // ---- Role Management ----
    List<RoleResponse> getAllRoles();

    RoleResponse getRoleById(Long id);

    RoleResponse createRole(RoleRequest request);

    RoleResponse updateRole(Long id, RoleRequest request);

    void deleteRole(Long id);

    // ---- Permission Management ----
    List<PermissionResponse> getAllPermissions();
}
