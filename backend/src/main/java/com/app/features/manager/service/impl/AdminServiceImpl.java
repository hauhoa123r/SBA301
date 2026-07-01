package com.app.features.manager.service.impl;

import com.app.features.manager.dto.request.RoleRequest;
import com.app.features.manager.dto.request.UserRoleRequest;
import com.app.features.manager.dto.request.UserStatusRequest;
import com.app.features.manager.dto.request.UserUpdateRequest;
import com.app.features.manager.dto.response.PermissionResponse;
import com.app.features.manager.dto.response.RoleResponse;
import com.app.features.manager.dto.response.UserAdminResponse;
import com.app.features.manager.repository.AdminUserRepository;
import com.app.features.manager.repository.PermissionRepository;
import com.app.features.manager.repository.RolePermissionRepository;
import com.app.features.manager.repository.RoleRepository;
import com.app.features.manager.repository.UserRoleRepository;
import com.app.features.manager.service.AdminService;
import com.app.features.model.PermissionEntity;
import com.app.features.model.RoleEntity;
import com.app.features.model.RolePermissionEntity;
import com.app.features.model.RolePermissionIdEntity;
import com.app.features.model.UserEntity;
import com.app.features.model.enums.UserStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final AdminUserRepository adminUserRepository;
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final UserRoleRepository userRoleRepository;

    // ===== USER MANAGEMENT =====

    @Override
    public Page<UserAdminResponse> getAllUsers(String keyword, String status, Pageable pageable) {
        UserStatus userStatus = null;
        if (status != null && !status.isBlank()) {
            try {
                userStatus = UserStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException ignored) {
                // Invalid status string, treat as no filter
            }
        }
        String kw = (keyword == null || keyword.isBlank()) ? null : keyword.trim();
        return adminUserRepository.findAllWithFilter(userStatus, kw, pageable)
                .map(this::toUserAdminResponse);
    }

    @Override
    public UserAdminResponse getUserById(Long id) {
        UserEntity user = adminUserRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        return toUserAdminResponse(user);
    }

    @Override
    @Transactional
    public UserAdminResponse updateUser(Long id, UserUpdateRequest request) {
        UserEntity user = adminUserRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        // Check email uniqueness if changed
        if (!user.getEmail().equalsIgnoreCase(request.getEmail())
                && adminUserRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already in use: " + request.getEmail());
        }

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        return toUserAdminResponse(adminUserRepository.save(user));
    }

    @Override
    @Transactional
    public UserAdminResponse changeUserStatus(Long id, UserStatusRequest request) {
        UserEntity user = adminUserRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        user.setStatus(request.getStatus());
        return toUserAdminResponse(adminUserRepository.save(user));
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        if (!adminUserRepository.existsById(id)) {
            throw new RuntimeException("User not found with id: " + id);
        }
        adminUserRepository.deleteById(id);
    }

    @Override
    @Transactional
    public UserAdminResponse updateUserRoles(Long id, UserRoleRequest request) {
        UserEntity user = adminUserRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        // Clear existing roles
        user.getRoles().clear();

        // Assign new roles
        if (request.getRoleIds() != null) {
            for (Long roleId : request.getRoleIds()) {
                RoleEntity role = roleRepository.findById(roleId)
                        .orElseThrow(() -> new RuntimeException("Role not found with id: " + roleId));
                user.getRoles().add(role);
            }
        }
        
        user = adminUserRepository.save(user);
        return toUserAdminResponse(user);
    }

    // ===== ROLE MANAGEMENT =====

    @Override
    public List<RoleResponse> getAllRoles() {
        return roleRepository.findAll()
                .stream()
                .map(this::toRoleResponse)
                .collect(Collectors.toList());
    }

    @Override
    public RoleResponse getRoleById(Long id) {
        RoleEntity role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found with id: " + id));
        return toRoleResponse(role);
    }

    @Override
    @Transactional
    public RoleResponse createRole(RoleRequest request) {
        if (roleRepository.existsByName(request.getName())) {
            throw new RuntimeException("Role name already exists: " + request.getName());
        }

        RoleEntity role = new RoleEntity();
        role.setName(request.getName());
        role.setDescription(request.getDescription());
        role = roleRepository.save(role);

        // Assign permissions
        assignPermissionsToRole(role, request.getPermissionIds());

        return toRoleResponse(roleRepository.findById(role.getId()).orElseThrow());
    }

    @Override
    @Transactional
    public RoleResponse updateRole(Long id, RoleRequest request) {
        RoleEntity role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found with id: " + id));

        // Check name uniqueness
        if (!role.getName().equals(request.getName()) && roleRepository.existsByName(request.getName())) {
            throw new RuntimeException("Role name already exists: " + request.getName());
        }

        role.setName(request.getName());
        role.setDescription(request.getDescription());
        roleRepository.save(role);

        // Re-assign permissions
        rolePermissionRepository.deleteAllByRoleId(id);
        assignPermissionsToRole(role, request.getPermissionIds());

        return toRoleResponse(roleRepository.findById(id).orElseThrow());
    }

    @Override
    @Transactional
    public void deleteRole(Long id) {
        if (!roleRepository.existsById(id)) {
            throw new RuntimeException("Role not found with id: " + id);
        }
        rolePermissionRepository.deleteAllByRoleId(id);
        roleRepository.deleteById(id);
    }

    // ===== PERMISSION MANAGEMENT =====

    @Override
    public List<PermissionResponse> getAllPermissions() {
        return permissionRepository.findAll()
                .stream()
                .map(p -> PermissionResponse.builder()
                        .id(p.getId())
                        .code(p.getCode())
                        .name(p.getName())
                        .build())
                .collect(Collectors.toList());
    }

    // ===== PRIVATE HELPERS =====

    private void assignPermissionsToRole(RoleEntity role, List<Long> permissionIds) {
        if (permissionIds == null || permissionIds.isEmpty()) return;
        for (Long permId : permissionIds) {
            PermissionEntity perm = permissionRepository.findById(permId)
                    .orElseThrow(() -> new RuntimeException("Permission not found with id: " + permId));

            RolePermissionIdEntity rpId = new RolePermissionIdEntity();
            rpId.setRoleId(role.getId());
            rpId.setPermissionId(permId);

            RolePermissionEntity rp = new RolePermissionEntity();
            rp.setId(rpId);
            rp.setRole(role);
            rp.setPermission(perm);
            rolePermissionRepository.save(rp);
        }
    }

    private UserAdminResponse toUserAdminResponse(UserEntity user) {
        List<RoleResponse> roles = user.getRoles() == null ? List.of() :
                user.getRoles().stream()
                        .map(this::toRoleResponse)
                        .collect(Collectors.toList());

        return UserAdminResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .status(user.getStatus())
                .totalLearningPoints(user.getTotalLearningPoints())
                .referralCode(user.getReferralCode())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .roles(roles)
                .build();
    }

    private RoleResponse toRoleResponse(RoleEntity role) {
        // Permissions are loaded lazily; handle gracefully
        List<PermissionResponse> permissions = List.of();
        try {
            permissions = rolePermissionRepository.findAll().stream()
                    .filter(rp -> rp.getRole().getId().equals(role.getId()))
                    .map(rp -> PermissionResponse.builder()
                            .id(rp.getPermission().getId())
                            .code(rp.getPermission().getCode())
                            .name(rp.getPermission().getName())
                            .build())
                    .collect(Collectors.toList());
        } catch (Exception ignored) {
            // Safe fallback
        }

        return RoleResponse.builder()
                .id(role.getId())
                .name(role.getName())
                .description(role.getDescription())
                .permissions(permissions)
                .build();
    }
}
