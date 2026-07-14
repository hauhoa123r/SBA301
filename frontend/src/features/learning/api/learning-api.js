import api from "../../../api/axios";
import { API_LEARNING } from "../../../api/apiPath";

export async function getCourseLearningDetails(courseId) {
    const response = await api.get(`${API_LEARNING}/courses/${courseId}`);
    return response.data;
}
