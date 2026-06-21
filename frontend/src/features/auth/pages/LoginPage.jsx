import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Zap } from "lucide-react";
import HeroFooter from "../../../shared/components/HeroFooter";
import HeroHeader from "../../../shared/components/HeroHeader";
const LoginPage = () => {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const validInput = (name, value) => {
        if (!value.trim())
            return `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;

        if (name === "email" && !/\S+@\S+\.\S+/.test(value))
            return "Enter a valid email address";

        if (name === "password" && value.length < 6)
            return "Password must be at least 6 characters";

        return "";
    };

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
        setErrors((prev) => ({
            ...prev,
            [name]: validInput(name, value),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const emailError = validInput("email", formData.email);
        const passwordError = validInput("password", formData.password);
        if (emailError || passwordError) {
            setErrors({
                email: emailError,
                password: passwordError,
            });
            return;
        }
        try {
            navigate("/");
        } catch (err) {
            const errMsg =
                err?.response?.data?.error || "Đăng nhập thất bại";

            console.error(errMsg);
        }
    };

    return (
        <div className="min-h-screen bg-[#090514] flex flex-col"style={{ fontFamily: "'Inter', sans-serif" }}>
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
                                <h2
                                    className="text-3xl font-extrabold text-white mb-2"
                                    style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                                >
                                    Welcome back
                                </h2>
                                <p className="text-[#94a3b8] text-sm">
                                    Enter your account details to continue
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} noValidate>
                                <div className="mb-6">
                                    <label className="block text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        type="text"
                                        name="email"
                                        placeholder="you@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className="w-full bg-[#160e2e] border border-[#7c3aed]/20 focus:border-[#7c3aed]/60 text-[#f8fafc] placeholder-[#94a3b8]/50 rounded-xl px-4 py-3 text-sm outline-none transition-colors"
                                    />
                                    {errors.email && (
                                        <p className="mt-1.5 text-xs font-semibold text-red-400">{errors.email}</p>
                                    )}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-2">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            className="w-full bg-[#160e2e] border border-[#7c3aed]/20 focus:border-[#7c3aed]/60 text-[#f8fafc] placeholder-[#94a3b8]/50 rounded-xl px-4 py-3 pr-11 text-sm outline-none transition-colors"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#a78bfa] transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="mt-1.5 text-xs font-semibold text-red-400">{errors.password}</p>
                                    )}
                                </div>
                                <div className="mb-8 text-right">
                                    <Link
                                        to="/forgot-password"
                                        className="text-xs text-[#94a3b8] hover:text-[#a78bfa] no-underline transition-colors"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-xl py-3 font-semibold text-sm transition-all shadow-lg shadow-[#7c3aed]/30 hover:shadow-[#7c3aed]/50 hover:scale-[1.01]"
                                >
                                    Login
                                </button>
                            </form>
                        </div>

                        <div className="mt-8 flex items-center gap-3 pt-6 border-t border-[#7c3aed]/10">
                            <span className="text-sm text-[#94a3b8]">Don't have an account?</span>
                            <Link
                                to="/register"
                                className="text-sm font-semibold text-[#a78bfa] hover:text-white no-underline transition-colors"
                            >
                                Sign up →
                            </Link>
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
                                Welcome to<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a78bfa] to-[#7c3aed]">
                                    Edujar
                                </span>
                            </h1>
                            <p className="text-[#94a3b8] text-sm leading-relaxed max-w-xs">
                                Login to access your courses, track your progress, and connect with 120,000+ learners.
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
                                { value: "120K+", label: "Learners" },
                                { value: "1,800+", label: "Courses" },
                                { value: "4.9★", label: "Rating" },
                            ].map(({ value, label }) => (
                                <div key={label} className="bg-[#7c3aed]/10 border border-[#7c3aed]/20 rounded-xl p-3 text-center">
                                    <div className="text-white font-bold text-base" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
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
};

export default LoginPage;
