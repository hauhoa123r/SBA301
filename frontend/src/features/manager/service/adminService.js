import api from "../../../api/axios";

// ============ USER MANAGEMENT (US44) ============

/**
 * Lấy danh sách users với filter và phân trang
 */
export const getUsers = async ({ keyword = "", status = "", page = 0, size = 10, sortBy = "createdAt", sortDir = "desc" } = {}) => {
    const params = new URLSearchParams();
    if (keyword) params.append("keyword", keyword);
    if (status) params.append("status", status);
    params.append("page", page);
    params.append("size", size);
    params.append("sortBy", sortBy);
    params.append("sortDir", sortDir);

    const response = await api.get(`/api/admin/users?${params.toString()}`);
    return response.data;
};

/**
 * Lấy chi tiết user theo ID
 */
export const getUserById = async (id) => {
    const response = await api.get(`/api/admin/users/${id}`);
    return response.data;
};

/**
 * Tạo user mới
 */
export const createUser = async (data) => {
    const response = await api.post("/api/admin/users", data);
    return response.data;
};

/**
 * Cập nhật thông tin user
 */
export const updateUser = async (id, data) => {
    const response = await api.put(`/api/admin/users/${id}`, data);
    return response.data;
};

/**
 * Thay đổi trạng thái tài khoản
 * @param {string} status - "ACTIVE" | "LOCKED" | "DELETED"
 */
export const changeUserStatus = async (id, status) => {
    const response = await api.put(`/api/admin/users/${id}/status`, { status });
    return response.data;
};

/**
 * Xóa user
 */
export const deleteUser = async (id) => {
    const response = await api.delete(`/api/admin/users/${id}`);
    return response.data;
};

/**
 * Gán roles cho user
 * @param {Long[]} roleIds - danh sách role IDs
 */
export const updateUserRoles = async (id, roleIds) => {
    const response = await api.put(`/api/admin/users/${id}/roles`, { roleIds });
    return response.data;
};

//  COUPON MANAGEMENT (US49)

export const getCoupons = async ({ keyword = "", page = 0, size = 10, sortBy = "createdAt", sortDir = "desc" } = {}) => {
    const params = new URLSearchParams();
    if (keyword) params.append("keyword", keyword);
    params.append("page", page);
    params.append("size", size);
    params.append("sortBy", sortBy);
    params.append("sortDir", sortDir);

    const response = await api.get(`/api/admin/coupons?${params.toString()}`);
    return response.data;
};

export const getCouponById = async (id) => {
    const response = await api.get(`/api/admin/coupons/${id}`);
    return response.data;
};

export const createCoupon = async (data) => {
    const response = await api.post("/api/admin/coupons", data);
    return response.data;
};

export const updateCoupon = async (id, data) => {
    const response = await api.put(`/api/admin/coupons/${id}`, data);
    return response.data;
};

export const deleteCoupon = async (id) => {
    const response = await api.delete(`/api/admin/coupons/${id}`);
    return response.data;
};

// = ROLE MANAGEMENT (US45) 

/**
 * Lấy tất cả roles
 */
export const getRoles = async () => {
    const response = await api.get("/api/admin/roles");
    return response.data;
};

/**
 * Lấy role theo ID
 */
export const getRoleById = async (id) => {
    const response = await api.get(`/api/admin/roles/${id}`);
    return response.data;
};

/**
 * Tạo role mới
 */
export const createRole = async (data) => {
    const response = await api.post("/api/admin/roles", data);
    return response.data;
};

/**
 * Cập nhật role
 */
export const updateRole = async (id, data) => {
    const response = await api.put(`/api/admin/roles/${id}`, data);
    return response.data;
};

/**
 * Xóa role
 */
export const deleteRole = async (id) => {
    const response = await api.delete(`/api/admin/roles/${id}`);
    return response.data;
};

// ============ PERMISSION MANAGEMENT ============

/**
 * Lấy tất cả permissions
 */
export const getPermissions = async () => {
    const response = await api.get("/api/admin/permissions");
    return response.data;
};
