import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../../app/provider/useAuth";
import { exchangeOAuthCode } from "../service/authService";

const exchanges = new Map();

function exchangeOnce(code) {
  if (!exchanges.has(code)) exchanges.set(code, exchangeOAuthCode(code));
  return exchanges.get(code);
}

export default function OAuthCallbackPage() {
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

    if (!callback.code || callback.initialError) return;

    let active = true;
    exchangeOnce(callback.code)
      .then(({ accessToken, refreshToken, user }) => {
        localStorage.setItem("token", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(user));
        setUser(user);
        if (active) navigate("/", { replace: true });
      })
      .catch((requestError) => {
        exchanges.delete(callback.code);
        if (active) setError(requestError.response?.data?.message || "Authorization code không hợp lệ hoặc đã hết hạn.");
      });

    return () => { active = false; };
  }, [callback, navigate, setUser]);

  return (
    <main className="flex min-h-[60vh] items-center justify-center p-6 text-brand-textPrimary">
      <div className="max-w-md rounded-2xl bg-brand-cardBg p-8 text-center shadow-xl">
        {error ? (
          <>
            <h1 className="mb-3 text-xl font-bold">Không thể đăng nhập</h1>
            <p className="text-brand-textSecondary">{error}</p>
            <button className="mt-6 rounded-xl bg-brand-accent px-5 py-3" onClick={() => navigate("/login", { replace: true })}>
              Quay lại đăng nhập
            </button>
          </>
        ) : (
          <>
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-brand-accent/20 border-t-brand-accent" />
            <p>Đang hoàn tất đăng nhập…</p>
          </>
        )}
      </div>
    </main>
  );
}
