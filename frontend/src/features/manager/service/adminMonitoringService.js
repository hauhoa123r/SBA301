import api from "../../../api/axios";

export const getAuditLogs = async ({
    keyword = "",
    page = 0,
    size = 10,
    sortBy = "createdAt",
    sortDir = "desc",
} = {}) => {
    const params = new URLSearchParams();
    if (keyword) params.append("keyword", keyword);
    params.append("page", page);
    params.append("size", size);
    params.append("sortBy", sortBy);
    params.append("sortDir", sortDir);

    const response = await api.get(`/api/admin/audit-logs?${params.toString()}`);
    return response.data;
};

export const getAuditLogById = async (id) => {
    const response = await api.get(`/api/admin/audit-logs/${id}`);
    return response.data;
};
