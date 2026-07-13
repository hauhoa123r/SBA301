import { ArrowLeft, CheckCircle2, Copy, Download, ExternalLink, QrCode, ShieldCheck } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function PaymentCheckoutPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const payment = location.state?.payment;
    const course = location.state?.course;

    if (!payment) {
        return (
            <section className="mx-auto max-w-3xl px-6 py-16 text-center text-brand-textPrimary">
                <h1 className="text-3xl font-black text-brand-white">Không tìm thấy thông tin thanh toán</h1>
                <p className="mt-3 text-brand-textSecondary">Vui lòng quay lại trang khóa học và tạo giao dịch thanh toán mới.</p>
                <Link to="/courses" className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-brand-accent px-6 font-black text-brand-white">
                    Xem khóa học
                </Link>
            </section>
        );
    }

    const amount = new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(Number(payment.amount || 0));
    const accountHolder = payment.accountName || payment.accountHolder || payment.beneficiaryName || payment.receiverName || "NGOC THUY NGUYEN";
    const accountNumber = payment.accountNumber || payment.bankAccountNumber || payment.receiverAccountNumber || "";
    const transferContent = payment.transferContent || payment.description || payment.invoiceCode;
    const qrPayload = payment.qrCode || payment.paymentLink || "";
    const qrCode = getQrImageSource(qrPayload);
    const copyText = async (text) => {
        if (!text) return;
        try {
            await navigator.clipboard.writeText(text);
        } catch {
            console.error("Không thể sao chép nội dung vào clipboard:", text)
        }
    };

    return (
        <section className="relative mx-auto max-w-6xl px-6 py-12 text-brand-textPrimary">
            <button type="button" onClick={() => navigate(-1)} className="mb-8 inline-flex items-center gap-2 text-sm font-black text-brand-textSecondary transition hover:text-brand-white">
                <ArrowLeft className="h-4 w-4" />
                Quay lại
            </button>

            <div className="grid gap-8 lg:grid-cols-[420px_minmax(0,1fr)]">
                <div className="overflow-hidden rounded-3xl border border-brand-accent/20 bg-brand-cardBg shadow-2xl shadow-brand-black/30">
                    <div className="border-b border-brand-accent/10 bg-brand-light/70 px-6 py-5">
                        <div className="inline-flex items-center gap-2 rounded-full border border-brand-accent/20 bg-brand-dark px-3 py-1.5 text-xs font-black uppercase tracking-wide text-brand-accentSoft">
                            <QrCode className="h-4 w-4" />
                            Mã QR payOS
                        </div>
                        <h1 className="mt-3 text-2xl font-black text-brand-white">Quét mã để hoàn tất thanh toán</h1>
                        <p className="mt-2 text-sm font-semibold leading-6 text-brand-textSecondary">
                            Dùng ứng dụng ngân hàng hỗ trợ VietQR. Hãy giữ trang này mở cho đến khi thanh toán được xác nhận.
                        </p>
                    </div>

                    <div className="p-6">
                        {qrCode ? (
                            <div className="rounded-[28px] border border-brand-accent/20 bg-brand-dark p-4 shadow-inner shadow-brand-black/30">
                                <div className="rounded-2xl bg-brand-white p-5 ring-1 ring-brand-accent/10">
                                    <img src={qrCode} alt="Mã QR thanh toán" className="mx-auto aspect-square w-full max-w-[320px] object-contain" />
                                </div>
                            </div>
                        ) : (
                            <div className="grid aspect-square place-items-center rounded-2xl border border-brand-accent/20 bg-brand-light px-6 text-center text-sm font-semibold leading-6 text-brand-textSecondary">
                                Cổng thanh toán này dùng liên kết thanh toán thay cho mã QR.
                            </div>
                        )}

                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                            {qrCode && (
                                <a href={qrCode} download className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-brand-accent/25 bg-brand-light text-sm font-black text-brand-accentPale transition hover:border-brand-accent/50 hover:bg-brand-accent/15 hover:text-brand-white">
                                    <Download className="h-4 w-4" />
                                    Tải mã QR
                                </a>
                            )}
                            {payment.paymentLink && (
                                <button type="button" onClick={() => copyText(payment.paymentLink)} className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-brand-accent/25 bg-brand-light text-sm font-black text-brand-accentPale transition hover:border-brand-accent/50 hover:bg-brand-accent/15 hover:text-brand-white">
                                    <Copy className="h-4 w-4" />
                                    Sao chép liên kết
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="rounded-3xl border border-brand-accent/10 bg-brand-cardBg p-6 shadow-2xl shadow-brand-black/30">
                    <div className="flex flex-col gap-4 border-b border-brand-accent/10 pb-6 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-brand-textSecondary">Mã hóa đơn</p>
                            <h2 className="mt-2 break-words text-3xl font-black text-brand-white md:text-4xl">{payment.invoiceCode}</h2>
                        </div>
                        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-status-success/20 bg-status-success/10 px-4 py-2 text-sm font-black text-status-successSoft">
                            <ShieldCheck className="h-4 w-4" />
                            Thanh toán an toàn
                        </span>
                    </div>

                    <div className="mt-8 grid gap-4">
                        <PaymentInfoRow label="Khóa học" value={course?.title || "Đang cập nhật"} />
                        <PaymentInfoRow label="Số tiền" value={amount} />
                        <PaymentInfoRow label="Chủ tài khoản" value={accountHolder} copyValue={accountHolder} onCopy={copyText} />
                        {accountNumber && <PaymentInfoRow label="Số tài khoản" value={accountNumber} copyValue={accountNumber} onCopy={copyText} />}
                        <PaymentInfoRow label="Nội dung chuyển khoản" value={transferContent} copyValue={transferContent} onCopy={copyText} highlight />
                    </div>

                    {payment.paymentLink && (
                        <a href={payment.paymentLink} target="_blank" rel="noreferrer" className="mt-8 inline-flex h-14 items-center justify-center gap-2 rounded-full bg-brand-accent px-6 text-base font-black text-brand-white shadow-lg shadow-brand-accent/25 transition hover:bg-brand-accentHover">
                            <ExternalLink className="h-5 w-5" />
                            Mở trang thanh toán payOS
                        </a>
                    )}

                    <div className="mt-6 rounded-2xl border border-brand-infoLight/20 bg-brand-info/10 p-4">
                        <div className="flex items-start gap-3 text-sm font-semibold leading-6 text-brand-infoSoft">
                            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                            <p>Sau khi payOS xác nhận chuyển khoản, webhook backend sẽ cập nhật hóa đơn và tự động kích hoạt quyền truy cập khóa học.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function getQrImageSource(value) {
    if (!value) return "";
    if (/^(https?:|data:image|blob:)/i.test(value)) return value;
    return `https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=12&data=${encodeURIComponent(value)}`;
}

function PaymentInfoRow({ label, value, copyValue, onCopy, highlight = false }) {
    return (
        <div className={`grid gap-3 rounded-2xl border px-4 py-3 sm:grid-cols-[150px_minmax(0,1fr)_44px] sm:items-center ${highlight ? "border-brand-accent/30 bg-brand-accent/10" : "border-brand-accent/10 bg-brand-light/70"}`}>
            <span className="text-sm font-bold text-brand-textSecondary">{label}</span>
            <span className={`break-words font-black sm:text-right ${highlight ? "text-brand-accentPale" : "text-brand-white"}`}>{value}</span>
            {copyValue ? (
                <button type="button" onClick={() => onCopy(copyValue)} className="grid h-11 w-11 place-items-center rounded-full bg-brand-dark text-brand-accentSoft transition hover:bg-brand-accent hover:text-brand-white sm:justify-self-end" aria-label={`Sao chép ${label}`}>
                    <Copy className="h-4 w-4" />
                </button>
            ) : (
                <span className="hidden sm:block" />
            )}
        </div>
    );
}
