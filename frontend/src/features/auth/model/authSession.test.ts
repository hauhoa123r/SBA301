import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  AUTH_STORAGE_KEYS,
  getStoredUser,
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

  it("restores an admin session and accepts admin OAuth responses", () => {
    localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify({ id: 1, roles: ["ROLE_ADMIN"] }));
    localStorage.setItem(AUTH_STORAGE_KEYS.accessToken, "access-token");
    expect(getStoredUser()).toMatchObject({ id: 1, role: "ADMIN", roles: ["ADMIN"] });
    expect(parseOAuthResponse({ accessToken: "access", refreshToken: "refresh", user: { roles: ["ADMIN"] } }).user.roles).toEqual(["ADMIN"]);
  });
});
