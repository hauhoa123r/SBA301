import api from "../../../api/axios";
import { API_AUTH } from "@/api/apiPath.js";

export const login = async (data) => {
  const response = await api.post(`${API_AUTH}/login`, data);
  return response.data;
};

export const exchangeOAuthCode = async (code) => {
  const response = await api.post(`${API_AUTH}/oauth/exchange`, { code });
  return response.data;
};

export const logout = async () => {
  let serverLogoutSucceeded = false;
  try {
    await api.post(`${API_AUTH}/logout`);
    serverLogoutSucceeded = true;
  } catch {
    // Client credentials must still be removed when the backend is unavailable.
  } finally {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    sessionStorage.removeItem("oauthReturnTo");
  }
  return serverLogoutSucceeded;
};

export const register = async (data) => {
  const response = await api.post(`${API_AUTH}/register`, data);
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

export const verifyEmail = async (data) => {
  const response = await api.post(`${API_AUTH}/verify-email`, data);
  return response.data;
};

export const resetPassword = async (data) => {
  const response = await api.patch(`${API_AUTH}/reset-password`, data);
  return response.data;
}


