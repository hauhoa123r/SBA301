import { CheckCircle2, CircleX } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import AnimatedCard from "../../../../shared/components/animation/AnimatedCard";
import UserReveal from "../../../../shared/components/animation/UserReveal";

export default function PaymentResultPage() {
    const [searchParams] = useSearchParams();
    const success = searchParams.get("success") === "true";
    const invoiceCode = searchParams.get("invoiceCode");
    const message = getResultMessage(searchParams.get("message"), success);
    const Icon = success ? CheckCircle2 : CircleX;

    return (
        <section aria-labelledby="payment-result-title" aria-live="polite" className="user-ui-scope mx-auto grid min-h-[70vh] max-w-3xl place-items-center px-4 py-12 text-center text-brand-textPrimary sm:px-6 sm:py-16">
            <UserReveal className="w-full" distance={20}>
                <AnimatedCard className="w-full rounded-3xl border border-brand-accent/10 bg-brand-cardBg p-6 shadow-2xl shadow-brand-accent/10 sm:p-8">
                    <div className={`mx-auto grid h-20 w-20 place-items-center rounded-full ${success ? "bg-status-success/15 text-status-success" : "bg-social-google/15 text-social-google"}`}>
                        <Icon aria-hidden="true" className="h-10 w-10" />
                    </div>
                    <h1 id="payment-result-title" className="mt-6 break-words text-3xl font-black text-brand-white sm:text-4xl">{message}</h1>
                    {invoiceCode && (
                        <p className="mt-3 text-base font-semibold text-brand-textSecondary">
                            Mã hóa đơn: <span className="break-all font-black text-brand-accentPale">{invoiceCode}</span>
                        </p>
                    )}
                    <Link to="/courses" className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-brand-accent px-6 py-3 font-black text-brand-white transition hover:bg-brand-accentHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accentSoft">
                        Tiếp tục học
                    </Link>
                </AnimatedCard>
            </UserReveal>
        </section>
    );
}

function getResultMessage(message, success) {
    if (!message) return success ? "Thanh toán thành công" : "Thanh toán thất bại";
    if (message === "Payment successful") return "Thanh toán thành công";
    if (message === "Payment failed") return "Thanh toán thất bại";
    return message;
}
