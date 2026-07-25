import { API_LEARNING, axiosClient as api } from "@/shared/api";

export async function getLearningStats(courseId) {
    const params = courseId ? { courseId } : {};
    const response = await api.get(`${API_LEARNING}/stats`, { params });
    return response.data;
}
