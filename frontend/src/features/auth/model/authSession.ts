import { isUser, toSupportedUser, type SupportedUser } from "@/entities/user";
import { clearMemorySession, getAuthState, setMemorySession, setMemoryUser } from "@/shared/api/authMemory";
import type { AuthMessageResponse, AuthSession, OAuthSession } from "./auth.types";

export const AUTH_STORAGE_KEYS = {
  user: "user",
  accessToken: "token",
  refreshToken: "refreshToken",
  oauthReturnTo: "oauthReturnTo",
} as const;

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value ? value : undefined;
}

function firstTruthy(values: readonly unknown[]): unknown {
  return values.find(Boolean);
}

function requireSupportedUser(value: unknown): SupportedUser {
  if (!isUser(value)) throw new Error("Login response does not contain a user");

  const user = toSupportedUser(value);
  if (!user) {
    throw new Error(
      "Tài khoản này không còn được hỗ trợ. Chỉ tài khoản STUDENT hoặc ADMIN có thể đăng nhập.",
    );
  }

  return user;
}

export function parseLoginResponse(value: unknown): AuthSession {
  if (!isRecord(value)) throw new Error("Invalid login response");

  const data = isRecord(value.data) ? value.data : undefined;
  const userCandidate = firstTruthy([value.user, data?.user, data, value]);
  const user = requireSupportedUser(userCandidate);

  return {
    user,
    accessToken: readOptionalString(firstTruthy([value.token, data?.token, value.accessToken, data?.accessToken])),
  };
}

export function parseOAuthResponse(value: unknown): OAuthSession {
  if (!isRecord(value)) throw new Error("Invalid OAuth response");

  const accessToken = readOptionalString(value.accessToken);
  if (!accessToken || !isUser(value.user)) {
    throw new Error("OAuth response does not contain a complete session");
  }

  const user = requireSupportedUser(value.user);
  return { accessToken, user };
}

export function readMessageResponse(value: unknown): AuthMessageResponse {
  if (!isRecord(value)) return {};
  return { message: typeof value.message === "string" ? value.message : undefined };
}

// Remove only known legacy authentication keys. Preferences remain untouched.
export function migrateLegacyAuthStorage(): void {
  for (const name of ["localStorage", "sessionStorage"] as const) {
    try {
      for (const key of [AUTH_STORAGE_KEYS.user, AUTH_STORAGE_KEYS.accessToken, AUTH_STORAGE_KEYS.refreshToken]) {
        globalThis[name].removeItem(key);
      }
    } catch { /* Browsers may deny storage; authentication remains in memory. */ }
  }
}

export function getStoredUser(): SupportedUser | null {
  migrateLegacyAuthStorage();
  return getAuthState().user;
}

export function persistUser(user: SupportedUser | null): void {
  setMemoryUser(user);
}

export function persistLoginSession(session: AuthSession): void {
  if (!session.accessToken) throw new Error("Login response does not contain an access token");
  migrateLegacyAuthStorage();
  setMemorySession(session.accessToken, session.user, true);
}

export function persistOAuthSession(session: OAuthSession): void {
  persistLoginSession(session);
}

export function clearAuthSession(): void {
  clearMemorySession();
  migrateLegacyAuthStorage();
  try { sessionStorage.removeItem(AUTH_STORAGE_KEYS.oauthReturnTo); } catch { /* Storage may be unavailable. */ }
}
