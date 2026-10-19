import type { SupportedUser } from "@/entities/user";

interface AuthState {
  accessToken: string | null;
  user: SupportedUser | null;
  initializing: boolean;
}

let state: AuthState = { accessToken: null, user: null, initializing: true };
let viewState = { user: state.user, initializing: state.initializing };
let version = 0;
const listeners = new Set<() => void>();
let cookieQueue: Promise<void> = Promise.resolve();
export const getAuthState = (): AuthState => state;
// React snapshots never contain the bearer credential (including DevTools hook snapshots).
export const getAuthViewState = () => viewState;
export const getAuthVersion = (): number => version;
export function subscribeAuth(listener: () => void): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
function update(next: AuthState): void {
  state = next;
  if (viewState.user !== next.user || viewState.initializing !== next.initializing)
    viewState = { user: next.user, initializing: next.initializing };
  listeners.forEach((listener) => { listener(); });
}
export function setMemorySession(accessToken: string, user: SupportedUser, newLogin = false): void {
  if (newLogin) {
    version++;
    logoutIntent = null;
    try { localStorage.removeItem(LOGOUT_KEY); } catch { /* Storage may be unavailable. */ }
  }
  update({ accessToken, user, initializing: false });
}
export function setMemoryUser(user: SupportedUser | null): void {
  update({ ...state, user });
}
export function clearMemorySession(): void {
  version++;
  update({ accessToken: null, user: null, initializing: false });
}
export function finishAuthInitialization(): void {
  update({ ...state, initializing: false });
}

// Only logout intent is persisted. No credentials or user information cross tabs.
const LOGOUT_KEY = "learning-platform.logout";
interface LogoutIntent { id: string; pending: boolean; }
let logoutIntent: LogoutIntent | null = null;
export function getLogoutIntent(): LogoutIntent | null {
  try {
    const raw = localStorage.getItem(LOGOUT_KEY);
    if (raw) {
      const value: unknown = JSON.parse(raw);
      if (typeof value === "object" && value !== null && "id" in value && "pending" in value
          && typeof value.id === "string" && typeof value.pending === "boolean") return value as LogoutIntent;
    }
  } catch { /* Keep the local intent if persistence is denied. */ }
  return logoutIntent;
}
function saveLogoutIntent(intent: LogoutIntent): void {
  logoutIntent = intent;
  try { localStorage.setItem(LOGOUT_KEY, JSON.stringify(intent)); } catch { /* Memory still clears. */ }
}
export function beginLogout(): string {
  const previous = getLogoutIntent();
  const id = previous?.pending ? previous.id : crypto.randomUUID();
  saveLogoutIntent({ id, pending: true });
  clearMemorySession();
  return id;
}
export function confirmLogout(id: string): void {
  if (getLogoutIntent()?.id === id) saveLogoutIntent({ id, pending: false });
}
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event: StorageEvent) => {
    if (event.key === LOGOUT_KEY || event.key === null) {
      logoutIntent = null;
      clearMemorySession();
    }
  });
}

// Web Locks serialize cookie rotation and logout across same-origin tabs without persisting credentials.
export function withAuthLock<T>(action: () => Promise<T>): Promise<T> {
  if (typeof navigator !== "undefined" && navigator.locks) {
    return navigator.locks.request("learning-platform-auth-cookie", async () => action());
  }
  const next = cookieQueue.then(action, action);
  cookieQueue = next.then(() => undefined, () => undefined);
  return next;
}
