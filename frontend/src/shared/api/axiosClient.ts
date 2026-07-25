import axios, { type AxiosResponse } from "axios";

const ACCESS_TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_KEY = "user";

interface RefreshSessionRequest {
  refreshToken: string;
}

interface RefreshSessionResponse {
  accessToken?: string;
  refreshToken?: string;
  user?: unknown;
}

export const axiosClient = axios.create({
  timeout: 0,
});

let refreshRequest: Promise<string> | null = null;

const clearSession = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

const redirectToLogin = (): void => {
  if (window.location.pathname === "/login") return;

  const returnTo = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  window.location.assign(`/login?returnTo=${encodeURIComponent(returnTo)}`);
};

const refreshSession = async (): Promise<string> => {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) {
    throw new Error("Refresh token is unavailable");
  }

  const response = await axios.post<
    RefreshSessionResponse,
    AxiosResponse<RefreshSessionResponse>,
    RefreshSessionRequest
  >("/api/auth/refresh", { refreshToken });
  const {
    accessToken,
    refreshToken: nextRefreshToken,
    user,
  } = response.data;

  if (!accessToken) {
    throw new Error("Refresh response does not contain an access token");
  }

  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (nextRefreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, nextRefreshToken);
  }
  if (user) {
    const serializedUser = JSON.stringify(user);
    if (serializedUser !== undefined) {
      localStorage.setItem(USER_KEY, serializedUser);
    }
  }

  return accessToken;
};

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (token) config.headers.set("Authorization", `Bearer ${token}`);
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError<unknown, unknown>(error)) {
      throw error;
    }

    const originalRequest = error.config;
    const status = error.response?.status;
    const requestUrl = originalRequest?.url ?? "";
    const isTokenRequest = requestUrl.includes("/api/auth/login")
      || requestUrl.includes("/api/auth/refresh")
      || requestUrl.includes("/api/auth/oauth/exchange");
    const hasAlreadyRetried = originalRequest
      ? Reflect.get(originalRequest, "_retry") === true
      : false;

    if (
      status !== 401
      || !originalRequest
      || hasAlreadyRetried
      || isTokenRequest
    ) {
      return Promise.reject(error);
    }

    Reflect.set(originalRequest, "_retry", true);

    try {
      if (!refreshRequest) {
        refreshRequest = refreshSession().finally(() => {
          refreshRequest = null;
        });
      }

      const accessToken = await refreshRequest;
      originalRequest.headers.set("Authorization", `Bearer ${accessToken}`);
      return axiosClient(originalRequest);
    } catch (refreshError: unknown) {
      clearSession();
      redirectToLogin();
      throw refreshError;
    }
  },
);

export default axiosClient;
