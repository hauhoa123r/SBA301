import api from "../../../api/axios";
import { API_LEARNING } from "../../../api/apiPath";

export async function getLearningStats(courseId) {
    const params = courseId ? { courseId } : {};
    const response = await api.get(`${API_LEARNING}/stats`, { params });
    return response.data;
}
