import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CircleX, LoaderCircle, MailCheck, ShieldCheck } from "lucide-react";
import { resendVerificationEmail, verifyEmail } from "../service/authService.js";

const resultConfig = {
    loading: {
        icon: <LoaderCircle className="h-8 w-8 animate-spin" />,
        iconClass: "border-brand-accent/25 bg-brand-accent/10 text-brand-accentSoft",
        title: "Đang xác thực email",
        description: "Hệ thống đang kiểm tra liên kết xác thực của bạn.",
    },
    success: {
        icon: <ShieldCheck className="h-8 w-8" />,
        iconClass: "border-status-success/30 bg-status-success/10 text-status-successSoft",
        title: "Xác thực thành công",
        description: "Tài khoản của bạn đã được kích hoạt. Bạn có thể đóng tab này.",
    },
    error: {
        icon: <CircleX className="h-8 w-8" />,
        iconClass: "border-status-danger/30 bg-status-danger/10 text-status-danger",
        title: "Không thể xác thực email",
        description: "Liên kết xác thực không hợp lệ hoặc đã hết hạn. Bạn có thể gửi lại email xác thực.",
    },
};

export default function VerifyEmailPage() {
    const [searchParams] = useSearchParams();
    const email = searchParams.get("email")?.trim() || "";
    const token = searchParams.get("token")?.trim() || "";
    const [status, setStatus] = useState("loading");
    const [message, setMessage] = useState("");
    const [isResending, setIsResending] = useState(false);

    useEffect(() => {
        if (!email || !token) {
            return;
        }

        let ignore = false;

        const verify = async () => {
            try {
                const response = await verifyEmail({ email, token });
                if (!ignore) {
                    setMessage(response?.message || "");
                    setStatus("success");
                }
            } catch (error) {
                if (!ignore) {
                    setMessage(error?.response?.data?.message || "");
                    setStatus("error");
                }
            }
        };

        verify();

        return () => {
            ignore = true;
        };
    }, [email, token]);

    const handleResend = async () => {
        if (!email || isResending) {
            return;
        }

        setIsResending(true);
        try {
            const response = await resendVerificationEmail({ email });
            setMessage(response?.message || "Đã gửi lại email xác thực. Vui lòng kiểm tra hộp thư của bạn.");
        } catch (error) {
            setMessage(error?.response?.data?.message || "Không thể gửi lại email xác thực. Vui lòng thử lại sau.");
        } finally {
            setIsResending(false);
        }
    };

    const displayStatus = !email || !token ? "error" : status;
    const displayMessage = !email || !token ? "Thiếu thông tin xác thực trong liên kết." : message;
    const current = resultConfig[displayStatus];
    const canResend = displayStatus === "error" && Boolean(email);

    return (
        <div className="relative min-h-[calc(100vh-160px)] overflow-hidden text-brand-textPrimary" style={{ fontFamily: "'Be Vietnam Pro', 'Noto Sans SC', sans-serif" }}>
            <section className="relative z-10 flex min-h-[calc(100vh-160px)] items-center justify-center px-6 py-12">
                <div className="w-full max-w-xl rounded-3xl border border-brand-accent/15 bg-brand-cardBg p-8 text-center shadow-2xl shadow-brand-accent/10 md:p-10">

                    <div className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border ${current.iconClass}`}>
                        {current.icon}
                    </div>

                    <h1 className="mb-3 text-3xl font-extrabold text-brand-white">
                        {current.title}
                    </h1>
                    <p className="mx-auto max-w-md text-sm leading-6 text-brand-textSecondary">
                        {current.description}
                    </p>
                    {displayMessage ? (
                        <p className="mx-auto mt-4 max-w-md rounded-2xl border border-brand-accent/15 bg-brand-light px-4 py-3 text-sm font-semibold text-brand-textPrimary">
                            {displayMessage}
                        </p>
                    ) : null}
                    {canResend ? (
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={isResending}
                            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-brand-accent px-5 py-3 text-sm font-semibold text-brand-white shadow-lg shadow-brand-accent/20 transition hover:bg-brand-accentHover disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {isResending ? (
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                            ) : (
                                <MailCheck className="h-4 w-4" />
                            )}
                            {isResending ? "Đang gửi lại" : "Gửi lại email xác thực"}
                        </button>
                    ) : null}
                </div>
            </section>
        </div>
    );
}
