import { useCallback, useMemo, useState, type ReactNode, type SetStateAction } from "react";
import { toSupportedUser, type SupportedUser } from "@/entities/user";
import { AuthContext } from "./AuthContext";
import { getStoredUser, persistUser } from "./authSession";

export interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setStoredUser] = useState<SupportedUser | null>(getStoredUser);

  const setUser = useCallback((nextUser: SetStateAction<SupportedUser | null>) => {
    setStoredUser((currentUser) => {
      const resolvedUser = typeof nextUser === "function" ? nextUser(currentUser) : nextUser;
      const supportedUser = toSupportedUser(resolvedUser);
      persistUser(supportedUser);
      return supportedUser;
    });
  }, []);

  const authValue = useMemo(() => ({ user, setUser }), [user, setUser]);

  return <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>;
}
