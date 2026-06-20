import api from "../../../api/axios";

export const login = async (data) => {
  const response = await api.post("/api/user/login", data);
  return response.data;
};

export const forgotPassword = async (data) => {
  const response = await api.post("/api/user/forgot-password", data);
  return response.data;
};


