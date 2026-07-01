import { ArrowLeft, Copy, Download, Info, LockKeyhole, Timer } from "lucide-react";
import { paymentInfo } from "../../services/data/courseDetailData";
import PaymentRow from "./PaymentRow";

export default function CoursePaymentPage({ course, amount, countdownSeconds, onBack }) {
    const formatAmount = (value) => `${new Intl.NumberFormat("vi-VN").format(value)}đ`;
    const formatCountdown = (seconds) => {
        const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
        const remainSeconds = (seconds % 60).toString().padStart(2, "0");
        return `${minutes}:${remainSeconds}`;
    };
    const qrUrl = `https://img.vietqr.io/image/MB-${paymentInfo.accountNumber}-compact2.png?amount=${amount}&addInfo=${paymentInfo.transferContent}&accountName=${encodeURIComponent(paymentInfo.accountName)}`;

    const copyText = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
        } catch {
            console.error("Failed to copy text to clipboard");
        }
    };

    const copyAll = () => {
        copyText(
            [
                `Bank: ${paymentInfo.bankName}`,
                `Account number: ${paymentInfo.accountNumber}`,
                `Account name: ${paymentInfo.accountName}`,
                `Amount: ${formatAmount(amount)}`,
                `Transfer note: ${paymentInfo.transferContent}`,
            ].join("\n"),
        );
    };

    return (
        <div className="min-h-screen bg-brand-dark text-brand-textPrimary" style={{ fontFamily: "'Inter', sans-serif" }}>
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute left-[-10%] top-[-20%] h-[500px] w-[500px] rounded-full bg-brand-accent/20 blur-[120px]" />
                <div className="absolute bottom-[-18%] right-[-8%] h-[540px] w-[540px] rounded-full bg-brand-infoDeep/30 blur-[120px]" />
                <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `linear-gradient(var(--color-brand-accent) 1px, var(--color-brand-transparent) 1px), linear-gradient(90deg, var(--color-brand-accent) 1px, var(--color-brand-transparent) 1px)`, backgroundSize: "56px 56px" }} />
            </div>

            <header className="relative z-10 border-b border-brand-accent/10 bg-brand-dark/90 shadow-lg shadow-brand-black/20 backdrop-blur">
                <div className="mx-auto flex h-20 max-w-[1500px] items-center justify-between px-6">
                    <button type="button" onClick={onBack} className="inline-flex items-center gap-3 text-sm font-black uppercase tracking-wide text-brand-textSecondary transition hover:text-brand-white">
                        <ArrowLeft className="h-5 w-5" />
                        Back
                    </button>

                    <div className="inline-flex items-center gap-3 rounded-full border border-brand-accent/10 bg-brand-light px-5 py-3 text-sm font-bold text-brand-textSecondary shadow-lg shadow-brand-accent/5">
                        <Timer className="h-5 w-5 text-brand-accentSoft" />
                        <span>Order expires in:</span>
                        <span className="font-black text-brand-white">{formatCountdown(countdownSeconds)}</span>
                    </div>

                    <div className="grid h-12 w-12 place-items-center rounded-full bg-brand-cardBg text-lg font-black text-brand-white ring-1 ring-brand-accent/20">
                        {course.instructor.charAt(0)}
                    </div>
                </div>
            </header>

            <main className="relative z-10 mx-auto max-w-[1120px] px-6 py-14">
                <section className="text-center">
                    <p className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-brand-accent text-2xl font-black text-brand-white shadow-lg shadow-brand-accent/30">
                        QR
                    </p>
                    <h1 className="text-3xl font-black text-brand-white md:text-5xl" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                        Scan the QR code to pay
                    </h1>
                    <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-brand-textSecondary md:text-lg">
                        Open your banking app and scan the QR code. Make sure the transfer note is{" "}
                        <span className="font-black text-brand-accentPale">{paymentInfo.transferContent}</span>.
                    </p>
                </section>

                <section className="mt-10 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
                    <div className="rounded-3xl border border-brand-accent/10 bg-brand-cardBg p-6 shadow-2xl shadow-brand-accent/10">
                        <div className="rounded-2xl bg-brand-white p-5">
                            <img src={qrUrl} alt="MB Bank payment QR code" className="mx-auto aspect-square w-full max-w-[330px] object-contain" />
                        </div>
                        <a href={qrUrl} download className="mt-5 inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl border border-brand-accent/30 text-base font-black text-brand-accentPale transition hover:bg-brand-accent/10 hover:text-brand-white">
                            <Download className="h-5 w-5" />
                            Download QR code
                        </a>
                    </div>

                    <div className="overflow-hidden rounded-3xl border border-brand-accent/10 bg-brand-cardBg shadow-2xl shadow-brand-accent/10">
                        <PaymentRow label="Course" value={course.title} />
                        <PaymentRow label="Bank" value={paymentInfo.bankName} />
                        <PaymentRow label="Account number" value={paymentInfo.accountNumber} copyValue={paymentInfo.accountNumber} onCopy={copyText} />
                        <PaymentRow label="Account name" value={paymentInfo.accountName} />
                        <PaymentRow label="Amount" value={formatAmount(amount)} copyValue={String(amount)} onCopy={copyText} />
                        <PaymentRow label="Transfer note" value={paymentInfo.transferContent} copyValue={paymentInfo.transferContent} onCopy={copyText} highlight />

                        <div className="border-t border-brand-accent/10 p-5">
                            <button type="button" onClick={copyAll} className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-brand-accent text-base font-black text-brand-white shadow-lg shadow-brand-accent/25 transition hover:bg-brand-accentHover">
                                <Copy className="h-5 w-5" />
                                Copy all
                            </button>
                        </div>
                    </div>
                </section>

                <div className="mx-auto mt-8 flex max-w-3xl items-start gap-3 rounded-2xl border border-brand-infoLight/20 bg-brand-info/10 p-5 text-sm font-semibold leading-6 text-brand-infoSoft">
                    <Info className="mt-0.5 h-5 w-5 shrink-0" />
                    <p>If your order is not activated automatically after 5 minutes, please contact support and provide the transfer note {paymentInfo.transferContent}.</p>
                </div>
            </main>

            <footer className="relative z-10 border-t border-brand-accent/10 bg-brand-dark/95">
                <div className="mx-auto flex max-w-[1500px] flex-col gap-3 px-6 py-5 text-sm font-semibold text-brand-textSecondary md:flex-row md:items-center md:justify-between">
                    <span className="inline-flex items-center gap-2">
                        <LockKeyhole className="h-4 w-4 text-status-success" />
                        Secure payment by bank transfer
                    </span>
                    <span>MB Bank • {paymentInfo.accountNumber} • {paymentInfo.accountName}</span>
                </div>
            </footer>
        </div>
    );
}
