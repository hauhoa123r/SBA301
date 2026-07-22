import { ReceiptText } from "lucide-react";

const statusClasses = {
    PAID: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
    COMPLETED: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
    PENDING: "border-amber-300/30 bg-amber-300/10 text-amber-200",
    FAILED: "border-red-400/30 bg-red-400/10 text-red-300",
    CANCELLED: "border-red-400/30 bg-red-400/10 text-red-300",
    REFUNDED: "border-sky-300/30 bg-sky-300/10 text-sky-200",
};

const statusLabels = {
    PAID: "Đã thanh toán",
    COMPLETED: "Hoàn tất",
    PENDING: "Đang xử lý",
    FAILED: "Thất bại",
    CANCELLED: "Đã hủy",
    REFUNDED: "Đã hoàn tiền",
};

const formatCurrency = (value) => {
    if (value === null || value === undefined || value === "") return "—";

    const amount = Number(value);
    if (Number.isNaN(amount)) return String(value);

    return `${amount.toLocaleString("vi-VN")}đ`;
};

const formatDateTime = (value) => {
    if (!value) return "—";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);

    return date.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const displayValue = (value) => {
    if (value === null || value === undefined || value === "") return "—";
    return value;
};

const normalizeStatus = (status) => String(status ?? "").toUpperCase();

const getStatusClassName = (status) =>
    statusClasses[normalizeStatus(status)] ?? "border-brand-accent/25 bg-brand-accent/10 text-brand-accentSoft";

const formatStatus = (status) => {
    const normalizedStatus = normalizeStatus(status);
    return statusLabels[normalizedStatus] ?? displayValue(status);
};

export default function OrderHistory({ orders = [], isLoading }) {
    if (isLoading) {
        return (
            <div className="rounded-2xl border border-brand-accent/15 bg-brand-light/40 p-5 text-sm text-brand-textSecondary">
                Đang tải lịch sử đơn hàng...
            </div>
        );
    }

    if (!orders.length) {
        return (
            <div className="flex gap-4 rounded-2xl border border-dashed border-brand-accent/30 bg-brand-light/40 p-5 text-sm">
                <ReceiptText className="h-5 w-5 text-brand-accentPale" />
                <div>
                    <p className="font-bold text-brand-white">Chưa có đơn hàng</p>
                    <p className="mt-1 text-brand-textSecondary">Các khóa học đã thanh toán sẽ xuất hiện tại đây.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {orders.map((order) => (
                <article
                    key={order.id}
                    className="rounded-2xl border border-brand-accent/15 bg-brand-light/40 p-4 shadow-md shadow-brand-black/10 transition hover:border-brand-accent/35"
                >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-accentSoft">
                                Khóa học:
                            </p>
                            <h2 className="mt-1 break-words text-base font-bold text-brand-white">
                                {displayValue(order.courseTitle)}
                            </h2>

                            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-brand-textSecondary">
                                <span>
                                    Giá gốc: <strong className="text-brand-white">{formatCurrency(order.originalAmount)}</strong>
                                </span>
                                <span>
                                    Giá giảm: <strong className="text-brand-white">{formatCurrency(order.discountAmount)}</strong>
                                </span>
                            </div>

                            <p className="mt-2 text-xs leading-5 text-brand-textSecondary">
                                Tạo: <span className="text-brand-white">{formatDateTime(order.createdAt)}</span>
                                <span className="mx-2 text-brand-accent/40">•</span>
                                Cập nhật: <span className="text-brand-white">{formatDateTime(order.updatedAt)}</span>
                            </p>
                        </div>

                        <div className="shrink-0 rounded-2xl border border-brand-accent/10 bg-brand-black/15 px-4 py-3 md:min-w-47.5 md:text-center">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-textSecondary">
                                Số tiền thanh toán
                            </p>
                            <p className="mt-1 text-xl font-extrabold text-brand-white">
                                {formatCurrency(order.amount)}
                            </p>
                            <span
                                className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getStatusClassName(order.status)}`}
                            >
                                Trạng thái: {formatStatus(order.status)}
                            </span>
                        </div>
                    </div>
                </article>
            ))}
        </div>
    );
}
