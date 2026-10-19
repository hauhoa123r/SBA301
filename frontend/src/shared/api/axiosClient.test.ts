import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from "axios";

const user = { id: 7, roles: ["STUDENT"] };

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
}

async function setup(options: { rejectRefresh?: boolean; rejectRetry?: boolean; holdRefresh?: boolean; refreshStatus?: number; holdRetry?: boolean } = {}) {
  const axios = (await import("axios")).default;
  let refreshCount = 0;
  let protectedCount = 0;
  let logoutCount = 0;
  const refreshStarted = deferred<void>();
  const releaseRefresh = deferred<void>();
  const retryStarted = deferred<void>();
  const releaseRetry = deferred<void>();
  const response = (config: InternalAxiosRequestConfig, data: unknown, status = 200): AxiosResponse => ({
    config, data, status, statusText: String(status), headers: {},
  });
  const reject = (config: InternalAxiosRequestConfig, status: number): never => {
    throw new axios.AxiosError("Request rejected", "ERR_BAD_REQUEST", config, undefined, response(config, {}, status));
  };
  const adapter: AxiosAdapter = async (config) => {
    expect(config.withCredentials).toBe(true);
    if (config.url === "/api/auth/csrf") return response(config, { token: "csrf-test" });
    if (config.url === "/api/auth/refresh") {
      refreshCount++;
      expect(config.headers.get("X-XSRF-TOKEN")).toBe("csrf-test");
      expect(config.data).not.toContain("refreshToken");
      refreshStarted.resolve();
      if (options.holdRefresh) await releaseRefresh.promise;
      if (options.rejectRefresh) reject(config, 401);
      if (options.refreshStatus) reject(config, options.refreshStatus);
      return response(config, { accessToken: "new-access", user });
    }
    if (config.url === "/api/auth/logout") {
      logoutCount++;
      expect(config.headers.get("X-XSRF-TOKEN")).toBe("csrf-test");
      return response(config, {}, 204);
    }
    protectedCount++;
    if (options.holdRetry && config.headers.get("Authorization") === "Bearer new-access") {
      retryStarted.resolve();
      await releaseRetry.promise;
      reject(config, 401);
    }
    if (config.headers.get("Authorization") !== "Bearer new-access" || options.rejectRetry) reject(config, 401);
    return response(config, { ok: true });
  };
  axios.defaults.adapter = adapter;
  const client = await import("./axiosClient");
  const memory = await import("./authMemory");
  return { ...client, ...memory, refreshStarted, releaseRefresh, retryStarted, releaseRetry,
    counts: () => ({ refreshCount, protectedCount, logoutCount }) };
}

describe("memory authentication transport", () => {
  beforeEach(() => { vi.resetModules(); });

  it("restores a page reload once and stays initializing until the cookie refresh finishes", async () => {
    const auth = await setup({ holdRefresh: true });
    expect(auth.getAuthState()).toMatchObject({ accessToken: null, initializing: true });
    const first = auth.initializeAuth();
    const strictModeRepeat = auth.initializeAuth();
    await auth.refreshStarted.promise;
    expect(auth.getAuthState().initializing).toBe(true);
    auth.releaseRefresh.resolve();
    await Promise.all([first, strictModeRepeat]);
    expect(auth.counts().refreshCount).toBe(1);
    expect(auth.getAuthState()).toMatchObject({ accessToken: "new-access", user: { id: 7 }, initializing: false });
  });

  it("shares one refresh across simultaneous 401s and retries every request once", async () => {
    const auth = await setup({ holdRefresh: true });
    auth.setMemorySession("expired-access", { ...user, roles: ["STUDENT"], role: "STUDENT" }, true);
    const requests = Array.from({ length: 12 }, () => auth.axiosClient.get("/api/learning/stats"));
    await auth.refreshStarted.promise;
    auth.releaseRefresh.resolve();
    const results = await Promise.all(requests);
    expect(results.every((result) => result.status === 200)).toBe(true);
    expect(auth.counts()).toMatchObject({ refreshCount: 1, protectedCount: 24 });
  });

  it("stops after one retry when the protected endpoint still returns 401", async () => {
    const auth = await setup({ rejectRetry: true });
    auth.setMemorySession("expired-access", { ...user, roles: ["STUDENT"], role: "STUDENT" }, true);
    await expect(auth.axiosClient.get("/api/learning/stats")).rejects.toThrow();
    expect(auth.counts()).toMatchObject({ refreshCount: 1, protectedCount: 2 });
  });

  it("clears the in-memory user and credentials when the refresh session expires", async () => {
    const auth = await setup({ rejectRefresh: true });
    auth.setMemorySession("expired-access", { ...user, roles: ["STUDENT"], role: "STUDENT" }, true);
    await expect(auth.axiosClient.get("/api/learning/stats")).rejects.toThrow();
    expect(auth.getAuthState()).toMatchObject({ accessToken: null, user: null, initializing: false });
    expect(auth.counts().refreshCount).toBe(1);
  });

  it("does not resurrect memory credentials when logout happens during refresh", async () => {
    const auth = await setup({ holdRefresh: true });
    auth.setMemorySession("expired-access", { ...user, roles: ["STUDENT"], role: "STUDENT" }, true);
    const pending = auth.refreshSession();
    const rejected = expect(pending).rejects.toThrow(/Session changed/);
    await auth.refreshStarted.promise;
    auth.clearMemorySession();
    const logout = auth.withAuthLock(() => auth.axiosClient.post("/api/auth/logout"));
    expect(auth.counts().logoutCount).toBe(0);
    auth.releaseRefresh.resolve();
    await rejected;
    await logout;
    expect(auth.getAuthState()).toMatchObject({ accessToken: null, user: null });
    expect(auth.counts().logoutCount).toBe(1);
  });

  it("treats an expired refresh cookie as anonymous on reload without retry loops", async () => {
    const auth = await setup({ rejectRefresh: true });
    await auth.initializeAuth();
    expect(auth.getAuthState()).toMatchObject({ accessToken: null, user: null, initializing: false });
    expect(auth.counts().refreshCount).toBe(1);
  });

  it.each([409, 500])("stops a refresh failure with status %s without looping", async (refreshStatus) => {
    const auth = await setup({ refreshStatus });
    auth.setMemorySession("expired-access", { ...user, roles: ["STUDENT"], role: "STUDENT" }, true);
    await expect(auth.axiosClient.get("/api/learning/stats")).rejects.toThrow();
    expect(auth.counts()).toMatchObject({ refreshCount: 1, protectedCount: 1 });
  });

  it.each([true, false])("does not erase newer credentials on an old retry 401 (new login: %s)", async newLogin => {
    const auth = await setup({ holdRetry: true });
    auth.setMemorySession("expired-access", { ...user, roles: ["STUDENT"], role: "STUDENT" }, true);
    const request = auth.axiosClient.get("/api/learning/stats");
    const rejected = expect(request).rejects.toThrow();
    await auth.retryStarted.promise;
    if (newLogin) auth.clearMemorySession();
    auth.setMemorySession("another-login", { ...user, roles: ["STUDENT"], role: "STUDENT" }, newLogin);
    auth.releaseRetry.resolve();
    await rejected;
    expect(auth.getAuthState().accessToken).toBe("another-login");
  });
});
