import api from "../../../api/axios";
import { API_LEARNING } from "../../../api/apiPath";

const getStoredUserId = () => {
    try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        return user?.id;
    } catch {
        return null;
    }
};

export async function getLearningStats(courseId) {
    const userId = getStoredUserId();
    const params = courseId ? { courseId } : {};
    const response = await api.get(`${API_LEARNING}/stats`, {
        params,
        headers: userId ? { "X-User-Id": userId } : undefined,
    });
    return response.data;
}
