import { ExternalLink, Landmark, Link as LinkIcon, QrCode, Wallet, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPayment } from "../service/payment.service";

const PAYMENT_METHODS = [
    { value: "VNPAY", label: "VNPay", description: "Thanh toán qua cổng VNPay", icon: Landmark },
    { value: "MOMO", label: "MoMo", description: "Ví điện tử MoMo", icon: Wallet },
    { value: "PAYOS", label: "payOS", description: "QR hoặc link thanh toán", icon: QrCode },
    { value: "ZALOPAY", label: "ZaloPay", description: "Ví điện tử ZaloPay", icon: Wallet },
];

const getPaymentErrorMessage = (err) => {
    const data = err?.response?.data;
    if (data?.message) return data.message;
    if (data?.error && data?.path) return `${data.error}: ${data.path}`;
    if (err?.message) return err.message;
    return "Không thể tạo thanh toán. Vui lòng thử lại.";
};

export default function PaymentMethodModal({ course, open, onClose }) {
    const navigate = useNavigate();
    const [provider, setProvider] = useState("VNPAY");
    const [payment, setPayment] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    if (!open) return null;

    const handleCreatePayment = async () => {
        setIsSubmitting(true);
        setError("");
        setPayment(null);

        try {
            const data = await createPayment({
                courseId: course.id,
                provider,
            });

            if (data.paymentUrl) {
                window.location.href = data.paymentUrl;
                return;
            }

            setPayment(data);
            navigate("/payment/checkout", {
                state: {
                    payment: data,
                    course,
                },
            });
        } catch (err) {
            setError(getPaymentErrorMessage(err));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 grid place-items-center bg-brand-black/70 px-4 py-6 backdrop-blur-sm">
            <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-brand-accent/15 bg-brand-cardBg shadow-2xl shadow-brand-black/40">
                <div className="flex items-start justify-between gap-4 border-b border-brand-accent/10 px-6 py-5">
                    <div>
                        <p className="text-sm font-bold text-brand-accentSoft">Thanh toán khóa học</p>
                        <h2 className="mt-1 text-2xl font-black text-brand-white">Chọn phương thức thanh toán</h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-light text-brand-textSecondary transition hover:bg-brand-accent hover:text-brand-white"
                        aria-label="Đóng"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="px-6 py-5">
                    <div className="grid gap-3 sm:grid-cols-2">
                        {PAYMENT_METHODS.map(({ value, label, description, icon: Icon }) => {
                            const isActive = provider === value;
                            return (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => {
                                        setProvider(value);
                                        setPayment(null);
                                    }}
                                    className={`flex min-h-24 items-center gap-4 rounded-2xl border p-4 text-left transition ${
                                        isActive
                                            ? "border-brand-accent bg-brand-accent/15 text-brand-white"
                                            : "border-brand-accent/10 bg-brand-light/70 text-brand-textSecondary hover:border-brand-accent/40 hover:text-brand-white"
                                    }`}
                                >
                                    <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${isActive ? "bg-brand-accent text-brand-white" : "bg-brand-dark text-brand-accentSoft"}`}>
                                        <Icon className="h-5 w-5" />
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
                        <p className="mt-4 rounded-2xl border border-social-google/20 bg-social-google/10 px-4 py-3 text-sm font-semibold text-social-google">
                            {error}
                        </p>
                    )}

                    {payment && (
                        <div className="mt-5 rounded-2xl border border-brand-accent/10 bg-brand-dark/70 p-5">
                            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                                {payment.qrCode && (
                                    <div className="rounded-2xl bg-brand-white p-4">
                                        <img src={payment.qrCode} alt="Mã QR thanh toán" className="h-44 w-44 object-contain" />
                                    </div>
                                )}
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-bold text-brand-textSecondary">Mã hóa đơn</p>
                                    <p className="mt-1 break-words text-xl font-black text-brand-white">{payment.invoiceCode}</p>
                                    <p className="mt-3 text-sm font-semibold leading-6 text-brand-textSecondary">
                                        Quét QR hoặc mở link để tiếp tục thanh toán. Sau khi cổng thanh toán xác nhận, hệ thống sẽ tự kích hoạt gói học.
                                    </p>
                                    {payment.paymentLink && (
                                        <a
                                            href={payment.paymentLink}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="mt-4 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-brand-accent px-5 text-sm font-black text-brand-white transition hover:bg-brand-accentHover"
                                        >
                                            <LinkIcon className="h-4 w-4" />
                                            Tiếp tục thanh toán
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-brand-accent/10 px-6 py-5 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-12 items-center justify-center rounded-full border border-brand-accent/20 px-5 text-sm font-black text-brand-textSecondary transition hover:bg-brand-light hover:text-brand-white"
                    >
                        Đóng
                    </button>
                    <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={handleCreatePayment}
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-brand-accent px-5 text-sm font-black text-brand-white transition hover:bg-brand-accentHover disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <ExternalLink className="h-4 w-4" />
                        {isSubmitting ? "Đang tạo thanh toán..." : "Xác nhận thanh toán"}
                    </button>
                </div>
            </div>
        </div>
    );
}
