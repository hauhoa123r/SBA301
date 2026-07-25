import { isUser, toStudentUser, type StudentUser } from "@/entities/user";
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

function requireStudentUser(value: unknown): StudentUser {
  if (!isUser(value)) throw new Error("Login response does not contain a user");

  const user = toStudentUser(value);
  if (!user) {
    throw new Error(
      "Tài khoản này không còn được hỗ trợ. Chỉ tài khoản STUDENT có thể đăng nhập.",
    );
  }

  return user;
}

export function parseLoginResponse(value: unknown): AuthSession {
  if (!isRecord(value)) throw new Error("Invalid login response");

  const data = isRecord(value.data) ? value.data : undefined;
  const userCandidate = firstTruthy([value.user, data?.user, data, value]);
  const user = requireStudentUser(userCandidate);

  return {
    user,
    accessToken: readOptionalString(firstTruthy([value.token, data?.token, value.accessToken, data?.accessToken])),
    refreshToken: readOptionalString(firstTruthy([value.refreshToken, data?.refreshToken])),
  };
}

export function parseOAuthResponse(value: unknown): OAuthSession {
  if (!isRecord(value)) throw new Error("Invalid OAuth response");

  const accessToken = readOptionalString(value.accessToken);
  const refreshToken = readOptionalString(value.refreshToken);
  if (!accessToken || !refreshToken || !isUser(value.user)) {
    throw new Error("OAuth response does not contain a complete session");
  }

  const user = requireStudentUser(value.user);
  return { accessToken, refreshToken, user };
}

export function readMessageResponse(value: unknown): AuthMessageResponse {
  if (!isRecord(value)) return {};
  return { message: typeof value.message === "string" ? value.message : undefined };
}

export function getStoredUser(): StudentUser | null {
  const savedUser = localStorage.getItem(AUTH_STORAGE_KEYS.user);
  const accessToken = localStorage.getItem(AUTH_STORAGE_KEYS.accessToken);
  const refreshToken = localStorage.getItem(AUTH_STORAGE_KEYS.refreshToken);
  const hasSession = accessToken ? accessToken : refreshToken;

  if (!savedUser || !hasSession) {
    clearAuthSession();
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(savedUser);
    const user = toStudentUser(parsed);
    if (user) {
      persistUser(user);
      return user;
    }
  } catch {
    // Invalid persisted JSON is handled by clearing the cached user below.
  }

  clearAuthSession();
  return null;
}

export function persistUser(user: StudentUser | null): void {
  if (user) {
    localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(user));
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEYS.user);
  }
}

export function persistLoginSession(session: AuthSession): void {
  persistUser(session.user);
  if (session.accessToken) {
    localStorage.setItem(AUTH_STORAGE_KEYS.accessToken, session.accessToken);
  }
  if (session.refreshToken) {
    localStorage.setItem(AUTH_STORAGE_KEYS.refreshToken, session.refreshToken);
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEYS.refreshToken);
  }
}

export function persistOAuthSession(session: OAuthSession): void {
  localStorage.setItem(AUTH_STORAGE_KEYS.accessToken, session.accessToken);
  localStorage.setItem(AUTH_STORAGE_KEYS.refreshToken, session.refreshToken);
  persistUser(session.user);
}

export function clearAuthSession(): void {
  localStorage.removeItem(AUTH_STORAGE_KEYS.user);
  localStorage.removeItem(AUTH_STORAGE_KEYS.accessToken);
  localStorage.removeItem(AUTH_STORAGE_KEYS.refreshToken);
  sessionStorage.removeItem(AUTH_STORAGE_KEYS.oauthReturnTo);
}
