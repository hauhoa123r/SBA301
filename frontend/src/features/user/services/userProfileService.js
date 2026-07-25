import { API_USERS, axiosClient as api } from "@/shared/api";

export const getUserProfile = async (userId) => {
    const response = await api.get(`${API_USERS}/${userId}`);
    return response.data;
};

export const getOrderHistory = async (userId) => {
    const response = await api.get(`${API_USERS}/${userId}/orders`);
    return response.data;
};

export const updateUserProfile = async (userId, data) => {
    const response = await api.patch(`${API_USERS}/${userId}`, data);
    return response.data;
};

export const changePassword = async (data) => {
    const response = await api.patch(`${API_USERS}/change-password`, data);
    return response.data;
};
