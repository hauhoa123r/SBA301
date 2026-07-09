import axiosInstance from '../../../../api/axios';
import {
  API_CATEGORIES,
  API_TAGS,
  API_PLANS,
  API_COURSES
} from '../../../../api/apiPath';

const courseManagementService = {
  
  getCourses: async () => {
    try {
      const response = await axiosInstance.get(`${API_COURSES}/manage-course`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error loading course list');
    }
  },

  createCourse: async (data) => {
    try {
      const response = await axiosInstance.post(`${API_COURSES}`, data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error creating course');
    }
  },

  updateCourse: async (id, data) => {
    try {
      const response = await axiosInstance.put(`/courses/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error updating course');
    }
  },

  deleteCourse: async (id) => {
    try {
      const response = await axiosInstance.delete(`/courses/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error deleting course');
    }
  },

  // ─── Dashboard ──────────────────────────────────────────────────────────────
  getDashboardStats: async () => {
    try {
      const response = await axiosInstance.get('/dashboard/stats');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error loading statistics');
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
      throw new Error(error.response?.data?.message || 'Error loading reviews');
    }
  },

  // ─── Curriculum ─────────────────────────────────────────────────────────────
  getCurriculum: async (courseId) => {
    try {
      const response = await axiosInstance.get(`/courses/${courseId}/curriculum`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error loading curriculum');
    }
  },

  updateCurriculum: async (courseId, chapters) => {
    try {
      const response = await axiosInstance.put(`/courses/${courseId}/curriculum`, chapters);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error updating curriculum');
    }
  },

  // ─── Master Data ────────────────────────────────────────────────────────────
  getCategories: async () => {
    try {
      const response = await axiosInstance.get(API_CATEGORIES);
      return response.data?.data ?? response.data ?? [];
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error loading categories');
    }
  },

  getTags: async () => {
    try {
      const response = await axiosInstance.get(API_TAGS);
      return response.data?.data ?? response.data ?? [];
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error loading tags');
    }
  },

  getPlans: async () => {
    try {
      const response = await axiosInstance.get(API_PLANS);
      return response.data?.data ?? response.data ?? [];
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error loading plans');
    }
  },
};

export default courseManagementService;
