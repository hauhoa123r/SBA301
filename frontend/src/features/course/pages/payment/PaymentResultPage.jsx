import { CheckCircle2, CircleX } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

export default function PaymentResultPage() {
    const [searchParams] = useSearchParams();
    const success = searchParams.get("success") === "true";
    const invoiceCode = searchParams.get("invoiceCode");
    const message = getResultMessage(searchParams.get("message"), success);
    const Icon = success ? CheckCircle2 : CircleX;

    return (
        <section className="mx-auto grid min-h-[70vh] max-w-3xl place-items-center px-6 py-16 text-center text-brand-textPrimary">
            <div className="w-full rounded-3xl border border-brand-accent/10 bg-brand-cardBg p-8 shadow-2xl shadow-brand-accent/10">
                <div className={`mx-auto grid h-20 w-20 place-items-center rounded-full ${success ? "bg-status-success/15 text-status-success" : "bg-social-google/15 text-social-google"}`}>
                    <Icon className="h-10 w-10" />
                </div>
                <h1 className="mt-6 text-4xl font-black text-brand-white">{message}</h1>
                {invoiceCode && (
                    <p className="mt-3 text-base font-semibold text-brand-textSecondary">
                        Mã hóa đơn: <span className="font-black text-brand-accentPale">{invoiceCode}</span>
                    </p>
                )}
                <Link to="/courses" className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-brand-accent px-6 font-black text-brand-white transition hover:bg-brand-accentHover">
                    Tiếp tục học
                </Link>
            </div>
        </section>
    );
}

function getResultMessage(message, success) {
    if (!message) return success ? "Thanh toán thành công" : "Thanh toán thất bại";
    if (message === "Payment successful") return "Thanh toán thành công";
    if (message === "Payment failed") return "Thanh toán thất bại";
    return message;
}
