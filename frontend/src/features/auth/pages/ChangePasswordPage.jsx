import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import HeroHeader from "../../../shared/components/HeroHeader";
import HeroFooter from "../../../shared/components/HeroFooter";
import { toast } from "react-toastify";
import {
    validateChangePassword,
    validatePassword,
    validateResetPassword,
    validateResetPasswordToken
} from "../shared/utils/validator.js";

const baseInputClass =
    "w-full bg-[#160e2e] border border-[#7c3aed]/20 focus:border-[#7c3aed]/60 text-[#f8fafc] placeholder-[#94a3b8]/50 rounded-xl px-4 py-3 text-sm outline-none transition-colors";
const baseButtonClass =
    "w-full mt-4 bg-[#7c3aed] hover:bg-[#6d28d9] text-white py-3 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-[#7c3aed]/30 hover:shadow-[#7c3aed]/50 hover:scale-[1.01] active:scale-[0.99]";
const fieldLabelClass = "block text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-2";

export default function ChangePasswordPage({ mode = "change" }) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const email = searchParams.get("email");
    const token = searchParams.get("token");

    const [formData, setFormData] = useState({
        current_password: "",
        new_password: "",
        confirm_password: "",
    });

    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        if (validateResetPasswordToken(mode, email, token)) {
            toast.error("Reset session is invalid.");
            navigate("/forgot-password", { replace: true });
        }
    }, [mode, email, token, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validatePasswordForm = (formData, mode = "change") => {

        if(mode === "change"){
            const check = validateChangePassword(formData.oldPassword ,formData.new_password, formData.confirm_password);
            if(check){
                toast.error(check);
                return check;
            }
        }

        if (mode === 'reset') {
            const check = validateResetPassword(formData.new_password, formData.confirm_password);
            if(check){
                toast.error(check);
                return check;
            }
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if(!validatePasswordForm(formData, mode)){
            toast.success("Password reset successfully. Please reLogin...");
            navigate("/login", { replace: true });
            return;
        }
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
                <div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-[#7c3aed]/15 shadow-2xl shadow-[#7c3aed]/10 grid md:grid-cols-[0.9fr_1.1fr]">
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
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="12"
                                    height="12"
                                    fill="currentColor"
                                    viewBox="0 0 16 16"
                                >
                                    <path d="M8 0a8 8 0 1 0 4.903 14.32l-.78-.78A6.5 6.5 0 1 1 8 1.5V0z" />
                                    <path d="M8 4.5a3.5 3.5 0 0 0-3.5 3.5h1.5a2 2 0 1 1 4 0c0 .667-.333 1.166-.999 1.666C8.333 10.166 8 10.666 8 11.5V12h1.5v-.25c0-.5.166-.75.666-1.083C11 9.999 11.5 9.167 11.5 8a3.5 3.5 0 0 0-3.5-3.5z" />
                                </svg>
                                Password Security
                            </div>
                            <h1
                                className="mb-3 text-4xl font-extrabold leading-tight text-white"
                                style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                            >
                                {mode === "change" ? "Update your current password" : "Reset your account password"}
                            </h1>
                            <p className="max-w-sm text-sm leading-6 text-[#94a3b8]">
                                {mode === "change"
                                    ? "Use your current password to protect the account, then choose a stronger new one."
                                    : "Set a new password after verifying your email and token."}
                            </p>
                        </div>

                        <div className="relative z-10 my-10 flex justify-center">
                            <img
                                src="/images/undraw_morning-news_h9nz.svg"
                                alt="Password management illustration"
                                className="max-h-72 w-auto drop-shadow-2xl"
                            />
                        </div>
                    </section>

                    <section className="bg-[#1c1236] p-8 md:p-10">
                        <div className="text-center mb-8">
                            <h2
                                className="text-3xl font-bold text-white tracking-wide"
                                style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                            >
                                {mode === "change" ? "Change Password" : "Reset Password"}
                            </h2>
                            {mode === "reset" && email ? (
                                <p className="mt-2 text-sm text-[#94a3b8]">
                                    Resetting password for <span className="text-white">{email}</span>
                                </p>
                            ) : null}
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                            {mode === "change" ? (
                                <div className="relative">
                                    <label className={fieldLabelClass}>Current Password</label>
                                    <div className="relative">
                                        <input
                                            className={`${baseInputClass} pr-10`}
                                            name="current_password"
                                            value={formData.current_password}
                                            onChange={handleChange}
                                            type={showOldPassword ? "text" : "password"}
                                            placeholder="Current Password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#a78bfa] transition-colors"
                                            onClick={() => setShowOldPassword(!showOldPassword)}
                                        >
                                            {showOldPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>
                            ) : null}

                            <div className="relative">
                                <label className={fieldLabelClass}>New Password</label>
                                <div className="relative">
                                    <input
                                        name="new_password"
                                        required
                                        value={formData.new_password}
                                        onChange={handleChange}
                                        type={showNewPassword ? "text" : "password"}
                                        placeholder="New Password"
                                        className={`${baseInputClass} pr-10`}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#a78bfa] transition-colors"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                    >
                                        {showNewPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="relative">
                                <label className={fieldLabelClass}>Confirm New Password</label>
                                <div className="relative">
                                    <input
                                        name="confirm_password"
                                        required
                                        value={formData.confirm_password}
                                        onChange={handleChange}
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Confirm New Password"
                                        className={`${baseInputClass} pr-10`}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#a78bfa] transition-colors"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <button className={baseButtonClass} type="submit">
                                {mode === "change" ? "Save Changes" : "Reset Password"}
                            </button>
                        </form>
                    </section>
                </div>
            </main>

            <HeroFooter />
        </div>
    );
}
