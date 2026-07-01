import api from "../../../api/axios";
import { API_USERS } from "../../../api/apiPath";

export const getUserProfile = async (userId) => {
    const response = await api.get(`${API_USERS}/${userId}`);
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
