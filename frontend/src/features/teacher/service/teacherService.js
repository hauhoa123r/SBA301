import axios from '../../../api/axios';

const API_BASE = '/teacher';

export const getTeacherCourses = async () => {
  try {
    const response = await axios.get(`${API_BASE}/courses`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Lỗi khi tải danh sách khóa học');
  }
};

export const getTeacherDashboardStats = async () => {
  try {
    const response = await axios.get(`${API_BASE}/dashboard/stats`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Lỗi khi tải thống kê');
  }
};

export const getCourseReviews = async (courseId) => {
  try {
    const url = courseId ? `${API_BASE}/reviews?courseId=${courseId}` : `${API_BASE}/reviews`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Lỗi khi tải đánh giá');
  }
};

export const createCourse = async (courseData) => {
  try {
    const response = await axios.post(`${API_BASE}/courses`, courseData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Lỗi khi tạo khóa học');
  }
};

export const updateCourse = async (courseId, courseData) => {
  try {
    const response = await axios.put(`${API_BASE}/courses/${courseId}`, courseData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Lỗi khi cập nhật khóa học');
  }
};

export const getCourseCurriculum = async (courseId) => {
  try {
    const response = await axios.get(`${API_BASE}/courses/${courseId}/curriculum`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Lỗi khi tải giáo trình');
  }
};

export const updateCourseCurriculum = async (courseId, curriculumData) => {
  try {
    const response = await axios.put(`${API_BASE}/courses/${courseId}/curriculum`, {
      chapters: curriculumData,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Lỗi khi cập nhật giáo trình');
  }
};

export const deleteCourse = async (courseId) => {
  try {
    const response = await axios.delete(`${API_BASE}/courses/${courseId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Lỗi khi xóa khóa học');
  }
};
