package com.app.features.manager.service.impl;

import com.app.features.manager.dto.request.RoleRequest;
import com.app.features.manager.dto.request.UserCreateRequest;
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
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminServiceImpl implements AdminService {

    private static final String ROLE_ADMIN = "ADMIN";
    private static final List<String> MANAGEABLE_ROLE_NAMES = List.of("MODERATOR", "TEACHER", "STUDENT");

    private final AdminUserRepository adminUserRepository;
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final UserRoleRepository userRoleRepository;

    //USER MANAGEMENT

    @Override
    public Page<UserAdminResponse> getAllUsers(String keyword, String status, Pageable pageable) {
        UserStatus userStatus = null;
        if (status != null && !status.isBlank()) {
            try {
                userStatus = UserStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException ignored) {
                log.warn("Invalid user status filter ignored, status={}", status);
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
                .orElseThrow(() -> {
                    log.warn("Admin user lookup failed, userId={}", id);
                    return new RuntimeException("User not found with id: " + id);
                });
        return toUserAdminResponse(user);
    }

    @Override
    @Transactional
    public UserAdminResponse createUser(UserCreateRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        if (adminUserRepository.existsByEmail(normalizedEmail)) {
            throw new RuntimeException("Email đã được sử dụng: " + normalizedEmail);
        }

        RoleEntity role = roleRepository.findById(request.getRoleId())
                .orElseThrow(() -> new RuntimeException("Role not found with id: " + request.getRoleId()));

        String normalizedRoleName = role.getName() == null ? "" : role.getName().trim().toUpperCase();
        if (!MANAGEABLE_ROLE_NAMES.contains(normalizedRoleName)) {
            throw new RuntimeException("Vai trò phải là MODERATOR, TEACHER hoặc STUDENT");
        }

        UserEntity user = new UserEntity();
        user.setFullName(request.getFullName().trim());
        user.setEmail(normalizedEmail);
        user.setPasswordHash(request.getPassword());
        user.setStatus(UserStatus.ACTIVE);
        user.setTotalLearningPoints(0);
        user.getRoles().clear();
        user.getRoles().add(role);

        UserEntity savedUser = adminUserRepository.save(user);
        log.info("Admin user created successfully, userId={}, role={}", savedUser.getId(), normalizedRoleName);
        return toUserAdminResponse(savedUser);
    }

    @Override
    @Transactional
    public UserAdminResponse updateUser(Long id, UserUpdateRequest request) {
        log.info("Admin user update requested, userId={}", id);
        UserEntity user = adminUserRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        // Check email uniqueness if changed
        if (!user.getEmail().equalsIgnoreCase(request.getEmail())
                && adminUserRepository.existsByEmail(request.getEmail())) {
            log.warn("Admin user update rejected because email is already used, userId={}", id);
            throw new RuntimeException("Email already in use: " + request.getEmail());
        }

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        UserAdminResponse response = toUserAdminResponse(adminUserRepository.save(user));
        log.info("Admin user updated successfully, userId={}", id);
        return response;
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
        log.info("Admin user deletion requested, userId={}", id);
        if (!adminUserRepository.existsById(id)) {
            log.warn("Admin user deletion failed because user was not found, userId={}", id);
            throw new RuntimeException("User not found with id: " + id);
        }
        adminUserRepository.deleteById(id);
        log.info("Admin user deleted successfully, userId={}", id);
    }

    @Override
    @Transactional
    public UserAdminResponse updateUserRoles(Long id, UserRoleRequest request) {
        UserEntity user = adminUserRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        List<Long> requestedRoleIds = request.getRoleIds();
        if (requestedRoleIds == null || requestedRoleIds.size() != 1) {
            throw new RuntimeException("Exactly one role must be selected for this account");
        }

        boolean isAdminAccount = user.getRoles().stream()
                .map(RoleEntity::getName)
                .anyMatch(ROLE_ADMIN::equalsIgnoreCase);
        if (isAdminAccount) {
            throw new RuntimeException("ADMIN accounts cannot be assigned to another role");
        }

        boolean hasManageableCurrentRole = user.getRoles().stream()
                .map(RoleEntity::getName)
                .filter(roleName -> roleName != null && !roleName.isBlank())
                .map(roleName -> roleName.trim().toUpperCase())
                .anyMatch(MANAGEABLE_ROLE_NAMES::contains);
        if (!hasManageableCurrentRole) {
            throw new RuntimeException("Only MODERATOR, TEACHER or STUDENT accounts can be reassigned");
        }

        RoleEntity targetRole = roleRepository.findById(requestedRoleIds.get(0))
                .orElseThrow(() -> new RuntimeException("Role not found with id: " + requestedRoleIds.get(0)));

        String normalizedTargetRoleName = targetRole.getName() == null ? "" : targetRole.getName().trim().toUpperCase();
        if (!MANAGEABLE_ROLE_NAMES.contains(normalizedTargetRoleName)) {
            throw new RuntimeException("Role must be one of MODERATOR, TEACHER or STUDENT");
        }

        user.getRoles().clear();
        user.getRoles().add(targetRole);
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
        log.info("Role creation requested, roleName={}", request.getName());
        if (roleRepository.existsByName(request.getName())) {
            log.warn("Role creation rejected because name already exists, roleName={}", request.getName());
            throw new RuntimeException("Role name already exists: " + request.getName());
        }

        RoleEntity role = new RoleEntity();
        role.setName(request.getName());
        role.setDescription(request.getDescription());
        role = roleRepository.save(role);

        // Assign permissions
        assignPermissionsToRole(role, request.getPermissionIds());

        RoleResponse response = toRoleResponse(roleRepository.findById(role.getId()).orElseThrow());
        log.info("Role created successfully, roleId={}", role.getId());
        return response;
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
        log.info("Role deletion requested, roleId={}", id);
        if (!roleRepository.existsById(id)) {
            log.warn("Role deletion failed because role was not found, roleId={}", id);
            throw new RuntimeException("Role not found with id: " + id);
        }
        rolePermissionRepository.deleteAllByRoleId(id);
        roleRepository.deleteById(id);
        log.info("Role deleted successfully, roleId={}", id);
    }

    //PERMISSION MANAGEMENT

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

    //PRIVATE HELPERS

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
        } catch (Exception exception) {
            log.error("Role permissions could not be loaded, roleId={}", role.getId(), exception);
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
