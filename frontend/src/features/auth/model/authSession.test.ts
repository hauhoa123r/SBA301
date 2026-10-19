import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  AUTH_STORAGE_KEYS,
  getStoredUser,
  clearAuthSession,
  persistLoginSession,
  parseLoginResponse,
  parseOAuthResponse,
} from "./authSession";

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();

  get length(): number {
    return this.values.size;
  }

  clear(): void {
    this.values.clear();
  }

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  key(index: number): string | null {
    return [...this.values.keys()][index] ?? null;
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

describe("supported authentication sessions", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", new MemoryStorage());
    vi.stubGlobal("sessionStorage", new MemoryStorage());
    clearAuthSession();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each(["MODERATOR", "TEACHER", "INSTRUCTOR", "USER"])(
    "rejects a legacy-only %s login",
    (role) => {
      expect(() => parseLoginResponse({ user: { roles: [role] } })).toThrow(
        /STUDENT/,
      );
    },
  );

  it("preserves both supported roles for a mixed-role login", () => {
    const session = parseLoginResponse({
      user: {
        id: 7,
        roles: ["ADMIN", "ROLE_STUDENT"],
        authorities: ["ROLE_MODERATOR"],
      },
      token: "access-token",
    });

    expect(session.user).toMatchObject({
      id: 7,
      role: "ADMIN",
      roles: ["ADMIN", "STUDENT"],
    });
    expect(session.user).not.toHaveProperty("authorities");
  });

  it("applies the same legacy-account policy to OAuth", () => {
    expect(() =>
      parseOAuthResponse({
        accessToken: "access-token",
        refreshToken: "refresh-token",
        user: { roles: ["ROLE_TEACHER"] },
      }),
    ).toThrow(/STUDENT/);
  });

  it("clears a persisted legacy-only session including its tokens", () => {
    localStorage.setItem(
      AUTH_STORAGE_KEYS.user,
      JSON.stringify({ roles: ["ROLE_TEACHER"] }),
    );
    localStorage.setItem(AUTH_STORAGE_KEYS.accessToken, "access-token");
    localStorage.setItem(AUTH_STORAGE_KEYS.refreshToken, "refresh-token");

    expect(getStoredUser()).toBeNull();
    expect(localStorage.getItem(AUTH_STORAGE_KEYS.user)).toBeNull();
    expect(localStorage.getItem(AUTH_STORAGE_KEYS.accessToken)).toBeNull();
    expect(localStorage.getItem(AUTH_STORAGE_KEYS.refreshToken)).toBeNull();
  });

  it("ignores persisted credentials and accepts admin OAuth without a refresh token in JSON", () => {
    localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify({ id: 1, roles: ["ROLE_ADMIN"] }));
    localStorage.setItem(AUTH_STORAGE_KEYS.accessToken, "access-token");
    expect(getStoredUser()).toBeNull();
    expect(parseOAuthResponse({ accessToken: "access", user: { roles: ["ADMIN"] } }).user.roles).toEqual(["ADMIN"]);
  });

  it("keeps tokens and user only in memory and preserves preferences during migration and logout", () => {
    localStorage.setItem("theme", "dark");
    sessionStorage.setItem("language", "vi");
    sessionStorage.setItem("token", "legacy-access");
    persistLoginSession(parseLoginResponse({ accessToken: "access", user: { id: 1, roles: ["ADMIN"] } }));
    expect(getStoredUser()?.id).toBe(1);
    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("refreshToken")).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
    expect(sessionStorage.getItem("token")).toBeNull();
    clearAuthSession();
    expect(getStoredUser()).toBeNull();
    expect(localStorage.getItem("theme")).toBe("dark");
    expect(sessionStorage.getItem("language")).toBe("vi");
  });
});
