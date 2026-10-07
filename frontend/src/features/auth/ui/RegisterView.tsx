import { useState, type ChangeEvent, type FocusEvent, type SubmitEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaFacebookF, FaGoogle } from "react-icons/fa";
import { Lock, Mail, User, UserPlus, Zap } from "lucide-react";
import { showApiErrorToast, showSuccessToast } from "@/shared/utils";
import { register } from "../api/authApi";
import { UserReveal } from "@/shared/ui/animation";
import { validateAuthField, type AuthFieldName } from "../model/validation";

const baseInputClass =
    "w-full bg-brand-light border border-brand-accent/20 focus:border-brand-accent/60 text-brand-textPrimary placeholder-brand-textSecondary/50 rounded-xl px-4 py-3 text-sm outline-none transition-colors";
const baseButtonClass =
    "w-full bg-brand-accent hover:bg-brand-accentHover text-brand-white rounded-xl py-3 font-semibold text-sm transition-all shadow-lg shadow-brand-accent/30 hover:shadow-brand-accent/50 hover:scale-[1.01]";
const socialButtonClass =
    "inline-flex items-center justify-center gap-2 rounded-xl border border-brand-accent/20 bg-brand-light px-4 py-3 text-sm font-semibold text-brand-white transition hover:border-brand-accent/50 hover:bg-brand-accent/10";
const fieldLabelClass = "block text-xs font-semibold text-brand-textSecondary uppercase tracking-wider mb-2";

interface RegisterFormData {
    fullName: string;
    email: string;
    password: string;
}

type RegisterFieldName = keyof RegisterFormData;

const isRegisterFieldName = (name: string): name is RegisterFieldName =>
    name === "fullName" || name === "email" || name === "password";

const isAuthFieldName = (name: RegisterFieldName): name is AuthFieldName =>
    name === "email" || name === "password";

