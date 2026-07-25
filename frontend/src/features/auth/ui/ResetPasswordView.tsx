import {useEffect, useState, type ChangeEvent, type SubmitEvent} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {ArrowLeft, Eye, EyeOff, LockKeyhole, RefreshCw, ShieldCheck} from "lucide-react";
import {validateResetPassword, validateResetPasswordToken} from "../model/validation";
import {resetPassword} from "../api/authApi";
import {getApiErrorMessage, showErrorToast, showSuccessToast} from "@/shared/utils";
import { UserReveal } from "@/shared/ui/animation";
import {isRecord} from "../model/authSession";

const baseInputClass =
    "w-full bg-brand-light border border-brand-accent/20 focus:border-brand-accent/60 text-brand-textPrimary placeholder-brand-textSecondary/50 rounded-xl px-4 py-3 text-sm outline-none transition-colors";
const baseButtonClass =
    "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-accent px-4 py-3 text-sm font-semibold text-brand-white shadow-lg shadow-brand-accent/30 transition hover:bg-brand-accentHover hover:shadow-brand-accent/50 disabled:cursor-not-allowed disabled:opacity-60";
const fieldLabelClass = "block text-xs font-semibold text-brand-textSecondary uppercase tracking-wider mb-2";

interface ResetPasswordFormData {
    new_password: string;
    confirm_password: string;
}

type ResetPasswordFieldName = keyof ResetPasswordFormData;

const isResetPasswordFieldName = (name: string): name is ResetPasswordFieldName =>
    name === "new_password" || name === "confirm_password";

function readResetState(state: unknown): { email?: string; token?: string } {
    if (!isRecord(state)) return {};
    return {
        email: typeof state.email === "string" ? state.email : undefined,
        token: typeof state.token === "string" ? state.token : undefined,
    };
}

