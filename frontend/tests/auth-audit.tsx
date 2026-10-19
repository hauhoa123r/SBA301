// Test-only browser harness: production auth modules, real cookie HTTP, no token output.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../src/features/auth/model/AuthProvider";
import { useAuth } from "../src/features/auth/model/useAuth";
import { ProtectedRoute } from "../src/app/router/ProtectedRoute";
import { login, logout } from "../src/features/auth/api/authApi";
import { parseLoginResponse, persistLoginSession } from "../src/features/auth/model/authSession";
import { getAuthState, setMemorySession } from "../src/shared/api/authMemory";
import { axiosClient, refreshSession } from "../src/shared/api/axiosClient";

function Probe() {
  const { user } = useAuth();
  return <><output id="identity">{user ? "authenticated" : "anonymous"}</output>
    <MemoryRouter initialEntries={["/private"]}><Routes>
      <Route path="/private" element={<ProtectedRoute><span id="private">private</span></ProtectedRoute>} />
      <Route path="/login" element={<span id="login">login</span>} />
    </Routes></MemoryRouter></>;
}
Reflect.set(window, "audit", {
  documentId: crypto.randomUUID(),
  async login(email: string) { persistLoginSession(parseLoginResponse(await login({ email, password: "Password1" }))); return true; },
  logout,
  refresh: async () => { await refreshSession(); return true; },
  async burst401() {
    setMemorySession("synthetic-invalid-access", getAuthState().user!);
    const results = await Promise.all(Array.from({ length: 12 }, () => axiosClient.get("/api/auth/me")));
    return results.every(response => response.status === 200);
  },
  snapshot: () => ({ authenticated: !!getAuthState().user, initializing: getAuthState().initializing }),
});
createRoot(document.getElementById("root")!).render(<StrictMode><AuthProvider><Probe /></AuthProvider></StrictMode>);