export default function RegisterView() {
    const navigate = useNavigate();
    const registerWithGoogle = () => {
        window.location.assign("/api/oauth2/authorization/google");
    };
    const registerWithFacebook = () => {
        window.location.assign("/api/oauth2/authorization/facebook");
    };
    const [formData, setFormData] = useState<RegisterFormData>({
        fullName: "",
        email: "",
        password: "",
    });
    const [errors, setErrors] = useState<Record<RegisterFieldName, string>>({
        fullName: "",
        email: "",
        password: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (!isRegisterFieldName(name)) return;
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
        if (!isRegisterFieldName(name)) return;

        if (name === "fullName") {
            setErrors((prev) => ({
                ...prev,
                fullName: value.trim() ? "" : "Vui lòng nhập họ và tên.",
            }));
            return;
        }

        if (!isAuthFieldName(name)) return;
        setErrors((prev) => ({
            ...prev,
            [name]: validateAuthField(name, value),
        }));
    };

    const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (isSubmitting) return;

        const nextErrors = {
            fullName: formData.fullName.trim() ? "" : "Vui lòng nhập họ và tên.",
            email: validateAuthField("email", formData.email),
            password: validateAuthField("password", formData.password),
        };

        setErrors(nextErrors);

        if (Object.values(nextErrors).some(Boolean)) {
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await register({
                fullName: formData.fullName.trim(),
                email: formData.email.trim(),
                password: formData.password,
            });
            showSuccessToast(response.emailVerificationRequired === false
                ? "Tạo tài khoản thành công. Bạn có thể đăng nhập ngay."
                : "Tạo tài khoản thành công. Vui lòng xác minh email để kích hoạt tài khoản.");
            void navigate("/login", { replace: true });
        } catch (error) {
            showApiErrorToast(error, "Có lỗi khi thực hiện đăng ký, vui lòng thử lại sau.");
        } finally {
            setIsSubmitting(false);
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
                                <div className="inline-flex items-center gap-2 bg-brand-accent/15 border border-brand-accent/25 text-brand-accentSoft text-xs font-semibold px-3 py-1.5 rounded-full mb-6 tracking-wider uppercase">
                                    <UserPlus className="w-3 h-3" />
                                    Cổng học viên
                                </div>
                                <h2
                                    className="text-3xl font-extrabold text-brand-white mb-2"
                                    style={{ fontFamily: "'Be Vietnam Pro', 'Noto Sans SC', sans-serif" }}
                                >
                                    Tạo tài khoản của bạn
                                </h2>
                                <p className="text-brand-textSecondary text-sm leading-relaxed max-w-md">
                                    Tham gia Edujar để lưu khóa học, theo dõi tiến độ và tiếp tục học ở bất cứ đâu.
                                </p>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <button type="button" onClick={registerWithGoogle} className={socialButtonClass}>
                                    <FaGoogle className="h-4 w-4 text-social-google" />
                                    Google
                                </button>
                                <button type="button" onClick={registerWithFacebook} className={socialButtonClass}>
                                    <FaFacebookF className="h-4 w-4 text-social-facebook" />
                                    Facebook
                                </button>
                            </div>

                            <div className="my-7 flex items-center gap-3">
                                <div className="h-px flex-1 bg-brand-accent/10" />
                                <span className="text-xs font-semibold uppercase tracking-wider text-brand-textSecondary">
                                    hoặc đăng ký bằng email
                                </span>
                                <div className="h-px flex-1 bg-brand-accent/10" />
                            </div>

                            <form onSubmit={(event) => {
                                void handleSubmit(event);
                            }} noValidate>
                                <div className="mb-5">
                                    <label htmlFor="register-full-name" className={fieldLabelClass}>Họ và tên</label>
                                    <div className="relative">
                                        <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-textSecondary" />
                                        <input
                                            type="text"
                                            id="register-full-name"
                                            name="fullName"
                                            placeholder="Nguyễn Văn A"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            aria-invalid={Boolean(errors.fullName)}
                                            aria-describedby={errors.fullName ? "register-full-name-error" : undefined}
                                            className={`${baseInputClass} pl-11`}
                                        />
                                    </div>
                                    {errors.fullName ? (
                                        <p id="register-full-name-error" role="alert" className="mt-1.5 text-xs font-semibold text-social-google">{errors.fullName}</p>
                                    ) : null}
                                </div>

                                <div className="mb-5">
                                    <label htmlFor="register-email" className={fieldLabelClass}>Địa chỉ email</label>
                                    <div className="relative">
                                        <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-textSecondary" />
                                        <input
                                            type="email"
                                            id="register-email"
                                            name="email"
                                            placeholder="you@example.com"
                                            value={formData.email}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            aria-invalid={Boolean(errors.email)}
                                            aria-describedby={errors.email ? "register-email-error" : undefined}
                                            className={`${baseInputClass} pl-11`}
                                        />
                                    </div>
                                    {errors.email ? (
                                        <p id="register-email-error" role="alert" className="mt-1.5 text-xs font-semibold text-social-google">{errors.email}</p>
                                    ) : null}
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="register-password" className={fieldLabelClass}>Mật khẩu</label>
                                    <div className="relative">
                                        <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-textSecondary" />
                                        <input
                                            type="password"
                                            id="register-password"
                                            name="password"
                                            placeholder="Ít nhất 8 ký tự, có 1 chữ hoa"
                                            value={formData.password}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            aria-invalid={Boolean(errors.password)}
                                            aria-describedby={errors.password ? "register-password-error" : undefined}
                                            className={`${baseInputClass} pl-11`}
                                        />
                                    </div>
                                    {errors.password ? (
                                        <p id="register-password-error" role="alert" className="mt-1.5 text-xs font-semibold text-social-google">{errors.password}</p>
                                    ) : null}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`${baseButtonClass} disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100`}
                                >
                                    <UserPlus className="inline-block h-4 w-4 mr-2" />
                                    Tạo tài khoản
                                </button>
                            </form>

                            <p className="mt-6 text-center text-sm text-brand-textSecondary">
                                Đã có tài khoản?{" "}
                                <Link to="/login" className="font-semibold text-brand-accentSoft no-underline transition hover:text-brand-white">
                                    Đăng nhập
                                </Link>
                            </p>
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
                                Bắt đầu học với các khóa học chất lượng
                            </h1>
                            <p className="text-brand-textSecondary text-sm leading-relaxed max-w-xs">
                                Tạo tài khoản để lưu khóa học, theo dõi tiến độ và nhận chứng nhận khi hoàn thành.
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
                                { value: "1.800+", label: "Khóa học" },
                                { value: "340+", label: "Giảng viên" },
                                { value: "98%", label: "Thành công" },
                            ].map(({ value, label }) => (
                                <div key={label} className="bg-brand-accent/10 border border-brand-accent/20 rounded-xl p-3 text-center">
                                    <div
                                        className="text-brand-white font-bold text-base"
                                        style={{ fontFamily: "'Be Vietnam Pro', 'Noto Sans SC', sans-serif" }}
                                    >
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
}
