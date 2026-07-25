import { API_AUTH, axiosClient } from "@/shared/api";
import type {
  AuthMessageResponse,
  EmailRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  TokenVerificationRequest,
} from "../model/auth.types";
import { clearAuthSession, readMessageResponse } from "../model/authSession";

interface HttpResponse {
  data: unknown;
}

export const login = async (data: LoginRequest): Promise<unknown> => {
  const response: HttpResponse = await axiosClient.post(`${API_AUTH}/login`, data);
  return response.data;
};

export const exchangeOAuthCode = async (code: string): Promise<unknown> => {
  const response: HttpResponse = await axiosClient.post(`${API_AUTH}/oauth/exchange`, { code });
  return response.data;
};

export const logout = async (): Promise<boolean> => {
  let serverLogoutSucceeded = false;
  try {
    await axiosClient.post(`${API_AUTH}/logout`);
    serverLogoutSucceeded = true;
  } catch {
    // Client credentials must still be removed when the backend is unavailable.
  } finally {
    clearAuthSession();
  }
  return serverLogoutSucceeded;
};

async function postMessage(path: string, data: unknown): Promise<AuthMessageResponse> {
  const response: HttpResponse = await axiosClient.post(`${API_AUTH}${path}`, data);
  return readMessageResponse(response.data);
}

export const register = (data: RegisterRequest): Promise<AuthMessageResponse> =>
  postMessage("/register", data);

export const forgotPassword = (data: EmailRequest): Promise<AuthMessageResponse> =>
  postMessage("/forgot-password", data);

export const verifyToken = (data: TokenVerificationRequest): Promise<AuthMessageResponse> =>
  postMessage("/verify-token", data);

export const verifyEmail = (data: TokenVerificationRequest): Promise<AuthMessageResponse> =>
  postMessage("/verify-email", data);

export const resetPassword = async (data: ResetPasswordRequest): Promise<AuthMessageResponse> => {
  const response: HttpResponse = await axiosClient.patch(`${API_AUTH}/reset-password`, data);
  return readMessageResponse(response.data);
};
