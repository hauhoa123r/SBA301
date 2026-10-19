import axios from "axios";
import { toSupportedUser } from "@/entities/user";
import {
  clearMemorySession, finishAuthInitialization, getAuthState, getAuthVersion,
  setMemorySession, withAuthLock, getLogoutIntent,
} from "./authMemory";

const cookieClient = axios.create({ withCredentials: true, timeout: 15000 });
export const axiosClient = axios.create({ timeout: 0, withCredentials: true });
let refreshRequest: Promise<string> | null = null;
let initialization: Promise<void> | null = null;

export async function csrfHeaders(): Promise<Record<string, string>> {
  const { data } = await cookieClient.get<{ token: string }>("/api/auth/csrf");
  return { "X-XSRF-TOKEN": data.token };
}

export function refreshSession(): Promise<string> {
  if (getLogoutIntent()) return Promise.reject(new Error("Session has been logged out"));
  if (refreshRequest) return refreshRequest;
  const version = getAuthVersion();
  refreshRequest = withAuthLock(async () => {
    if (version !== getAuthVersion() || getLogoutIntent()) throw new Error("Session changed during refresh");
    const response = await cookieClient.post<{ accessToken: string; user: unknown }>(
      "/api/auth/refresh", {}, { headers: await csrfHeaders() },
    );
    const user = toSupportedUser(response.data.user);
    if (!response.data.accessToken || !user) throw new Error("Invalid refresh response");
    if (version !== getAuthVersion() || getLogoutIntent()) throw new Error("Session changed during refresh");
    setMemorySession(response.data.accessToken, user);
    return response.data.accessToken;
  }).catch((error: unknown) => {
    if (version === getAuthVersion()) clearMemorySession();
    throw error;
  }).finally(() => { refreshRequest = null; });
  return refreshRequest;
}

export function initializeAuth(): Promise<void> {
  initialization ??= refreshSession().then(() => undefined).catch(() => undefined)
    .finally(finishAuthInitialization);
  return initialization;
}

function isCookieMutation(url: string, method?: string): boolean {
  return method?.toLowerCase() === "post"
    && ["/api/auth/login", "/api/auth/oauth/exchange", "/api/auth/refresh", "/api/auth/logout"].includes(url);
}

axiosClient.interceptors.request.use(async (config) => {
  const requestVersion: unknown = Reflect.get(config, "_authVersion");
  if (requestVersion !== undefined && requestVersion !== getAuthVersion()) throw new Error("Session changed during request");
  Reflect.set(config, "_authVersion", getAuthVersion());
  if (isCookieMutation(config.url ?? "", config.method)) {
    const headers = await csrfHeaders();
    config.headers.set("X-XSRF-TOKEN", headers["X-XSRF-TOKEN"]);
  } else {
    const token = getAuthState().accessToken;
    if (token) config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) throw error;
    const original = error.config;
    if (error.response?.status !== 401 || !original) throw error;
    if (Reflect.get(original, "_authVersion") !== getAuthVersion()) throw error;
    if (Reflect.get(original, "_retry") === true) {
      if (original.headers.get("Authorization") === `Bearer ${getAuthState().accessToken}`) clearMemorySession();
      throw error;
    }
    if ((original.url ?? "").startsWith("/api/auth/") && original.url !== "/api/auth/me") throw error;
    // Public API failures and requests made after logout must not restore an old session.
    if (!getAuthState().accessToken) throw error;
    Reflect.set(original, "_retry", true);
    const current = `Bearer ${getAuthState().accessToken}`;
    // A late 401 for an old token can use the token already obtained by another request.
    if (original.headers.get("Authorization") !== current) {
      original.headers.set("Authorization", current);
    } else {
      original.headers.set("Authorization", `Bearer ${await refreshSession()}`);
    }
    return axiosClient(original);
  },
);

export default axiosClient;
