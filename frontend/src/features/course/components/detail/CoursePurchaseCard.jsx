import { BadgePercent, BookOpen, CheckCircle2, Clock3, CreditCard, FileText, Play, Signal, Trophy } from "lucide-react";
import UserImage from "../../../../shared/components/animation/UserImage";
import UserReveal from "../../../../shared/components/animation/UserReveal";
import { formatCoursePrice } from "../../../../shared/utils/currency";

const VOUCHER_STATUS_MESSAGES = {
    VALID: "Đã áp dụng mã giảm giá",
    NOT_FOUND: "Mã giảm giá không tồn tại",
    EXPIRED: "Mã giảm giá đã hết hạn",
    OUT_OF_USES: "Mã giảm giá đã đạt giới hạn sử dụng",
    NOT_STARTED: "Mã giảm giá chưa bắt đầu có hiệu lực",
    DISABLED: "Mã giảm giá đã bị vô hiệu hóa",
    EMPTY: "Vui lòng nhập mã giảm giá.",
    INVALID: "Không thể kiểm tra mã giảm giá. Vui lòng thử lại.",
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
    const voucherInputId = `course-voucher-${course.id}`;
    const voucherFeedbackId = `${voucherInputId}-feedback`;
    const hasVoucherError = Boolean(voucherStatus && voucherStatus !== "VALID");
    const courseTitle = course?.title || "Khóa học";
    const courseLevel = course?.level || "Đang cập nhật";
    const courseDuration = course?.duration || "Đang cập nhật";
    const courseCategory = course?.category || "Chưa phân loại";

    return (
        <UserReveal as="aside" delay={120} distance={20} className="min-w-0 lg:sticky lg:top-28 lg:h-fit">
            <div className="rounded-3xl border border-brand-accent/10 bg-brand-cardBg p-4 shadow-2xl shadow-brand-accent/10 sm:p-6">
                <div className="relative overflow-hidden rounded-2xl border border-brand-accent/10">
                    <UserImage src={course?.thumbnailUrl} alt={courseTitle} width="800" height="450" priority className="aspect-video w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/90 via-brand-dark/20 to-brand-transparent" />
                    <button type="button" aria-label="Xem trước khóa học" className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-brand-white text-brand-accent shadow-xl transition hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-accentSoft sm:h-20 sm:w-20">
                        <Play aria-hidden="true" className="ml-1 h-7 w-7 fill-brand-accent sm:h-9 sm:w-9" />
                    </button>
                    <p className="absolute bottom-4 left-0 right-0 text-center text-base font-black text-brand-white sm:bottom-7 sm:text-xl">Xem trước khóa học</p>
                </div>

                <div className="mt-7 text-center">
                    <p className="text-sm font-bold text-brand-textSecondary">Giá khóa học</p>
                    <div className="mt-1 text-4xl font-black text-brand-white">
                        {formatCoursePrice(finalPrice)}
                    </div>
                    {isVoucherValid && <p className="mt-1 text-sm text-brand-textSecondary">Giá gốc: <span className="line-through">{formatCoursePrice(course?.price)}</span></p>}
                </div>

                <div className="mt-6 rounded-2xl border border-brand-accent/10 bg-brand-light/70 p-4" aria-busy={isVerifyingVoucher}>
                    <label htmlFor={voucherInputId} className="mb-2 block text-xs font-black uppercase tracking-wider text-brand-textSecondary">Mã giảm giá</label>
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <input
                            id={voucherInputId}
                            value={voucher}
                            onChange={(event) => onVoucherChange(event.target.value)}
                            placeholder="Nhập mã giảm giá"
                            autoComplete="off"
                            spellCheck="false"
                            aria-invalid={hasVoucherError}
                            aria-describedby={voucherStatus ? voucherFeedbackId : undefined}
                            className="h-11 min-w-0 flex-1 rounded-xl border border-brand-accent/20 bg-brand-dark px-4 text-sm font-semibold text-brand-white outline-none transition placeholder:text-brand-textSecondary/50 focus:border-brand-accent/60 focus:ring-2 focus:ring-brand-accent/20"
                        />
                        <button type="button" onClick={onVerifyVoucher} disabled={isVerifyingVoucher} className="inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-brand-accent/30 px-4 text-sm font-black text-brand-accentSoft transition hover:bg-brand-accent/10 hover:text-brand-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accentSoft disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">
                            <BadgePercent aria-hidden="true" className="h-4 w-4" />
                            {isVerifyingVoucher ? "Đang kiểm tra" : "Kiểm tra"}
                        </button>
                    </div>
                    {voucherStatus === "VALID" && <p id={voucherFeedbackId} role="status" className="mt-2 text-sm font-semibold leading-5 text-status-success">{voucherMessage}. Bạn đã tiết kiệm {formatCoursePrice(discountAmount)}.</p>}
                    {voucherStatus && voucherStatus !== "VALID" && (
                        <p id={voucherFeedbackId} role="alert" className={`mt-2 text-sm font-semibold leading-5 ${voucherStatus === "EMPTY" ? "text-status-warning" : "text-social-google"}`}>
                            {voucherMessage || VOUCHER_STATUS_MESSAGES.INVALID}
                        </p>
                    )}
                </div>

                <button type="button" onClick={onPurchase} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-accent px-6 py-3.5 text-base font-black text-brand-white shadow-lg shadow-brand-accent/25 transition hover:bg-brand-accentHover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-accentSoft sm:py-4 sm:text-lg">
                    <CreditCard aria-hidden="true" className="h-5 w-5" />
                    Đăng ký ngay
                </button>

                <div className="mt-7 border-t border-brand-accent/10 pt-6">
                    <ul className="space-y-4 text-base font-medium text-brand-textSecondary">
                        {[
                            { icon: Signal, text: `Trình độ ${courseLevel}` },
                            { icon: BookOpen, text: `Tổng cộng ${totalLessons} bài học` },
                            { icon: Clock3, text: `Thời lượng ${courseDuration}` },
                            { icon: Trophy, text: "Chứng nhận hoàn thành" },
                            { icon: CheckCircle2, text: "Học mọi lúc, mọi nơi" },
                            { icon: FileText, text: `Danh mục ${courseCategory}` },
                        ].map(({ icon: Icon, text }) => (
                            <li key={text} className="flex items-center gap-4">
                                <Icon aria-hidden="true" className="h-5 w-5 shrink-0 text-brand-accentSoft" />
                                <span>{text}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </UserReveal>
    );
}
