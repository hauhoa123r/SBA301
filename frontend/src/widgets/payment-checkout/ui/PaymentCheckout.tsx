import { ArrowLeft, Copy, Download, ExternalLink, QrCode } from "lucide-react";
import type { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import type { CourseDetail } from "@/entities/course";
import type { Payment } from "@/entities/payment";
import { AnimatedCard, UserImage, UserReveal, UserStagger } from "@/shared/ui";
import { formatVndCurrency } from "@/shared/utils";

interface PaymentCheckoutState {
  payment: Payment;
  course?: CourseDetail;
  couponCode?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isPayment(value: unknown): value is Payment {
  return (
    isRecord(value) &&
    typeof value.paymentUrl === "string" &&
    typeof value.paymentLink === "string" &&
    typeof value.qrCode === "string"
  );
}

function isCourseDetail(value: unknown): value is CourseDetail {
  return isRecord(value) && typeof value.price === "number";
}

function getCheckoutState(value: unknown): PaymentCheckoutState | null {
  if (!isRecord(value) || !isPayment(value.payment)) return null;
  return {
    payment: value.payment,
    course: isCourseDetail(value.course) ? value.course : undefined,
    couponCode: typeof value.couponCode === "string" ? value.couponCode : undefined,
  };
}

function getQrImageSource(value: string): string {
  if (!value) return "";
  if (/^(https?:|data:image|blob:)/i.test(value)) return value;
  return `https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=12&data=${encodeURIComponent(value)}`;
}

interface PaymentInfoRowProps {
  label: string;
  value: ReactNode;
  copyValue?: string;
  onCopy: (value: string) => Promise<void>;
  highlight?: boolean;
}

function PaymentInfoRow({
  label,
  value,
  copyValue,
  onCopy,
  highlight = false,
}: PaymentInfoRowProps) {
  return (
    <div
      className={`grid min-w-0 gap-3 rounded-2xl border px-4 py-3 sm:grid-cols-[minmax(110px,150px)_minmax(0,1fr)_44px] sm:items-center ${
        highlight
          ? "border-brand-accent/30 bg-brand-accent/10"
          : "border-brand-accent/10 bg-brand-light/70"
      }`}
    >
      <span className="text-sm font-bold text-brand-textSecondary">{label}</span>
      <span
        className={`min-w-0 break-words font-black [overflow-wrap:anywhere] sm:text-right ${
          highlight ? "text-brand-accentPale" : "text-brand-white"
        }`}
      >
        {value}
      </span>
      {copyValue ? (
        <button
          type="button"
          onClick={() => void onCopy(copyValue)}
          className="grid h-11 w-11 place-items-center rounded-full bg-brand-dark text-brand-accentSoft transition hover:bg-brand-accent hover:text-brand-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accentSoft sm:justify-self-end"
          aria-label={`Sao chép ${label}`}
        >
          <Copy aria-hidden="true" className="h-4 w-4" />
        </button>
      ) : (
        <span className="hidden sm:block" />
      )}
    </div>
  );
}

export function PaymentCheckout() {
  const location = useLocation();
  const navigate = useNavigate();
  const checkoutState = getCheckoutState(location.state);

  if (!checkoutState) {
    return (
      <UserReveal
        as="section"
        className="user-ui-scope mx-auto max-w-3xl px-4 py-16 text-center text-brand-textPrimary sm:px-6"
      >
        <h1 className="text-2xl font-black text-brand-white sm:text-3xl">
          Không tìm thấy thông tin thanh toán
        </h1>
        <p className="mt-3 text-brand-textSecondary">
          Vui lòng quay lại trang khóa học và tạo giao dịch thanh toán mới.
        </p>
        <Link
          to="/courses"
          className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-brand-accent px-6 font-black text-brand-white transition hover:bg-brand-accentHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accentSoft"
        >
          Xem khóa học
        </Link>
      </UserReveal>
    );
  }

  const { payment, course } = checkoutState;
  const amount = formatVndCurrency(payment.amount);
  const accountHolder =
    payment.accountName ||
    payment.accountHolder ||
    payment.beneficiaryName ||
    payment.receiverName ||
    "NGOC THUY NGUYEN";
  const accountNumber = "0392004902";
  const transferContent =
    payment.transferContent || payment.description || payment.invoiceCode || "";
  const qrPayload = payment.qrCode || payment.paymentLink || "";
  const qrCode = getQrImageSource(qrPayload);

  const copyText = async (value: string): Promise<void> => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      console.error("Không thể sao chép nội dung vào clipboard:", value);
    }
  };

  return (
    <section
      aria-labelledby="payment-checkout-title"
      className="user-ui-scope relative mx-auto max-w-6xl px-4 py-8 text-brand-textPrimary sm:px-6 sm:py-12"
    >
      <button
        type="button"
        onClick={() => {
          void navigate(-1);
        }}
        className="mb-6 inline-flex items-center gap-2 rounded-lg py-1 text-sm font-black text-brand-textSecondary transition hover:text-brand-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accentSoft sm:mb-8"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        Quay lại
      </button>

      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:gap-8">
        <UserReveal distance={20} className="min-w-0">
          <AnimatedCard className="overflow-hidden rounded-3xl border border-brand-accent/20 bg-brand-cardBg shadow-2xl shadow-brand-black/30">
            <div className="border-b border-brand-accent/10 bg-brand-light/70 px-4 py-5 sm:px-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-accent/20 bg-brand-dark px-3 py-1.5 text-xs font-black uppercase tracking-wide text-brand-accentSoft">
                <QrCode aria-hidden="true" className="h-4 w-4" />
                Mã QR payOS
              </div>
              <h1
                id="payment-checkout-title"
                className="mt-3 text-xl font-black leading-tight text-brand-white sm:text-2xl"
              >
                Quét mã để hoàn tất thanh toán
              </h1>
              <p className="mt-2 text-sm font-semibold leading-6 text-brand-textSecondary">
                Dùng ứng dụng ngân hàng hỗ trợ VietQR. Hãy giữ trang này mở cho đến khi thanh toán được xác nhận.
              </p>
            </div>
            <div className="p-4 sm:p-6">
              {qrCode ? (
                <div className="rounded-[28px] border border-brand-accent/20 bg-brand-dark p-4 shadow-inner shadow-brand-black/30">
                  <div className="rounded-2xl bg-brand-white p-3 ring-1 ring-brand-accent/10 sm:p-5">
                    <UserImage
                      src={qrCode}
                      alt="Mã QR thanh toán"
                      width="360"
                      height="360"
                      priority
                      className="mx-auto aspect-square w-full max-w-[320px] object-contain"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid aspect-square place-items-center rounded-2xl border border-brand-accent/20 bg-brand-light px-6 text-center text-sm font-semibold leading-6 text-brand-textSecondary">
                  Cổng thanh toán này dùng liên kết thanh toán thay cho mã QR.
                </div>
              )}
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {qrCode && (
                  <a
                    href={qrCode}
                    download
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-brand-accent/25 bg-brand-light px-4 text-sm font-black text-brand-accentPale transition hover:border-brand-accent/50 hover:bg-brand-accent/15 hover:text-brand-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accentSoft"
                  >
                    <Download aria-hidden="true" className="h-4 w-4" /> Tải mã QR
                  </a>
                )}
                {payment.paymentLink && (
                  <button
                    type="button"
                    onClick={() => void copyText(payment.paymentLink)}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-brand-accent/25 bg-brand-light px-4 text-sm font-black text-brand-accentPale transition hover:border-brand-accent/50 hover:bg-brand-accent/15 hover:text-brand-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accentSoft"
                  >
                    <Copy aria-hidden="true" className="h-4 w-4" /> Sao chép liên kết
                  </button>
                )}
              </div>
            </div>
          </AnimatedCard>
        </UserReveal>

        <UserReveal delay={80} distance={20} className="min-w-0">
          <AnimatedCard className="rounded-3xl border border-brand-accent/10 bg-brand-cardBg p-4 shadow-2xl shadow-brand-black/30 sm:p-6">
            <div className="border-b border-brand-accent/10 pb-6">
              <p className="text-sm font-bold text-brand-textSecondary">Mã hóa đơn</p>
              <h2 className="mt-2 break-words text-2xl font-black text-brand-white sm:text-3xl md:text-4xl">
                {payment.invoiceCode}
              </h2>
            </div>
            <UserStagger className="mt-6 grid gap-4 sm:mt-8" step={55} distance={16}>
              <PaymentInfoRow label="Khóa học" value={course?.title || "Đang cập nhật"} onCopy={copyText} />
              <PaymentInfoRow label="Số tiền" value={amount} onCopy={copyText} />
              <PaymentInfoRow label="Chủ tài khoản" value={accountHolder} copyValue={accountHolder} onCopy={copyText} />
              <PaymentInfoRow label="Số tài khoản" value={accountNumber} copyValue={accountNumber} onCopy={copyText} />
              <PaymentInfoRow label="Nội dung chuyển khoản" value={transferContent} copyValue={transferContent} onCopy={copyText} highlight />
            </UserStagger>
            {payment.paymentLink && (
              <a
                href={payment.paymentLink}
                target="_blank"
                rel="noreferrer"
                className="mt-8 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-brand-accent px-6 py-3 text-center text-sm font-black text-brand-white shadow-lg shadow-brand-accent/25 transition hover:bg-brand-accentHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accentSoft sm:text-base"
              >
                <ExternalLink aria-hidden="true" className="h-5 w-5 shrink-0" />
                Mở trang thanh toán payOS
              </a>
            )}
          </AnimatedCard>
        </UserReveal>
      </div>
    </section>
  );
}
