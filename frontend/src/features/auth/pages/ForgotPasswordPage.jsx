import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, KeyRound, Mail, RefreshCw, ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";
import { forgotPassword, verifyToken } from "../service/authService.js";
import { validateEmail, validateToken } from "../shared/utils/validator.js";

const baseInputClass =
    "w-full bg-brand-light border border-brand-accent/20 focus:border-brand-accent/60 text-brand-textPrimary placeholder-brand-textSecondary/50 rounded-xl px-4 py-3 text-sm outline-none transition-colors";
const baseButtonClass =
    "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-accent px-4 py-3 text-sm font-semibold text-brand-white shadow-lg shadow-brand-accent/30 transition hover:bg-brand-accentHover hover:shadow-brand-accent/50 disabled:cursor-not-allowed disabled:opacity-60";
const fieldLabelClass = "mb-2 block text-xs font-semibold uppercase tracking-wider text-brand-textSecondary";

export default function ForgotPasswordPage() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({ email: "", token: "" });
    const [errors, setErrors] = useState({ email: "", token: "" });

    const [loading, setLoading] = useState(false);
    const [showTokenModal, setShowTokenModal] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        const email = formData.email.trim().toLowerCase();
        const emailError = validateEmail(email);
        if (emailError) {
            setErrors({ email: emailError, token: "" });
            return;
        }
        try {
            setLoading(true);
            const response = await forgotPassword({ email });
            toast.success(response?.message || "Đã gửi mã đặt lại mật khẩu.");
            setFormData((prev) => ({ ...prev, email }));
            setShowTokenModal(true);
        } catch (error) {
            toast.error(getErrorMessage(error, "Không thể gửi mã đặt lại mật khẩu."));
        } finally {
            setLoading(false);
        }
    };

    const handleTokenSubmit = async (e) => {
        e.preventDefault();
        const email = formData.email.trim().toLowerCase();
        const token = formData.token.trim();
        const tokenError = validateToken(token);
        if (tokenError) {
            setErrors((prev) => ({ ...prev, token: tokenError }));
            return;
        }
        try {
            setLoading(true);
            const response = await verifyToken({ email, token });
            toast.success(response?.message || "Mã xác minh hợp lệ.");
            navigate('/reset-password', {
                replace: true,
                state: { email, token }
            });
        } catch (error) {
            toast.error(getErrorMessage(error, "Không thể xác minh mã."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative overflow-hidden text-brand-textPrimary" style={{ fontFamily: "'Be Vietnam Pro', 'Noto Sans SC', sans-serif" }}>
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-125 h-125 rounded-full bg-brand-accent/15 blur-[120px]" />
            </div>

            <section className="relative z-10 flex min-h-[calc(100vh-160px)] items-center justify-center p-6">
                <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-brand-accent/15 grid-cols-1 md:grid-cols-[0.9fr_1.1fr]">
                    <section className="relative hidden overflow-hidden bg-brand-dark p-10 md:flex md:flex-col md:justify-between">
                        <div className="relative z-10 my-10 flex justify-center">
                            <img
                                src="/images/undraw_morning-news_h9nz.svg"
                                alt="Minh họa khôi phục tài khoản"
                                className="max-h-72 w-auto drop-shadow-2xl"
                            />
                        </div>
                    </section>
                    <section className="bg-brand-cardBg p-8 md:p-10">
                        <Link to="/login" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-brand-textSecondary hover:text-brand-white">
                            <ArrowLeft className="h-4 w-4" /> Quay lại đăng nhập
                        </Link>
                        <div className="mb-8">
                            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-accent/20 bg-brand-accent/10 text-brand-accentSoft">
                                {showTokenModal ? <KeyRound className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
                            </div>
                            <h2 className="mb-2 text-3xl font-extrabold text-brand-white" style={{ fontFamily: "'Be Vietnam Pro', 'Noto Sans SC', sans-serif" }}>
                                {showTokenModal ? "Xác minh mã bảo mật" : "Quên mật khẩu"}
                            </h2>
                            <p className="text-sm leading-6 text-brand-textSecondary">
                                {!showTokenModal
                                    ? "Nhập địa chỉ email của bạn, chúng tôi sẽ gửi mã đặt lại mật khẩu."
                                    : `Chúng tôi đã gửi mã bảo mật đến ${formData.email}. Nhập mã bên dưới để tiếp tục.`}
                            </p>
                        </div>
                        {!showTokenModal ? (
                            <EmailStep
                                email={formData.email}
                                error={errors.email}
                                loading={loading}
                                onChange={handleChange}
                                onSubmit={handleEmailSubmit}
                            />
                        ) : (
                            <TokenStep
                                token={formData.token}
                                error={errors.token}
                                loading={loading}
                                onChange={handleChange}
                                onSubmit={handleTokenSubmit}
                                onBack={() => {
                                    setShowTokenModal(false);
                                    setFormData((prev) => ({ ...prev, token: "" }));
                                    setErrors((prev) => ({ ...prev, token: "" }));
                                }}
                            />
                        )}
                    </section>
                </div>
            </section>
        </div>
    );
}
function EmailStep({ email, error, loading, onChange, onSubmit }) {
    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div>
                <label className={fieldLabelClass}>Địa chỉ email</label>
                <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-textSecondary" />
                    <input
                        type="email"
                        name="email"
                        value={email}
                        onChange={onChange}
                        placeholder="you@example.com"
                        autoComplete="email"
                        className={`${baseInputClass} pl-11`}
                    />
                </div>
                {error && <p className="mt-1.5 text-xs font-semibold text-social-google">{error}</p>}
            </div>

            <button type="submit" disabled={loading} className={baseButtonClass}>
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                {loading ? "Đang gửi..." : "Gửi mã đặt lại"}
            </button>
        </form>
    );
}

function TokenStep({ token, error, loading, onChange, onSubmit, onBack }) {
    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div>
                <label className={fieldLabelClass}>Mã bảo mật</label>
                <div className="relative">
                    <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-textSecondary" />
                    <input
                        type="text"
                        name="token"
                        value={token}
                        onChange={onChange}
                        placeholder="000000"
                        autoComplete="one-time-code"
                        inputMode="numeric"
                        maxLength={6}
                        className={`${baseInputClass} pl-11`}
                    />
                </div>
                {error && <p className="mt-1.5 text-xs font-semibold text-social-google">{error}</p>}
            </div>

            <button type="submit" disabled={loading} className={baseButtonClass}>
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                {loading ? "Đang xác minh..." : "Xác minh mã"}
            </button>

            <button type="button" onClick={onBack} className="w-full text-sm font-semibold text-brand-textSecondary transition hover:text-brand-accentSoft">
                Dùng email khác
            </button>
        </form>
    );
}

function getErrorMessage(error, fallback) {
    const data = error?.response?.data;
    if (data?.message && data?.data && typeof data.data === "object") {
        return Object.values(data.data)[0] || data.message;
    }
    return data?.message || error?.message || fallback;
}
