import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../model/useAuth";
import { exchangeOAuthCode } from "../api/authApi";
import { UserReveal } from "@/shared/ui/animation";
import { getPostLoginPath } from "../model/authRedirect";
import {
  AUTH_STORAGE_KEYS,
  parseOAuthResponse,
  persistOAuthSession,
} from "../model/authSession";
import { getApiErrorMessage } from "@/shared/utils";

const exchanges = new Map<string, Promise<unknown>>();

function exchangeOnce(code: string): Promise<unknown> {
  const existingRequest = exchanges.get(code);
  if (existingRequest) return existingRequest;
  const request = exchangeOAuthCode(code);
  exchanges.set(code, request);
  return request;
}

export default function OAuthCallbackView() {
  const [callback] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const providerError = params.get("error");
    return {
      code,
      initialError: providerError
        ? `Đăng nhập OAuth thất bại: ${providerError}`
        : (!code ? "Thiếu authorization code." : ""),
    };
  });
  const [error, setError] = useState(callback.initialError);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    window.history.replaceState({}, document.title, window.location.pathname);

    const code = callback.code;
    if (!code || callback.initialError) return;

    let active = true;
    void exchangeOnce(code)
      .then((response) => {
        const session = parseOAuthResponse(response);
        persistOAuthSession(session);
        setUser(session.user);
        const requestedPath = sessionStorage.getItem(AUTH_STORAGE_KEYS.oauthReturnTo) ?? "";
        sessionStorage.removeItem(AUTH_STORAGE_KEYS.oauthReturnTo);
        if (active) void navigate(getPostLoginPath(requestedPath), { replace: true });
      })
      .catch((requestError: unknown) => {
        exchanges.delete(code);
        if (active) setError(getApiErrorMessage(requestError, "Authorization code không hợp lệ hoặc đã hết hạn."));
      });

    return () => { active = false; };
  }, [callback, navigate, setUser]);

  return (
    <main className="user-ui-scope flex min-h-[60vh] items-center justify-center p-6 text-brand-textPrimary">
      <UserReveal className="w-full max-w-md rounded-2xl border border-brand-accent/15 bg-brand-cardBg p-8 text-center shadow-xl" distance={20} aria-live="polite">
        {error ? (
          <>
            <h1 className="mb-3 text-xl font-bold">Không thể đăng nhập</h1>
            <p className="text-brand-textSecondary">{error}</p>
            <button className="mt-6 rounded-xl bg-brand-accent px-5 py-3" onClick={() => {
              void navigate("/login", { replace: true });
            }}>
              Quay lại đăng nhập
            </button>
          </>
        ) : (
          <>
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-brand-accent/20 border-t-brand-accent" />
            <p>Đang hoàn tất đăng nhập…</p>
          </>
        )}
      </UserReveal>
    </main>
  );
}
