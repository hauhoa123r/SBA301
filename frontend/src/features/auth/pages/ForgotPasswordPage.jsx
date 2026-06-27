import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, KeyRound, Mail, ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";
import HeroHeader from "../../../shared/components/HeroHeader";
import HeroFooter from "../../../shared/components/HeroFooter";
import { validInput } from "../../../shared/utils/inputHandler";
import {forgotPassword, verifyToken} from "../service/authService.js";

const baseInputClass =
    "w-full bg-[#160e2e] border border-[#7c3aed]/20 focus:border-[#7c3aed]/60 text-[#f8fafc] placeholder-[#94a3b8]/50 rounded-xl px-4 py-3 text-sm outline-none transition-colors";
const baseButtonClass =
    "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#7c3aed] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#7c3aed]/30 transition hover:bg-[#6d28d9] hover:shadow-[#7c3aed]/50 disabled:cursor-not-allowed disabled:opacity-60";
const fieldLabelClass = "mb-2 block text-xs font-semibold uppercase tracking-wider text-[#94a3b8]";

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
                const response = 'a' //await forgotPassword({ email: formData.email });
                toast.success(response?.message || "Reset token sent successfully");
                setShowTokenModal(true);
            } catch (error) {
                toast.error(error?.response?.data?.message || "Error sending reset token, please try again.");
                return;
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
                return;
            } finally {
                setLoading(false);
            }
        }
    }

    return (
        <div className="min-h-screen bg-[#090514] text-[#f8fafc] flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#7c3aed]/15 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-[#4c1d95]/20 blur-[100px]" />
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
                <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-[#7c3aed]/15 shadow-2xl shadow-[#7c3aed]/10 md:grid-cols-[0.9fr_1.1fr]">
                    <section className="relative hidden overflow-hidden bg-[#090514] p-10 md:flex md:flex-col md:justify-between">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#4c1d95]/60 via-[#090514] to-[#090514]" />
                        <div className="absolute left-[-70px] bottom-[-70px] h-[260px] w-[260px] rounded-full bg-[#7c3aed]/20 blur-[80px]" />
                        <div
                            className="absolute inset-0 opacity-[0.05]"
                            style={{
                                backgroundImage: `linear-gradient(#a78bfa 1px, transparent 1px), linear-gradient(90deg, #a78bfa 1px, transparent 1px)`,
                                backgroundSize: "40px 40px",
                            }}
                        />

                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 bg-[#7c3aed]/15 border border-[#7c3aed]/25 text-[#a78bfa] text-xs font-semibold px-3 py-1.5 rounded-full mb-6 tracking-wider uppercase">
                                <ShieldCheck className="w-3 h-3" />
                                Account Recovery
                            </div>
                            <h1
                                className="mb-3 text-4xl font-extrabold leading-tight text-white"
                                style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                            >
                                Restore access to your learning account
                            </h1>
                            <p className="max-w-sm text-sm leading-6 text-[#94a3b8]">
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

                    <section className="bg-[#1c1236] p-8 md:p-10">
                        <Link
                            to="/login"
                            className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#94a3b8] no-underline transition hover:text-white"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to login
                        </Link>

                        <div className="mb-8">
                            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[#7c3aed]/20 bg-[#7c3aed]/10 text-[#a78bfa]">
                                {showTokenModal ? <KeyRound className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
                            </div>
                            <h2
                                className="mb-2 text-3xl font-extrabold text-white"
                                style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                            >
                                {showTokenModal ? "Verify security token" : "Forgot password"}
                            </h2>
                            <p className="text-sm leading-6 text-[#94a3b8]">
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
                                        <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
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
                                        <p className="mt-1.5 text-xs font-semibold text-red-400">{errors.email}</p>
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
                                        <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
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
                                        <p className="mt-1.5 text-xs font-semibold text-red-400">{errors.token}</p>
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
                                    className="w-full text-sm font-semibold text-[#94a3b8] transition hover:text-[#a78bfa]"
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
