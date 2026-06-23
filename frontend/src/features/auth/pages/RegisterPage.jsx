import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaFacebookF, FaGoogle } from "react-icons/fa";
import { Lock, Mail, User, UserPlus, Zap } from "lucide-react";
import { toast } from "react-toastify";
import HeroHeader from "../../../shared/components/HeroHeader";
import HeroFooter from "../../../shared/components/HeroFooter";
import { validInput } from "../../../shared/utils/inputHandler";

const baseInputClass =
    "w-full bg-[#160e2e] border border-[#7c3aed]/20 focus:border-[#7c3aed]/60 text-[#f8fafc] placeholder-[#94a3b8]/50 rounded-xl px-4 py-3 text-sm outline-none transition-colors";
const baseButtonClass =
    "w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-xl py-3 font-semibold text-sm transition-all shadow-lg shadow-[#7c3aed]/30 hover:shadow-[#7c3aed]/50 hover:scale-[1.01]";
const socialButtonClass =
    "inline-flex items-center justify-center gap-2 rounded-xl border border-[#7c3aed]/20 bg-[#160e2e] px-4 py-3 text-sm font-semibold text-white transition hover:border-[#7c3aed]/50 hover:bg-[#7c3aed]/10";
const fieldLabelClass = "block text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-2";

export default function RegisterPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
    });
    const [errors, setErrors] = useState({
        fullName: "",
        email: "",
        password: "",
    });

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

    const handleBlur = (e) => {
        const { name, value } = e.target;

        if (name === "fullName") {
            setErrors((prev) => ({
                ...prev,
                fullName: value.trim() ? "" : "Full name is required.",
            }));
            return;
        }

        setErrors((prev) => ({
            ...prev,
            [name]: validInput(name, value),
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const nextErrors = {
            fullName: formData.fullName.trim() ? "" : "Full name is required.",
            email: validInput("email", formData.email),
            password: validInput("password", formData.password),
        };

        setErrors(nextErrors);

        if (Object.values(nextErrors).some(Boolean)) {
            return;
        }

        toast.success("Account created successfully. Please sign in.");
        navigate("/login", { replace: true });
    };

    return (
        <div className="min-h-screen bg-[#090514] flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
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
                <div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-[#7c3aed]/15 shadow-2xl shadow-[#7c3aed]/10 grid md:grid-cols-2">
                    <div className="bg-[#1c1236] flex flex-col justify-between p-10 min-h-[580px]">
                        <div>
                            <div className="mb-8">
                                <div className="inline-flex items-center gap-2 bg-[#7c3aed]/15 border border-[#7c3aed]/25 text-[#a78bfa] text-xs font-semibold px-3 py-1.5 rounded-full mb-6 tracking-wider uppercase">
                                    <UserPlus className="w-3 h-3" />
                                    Student Portal
                                </div>
                                <h2
                                    className="text-3xl font-extrabold text-white mb-2"
                                    style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                                >
                                    Create your account
                                </h2>
                                <p className="text-[#94a3b8] text-sm leading-relaxed max-w-md">
                                    Join Edujar to save courses, track your progress, and continue learning wherever you are.
                                </p>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <button type="button" className={socialButtonClass}>
                                    <FaGoogle className="h-4 w-4 text-red-400" />
                                    Google
                                </button>
                                <button type="button" className={socialButtonClass}>
                                    <FaFacebookF className="h-4 w-4 text-blue-400" />
                                    Facebook
                                </button>
                            </div>

                            <div className="my-7 flex items-center gap-3">
                                <div className="h-px flex-1 bg-[#7c3aed]/10" />
                                <span className="text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
                                    or register with email
                                </span>
                                <div className="h-px flex-1 bg-[#7c3aed]/10" />
                            </div>

                            <form onSubmit={handleSubmit} noValidate>
                                <div className="mb-5">
                                    <label className={fieldLabelClass}>Full Name</label>
                                    <div className="relative">
                                        <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
                                        <input
                                            type="text"
                                            name="fullName"
                                            placeholder="Nguyen Van A"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            className={`${baseInputClass} pl-11`}
                                        />
                                    </div>
                                    {errors.fullName ? (
                                        <p className="mt-1.5 text-xs font-semibold text-red-400">{errors.fullName}</p>
                                    ) : null}
                                </div>

                                <div className="mb-5">
                                    <label className={fieldLabelClass}>Email Address</label>
                                    <div className="relative">
                                        <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder="you@example.com"
                                            value={formData.email}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            className={`${baseInputClass} pl-11`}
                                        />
                                    </div>
                                    {errors.email ? (
                                        <p className="mt-1.5 text-xs font-semibold text-red-400">{errors.email}</p>
                                    ) : null}
                                </div>

                                <div className="mb-4">
                                    <label className={fieldLabelClass}>Password</label>
                                    <div className="relative">
                                        <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
                                        <input
                                            type="password"
                                            name="password"
                                            placeholder="At least 8 characters, 1 uppercase"
                                            value={formData.password}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            className={`${baseInputClass} pl-11`}
                                        />
                                    </div>
                                    {errors.password ? (
                                        <p className="mt-1.5 text-xs font-semibold text-red-400">{errors.password}</p>
                                    ) : null}
                                </div>

                                <button type="submit" className={baseButtonClass}>
                                    <UserPlus className="inline-block h-4 w-4 mr-2" />
                                    Create Account
                                </button>
                            </form>

                            <p className="mt-6 text-center text-sm text-[#94a3b8]">
                                Already have an account?{" "}
                                <Link to="/login" className="font-semibold text-[#a78bfa] no-underline transition hover:text-white">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </div>
                    <div className="relative flex flex-col justify-between p-10 text-white overflow-hidden bg-[#090514]">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#4c1d95]/60 via-[#090514] to-[#090514]" />
                        <div className="absolute top-[-60px] right-[-60px] w-[280px] h-[280px] rounded-full bg-[#7c3aed]/20 blur-[80px]" />
                        <div className="absolute bottom-[-40px] left-[-40px] w-[200px] h-[200px] rounded-full bg-[#4c1d95]/30 blur-[60px]" />
                        <div
                            className="absolute inset-0 opacity-[0.05]"
                            style={{
                                backgroundImage: `linear-gradient(#a78bfa 1px, transparent 1px), linear-gradient(90deg, #a78bfa 1px, transparent 1px)`,
                                backgroundSize: "40px 40px",
                            }}
                        />

                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 bg-[#7c3aed]/15 border border-[#7c3aed]/25 text-[#a78bfa] text-xs font-semibold px-3 py-1.5 rounded-full mb-6 tracking-wider uppercase">
                                <Zap className="w-3 h-3" />
                                Student Portal
                            </div>
                            <h1
                                className="text-4xl font-extrabold leading-tight mb-3"
                                style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                            >
                                Start learning with expert courses
                            </h1>
                            <p className="text-[#94a3b8] text-sm leading-relaxed max-w-xs">
                                Create your account to save courses, follow your progress, and earn certificates as you learn.
                            </p>
                        </div>

                        <div className="relative z-10 mt-10 flex justify-center">
                            <img
                                src="/images/undraw_morning-news_h9nz.svg"
                                alt="Student learning illustration"
                                className="max-h-72 w-auto drop-shadow-2xl"
                            />
                        </div>

                        <div className="relative z-10 mt-8 grid grid-cols-3 gap-3">
                            {[
                                { value: "1,800+", label: "Courses" },
                                { value: "340+", label: "Teachers" },
                                { value: "98%", label: "Success" },
                            ].map(({ value, label }) => (
                                <div key={label} className="bg-[#7c3aed]/10 border border-[#7c3aed]/20 rounded-xl p-3 text-center">
                                    <div
                                        className="text-white font-bold text-base"
                                        style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                                    >
                                        {value}
                                    </div>
                                    <div className="text-[#94a3b8] text-xs mt-0.5">{label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            <HeroFooter />
        </div>
    );
}
