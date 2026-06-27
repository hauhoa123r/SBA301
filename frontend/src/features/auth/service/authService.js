import api from "../../../api/axios";

export const login = async (data) => {
  const response = await api.post("/api/auth/login", data);
  return response.data;
};

export const forgotPassword = async (data) => {
  const response = await api.post("/api/auth/forgot-password", data);
  return response.data;
};

export const verifyToken = async (data) => {
  const response = await api.post("/api/auth/verify-token", data);
  return response.data;
};


