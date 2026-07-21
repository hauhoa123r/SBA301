import { ExternalLink, Landmark, Link as LinkIcon, QrCode, Wallet, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserImage from "../../../../shared/components/animation/UserImage";
import { createPayment } from "../../services/api/payment.service";
import useAuth from "../../../../app/provider/useAuth";
import { hasAnyRole } from "../../../../shared/utils/roles";

const PAYMENT_METHODS = [
    { value: "VNPAY", label: "VNPay", description: "Thanh toán qua cổng VNPay", icon: Landmark },
    { value: "MOMO", label: "MoMo", description: "Thanh toán bằng ví MoMo", icon: Wallet },
    { value: "PAYOS", label: "payOS", description: "Thanh toán bằng mã QR hoặc liên kết", icon: QrCode },
    { value: "ZALOPAY", label: "ZaloPay", description: "Thanh toán bằng ví ZaloPay", icon: Wallet },
];

const getPaymentErrorMessage = (err) => {
    const data = err?.response?.data;
    if (data?.message) return data.message;
    if (data?.error && data?.path) return `${data.error}: ${data.path}`;
    if (err?.message) return err.message;
    return "Không thể tạo thanh toán. Vui lòng thử lại.";
};

const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(Number(value || 0));

const FOCUSABLE_ELEMENTS = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
].join(",");

