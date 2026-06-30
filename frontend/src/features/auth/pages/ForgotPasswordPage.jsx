import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, KeyRound, Mail, ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";
import { validInput } from "../../../shared/utils/inputHandler";
import {forgotPassword, verifyToken} from "../service/authService.js";

const baseInputClass =
    "w-full bg-brand-light border border-brand-accent/20 focus:border-brand-accent/60 text-brand-textPrimary placeholder-brand-textSecondary/50 rounded-xl px-4 py-3 text-sm outline-none transition-colors";
const baseButtonClass =
    "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-accent px-4 py-3 text-sm font-semibold text-brand-white shadow-lg shadow-brand-accent/30 transition hover:bg-brand-accentHover hover:shadow-brand-accent/50 disabled:cursor-not-allowed disabled:opacity-60";
const fieldLabelClass = "mb-2 block text-xs font-semibold uppercase tracking-wider text-brand-textSecondary";

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
    const [showTokenModal, setShowTokenModal] = useState(false);

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
        //Email handling
        if(!showTokenModal){
            const emailError = validInput("email", formData.email);
            if(emailError) {
                setErrors({email: emailError, token: ""});
                return;
            }
            try{
                setLoading(true);
                const response = await forgotPassword({ email: formData.email });
                toast.success(response?.message || "Reset token sent successfully");
                setShowTokenModal(true);
            } catch (error) {
                toast.error(error?.response?.data?.message || "Error sending reset token, please try again.");
            } finally {
                setLoading(false);
            }
        } else {
            //Token verify
            const tokenError = validInput("token", formData.token);
            if (tokenError) {
                setErrors((prev) => ({...prev, token: tokenError}));
                return;
            }
            try {
                setLoading(true);
                const response = await verifyToken({
                    email: formData.email,
                    token: formData.token,
                });

                const searchParams = new URLSearchParams({
                    email: formData.email,
                    token: formData.token,
                });

                toast.success(response?.message || "Token verified. Continue to reset password.");
                navigate(`/reset-password?${searchParams.toString()}`);
            } catch (error) {
                toast.error(error?.response?.data?.message || "Error verifying token, please try again.");
            } finally {
                setLoading(false);
            }
        }
    }

    return (
        <div className="relative overflow-hidden text-brand-textPrimary" style={{ fontFamily: "'Inter', sans-serif" }}>
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

            <section className="relative z-10 flex min-h-[calc(100vh-160px)] items-center justify-center p-6">
                <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-brand-accent/15 shadow-2xl shadow-brand-accent/10 md:grid-cols-[0.9fr_1.1fr]">
                    <section className="relative hidden overflow-hidden bg-brand-dark p-10 md:flex md:flex-col md:justify-between">
                        <div className="absolute inset-0 bg-linear-to-br from-brand-accentDeep/60 via-brand-dark to-brand-dark" />
                        <div className="absolute -left-17.5 -bottom-17.5 h-65 w-65 rounded-full bg-brand-accent/20 blur-[80px]" />
                        <div
                            className="absolute inset-0 opacity-[0.05]"
                            style={{
                                backgroundImage: `linear-gradient(var(--color-brand-accentSoft) 1px, var(--color-brand-transparent) 1px), linear-gradient(90deg, var(--color-brand-accentSoft) 1px, var(--color-brand-transparent) 1px)`,
                                backgroundSize: "40px 40px",
                            }}
                        />

                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 bg-brand-accent/15 border border-brand-accent/25 text-brand-accentSoft text-xs font-semibold px-3 py-1.5 rounded-full mb-6 tracking-wider uppercase">
                                <ShieldCheck className="w-3 h-3" />
                                Account Recovery
                            </div>
                            <h1
                                className="mb-3 text-4xl font-extrabold leading-tight text-brand-white"
                                style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                            >
                                Restore access to your learning account
                            </h1>
                            <p className="max-w-sm text-sm leading-6 text-brand-textSecondary">
                                Verify your email and token before resetting the password.
                            </p>
                        </div>

                        <div className="relative z-10 my-10 flex justify-center">
                            <img
                                src="/images/undraw_morning-news_h9nz.svg"
                                alt="Account recovery illustration"
                                className="max-h-72 w-auto drop-shadow-2xl"
                            />
                        </div>
                    </section>

                    <section className="bg-brand-cardBg p-8 md:p-10">
                        <Link
                            to="/login"
                            className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-brand-textSecondary no-underline transition hover:text-brand-white"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to login
                        </Link>

                        <div className="mb-8">
                            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-accent/20 bg-brand-accent/10 text-brand-accentSoft">
                                {showTokenModal ? <KeyRound className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
                            </div>
                            <h2
                                className="mb-2 text-3xl font-extrabold text-brand-white"
                                style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                            >
                                {showTokenModal ? "Verify security token" : "Forgot password"}
                            </h2>
                            <p className="text-sm leading-6 text-brand-textSecondary">
                                {!showTokenModal
                                    ? "Enter your email address and we will send you a reset token."
                                    : `We sent a security token to ${formData.email}. Enter it below to continue.`}
                            </p>
                        </div>

                        {!showTokenModal ? (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className={fieldLabelClass}>Email Address</label>
                                    <div className="relative">
                                        <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-textSecondary" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="you@example.com"
                                            className={`${baseInputClass} pl-11`}
                                        />
                                    </div>

                                    {errors.email ? (
                                        <p className="mt-1.5 text-xs font-semibold text-social-google">{errors.email}</p>
                                    ) : null}
                                </div>

                                <button type="submit" disabled={loading} className={baseButtonClass}>
                                    <Mail className="h-4 w-4" />
                                    {loading ? "Sending..." : "Send Reset Token"}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className={fieldLabelClass}>Security Token</label>
                                    <div className="relative">
                                        <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-textSecondary" />
                                        <input
                                            type="text"
                                            name="token"
                                            value={formData.token}
                                            onChange={handleChange}
                                            placeholder="Enter token"
                                            className={`${baseInputClass} pl-11`}
                                        />
                                    </div>

                                    {errors.token ? (
                                        <p className="mt-1.5 text-xs font-semibold text-social-google">{errors.token}</p>
                                    ) : null}
                                </div>

                                <button type="submit" disabled={loading} className={baseButtonClass}>
                                    <ShieldCheck className="h-4 w-4" />
                                    {loading ? "Verifying..." : "Verify Token"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowTokenModal(false);
                                        setFormData((prev) => ({ ...prev, token: "" }));
                                        setErrors((prev) => ({ ...prev, token: "" }));
                                    }}
                                    className="w-full text-sm font-semibold text-brand-textSecondary transition hover:text-brand-accentSoft"
                                >
                                    Use a different email
                                </button>
                            </form>
                        )}
                    </section>
                </div>
            </section>
        </div>
    );
}
