import { formatVndCurrency } from "../../../../shared/utils/currency";

export default function PaymentSummary({ originalPrice, discountAmount, finalPrice }) {
    const payableAmount = finalPrice ?? originalPrice ?? 0;

    return (
        <div className="mb-5 grid gap-3 rounded-2xl border border-brand-accent/10 bg-brand-light/70 px-4 py-3 text-sm font-semibold text-brand-textSecondary sm:grid-cols-3">
            <span>
                Giá gốc
                <strong className="mt-1 block text-base text-brand-white">{formatVndCurrency(originalPrice)}</strong>
            </span>
            <span>
                Giảm giá
                <strong className="mt-1 block text-base text-status-success">{formatVndCurrency(discountAmount ?? 0)}</strong>
            </span>
            <span>
                Tổng thanh toán
                <strong className="mt-1 block text-base text-brand-accentPale">{formatVndCurrency(payableAmount)}</strong>
            </span>
        </div>
    );
}
