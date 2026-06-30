import { BadgePercent, BookOpen, CheckCircle2, Clock3, CreditCard, FileText, Play, Signal, Trophy } from "lucide-react";

const VOUCHER_STATUS_MESSAGES = {
    VALID: "Voucher applied",
    NOT_FOUND: "Voucher does not exist",
    EXPIRED: "Voucher has expired",
    OUT_OF_USES: "Voucher has reached its usage limit",
    NOT_STARTED: "Voucher is not active yet",
    DISABLED: "Voucher has been disabled",
    empty: "Please enter a voucher code.",
    invalid: "Unable to verify voucher. Please try again.",
};

export default function CoursePurchaseCard({
    course,
    finalPrice,
    discountAmount,
    isVoucherValid,
    isVerifyingVoucher,
    voucher,
    voucherStatus,
    totalLessons,
    onVoucherChange,
    onVerifyVoucher,
    onPurchase,
}) {
    const voucherMessage = VOUCHER_STATUS_MESSAGES[voucherStatus];
    const fmt = (n) =>
        !n
            ? "Free"
            :
        new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(n);

    return (
        <aside className="lg:sticky lg:top-28 lg:h-fit">
            <div className="rounded-3xl border border-brand-accent/10 bg-brand-cardBg p-6 shadow-2xl shadow-brand-accent/10">
                <div className="relative overflow-hidden rounded-2xl border border-brand-accent/10">
                    <img src={course.thumbnailUrl} alt={course.title} className="aspect-video w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/90 via-brand-dark/20 to-brand-transparent" />
                    <button className="absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-brand-white text-brand-accent shadow-xl transition hover:scale-105">
                        <Play className="ml-1 h-9 w-9 fill-brand-accent" />
                    </button>
                    <p className="absolute bottom-7 left-0 right-0 text-center text-xl font-black text-brand-white">Watch course preview</p>
                </div>

                <div className="mt-7 text-center">
                    <p className="text-sm font-bold text-brand-textSecondary">Course price</p>
                    <div className="mt-1 text-4xl font-black text-brand-white">
                        {fmt(finalPrice)}
                    </div>
                    {isVoucherValid && <p className="mt-1 text-sm text-brand-textSecondary">Original price: <span className="line-through">{fmt(course.price)}</span></p>}
                </div>

                <div className="mt-6 rounded-2xl border border-brand-accent/10 bg-brand-light/70 p-4">
                    <label className="mb-2 block text-xs font-black uppercase tracking-wider text-brand-textSecondary">Voucher</label>
                    <div className="flex gap-2">
                        <input value={voucher} onChange={(event) => onVoucherChange(event.target.value)} placeholder="Enter voucher code" className="h-11 min-w-0 flex-1 rounded-xl border border-brand-accent/20 bg-brand-dark px-4 text-sm font-semibold text-brand-white outline-none transition placeholder:text-brand-textSecondary/50 focus:border-brand-accent/60" />
                        <button type="button" onClick={onVerifyVoucher} disabled={isVerifyingVoucher} className="inline-flex h-11 items-center gap-2 rounded-xl border border-brand-accent/30 px-4 text-sm font-black text-brand-accentSoft transition hover:bg-brand-accent/10 hover:text-brand-white disabled:cursor-not-allowed disabled:opacity-60">
                            <BadgePercent className="h-4 w-4" />
                            {isVerifyingVoucher ? "Checking" : "Verify"}
                        </button>
                    </div>
                    {voucherStatus === "VALID" && <p className="mt-2 text-sm font-semibold text-status-success">{voucherMessage}. You saved {fmt(discountAmount)}.</p>}
                    {voucherStatus && voucherStatus !== "VALID" && (
                        <p className={`mt-2 text-sm font-semibold ${voucherStatus === "empty" ? "text-status-warning" : "text-social-google"}`}>
                            {voucherMessage || VOUCHER_STATUS_MESSAGES.invalid}
                        </p>
                    )}
                </div>

                <button type="button" onClick={onPurchase} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-accent px-6 py-4 text-lg font-black text-brand-white shadow-lg shadow-brand-accent/25 transition hover:bg-brand-accentHover">
                    <CreditCard className="h-5 w-5" />
                    Enroll now
                </button>

                <div className="mt-7 border-t border-brand-accent/10 pt-6">
                    <ul className="space-y-4 text-base font-medium text-brand-textSecondary">
                        {[
                            { icon: Signal, text: `Level ${course.level}` },
                            { icon: BookOpen, text: `${totalLessons} lessons total` },
                            { icon: Clock3, text: `Duration ${course.duration}` },
                            { icon: Trophy, text: "Completion certificate" },
                            { icon: CheckCircle2, text: "Learn anytime, anywhere" },
                            { icon: FileText, text: `Category ${course.category}` },
                        ].map(({ icon: Icon, text }) => (
                            <li key={text} className="flex items-center gap-4">
                                <Icon className="h-5 w-5 text-brand-accentSoft" />
                                <span>{text}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </aside>
    );
}
