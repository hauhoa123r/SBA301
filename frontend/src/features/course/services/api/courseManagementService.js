import axiosInstance from '../../../../api/axios';
import {
  API_CATEGORIES,
  API_TAGS,
  API_COURSES
} from '../../../../api/apiPath';

const courseManagementService = {
  
  getCourseById: async (id) => {
    try {
      const response = await axiosInstance.get(`${API_COURSES}/manage-course/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error loading course details', { cause: error });
    }
  },

  getCourses: async () => {
    try {
      const response = await axiosInstance.get(`${API_COURSES}/manage-course`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error loading course list', { cause: error });
    }
  },

  createCourse: async (data) => {
    try {
      const response = await axiosInstance.post(`${API_COURSES}`, data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error creating course', { cause: error });
    }
  },

  updateCourse: async (id, data) => {
    try {
      const response = await axiosInstance.put(`${API_COURSES}/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error updating course', { cause: error });
    }
  },

  deleteCourse: async (id) => {
    try {
      const response = await axiosInstance.delete(`${API_COURSES}/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error deleting course', { cause: error });
    }
  },

  // ─── Dashboard ──────────────────────────────────────────────────────────────
  getDashboardStats: async () => {
    try {
      const response = await axiosInstance.get(`${API_COURSES}/dashboard/stats`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error loading statistics', { cause: error });
    }
  },

  // ─── Reviews ────────────────────────────────────────────────────────────────
  getCourseReviews: async (courseId) => {
    try {
      const url = courseId
        ? `/reviews?courseId=${courseId}`
        : `/reviews`;
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error loading reviews', { cause: error });
    }
  },

  // ─── Curriculum ─────────────────────────────────────────────────────────────
  getCurriculum: async (courseId) => {
    try {
      const response = await axiosInstance.get(`${API_COURSES}/${courseId}/curriculum`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error loading curriculum', { cause: error });
    }
  },

  updateCurriculum: async (courseId, chapters) => {
    try {
      const response = await axiosInstance.put(`${API_COURSES}/${courseId}/curriculum`, chapters);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error updating curriculum', { cause: error });
    }
  },

  // ─── Master Data ────────────────────────────────────────────────────────────
  getCategories: async () => {
    try {
      const response = await axiosInstance.get(API_CATEGORIES);
      return response.data?.data ?? response.data ?? [];
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error loading categories', { cause: error });
    }
  },

  getTags: async () => {
    try {
      const response = await axiosInstance.get(API_TAGS);
      return response.data?.data ?? response.data ?? [];
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error loading tags', { cause: error });
    }
  },

};

export default courseManagementService;
