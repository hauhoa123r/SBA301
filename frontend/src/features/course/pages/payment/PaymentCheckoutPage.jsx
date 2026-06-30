import { ArrowLeft, ExternalLink, QrCode } from "lucide-react";
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
                <p className="mt-3 text-brand-textSecondary">Vui lòng quay lại khóa học và tạo thanh toán mới.</p>
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

    return (
        <section className="relative mx-auto max-w-5xl px-6 py-12 text-brand-textPrimary">
            <button
                type="button"
                onClick={() => navigate(-1)}
                className="mb-8 inline-flex items-center gap-2 text-sm font-black text-brand-textSecondary transition hover:text-brand-white"
            >
                <ArrowLeft className="h-4 w-4" />
                Quay lại
            </button>

            <div className="grid gap-8 lg:grid-cols-[360px_minmax(0,1fr)]">
                <div className="rounded-3xl border border-brand-accent/10 bg-brand-cardBg p-6 shadow-2xl shadow-brand-accent/10">
                    <div className="mb-5 inline-flex items-center gap-2 text-sm font-black text-brand-accentSoft">
                        <QrCode className="h-5 w-5" />
                        Quét mã thanh toán
                    </div>

                    {payment.qrCode ? (
                        <div className="rounded-2xl bg-brand-white p-5">
                            <img src={payment.qrCode} alt="Mã QR thanh toán" className="mx-auto aspect-square w-full max-w-[280px] object-contain" />
                        </div>
                    ) : (
                        <div className="grid aspect-square place-items-center rounded-2xl border border-brand-accent/10 bg-brand-light text-center text-brand-textSecondary">
                            Cổng thanh toán này sử dụng link chuyển hướng.
                        </div>
                    )}
                </div>

                <div className="rounded-3xl border border-brand-accent/10 bg-brand-cardBg p-6 shadow-2xl shadow-brand-accent/10">
                    <p className="text-sm font-bold text-brand-textSecondary">Mã hóa đơn</p>
                    <h1 className="mt-2 break-words text-4xl font-black text-brand-white">{payment.invoiceCode}</h1>

                    <div className="mt-8 grid gap-4">
                        <PaymentInfoRow label="Khóa học" value={course?.title || "Đang cập nhật"} />
                        <PaymentInfoRow label="Cổng thanh toán" value={payment.provider} />
                        <PaymentInfoRow label="Số tiền" value={amount} />
                    </div>

                    {payment.paymentLink && (
                        <a
                            href={payment.paymentLink}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-8 inline-flex h-14 items-center justify-center gap-2 rounded-full bg-brand-accent px-6 text-base font-black text-brand-white transition hover:bg-brand-accentHover"
                        >
                            <ExternalLink className="h-5 w-5" />
                            Tiếp tục thanh toán
                        </a>
                    )}

                    <p className="mt-6 max-w-2xl text-sm font-semibold leading-6 text-brand-textSecondary">
                        Sau khi thanh toán thành công, cổng thanh toán sẽ gọi webhook/callback về backend để cập nhật hóa đơn và kích hoạt gói học.
                    </p>
                </div>
            </div>
        </section>
    );
}

function PaymentInfoRow({ label, value }) {
    return (
        <div className="grid gap-1 rounded-2xl border border-brand-accent/10 bg-brand-light/70 px-4 py-3 sm:grid-cols-[150px_minmax(0,1fr)]">
            <span className="text-sm font-bold text-brand-textSecondary">{label}</span>
            <span className="break-words font-black text-brand-white sm:text-right">{value}</span>
        </div>
    );
}
