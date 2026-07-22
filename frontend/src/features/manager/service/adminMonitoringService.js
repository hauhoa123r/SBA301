import api from "../../../api/axios";

export const getAuditLogs = async ({
    keyword = "",
    page = 0,
    size = 8,
} = {}) => {
    const params = new URLSearchParams();
    if (keyword) params.append("keyword", keyword);
    params.append("page", page);
    params.append("size", size);

    const response = await api.get(`/api/admin/audit-logs?${params.toString()}`);
    return response.data;
};
