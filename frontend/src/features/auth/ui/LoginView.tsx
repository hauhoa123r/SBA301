import { useState, type ChangeEvent, type FocusEvent, type SubmitEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaFacebookF, FaGoogle } from "react-icons/fa";
import { Eye, EyeOff, Zap } from "lucide-react";
import { login } from "../api/authApi";
import { useAuth } from "../model/useAuth";
import { showApiErrorToast } from "@/shared/utils";
import { UserReveal } from "@/shared/ui/animation";
import { getPostLoginPath, getRequestedPath } from "../model/authRedirect";
import { AUTH_STORAGE_KEYS, parseLoginResponse, persistLoginSession } from "../model/authSession";
import { validateAuthField, type AuthFieldName } from "../model/validation";

interface LoginFormData {
    email: string;
    password: string;
}

const isAuthFieldName = (name: string): name is AuthFieldName => name === "email" || name === "password";

const LoginView = () => {
    const [formData, setFormData] = useState<LoginFormData>({ email: "", password: "" });
    const [errors, setErrors] = useState<Record<AuthFieldName, string>>({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { setUser } = useAuth();
    const rememberOAuthReturnTo = () => {
        const requestedPath = getRequestedPath(location);
        if (requestedPath) {
            sessionStorage.setItem(AUTH_STORAGE_KEYS.oauthReturnTo, requestedPath);
        } else {
            sessionStorage.removeItem(AUTH_STORAGE_KEYS.oauthReturnTo);
        }
    };
    const loginWithGoogle = () => {
        rememberOAuthReturnTo();
        window.location.assign("/api/oauth2/authorization/google");
    };
    const loginWithFacebook = () => {
        rememberOAuthReturnTo();
        window.location.assign("/api/oauth2/authorization/facebook");
    };


    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (!isAuthFieldName(name)) return;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (!isAuthFieldName(name)) return;
        setErrors((prev) => ({
            ...prev,
            [name]: validateAuthField(name, value),
        }));
    };

    const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        const nextErrors = {
            email: validateAuthField("email", formData.email),
            password: validateAuthField("password", formData.password),
        };

        setErrors(nextErrors);

        if (Object.values(nextErrors).some(Boolean)) {
            return;
        }
        try {
            const response = await login({
                email: formData.email.trim(),
                password: formData.password,
            });
            const session = parseLoginResponse(response);
            persistLoginSession(session);
            setUser(session.user);
            void navigate(getPostLoginPath(getRequestedPath(location)), { replace: true });
        } catch (err) {
            showApiErrorToast(err, "Đăng nhập thất bại. Vui lòng kiểm tra email hoặc mật khẩu.");
        }
    };

    return (
        <div className="user-ui-scope relative overflow-hidden text-brand-textPrimary" style={{ fontFamily: "'Be Vietnam Pro', 'Noto Sans SC', sans-serif" }}>
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-125 h-125 rounded-full bg-brand-accent/15 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-5%] w-100 h-100 rounded-full bg-brand-accentDeep/20 blur-[100px]" />
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(var(--color-brand-accent) 1px, var(--color-brand-transparent) 1px), linear-gradient(90deg, var(--color-brand-accent) 1px, var(--color-brand-transparent) 1px)`,
                        backgroundSize: "60px 60px",
                    }}
                />
            </div>
            <section className="relative z-10 flex min-h-[calc(100vh-160px)] items-center justify-center p-4 sm:p-6">
                <UserReveal className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-brand-accent/15 shadow-2xl shadow-brand-accent/10 md:grid-cols-2" distance={20}>
                    <div className="flex flex-col justify-between bg-brand-cardBg p-6 sm:p-8 md:min-h-145 md:p-10">
                        <div>
                            <div className="mb-8">
                                <h2
                                    className="text-3xl font-extrabold text-brand-white mb-2"
                                    style={{ fontFamily: "'Be Vietnam Pro', 'Noto Sans SC', sans-serif" }}
                                >
                                    Chào mừng trở lại
                                </h2>
                                <p className="text-brand-textSecondary text-sm">
                                    Nhập thông tin tài khoản để tiếp tục
                                </p>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <button
                                    type="button"
                                    onClick={loginWithGoogle}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-brand-accent/20 bg-brand-light px-4 py-3 text-sm font-semibold text-brand-white transition hover:border-brand-accent/50 hover:bg-brand-accent/10"
                                >
                                    <FaGoogle className="h-4 w-4 text-social-google" />
                                    Google
                                </button>
                                <button
                                    type="button"
                                    onClick={loginWithFacebook}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-brand-accent/20 bg-brand-light px-4 py-3 text-sm font-semibold text-brand-white transition hover:border-brand-accent/50 hover:bg-brand-accent/10"
                                >
                                    <FaFacebookF className="h-4 w-4 text-social-facebook" />
                                    Facebook
                                </button>
                            </div>

                            <div className="my-7 flex items-center gap-3">
                                <div className="h-px flex-1 bg-brand-accent/10" />
                                <span className="text-xs font-semibold uppercase tracking-wider text-brand-textSecondary">
                                    hoặc đăng nhập bằng email
                                </span>
                                <div className="h-px flex-1 bg-brand-accent/10" />
                            </div>

                            <form onSubmit={(event) => {
                                void handleSubmit(event);
                            }} noValidate>
                                <div className="mb-6">
                                    <label htmlFor="login-email" className="block text-xs font-semibold text-brand-textSecondary uppercase tracking-wider mb-2">
                                        Địa chỉ email
                                    </label>
                                    <input
                                        type="text"
                                        id="login-email"
                                        name="email"
                                        placeholder="you@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        aria-invalid={Boolean(errors.email)}
                                        aria-describedby={errors.email ? "login-email-error" : undefined}
                                        className="w-full bg-brand-light border border-brand-accent/20 focus:border-brand-accent/60 text-brand-textPrimary placeholder-brand-textSecondary/50 rounded-xl px-4 py-3 text-sm outline-none transition-colors"
                                    />
                                    {errors.email && (
                                        <p id="login-email-error" role="alert" className="mt-1.5 text-xs font-semibold text-social-google">{errors.email}</p>
                                    )}
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="login-password" className="block text-xs font-semibold text-brand-textSecondary uppercase tracking-wider mb-2">
                                        Mật khẩu
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            id="login-password"
                                            name="password"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            aria-invalid={Boolean(errors.password)}
                                            aria-describedby={errors.password ? "login-password-error" : undefined}
                                            className="w-full bg-brand-light border border-brand-accent/20 focus:border-brand-accent/60 text-brand-textPrimary placeholder-brand-textSecondary/50 rounded-xl px-4 py-3 pr-11 text-sm outline-none transition-colors"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowPassword(!showPassword);
                                            }}
                                            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-textSecondary hover:text-brand-accentSoft transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p id="login-password-error" role="alert" className="mt-1.5 text-xs font-semibold text-social-google">{errors.password}</p>
                                    )}
                                </div>
                                <div className="mb-8 text-right">
                                    <Link
                                        to="/forgot-password"
                                        className="text-xs text-brand-textSecondary hover:text-brand-accentSoft no-underline transition-colors"
                                    >
                                        Quên mật khẩu?
                                    </Link>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-brand-accent hover:bg-brand-accentHover text-brand-white rounded-xl py-3 font-semibold text-sm transition-all shadow-lg shadow-brand-accent/30 hover:shadow-brand-accent/50 hover:scale-[1.01]"
                                >
                                    Đăng nhập
                                </button>
                            </form>
                        </div>

                        <div className="mt-8 flex items-center gap-3 pt-6 border-t border-brand-accent/10">
                            <span className="text-sm text-brand-textSecondary">Chưa có tài khoản?</span>
                            <Link
                                to="/register"
                                className="text-sm font-semibold text-brand-accentSoft hover:text-brand-white no-underline transition-colors"
                            >
                                Đăng ký →
                            </Link>
                        </div>
                    </div>
                    <div className="relative hidden flex-col justify-between overflow-hidden bg-brand-dark p-10 text-brand-white md:flex">
                        <div className="absolute inset-0 bg-linear-to-br from-brand-accentDeep/60 via-brand-dark to-brand-dark" />
                        <div className="absolute -top-15 -right-15 w-70 h-70 rounded-full bg-brand-accent/20 blur-[80px]" />
                        <div className="absolute -bottom-10 -left-10 w-50 h-50 rounded-full bg-brand-accentDeep/30 blur-[60px]" />
                        <div
                            className="absolute inset-0 opacity-[0.05]"
                            style={{
                                backgroundImage: `linear-gradient(var(--color-brand-accentSoft) 1px, var(--color-brand-transparent) 1px), linear-gradient(90deg, var(--color-brand-accentSoft) 1px, var(--color-brand-transparent) 1px)`,
                                backgroundSize: "40px 40px",
                            }}
                        />

                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 bg-brand-accent/15 border border-brand-accent/25 text-brand-accentSoft text-xs font-semibold px-3 py-1.5 rounded-full mb-6 tracking-wider uppercase">
                                <Zap className="w-3 h-3" />
                                Cổng học viên
                            </div>
                            <h1
                                className="text-4xl font-extrabold leading-tight mb-3"
                                style={{ fontFamily: "'Be Vietnam Pro', 'Noto Sans SC', sans-serif" }}
                            >
                                Chào mừng đến với<br />
                                <span className="text-brand-transparent bg-clip-text bg-linear-to-r from-brand-accentSoft to-brand-accent">
                                    Edujar
                                </span>
                            </h1>
                            <p className="text-brand-textSecondary text-sm leading-relaxed max-w-xs">
                                Đăng nhập để truy cập khóa học, theo dõi tiến độ và kết nối cùng hơn 120.000 học viên.
                            </p>
                        </div>
                        <div className="relative z-10 mt-10 flex justify-center">
                            <img
                                src="/images/undraw_morning-news_h9nz.svg"
                                alt="Minh họa học viên đang học"
                                className="max-h-72 w-auto drop-shadow-2xl"
                            />
                        </div>
                        <div className="relative z-10 mt-8 grid grid-cols-3 gap-3">
                            {[
                                { value: "120K+", label: "Học viên" },
                                { value: "1.800+", label: "Khóa học" },
                                { value: "4,9★", label: "Đánh giá" },
                            ].map(({ value, label }) => (
                                <div key={label} className="bg-brand-accent/10 border border-brand-accent/20 rounded-xl p-3 text-center">
                                    <div className="text-brand-white font-bold text-base" style={{ fontFamily: "'Be Vietnam Pro', 'Noto Sans SC', sans-serif" }}>
                                        {value}
                                    </div>
                                    <div className="text-brand-textSecondary text-xs mt-0.5">{label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </UserReveal>
            </section>
        </div>
    );
};

export default LoginView;
