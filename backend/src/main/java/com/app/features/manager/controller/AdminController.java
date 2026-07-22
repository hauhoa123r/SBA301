package com.app.features.manager.controller;

import com.app.features.manager.dto.request.CouponCreateRequest;
import com.app.features.manager.dto.request.CouponUpdateRequest;
import com.app.features.manager.dto.request.RoleRequest;
import com.app.features.manager.dto.request.UserCreateRequest;
import com.app.features.manager.dto.request.UserRoleRequest;
import com.app.features.manager.dto.request.UserStatusRequest;
import com.app.features.manager.dto.request.UserUpdateRequest;
import com.app.features.manager.dto.response.CouponAdminResponse;
import com.app.features.manager.dto.response.PermissionResponse;
import com.app.features.manager.dto.response.RoleResponse;
import com.app.features.manager.dto.response.UserAdminResponse;
import com.app.features.manager.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    //USER MANAGEMENT (US44)

    @GetMapping("/users")
    public ResponseEntity<Map<String, Object>> getAllUsers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<UserAdminResponse> result = adminService.getAllUsers(keyword, status, pageable);

        return ResponseEntity.ok(Map.of(
                "content", result.getContent(),
                "totalElements", result.getTotalElements(),
                "totalPages", result.getTotalPages(),
                "currentPage", result.getNumber(),
                "pageSize", result.getSize()
        ));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<UserAdminResponse> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getUserById(id));
    }

    @PostMapping("/users")
    public ResponseEntity<UserAdminResponse> createUser(@Valid @RequestBody UserCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.createUser(request));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<UserAdminResponse> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserUpdateRequest request
    ) {
        return ResponseEntity.ok(adminService.updateUser(id, request));
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<UserAdminResponse> changeUserStatus(
            @PathVariable Long id,
            @Valid @RequestBody UserStatusRequest request
    ) {
        return ResponseEntity.ok(adminService.changeUserStatus(id, request));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }

    @PutMapping("/users/{id}/roles")
    public ResponseEntity<UserAdminResponse> updateUserRoles(
            @PathVariable Long id,
            @Valid @RequestBody UserRoleRequest request
    ) {
        return ResponseEntity.ok(adminService.updateUserRoles(id, request));
    }

    // COUPON MANAGEMENT (US49)

    @GetMapping("/coupons")
    public ResponseEntity<Map<String, Object>> getAllCoupons(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<CouponAdminResponse> result = adminService.getAllCoupons(keyword, pageable);

        return ResponseEntity.ok(Map.of(
                "content", result.getContent(),
                "totalElements", result.getTotalElements(),
                "totalPages", result.getTotalPages(),
                "currentPage", result.getNumber(),
                "pageSize", result.getSize()
        ));
    }

    @GetMapping("/coupons/{id}")
    public ResponseEntity<CouponAdminResponse> getCouponById(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getCouponById(id));
    }

    @PostMapping("/coupons")
    public ResponseEntity<CouponAdminResponse> createCoupon(@Valid @RequestBody CouponCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.createCoupon(request));
    }

    @PutMapping("/coupons/{id}")
    public ResponseEntity<CouponAdminResponse> updateCoupon(
            @PathVariable Long id,
            @Valid @RequestBody CouponUpdateRequest request
    ) {
        return ResponseEntity.ok(adminService.updateCoupon(id, request));
    }

    @DeleteMapping("/coupons/{id}")
    public ResponseEntity<Map<String, String>> deleteCoupon(@PathVariable Long id) {
        adminService.deleteCoupon(id);
        return ResponseEntity.ok(Map.of("message", "Coupon deleted successfully"));
    }

    //ROLE MANAGEMENT (US45)

    @GetMapping("/roles")
    public ResponseEntity<List<RoleResponse>> getAllRoles() {
        return ResponseEntity.ok(adminService.getAllRoles());
    }

    @GetMapping("/roles/{id}")
    public ResponseEntity<RoleResponse> getRoleById(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getRoleById(id));
    }

    @PostMapping("/roles")
    public ResponseEntity<RoleResponse> createRole(@Valid @RequestBody RoleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.createRole(request));
    }

    @PutMapping("/roles/{id}")
    public ResponseEntity<RoleResponse> updateRole(
            @PathVariable Long id,
            @Valid @RequestBody RoleRequest request
    ) {
        return ResponseEntity.ok(adminService.updateRole(id, request));
    }

    @DeleteMapping("/roles/{id}")
    public ResponseEntity<Map<String, String>> deleteRole(@PathVariable Long id) {
        adminService.deleteRole(id);
        return ResponseEntity.ok(Map.of("message", "Role deleted successfully"));
    }

    // PERMISSION MANAGEMENT

    @GetMapping("/permissions")
    public ResponseEntity<List<PermissionResponse>> getAllPermissions() {
        return ResponseEntity.ok(adminService.getAllPermissions());
    }

    // EXCEPTION HANDLER

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", ex.getMessage()));
    }
}
