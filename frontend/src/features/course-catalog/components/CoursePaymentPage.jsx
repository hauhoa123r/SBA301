import { ArrowLeft, Copy, Download, Info, LockKeyhole, Timer } from "lucide-react";
import { paymentInfo } from "../shared/courseDetailData";

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
            // Clipboard can be blocked on non-secure origins; users can still copy manually.
        }
    };

    const copyAll = () => {
        copyText(
            [
                `Ngân hàng: ${paymentInfo.bankName}`,
                `Số tài khoản: ${paymentInfo.accountNumber}`,
                `Tên tài khoản: ${paymentInfo.accountName}`,
                `Số tiền: ${formatAmount(amount)}`,
                `Nội dung: ${paymentInfo.transferContent}`,
            ].join("\n"),
        );
    };

    return (
        <div className="min-h-screen bg-brand-dark text-brand-textPrimary" style={{ fontFamily: "'Inter', sans-serif" }}>
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute left-[-10%] top-[-20%] h-[500px] w-[500px] rounded-full bg-brand-accent/20 blur-[120px]" />
                <div className="absolute bottom-[-18%] right-[-8%] h-[540px] w-[540px] rounded-full bg-brand-infoDeep/30 blur-[120px]" />
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage: `linear-gradient(var(--color-brand-accent) 1px, var(--color-brand-transparent) 1px), linear-gradient(90deg, var(--color-brand-accent) 1px, var(--color-brand-transparent) 1px)`,
                        backgroundSize: "56px 56px",
                    }}
                />
            </div>

            <header className="relative z-10 border-b border-brand-accent/10 bg-brand-dark/90 shadow-lg shadow-brand-black/20 backdrop-blur">
                <div className="mx-auto flex h-20 max-w-[1500px] items-center justify-between px-6">
                    <button type="button" onClick={onBack} className="inline-flex items-center gap-3 text-sm font-black uppercase tracking-wide text-brand-textSecondary transition hover:text-brand-white">
                        <ArrowLeft className="h-5 w-5" />
                        Quay lại
                    </button>

                    <div className="inline-flex items-center gap-3 rounded-full border border-brand-accent/10 bg-brand-light px-5 py-3 text-sm font-bold text-brand-textSecondary shadow-lg shadow-brand-accent/5">
                        <Timer className="h-5 w-5 text-brand-accentSoft" />
                        <span>Đơn hàng tự động hủy sau:</span>
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
                        Quét mã QR để thanh toán
                    </h1>
                    <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-brand-textSecondary md:text-lg">
                        Mở app ngân hàng và quét mã QR. Đảm bảo nội dung chuyển khoản là{" "}
                        <span className="font-black text-brand-accentPale">{paymentInfo.transferContent}</span>.
                    </p>
                </section>

                <section className="mt-10 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
                    <div className="rounded-3xl border border-brand-accent/10 bg-brand-cardBg p-6 shadow-2xl shadow-brand-accent/10">
                        <div className="rounded-2xl bg-brand-white p-5">
                            <img src={qrUrl} alt="Mã QR thanh toán MB Bank" className="mx-auto aspect-square w-full max-w-[330px] object-contain" />
                        </div>
                        <a
                            href={qrUrl}
                            download
                            className="mt-5 inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl border border-brand-accent/30 text-base font-black text-brand-accentPale transition hover:bg-brand-accent/10 hover:text-brand-white"
                        >
                            <Download className="h-5 w-5" />
                            Tải mã QR
                        </a>
                    </div>

                    <div className="overflow-hidden rounded-3xl border border-brand-accent/10 bg-brand-cardBg shadow-2xl shadow-brand-accent/10">
                        <PaymentRow label="Khóa học" value={course.title} />
                        <PaymentRow label="Ngân hàng" value={paymentInfo.bankName} />
                        <PaymentRow label="Số tài khoản" value={paymentInfo.accountNumber} copyValue={paymentInfo.accountNumber} onCopy={copyText} />
                        <PaymentRow label="Tên tài khoản" value={paymentInfo.accountName} />
                        <PaymentRow label="Số tiền" value={formatAmount(amount)} copyValue={String(amount)} onCopy={copyText} />
                        <PaymentRow label="Nội dung" value={paymentInfo.transferContent} copyValue={paymentInfo.transferContent} onCopy={copyText} highlight />

                        <div className="border-t border-brand-accent/10 p-5">
                            <button type="button" onClick={copyAll} className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-brand-accent text-base font-black text-brand-white shadow-lg shadow-brand-accent/25 transition hover:bg-brand-accentHover">
                                <Copy className="h-5 w-5" />
                                Sao chép toàn bộ
                            </button>
                        </div>
                    </div>
                </section>

                <div className="mx-auto mt-8 flex max-w-3xl items-start gap-3 rounded-2xl border border-brand-infoLight/20 bg-brand-info/10 p-5 text-sm font-semibold leading-6 text-brand-infoSoft">
                    <Info className="mt-0.5 h-5 w-5 shrink-0" />
                    <p>Nếu đơn hàng không tự động kích hoạt sau 5 phút, vui lòng liên hệ hỗ trợ và cung cấp nội dung chuyển khoản {paymentInfo.transferContent}.</p>
                </div>
            </main>

            <footer className="relative z-10 border-t border-brand-accent/10 bg-brand-dark/95">
                <div className="mx-auto flex max-w-[1500px] flex-col gap-3 px-6 py-5 text-sm font-semibold text-brand-textSecondary md:flex-row md:items-center md:justify-between">
                    <span className="inline-flex items-center gap-2">
                        <LockKeyhole className="h-4 w-4 text-status-success" />
                        Thanh toán an toàn với chuyển khoản ngân hàng
                    </span>
                    <span>MB Bank • {paymentInfo.accountNumber} • {paymentInfo.accountName}</span>
                </div>
            </footer>
        </div>
    );
}

function PaymentRow({ label, value, copyValue, onCopy, highlight = false }) {
    return (
        <div className="grid gap-3 border-b border-brand-accent/10 px-5 py-5 sm:grid-cols-[150px_minmax(0,1fr)_48px] sm:items-center">
            <span className="text-sm font-bold text-brand-textSecondary">{label}</span>
            <span className={`text-base font-black sm:text-right ${highlight ? "text-brand-accentPale" : "text-brand-white"}`}>
                {value}
            </span>
            {copyValue ? (
                <button
                    type="button"
                    onClick={() => onCopy(copyValue)}
                    className="grid h-11 w-11 place-items-center rounded-full bg-brand-light text-brand-textSecondary transition hover:bg-brand-accent hover:text-brand-white sm:justify-self-end"
                    aria-label={`Sao chép ${label}`}
                >
                    <Copy className="h-5 w-5" />
                </button>
            ) : (
                <span className="hidden sm:block" />
            )}
        </div>
    );
}
