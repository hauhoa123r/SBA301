import { useEffect, useState, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import { CircleX, LoaderCircle, ShieldCheck } from "lucide-react";
import { verifyEmail } from "../api/authApi";
import { UserReveal } from "@/shared/ui/animation";
import { getApiErrorMessage } from "@/shared/utils";

type VerificationStatus = "loading" | "success" | "error";

const resultConfig: Record<VerificationStatus, {
    icon: ReactNode;
    iconClass: string;
    title: string;
    description: string;
}> = {
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
        description: "Liên kết xác thực không hợp lệ hoặc đã hết hạn. Vui lòng đăng ký lại hoặc liên hệ hỗ trợ.",
    },
};

export default function VerifyEmailView() {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<VerificationStatus>("loading");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const email = searchParams.get("email")?.trim() ?? "";
        const token = searchParams.get("token")?.trim() ?? "";

        if (!email || !token) {
            // Preserve the immediate invalid-link state from the existing auth flow.
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setStatus("error");
            setMessage("Thiếu thông tin xác thực trong liên kết.");
            return;
        }

        let ignore = false;

        const verify = async () => {
            try {
                const response = await verifyEmail({ email, token });
                if (!ignore) {
                    setMessage(response.message ?? "");
                    setStatus("success");
                }
            } catch (error) {
                if (!ignore) {
                    setMessage(getApiErrorMessage(error, ""));
                    setStatus("error");
                }
            }
        };

        void verify();

        return () => {
            ignore = true;
        };
    }, [searchParams]);

    const current = resultConfig[status];

    return (
        <div className="user-ui-scope relative min-h-[calc(100vh-160px)] overflow-hidden text-brand-textPrimary" style={{ fontFamily: "'Be Vietnam Pro', 'Noto Sans SC', sans-serif" }}>
            <section className="relative z-10 flex min-h-[calc(100vh-160px)] items-center justify-center px-6 py-12">
                <UserReveal className="w-full max-w-xl rounded-3xl border border-brand-accent/15 bg-brand-cardBg p-8 text-center shadow-2xl shadow-brand-accent/10 md:p-10" distance={20} aria-live="polite">

                    <div className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border ${current.iconClass}`}>
                        {current.icon}
                    </div>

                    <h1 className="mb-3 text-3xl font-extrabold text-brand-white">
                        {current.title}
                    </h1>
                    <p className="mx-auto max-w-md text-sm leading-6 text-brand-textSecondary">
                        {current.description}
                    </p>
                    {message ? (
                        <p className="mx-auto mt-4 max-w-md rounded-2xl border border-brand-accent/15 bg-brand-light px-4 py-3 text-sm font-semibold text-brand-textPrimary">
                            {message}
                        </p>
                    ) : null}
                </UserReveal>
            </section>
        </div>
    );
}
