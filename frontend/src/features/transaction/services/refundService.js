import api from "../../../api/axios";
import { API_REFUNDS } from "../../../api/apiPath";

export const getRefunds = async (status = "") => {
    const query = status ? `?status=${encodeURIComponent(status)}` : "";
    const response = await api.get(`${API_REFUNDS}${query}`);
    return response.data?.data ?? response.data ?? [];
};

export const approveRefund = async (refundId) => {
    const response = await api.post(`${API_REFUNDS}/${refundId}/approve`);
    return response.data?.data ?? response.data;
};

export const rejectRefund = async (refundId) => {
    const response = await api.post(`${API_REFUNDS}/${refundId}/reject`);
    return response.data?.data ?? response.data;
};

export const processRefund = async (refundId) => {
    const response = await api.post(`${API_REFUNDS}/${refundId}/process`);
    return response.data?.data ?? response.data;
};