export default function ResetPasswordView() {
    const navigate = useNavigate();
    const location = useLocation();
    const { email, token } = readResetState(location.state);

    const [formData, setFormData] = useState<ResetPasswordFormData>({
        new_password: "",
        confirm_password: "",
    });
    const [formError, setFormError] = useState("");

    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (validateResetPasswordToken(email, token)) {
            showErrorToast("Phiên đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.");
            void navigate("/forgot-password", {replace: true});
        }
    }, [email, token, navigate]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        if (!isResetPasswordFieldName(name)) return;
        setFormData((current) => ({...current, [name]: value}));
        if (formError) setFormError("");
    };

    const validatePasswordForm = (values: ResetPasswordFormData): string => {
        const check = validateResetPassword(values.new_password, values.confirm_password);
        if (check) {
            setFormError(check);
            return check;
        }
        return "";
    };

    const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        const invalid = validatePasswordForm(formData);
        if (invalid) return;
        if (!email || !token) {
            setFormError("Phiên đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.");
            return;
        }

        const payload = {
            email,
            token,
            new_password: formData.new_password,
            confirm_password: formData.confirm_password,
        };
        try {
            setLoading(true);
            const response = await resetPassword(payload);
            showSuccessToast(response.message ? response.message : "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.");
            void navigate("/login", {replace: true});
        } catch (error) {
            const message = getApiErrorMessage(error, "Không thể đặt lại mật khẩu, vui lòng thử lại.");
            setFormError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="user-ui-scope relative overflow-hidden text-brand-textPrimary" style={{fontFamily: "'Be Vietnam Pro', 'Noto Sans SC', sans-serif"}}>
            <div className="fixed inset-0 pointer-events-none">
                <div
                    className="absolute top-[-20%] left-[-10%] w-125 h-125 rounded-full bg-brand-accent/15 blur-[120px]"/>
                <div
                    className="absolute bottom-[-10%] right-[-5%] w-100 h-100 rounded-full bg-brand-accentDeep/20 blur-[100px]"/>
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(var(--color-brand-accent) 1px, var(--color-brand-transparent) 1px), linear-gradient(90deg, var(--color-brand-accent) 1px, var(--color-brand-transparent) 1px)`,
                        backgroundSize: "60px 60px",
                    }}
                />
            </div>

            <section className="relative z-10 flex min-h-[calc(100vh-160px)] items-center justify-center p-4 sm:p-6">
                <UserReveal
                    className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-brand-accent/15 shadow-2xl shadow-brand-accent/10 md:grid-cols-[0.9fr_1.1fr]" distance={20}>
                    <section
                        className="relative hidden overflow-hidden bg-brand-dark p-10 md:flex md:flex-col md:justify-between">
                        <div
                            className="absolute inset-0 bg-linear-to-br from-brand-accentDeep/60 via-brand-dark to-brand-dark"/>
                        <div
                            className="absolute -left-17.5 -bottom-17.5 h-65 w-65 rounded-full bg-brand-accent/20 blur-[80px]"/>
                        <div
                            className="absolute inset-0 opacity-[0.05]"
                            style={{
                                backgroundImage: `linear-gradient(var(--color-brand-accentSoft) 1px, var(--color-brand-transparent) 1px), linear-gradient(90deg, var(--color-brand-accentSoft) 1px, var(--color-brand-transparent) 1px)`,
                                backgroundSize: "40px 40px",
                            }}
                        />

                        <div className="relative z-10">
                            <div
                                className="inline-flex items-center gap-2 bg-brand-accent/15 border border-brand-accent/25 text-brand-accentSoft text-xs font-semibold px-3 py-1.5 rounded-full mb-6 tracking-wider uppercase">
                                <ShieldCheck className="h-3.5 w-3.5"/>
                                Bảo mật mật khẩu
                            </div>
                            <h1
                                className="mb-3 text-4xl font-extrabold leading-tight text-brand-white"
                                style={{fontFamily: "'Be Vietnam Pro', 'Noto Sans SC', sans-serif"}}
                            >
                                Đặt lại mật khẩu tài khoản
                            </h1>
                            <p className="max-w-sm text-sm leading-6 text-brand-textSecondary">
                                Tạo mật khẩu mới sau khi xác minh email và mã bảo mật.
                            </p>
                        </div>

                        <div className="relative z-10 my-10 flex justify-center">
                            <img
                                src="/images/undraw_morning-news_h9nz.svg"
                                alt="Minh họa quản lý mật khẩu"
                                className="max-h-72 w-auto drop-shadow-2xl"
                            />
                        </div>
                    </section>

                    <section className="bg-brand-cardBg p-8 md:p-10">
                        <button
                            type="button"
                            onClick={() => {
                                void navigate("/forgot-password");
                            }}
                            className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-brand-textSecondary transition hover:text-brand-white"
                        >
                            <ArrowLeft className="h-4 w-4"/> Dùng email khác
                        </button>
                        <div className="text-center mb-8">
                            <div className="mx-auto mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-accent/20 bg-brand-accent/10 text-brand-accentSoft">
                                <LockKeyhole className="h-5 w-5"/>
                            </div>
                            <h2
                                className="text-3xl font-bold text-brand-white tracking-wide"
                                style={{fontFamily: "'Be Vietnam Pro', 'Noto Sans SC', sans-serif"}}
                            >
                                Đặt lại mật khẩu
                            </h2>
                            {email ? (
                                <p className="mt-2 text-sm text-brand-textSecondary">
                                    Đang đặt lại mật khẩu cho <span className="text-brand-white">{email}</span>
                                </p>
                            ) : null}
                        </div>

                        <form onSubmit={(event) => {
                            void handleSubmit(event);
                        }} className="flex flex-col gap-6">
                            {formError ? (
                                <p role="alert" className="rounded-xl border border-social-google/30 bg-social-google/10 px-4 py-3 text-sm font-semibold text-social-google">
                                    {formError}
                                </p>
                            ) : null}
                            <div className="relative">
                                <label htmlFor="reset-new-password" className={fieldLabelClass}>Mật khẩu mới</label>
                                <div className="relative">
                                    <input
                                        name="new_password"
                                        id="reset-new-password"
                                        required
                                        value={formData.new_password}
                                        onChange={handleChange}
                                        type={showNewPassword ? "text" : "password"}
                                        placeholder="Mật khẩu mới"
                                        autoComplete="new-password"
                                        className={`${baseInputClass} pr-10`}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-textSecondary hover:text-brand-accentSoft transition-colors"
                                        onClick={() => {
                                            setShowNewPassword(!showNewPassword);
                                        }}
                                        aria-label={showNewPassword ? "Ẩn mật khẩu mới" : "Hiện mật khẩu mới"}
                                    >
                                        {showNewPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                                    </button>
                                </div>
                            </div>

                            <div className="relative">
                                <label htmlFor="reset-confirm-password" className={fieldLabelClass}>Xác nhận mật khẩu mới</label>
                                <div className="relative">
                                    <input
                                        name="confirm_password"
                                        id="reset-confirm-password"
                                        required
                                        value={formData.confirm_password}
                                        onChange={handleChange}
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Xác nhận mật khẩu mới"
                                        autoComplete="new-password"
                                        className={`${baseInputClass} pr-10`}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-textSecondary hover:text-brand-accentSoft transition-colors"
                                        onClick={() => {
                                            setShowConfirmPassword(!showConfirmPassword);
                                        }}
                                        aria-label={showConfirmPassword ? "Ẩn xác nhận mật khẩu" : "Hiện xác nhận mật khẩu"}
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-4 w-4"/> :
                                            <Eye className="h-4 w-4"/>}
                                    </button>
                                </div>
                            </div>

                            <button className={baseButtonClass} type="submit" disabled={loading}>
                                {loading ? <RefreshCw className="h-4 w-4 animate-spin"/> : <LockKeyhole className="h-4 w-4"/>}
                                {loading ? "Đang lưu..." : "Đặt lại mật khẩu"}
                            </button>
                        </form>
                    </section>
                </UserReveal>
            </section>
        </div>
    );
}
