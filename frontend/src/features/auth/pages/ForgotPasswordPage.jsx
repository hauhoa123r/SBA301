import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, KeyRound, Mail, ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";
import HeroHeader from "../../../shared/components/HeroHeader";
import HeroFooter from "../../../shared/components/HeroFooter";
import { validInput } from "../../../shared/utils/inputHandler";

export default function ForgotPasswordPage() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        token: "",
    });

    const [errors, setErrors] = useState({
        email: "",
        token: "",
    });

    const [loading, setLoading] = useState(false);
    const [showTokenModel, setShowTokenModel] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

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

    const handleSubmit = async (e) => {
        e.preventDefault();

        const emailError = validInput("email", formData.email);

        if (emailError) {
            setErrors({ email: emailError, token: "" });
            return;
        }

        try {
            setLoading(true);
            const response = true;
            // const response = await forgotPassword({
            //     email: formData.email,
            // });
            toast.success(response.message || "Gửi liên kết đặt lại mật khẩu thành công");
            setShowTokenModel(true);
        } catch (err) {
            toast.error(err?.response?.data?.error || "Email không tồn tại trong hệ thống. Vui lòng kiểm tra lại.");
        } finally {
            setLoading(false);
        }
    };

    const handleTokenSubmit = async (e) => {
        e.preventDefault();

        const tokenError = validInput("token", formData.token);

        if (tokenError) {
            setErrors((prev) => ({
                ...prev,
                token: tokenError,
            }));
            return;
        }

        try {
            setLoading(true);
            // Cần gọi API check token để chuyển hướng.
            toast.success("Xác thực thành công. Đang chuyển hướng...");
            navigate("/reset-password", {
                state: {
                    email: formData.email,
                    token: formData.token,
                },
            });
        } catch (err) {
            toast.error(err?.response?.data?.error || "Có lỗi xảy ra, vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-dark text-brand-textPrimary flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-brand-accent/15 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-5%] h-[420px] w-[420px] rounded-full bg-[#4c1d95]/20 blur-[100px]" />
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(#7c3aed 1px, transparent 1px), linear-gradient(90deg, #7c3aed 1px, transparent 1px)`,
                        backgroundSize: "60px 60px",
                    }}
                />
            </div>

            <HeroHeader />

            <main className="relative z-10 flex flex-1 items-center justify-center p-6">
                <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-brand-accent/15 shadow-2xl shadow-brand-accent/10 md:grid-cols-[0.9fr_1.1fr]">
                    <section className="relative hidden overflow-hidden bg-brand-dark p-10 md:flex md:flex-col md:justify-between">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#4c1d95]/60 via-brand-dark to-brand-dark" />
                        <div className="absolute left-[-70px] bottom-[-70px] h-[260px] w-[260px] rounded-full bg-brand-accent/20 blur-[80px]" />
                        <div
                            className="absolute inset-0 opacity-[0.05]"
                            style={{
                                backgroundImage: `linear-gradient(#a78bfa 1px, transparent 1px), linear-gradient(90deg, #a78bfa 1px, transparent 1px)`,
                                backgroundSize: "40px 40px",
                            }}
                        />

                        <div className="relative z-10">
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-accent/25 bg-brand-accent/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#a78bfa]">
                                <ShieldCheck className="h-3 w-3" />
                                Account Recovery
                            </div>
                            <h1
                                className="mb-3 text-4xl font-extrabold leading-tight text-white"
                                style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                            >
                                Restore access to your learning account
                            </h1>
                            <p className="max-w-sm text-sm leading-6 text-brand-textSecondary">
                                Verify your email and security token to continue to password reset safely.
                            </p>
                        </div>

                        <div className="relative z-10 my-10 flex justify-center">
                            <img
                                src="/images/undraw_morning-news_h9nz.svg"
                                alt="Account recovery illustration"
                                className="max-h-72 w-auto drop-shadow-2xl"
                            />
                        </div>

                        <div className="relative z-10 rounded-2xl border border-brand-accent/15 bg-brand-accent/10 p-5">
                            <p className="text-sm font-semibold text-white">Secure reset flow</p>
                            <p className="mt-2 text-sm leading-6 text-brand-textSecondary">
                                Your token is used only to confirm account ownership before changing the password.
                            </p>
                        </div>
                    </section>

                    <section className="bg-brand-cardBg p-8 md:p-10">
                        <Link
                            to="/login"
                            className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-brand-textSecondary no-underline transition hover:text-white"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to login
                        </Link>

                        <div className="mb-8">
                            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-accent/20 bg-brand-accent/10 text-[#a78bfa]">
                                {showTokenModel ? <KeyRound className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
                            </div>
                            <h2
                                className="mb-2 text-3xl font-extrabold text-white"
                                style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                            >
                                {showTokenModel ? "Verify security token" : "Forgot password"}
                            </h2>
                            <p className="text-sm leading-6 text-brand-textSecondary">
                                {!showTokenModel
                                    ? "Enter your email address and we will send you a token to reset your password."
                                    : `We sent a security token to ${formData.email}. Enter it below to continue.`}
                            </p>
                        </div>

                        {!showTokenModel ? (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-brand-textSecondary">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-textSecondary" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="you@example.com"
                                            className="w-full rounded-xl border border-brand-accent/20 bg-brand-light px-4 py-3 pl-11 text-sm text-white outline-none transition placeholder:text-brand-textSecondary/50 focus:border-brand-accent/60"
                                        />
                                    </div>

                                    {errors.email && (
                                        <p className="mt-1.5 text-xs font-semibold text-red-400">
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-accent px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-accent/30 transition hover:bg-brand-accentHover hover:shadow-brand-accent/50 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <Mail className="h-4 w-4" />
                                    {loading ? "Sending..." : "Send Reset Token"}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleTokenSubmit} className="space-y-6">
                                <div>
                                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-brand-textSecondary">
                                        Security Token
                                    </label>
                                    <div className="relative">
                                        <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-textSecondary" />
                                        <input
                                            type="text"
                                            name="token"
                                            value={formData.token}
                                            onChange={handleChange}
                                            placeholder="Enter token"
                                            className="w-full rounded-xl border border-brand-accent/20 bg-brand-light px-4 py-3 pl-11 text-sm text-white outline-none transition placeholder:text-brand-textSecondary/50 focus:border-brand-accent/60"
                                        />
                                    </div>

                                    {errors.token && (
                                        <p className="mt-1.5 text-xs font-semibold text-red-400">
                                            {errors.token}
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-accent px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-accent/30 transition hover:bg-brand-accentHover hover:shadow-brand-accent/50 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <ShieldCheck className="h-4 w-4" />
                                    {loading ? "Verifying..." : "Verify Token"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setShowTokenModel(false)}
                                    className="w-full text-sm font-semibold text-brand-textSecondary transition hover:text-[#a78bfa]"
                                >
                                    Use a different email
                                </button>
                            </form>
                        )}
                    </section>
                </div>
            </main>

            <HeroFooter />
        </div>
    );
}
