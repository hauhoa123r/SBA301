import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from "axios";

const user = { id: 7, roles: ["STUDENT"] as ["STUDENT"], role: "STUDENT" as const };
const logoutKey = "learning-platform.logout";

function storage(): Storage {
  const values = new Map<string, string>();
  return {
    get length() { return values.size; }, clear: () => values.clear(),
    getItem: key => values.get(key) ?? null, key: index => [...values.keys()][index] ?? null,
    removeItem: key => { values.delete(key); }, setItem: (key, value) => { values.set(key, value); },
  };
}

async function setup(failure?: "network" | "server") {
  const axios = (await import("axios")).default;
  const calls: string[] = [];
  const adapter: AxiosAdapter = async config => {
    await Promise.resolve();
    calls.push(config.url ?? "");
    const response = (data: unknown, status = 200): AxiosResponse => ({
      data, status, statusText: String(status), headers: {}, config,
    });
    if (config.url === "/api/auth/csrf") return response({ token: "csrf" });
    if (config.url === "/api/auth/logout") {
      if (failure === "network") throw new axios.AxiosError("Network Error", "ERR_NETWORK", config);
      if (failure === "server") throw new axios.AxiosError("Server Error", "ERR_BAD_RESPONSE", config, undefined, response({}, 500));
      return response({}, 204);
    }
    return response({ accessToken: "test-access", user });
  };
  axios.defaults.adapter = adapter;
  return { memory: await import("./authMemory"), client: await import("./axiosClient"),
    api: await import("../../features/auth/api/authApi"), calls };
}

describe("logout security", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubGlobal("window", new EventTarget());
    vi.stubGlobal("localStorage", storage());
    vi.stubGlobal("sessionStorage", storage());
  });
  afterEach(() => { vi.unstubAllGlobals(); });

  it("clears the other tab immediately on a logout storage event", async () => {
    const { memory } = await setup();
    memory.setMemorySession("old-access", user, true);
    const value = JSON.stringify({ id: "tab-a", pending: true });
    localStorage.setItem(logoutKey, value);
    window.dispatchEvent(Object.assign(new Event("storage"), { key: logoutKey, newValue: value }));
    expect(memory.getAuthState().accessToken).toBeNull();
  });

  it.each(["network", "server"] as const)("keeps logout intent across reload after %s failure", async failure => {
    const { memory, api } = await setup(failure);
    memory.setMemorySession("old-access", user, true);
    const result = api.logout();
    expect(memory.getAuthState().accessToken).toBeNull();
    expect(await result).toBe(false);
    expect(localStorage.getItem(logoutKey)).toContain('"pending":true');
    vi.resetModules();
    const reloaded = await setup();
    await reloaded.client.initializeAuth();
    expect(reloaded.calls).not.toContain("/api/auth/refresh");
    expect(reloaded.memory.getAuthState().accessToken).toBeNull();
    expect(await reloaded.api.retryPendingLogout()).toBe(true);
    expect(localStorage.getItem(logoutKey)).toContain('"pending":false');
  });

  it("confirmed logout also prevents automatic refresh on the next reload", async () => {
    const first = await setup();
    first.memory.setMemorySession("old-access", user, true);
    expect(await first.api.logout()).toBe(true);
    vi.resetModules();
    const reloaded = await setup();
    await reloaded.client.initializeAuth();
    expect(reloaded.calls).not.toContain("/api/auth/refresh");
  });

  it("keeps React snapshots and the logout marker free of credentials", async () => {
    const { memory, api } = await setup();
    memory.setMemorySession("synthetic-secret-access", user, true);
    expect(memory.getAuthViewState()).not.toHaveProperty("accessToken");
    await api.logout();
    const intent: unknown = JSON.parse(localStorage.getItem(logoutKey)!);
    expect(intent).toMatchObject({ pending: false });
    expect(typeof (intent as { id: unknown }).id).toBe("string");
    expect(localStorage.getItem(logoutKey)).not.toContain("synthetic-secret-access");
  });

  it("still clears credentials and logs out if browser storage is denied", async () => {
    const { memory, api } = await setup();
    const denied = () => { throw new Error("Storage denied"); };
    vi.stubGlobal("localStorage", { getItem: denied, setItem: denied, removeItem: denied });
    vi.stubGlobal("sessionStorage", { removeItem: denied });
    memory.setMemorySession("old-access", user, true);
    expect(await api.logout()).toBe(true);
    expect(memory.getAuthState().accessToken).toBeNull();
  });

  it("rejects a queued login if logout occurred before it acquired the cookie lock", async () => {
    const { memory, api, calls } = await setup();
    let release!: () => void;
    const held = memory.withAuthLock(() => new Promise<void>(resolve => { release = resolve; }));
    await Promise.resolve();
    const login = api.login({ email: "student@example.test", password: "Password1" });
    const rejected = expect(login).rejects.toThrow(/Session changed/);
    const logout = api.logout();
    release();
    await held;
    await rejected;
    await logout;
    expect(calls).not.toContain("/api/auth/login");
  });

  it("does not replay an old request under the identity of a new login", async () => {
    const { memory, client } = await setup();
    const axios = (await import("axios")).default;
    let release!: () => void;
    let started!: () => void;
    const ready = new Promise<void>(resolve => { started = resolve; });
    let attempts = 0;
    client.axiosClient.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
      attempts++;
      started();
      if (attempts === 1) await new Promise<void>(resolve => { release = resolve; });
      throw new axios.AxiosError("Unauthorized", "ERR_BAD_REQUEST", config, undefined, {
        config, data: {}, status: 401, statusText: "401", headers: {},
      });
    };
    memory.setMemorySession("alice", user, true);
    const request = client.axiosClient.patch("/api/users/7", { fullName: "Alice" });
    const rejected = expect(request).rejects.toThrow();
    await ready;
    memory.clearMemorySession();
    memory.setMemorySession("bob", { ...user, id: 8 }, true);
    release();
    await rejected;
    expect(attempts).toBe(1);
    expect(memory.getAuthState().accessToken).toBe("bob");
  });
});
