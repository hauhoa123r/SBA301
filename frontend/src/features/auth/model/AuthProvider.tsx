import { useCallback, useEffect, useMemo, useSyncExternalStore, type ReactNode, type SetStateAction } from "react";
import { toSupportedUser, type SupportedUser } from "@/entities/user";
import { getAuthState, getAuthViewState, setMemoryUser, subscribeAuth } from "@/shared/api/authMemory";
import { initializeAuth } from "@/shared/api/axiosClient";
import { retryPendingLogout } from "../api/authApi";
import { AuthContext } from "./AuthContext";
import { migrateLegacyAuthStorage } from "./authSession";
import { DailyStudyCheck } from "@/features/notifications/DailyStudyCheck";

export interface AuthProviderProps { children: ReactNode; }

export function AuthProvider({ children }: AuthProviderProps) {
  const { user, initializing } = useSyncExternalStore(subscribeAuth, getAuthViewState);
  useEffect(() => {
    migrateLegacyAuthStorage();
    void initializeAuth();
    const retryLogout = () => { void retryPendingLogout(); };
    retryLogout();
    window.addEventListener("online", retryLogout);
    window.addEventListener("focus", retryLogout);
    return () => {
      window.removeEventListener("online", retryLogout);
      window.removeEventListener("focus", retryLogout);
    };
  }, []);
  const setUser = useCallback((next: SetStateAction<SupportedUser | null>) => {
    setMemoryUser(toSupportedUser(typeof next === "function" ? next(getAuthState().user) : next));
  }, []);
  const value = useMemo(() => ({ user, setUser, initializing }), [user, setUser, initializing]);
  return <AuthContext.Provider value={value}>
    <DailyStudyCheck userId={user?.id} student={!!user?.roles.includes("STUDENT") && !user.roles.includes("ADMIN")} />
    {initializing ? <div role="status" className="p-6 text-center">Đang kiểm tra phiên đăng nhập…</div> : children}
  </AuthContext.Provider>;
}
