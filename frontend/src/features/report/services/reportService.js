import api from "../../../api/axios";
import { API_REPORTS } from "../../../api/apiPath";

export const getReports = async (status = "") => {
    const query = status ? `?status=${encodeURIComponent(status)}` : "";
    const response = await api.get(`${API_REPORTS}${query}`);
    return response.data?.data ?? response.data ?? [];
};

export const markReportInvestigating = async (reportId) => {
    const response = await api.post(`${API_REPORTS}/${reportId}/investigate`);
    return response.data?.data ?? response.data;
};

export const resolveReport = async (reportId) => {
    const response = await api.post(`${API_REPORTS}/${reportId}/resolve`);
    return response.data?.data ?? response.data;
};

export const dismissReport = async (reportId) => {
    const response = await api.post(`${API_REPORTS}/${reportId}/dismiss`);
    return response.data?.data ?? response.data;
};