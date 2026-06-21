import { BadgePercent, BookOpen, CheckCircle2, Clock3, CreditCard, FileText, Play, Signal, Trophy } from "lucide-react";

export default function CoursePurchaseCard({
    course,
    finalPrice,
    isVoucherValid,
    voucher,
    voucherStatus,
    totalLessons,
    onVoucherChange,
    onVerifyVoucher,
    onPurchase,
}) {
    const fmt = (n) =>
        new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(n);

    return (
        <aside className="lg:sticky lg:top-28 lg:h-fit">
            <div className="rounded-3xl border border-brand-accent/10 bg-brand-cardBg p-6 shadow-2xl shadow-brand-accent/10">
                <div className="relative overflow-hidden rounded-2xl border border-brand-accent/10">
                    <img src={course.thumbnail_url} alt={course.title} className="aspect-video w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/90 via-brand-dark/20 to-transparent" />
                    <button className="absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-brand-accent shadow-xl transition hover:scale-105">
                        <Play className="ml-1 h-9 w-9 fill-brand-accent" />
                    </button>
                    <p className="absolute bottom-7 left-0 right-0 text-center text-xl font-black text-white">Xem giới thiệu khóa học</p>
                </div>

                <div className="mt-7 text-center">
                    <p className="text-sm font-bold text-brand-textSecondary">Chi phí khóa học</p>
                    <div className="mt-1 text-4xl font-black text-white" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                        {fmt(finalPrice)}
                    </div>
                    {isVoucherValid && <p className="mt-1 text-sm text-brand-textSecondary">Giá gốc: <span className="line-through">{fmt(course.price)}</span></p>}
                </div>

                <div className="mt-6 rounded-2xl border border-brand-accent/10 bg-brand-light/70 p-4">
                    <label className="mb-2 block text-xs font-black uppercase tracking-wider text-brand-textSecondary">Voucher</label>
                    <div className="flex gap-2">
                        <input
                            value={voucher}
                            onChange={(event) => onVoucherChange(event.target.value)}
                            placeholder="Nhập EDUJAR10"
                            className="h-11 min-w-0 flex-1 rounded-xl border border-brand-accent/20 bg-brand-dark px-4 text-sm font-semibold text-white outline-none transition placeholder:text-brand-textSecondary/50 focus:border-brand-accent/60"
                        />
                        <button type="button" onClick={onVerifyVoucher} className="inline-flex h-11 items-center gap-2 rounded-xl border border-brand-accent/30 px-4 text-sm font-black text-[#a78bfa] transition hover:bg-brand-accent/10 hover:text-white">
                            <BadgePercent className="h-4 w-4" />
                            Verify
                        </button>
                    </div>
                    {voucherStatus === "valid" && <p className="mt-2 text-sm font-semibold text-emerald-400">Voucher EDUJAR10 applied successfully.</p>}
                    {voucherStatus === "invalid" && <p className="mt-2 text-sm font-semibold text-red-400">Voucher is not valid.</p>}
                    {voucherStatus === "empty" && <p className="mt-2 text-sm font-semibold text-amber-400">Please enter a voucher code.</p>}
                </div>

                <button type="button" onClick={onPurchase} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-accent px-6 py-4 text-lg font-black text-white shadow-lg shadow-brand-accent/25 transition hover:bg-brand-accentHover">
                    <CreditCard className="h-5 w-5" />
                    Đăng ký học
                </button>

                <div className="mt-7 border-t border-brand-accent/10 pt-6">
                    <ul className="space-y-4 text-base font-medium text-brand-textSecondary">
                        {[
                            { icon: Signal, text: `Trình độ ${course.level}` },
                            { icon: BookOpen, text: `Tổng số ${totalLessons} bài học` },
                            { icon: Clock3, text: `Thời lượng ${course.duration}` },
                            { icon: Trophy, text: "Chứng chỉ hoàn thành" },
                            { icon: CheckCircle2, text: "Học mọi lúc, mọi nơi" },
                            { icon: FileText, text: `Danh mục ${course.category}` },
                        ].map(({ icon: Icon, text }) => (
                            <li key={text} className="flex items-center gap-4">
                                <Icon className="h-5 w-5 text-[#a78bfa]" />
                                <span>{text}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </aside>
    );
}
