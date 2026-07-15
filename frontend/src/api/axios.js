import axios from "axios";

const api = axios.create({
  timeout: 0,
});

let refreshRequest = null;

const clearSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
};

const redirectToLogin = () => {
  if (window.location.pathname === "/login") return;

  const returnTo = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  window.location.assign(`/login?returnTo=${encodeURIComponent(returnTo)}`);
};

const refreshSession = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) {
    throw new Error("Refresh token is unavailable");
  }

  const response = await axios.post("/api/auth/refresh", { refreshToken });
  const { accessToken, refreshToken: nextRefreshToken, user } = response.data;

  if (!accessToken) {
    throw new Error("Refresh response does not contain an access token");
  }

  localStorage.setItem("token", accessToken);
  if (nextRefreshToken) localStorage.setItem("refreshToken", nextRefreshToken);
  if (user) localStorage.setItem("user", JSON.stringify(user));

  return accessToken;
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const requestUrl = originalRequest?.url || "";
    const isTokenRequest = requestUrl.includes("/api/auth/login")
      || requestUrl.includes("/api/auth/refresh")
      || requestUrl.includes("/api/auth/oauth/exchange");

    if (status !== 401 || !originalRequest || originalRequest._retry || isTokenRequest) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshRequest) {
        refreshRequest = refreshSession().finally(() => {
          refreshRequest = null;
        });
      }

      const accessToken = await refreshRequest;
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      clearSession();
      redirectToLogin();
      return Promise.reject(refreshError);
    }
  },
);

export default api;
