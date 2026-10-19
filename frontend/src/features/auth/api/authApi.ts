import { beginLogout, confirmLogout, getLogoutIntent, getAuthVersion, withAuthLock } from "@/shared/api/authMemory";
import { API_AUTH, axiosClient } from "@/shared/api";
import type {
  AuthMessageResponse,
  EmailRequest,
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
  TokenVerificationRequest,
} from "../model/auth.types";
import { migrateLegacyAuthStorage, readMessageResponse } from "../model/authSession";

interface HttpResponse {
  data: unknown;
}

export const login = async (data: LoginRequest): Promise<unknown> => {
  const version = getAuthVersion();
  const response: HttpResponse = await withAuthLock(() => {
    if (version !== getAuthVersion()) throw new Error("Session changed during login");
    return axiosClient.post(`${API_AUTH}/login`, data, { timeout: 15000 });
  });
  if (version !== getAuthVersion()) throw new Error("Session changed during login");
  return response.data;
};

export const exchangeOAuthCode = async (code: string): Promise<unknown> => {
  const version = getAuthVersion();
  const response: HttpResponse = await withAuthLock(() => {
    if (version !== getAuthVersion()) throw new Error("Session changed during OAuth exchange");
    return axiosClient.post(`${API_AUTH}/oauth/exchange`, { code }, { timeout: 15000 });
  });
  if (version !== getAuthVersion()) throw new Error("Session changed during OAuth exchange");
  return response.data;
};

export const logout = async (): Promise<boolean> => {
  beginLogout();
  migrateLegacyAuthStorage();
  return retryPendingLogout();
};

let logoutRequest: Promise<boolean> | null = null;
export const retryPendingLogout = (): Promise<boolean> => {
  if (logoutRequest) return logoutRequest;
  const intent = getLogoutIntent();
  if (!intent?.pending) return Promise.resolve(true);
  logoutRequest = attemptLogout(intent.id).finally(() => { logoutRequest = null; });
  return logoutRequest;
};

async function attemptLogout(id: string): Promise<boolean> {
  try {
    return await withAuthLock(async () => {
      // An explicit login may have replaced this logout while waiting for another tab.
      if (getLogoutIntent()?.id !== id) return false;
      await axiosClient.post(`${API_AUTH}/logout`, {}, { timeout: 15000 });
      confirmLogout(id);
      return true;
    });
  } catch {
    return false;
  }
}

async function postMessage(path: string, data: unknown): Promise<AuthMessageResponse> {
  const response: HttpResponse = await axiosClient.post(`${API_AUTH}${path}`, data);
  return readMessageResponse(response.data);
}

export const register = async (data: RegisterRequest): Promise<RegisterResponse> => {
  const response = await axiosClient.post<RegisterResponse>(`${API_AUTH}/register`, data);
  return response.data;
};

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