export default function PaymentMethodModal({ course, open, couponCode, finalPrice, discountAmount, onClose }) {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [provider, setProvider] = useState("VNPAY");
    const [payment, setPayment] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const dialogRef = useRef(null);
    const previouslyFocusedRef = useRef(null);
    const onCloseRef = useRef(onClose);
    const titleId = useId();
    const descriptionId = useId();

    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        if (!open) return undefined;

        previouslyFocusedRef.current = document.activeElement;
        const previousBodyOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const focusDialogFrame = window.requestAnimationFrame(() => {
            dialogRef.current?.focus();
        });

        const handleDialogKeyDown = (event) => {
            if (event.key === "Escape") {
                event.preventDefault();
                onCloseRef.current();
                return;
            }

            if (event.key !== "Tab" || !dialogRef.current) return;

            const dialog = dialogRef.current;
            const focusableElements = Array.from(dialog.querySelectorAll(FOCUSABLE_ELEMENTS));

            if (focusableElements.length === 0) {
                event.preventDefault();
                dialog.focus();
                return;
            }

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            const activeElement = document.activeElement;

            if (event.shiftKey && (activeElement === firstElement || !dialog.contains(activeElement))) {
                event.preventDefault();
                lastElement.focus();
            } else if (!event.shiftKey && (activeElement === lastElement || !dialog.contains(activeElement))) {
                event.preventDefault();
                firstElement.focus();
            }
        };

        document.addEventListener("keydown", handleDialogKeyDown);

        return () => {
            window.cancelAnimationFrame(focusDialogFrame);
            document.removeEventListener("keydown", handleDialogKeyDown);
            document.body.style.overflow = previousBodyOverflow;

            const previouslyFocused = previouslyFocusedRef.current;
            if (previouslyFocused instanceof HTMLElement && document.contains(previouslyFocused)) {
                previouslyFocused.focus();
            }
        };
    }, [open]);

    if (!open) return null;

    const handleSelectProvider = (value) => {
        setProvider(value);
        setPayment(null);
    };

    const handleCreatePayment = async () => {
        if (!user) {
            const returnTo = `${window.location.pathname}${window.location.search}`;
            navigate(`/login?returnTo=${encodeURIComponent(returnTo)}`);
            return;
        }
        if (!hasAnyRole(user, ["STUDENT"])) {
            onClose();
            return;
        }

        setIsSubmitting(true);
        setError("");
        setPayment(null);

        try {
            const data = await createPayment({
                courseId: course.id,
                provider,
                couponCode,
            });

            if (data.paymentUrl && provider !== "PAYOS") {
                window.location.href = data.paymentUrl;
                return;
            }

            setPayment(data);
            navigate("/payment/checkout", {
                state: {
                    payment: data,
                    course,
                    couponCode,
                },
            });
        } catch (err) {
            setError(getPaymentErrorMessage(err));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="user-modal-overlay fixed inset-0 z-50 grid place-items-center bg-brand-black/70 p-3 backdrop-blur-sm sm:px-4 sm:py-6">
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={descriptionId}
                aria-busy={isSubmitting}
                tabIndex={-1}
                className="user-modal-dialog flex max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-brand-accent/15 bg-brand-cardBg shadow-2xl shadow-brand-black/40 outline-none sm:max-h-[calc(100dvh-3rem)] sm:rounded-3xl"
            >
                <div className="flex shrink-0 items-start justify-between gap-4 border-b border-brand-accent/10 px-4 py-4 sm:px-6 sm:py-5">
                    <div>
                        <p id={descriptionId} className="sr-only">Chọn một phương thức và xác nhận để tiếp tục thanh toán khóa học.</p>
                        <p className="text-sm font-bold text-brand-accentSoft">Thanh toán khóa học</p>
                        <h2 id={titleId} className="mt-1 text-xl font-black leading-tight text-brand-white sm:text-2xl">Chọn phương thức thanh toán</h2>
                    </div>
                    <button type="button" onClick={onClose} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-light text-brand-textSecondary transition hover:bg-brand-accent hover:text-brand-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accentSoft" aria-label="Đóng hộp thoại thanh toán">
                        <X aria-hidden="true" className="h-5 w-5" />
                    </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5">
                    <div className="mb-5 grid gap-3 rounded-2xl border border-brand-accent/10 bg-brand-light/70 px-4 py-3 text-sm font-semibold text-brand-textSecondary sm:grid-cols-3">
                        <span>
                            Giá gốc
                            <strong className="mt-1 block text-base text-brand-white">{formatCurrency(course.price)}</strong>
                        </span>
                        <span>
                            Giảm giá
                            <strong className="mt-1 block text-base text-status-success">{formatCurrency(discountAmount || 0)}</strong>
                        </span>
                        <span>
                            Tổng thanh toán
                            <strong className="mt-1 block text-base text-brand-accentPale">{formatCurrency(finalPrice ?? course.price)}</strong>
                        </span>
                    </div>

                    <div role="group" aria-label="Phương thức thanh toán" className="grid gap-3 sm:grid-cols-2">
                        {PAYMENT_METHODS.map(({ value, label, description, icon: Icon }) => {
                            const isActive = provider === value;
                            return (
                                <button key={value} type="button" aria-pressed={isActive} onClick={() => handleSelectProvider(value)} className={`flex min-h-24 items-center gap-3 rounded-2xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accentSoft sm:gap-4 sm:p-4 ${isActive ? "border-brand-accent bg-brand-accent/15 text-brand-white" : "border-brand-accent/10 bg-brand-light/70 text-brand-textSecondary hover:border-brand-accent/40 hover:text-brand-white"}`}>
                                    <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${isActive ? "bg-brand-accent text-brand-white" : "bg-brand-dark text-brand-accentSoft"}`}>
                                        <Icon aria-hidden="true" className="h-5 w-5" />
                                    </span>
                                    <span className="min-w-0">
                                        <span className="block text-base font-black">{label}</span>
                                        <span className="mt-1 block text-sm font-semibold leading-5 text-brand-textSecondary">{description}</span>
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {error && (
                        <p role="alert" className="mt-4 rounded-2xl border border-social-google/20 bg-social-google/10 px-4 py-3 text-sm font-semibold text-social-google">
                            {error}
                        </p>
                    )}

                    {payment && (
                        <div className="mt-5 rounded-2xl border border-brand-accent/10 bg-brand-dark/70 p-5">
                            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                                {payment.qrCode && (
                                    <div className="mx-auto shrink-0 rounded-2xl bg-brand-white p-4 sm:mx-0">
                                        <UserImage src={payment.qrCode} alt="Mã QR thanh toán" width="176" height="176" className="h-44 w-44 object-contain" />
                                    </div>
                                )}
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-bold text-brand-textSecondary">Mã hóa đơn</p>
                                    <p className="mt-1 break-words text-xl font-black text-brand-white">{payment.invoiceCode}</p>
                                    <p className="mt-3 text-sm font-semibold leading-6 text-brand-textSecondary">
                                        Quét mã QR hoặc mở liên kết thanh toán để tiếp tục. Sau khi cổng thanh toán xác nhận, quyền truy cập khóa học sẽ được kích hoạt tự động.
                                    </p>
                                    {payment.paymentLink && (
                                        <a href={payment.paymentLink} target="_blank" rel="noreferrer" className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand-accent px-5 text-sm font-black text-brand-white transition hover:bg-brand-accentHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accentSoft sm:w-auto">
                                            <LinkIcon aria-hidden="true" className="h-4 w-4" />
                                            Tiếp tục thanh toán
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-brand-accent/10 px-4 py-4 sm:flex-row sm:justify-end sm:px-6 sm:py-5">
                    <button type="button" onClick={onClose} className="inline-flex h-12 items-center justify-center rounded-full border border-brand-accent/20 px-5 text-sm font-black text-brand-textSecondary transition hover:bg-brand-light hover:text-brand-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accentSoft">
                        Đóng
                    </button>
                    <button type="button" disabled={isSubmitting} onClick={handleCreatePayment} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-brand-accent px-5 text-sm font-black text-brand-white transition hover:bg-brand-accentHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accentSoft disabled:cursor-not-allowed disabled:opacity-60">
                        <ExternalLink aria-hidden="true" className="h-4 w-4" />
                        {isSubmitting ? "Đang tạo thanh toán..." : "Xác nhận thanh toán"}
                    </button>
                </div>
            </div>
        </div>
    );
}
