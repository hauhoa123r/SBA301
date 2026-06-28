import api from "../../../api/axios";
import { API_AUTH } from "../../../api/apiPath";

export const login = async (data) => {
  const response = await api.post(`${API_AUTH}/login`, data);
  return response.data;
};

export const forgotPassword = async (data) => {
  const response = await api.post(`${API_AUTH}/forgot-password`, data);
  return response.data;
};

export const verifyToken = async (data) => {
  const response = await api.post(`${API_AUTH}/verify-token`, data);
  return response.data;
};


