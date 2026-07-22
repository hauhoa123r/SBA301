import { useEffect, useMemo, useState } from "react";
import {
    Ban,
    CheckCircle2,
    Clock3,
    CreditCard,
    Filter,
    ReceiptText,
    Search,
    WalletCards,
} from "lucide-react";
import ModeratorLayout from "../../moderator/components/ModeratorLayout";
import {
    approveRefund,
    getRefunds,
    processRefund,
    rejectRefund,
} from "../services/refundService";

const STATUS_STYLES = {
    PENDING: "border-amber-200 bg-amber-50 text-amber-700",
    APPROVED: "border-emerald-200 bg-emerald-50 text-emerald-700",
    REJECTED: "border-rose-200 bg-rose-50 text-rose-700",
    PROCESSED: "border-sky-200 bg-sky-50 text-sky-700",
};

const STATUS_LABELS = {
    PENDING: "Chờ xử lý",
    APPROVED: "Đã duyệt",
    REJECTED: "Đã từ chối",
    PROCESSED: "Đã hoàn tiền",
};

const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(Number(value ?? 0));

const formatDate = (value) => {
    if (!value) return "Chưa có ngày";
    return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(new Date(value));
};

export default function RefundRequestsPage() {
    const [refunds, setRefunds] = useState([]);
    const [keyword, setKeyword] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [actionLoadingId, setActionLoadingId] = useState(null);

    const loadRefunds = async () => {
        try {
            setLoading(true);
            setError("");
            const data = await getRefunds(statusFilter === "ALL" ? "" : statusFilter);
            setRefunds(data);
        } catch {
            setError("Không thể tải yêu cầu hoàn tiền.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRefunds();
    }, [statusFilter]);

    const filteredRefunds = useMemo(() => {
        const searchValue = keyword.trim().toLowerCase();
        if (!searchValue) return refunds;

        return refunds.filter((refund) =>
            [
                refund.id,
                refund.learner,
                refund.course,
                refund.paymentProvider,
                refund.paymentStatus,
                refund.transactionId,
                refund.reason,
                refund.status,
            ]
                .join(" ")
                .toLowerCase()
                .includes(searchValue)
        );
    }, [refunds, keyword]);

    const runAction = async (refundId, action) => {
        try {
            setActionLoadingId(refundId);
            setError("");
            const updatedRefund = await action(refundId);
            setRefunds((items) =>
                items.map((refund) => (refund.id === refundId ? updatedRefund : refund))
            );
        } catch {
            setError("Không thể cập nhật yêu cầu hoàn tiền này.");
        } finally {
            setActionLoadingId(null);
        }
    };

    const pendingTotal = refunds
        .filter((refund) => refund.status === "PENDING")
        .reduce((total, refund) => total + Number(refund.amount ?? 0), 0);

    return (
        <ModeratorLayout
            eyebrow="Giao dịch"
            title="Xử lý yêu cầu hoàn tiền"
            description="Kiểm tra thông tin thanh toán, xử lý yêu cầu hoàn tiền hợp lệ và từ chối các yêu cầu vi phạm chính sách."
            actions={
                <div className="grid gap-3 text-sm sm:grid-cols-3 lg:min-w-[520px]">
                    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <ReceiptText className="mb-3 h-5 w-5 text-violet-600" />
                        <strong className="block text-2xl text-slate-950">{refunds.length}</strong>
                        <span className="text-slate-600">Yêu cầu</span>
                    </article>
                    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <WalletCards className="mb-3 h-5 w-5 text-amber-600" />
                        <strong className="block text-2xl text-slate-950">{formatCurrency(pendingTotal)}</strong>
                        <span className="text-slate-600">Giá trị chờ xử lý</span>
                    </article>
                    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <CreditCard className="mb-3 h-5 w-5 text-emerald-600" />
                        <strong className="block text-2xl text-slate-950">
                            {new Set(refunds.map((refund) => refund.paymentProvider).filter(Boolean)).size}
                        </strong>
                        <span className="text-slate-600">Phương thức thanh toán</span>
                    </article>
                </div>
            }
        >
            <section className="mb-6 grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-[1fr_240px]">
                <label className="relative block">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        value={keyword}
                        onChange={(event) => setKeyword(event.target.value)}
                        placeholder="Tìm mã yêu cầu, học viên, khóa học, lý do..."
                        className="h-12 w-full rounded-lg border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                    />
                </label>

                <label className="relative block">
                    <Filter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <select
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value)}
                        className="h-12 w-full appearance-none rounded-lg border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                    >
                        <option value="ALL">Tất cả yêu cầu hoàn tiền</option>
                        <option value="PENDING">Chờ xử lý</option>
                        <option value="APPROVED">Đã duyệt</option>
                        <option value="REJECTED">Đã từ chối</option>
                        <option value="PROCESSED">Đã hoàn tiền</option>
                    </select>
                </label>
            </section>

            {loading && (
                <div className="rounded-lg border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
                    Đang tải yêu cầu hoàn tiền...
                </div>
            )}

            {error && (
                <div className="mb-6 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
                    {error}
                </div>
            )}

            {!loading && (
                <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="grid grid-cols-[1fr_1.2fr_130px_160px] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4 text-xs font-semibold uppercase text-slate-500 max-lg:hidden">
                        <span>Yêu cầu</span>
                        <span>Lý do</span>
                        <span>Trạng thái</span>
                        <span>Thao tác</span>
                    </div>

                    <div className="divide-y divide-slate-200">
                        {filteredRefunds.map((refund) => (
                            <article key={refund.id} className="grid gap-4 px-5 py-5 lg:grid-cols-[1fr_1.2fr_130px_160px] lg:items-center">
                                <div>
                                    <div className="mb-2 flex flex-wrap items-center gap-2">
                                        <span className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                                            RF-{refund.id}
                                        </span>
                                        <span className="text-sm font-semibold text-slate-950">{formatCurrency(refund.amount)}</span>
                                    </div>
                                    <h2 className="font-semibold text-slate-950">{refund.learner || "Chưa rõ học viên"}</h2>
                                    <p className="mt-1 text-sm text-slate-600">
                                        {refund.course || "Chưa rõ khóa học"} · {refund.paymentProvider || "Chưa rõ nhà cung cấp"} · {formatDate(refund.requestedAt)}
                                    </p>
                                    {refund.transactionId && (
                                        <p className="mt-1 text-xs uppercase text-slate-500">
                                            Mã giao dịch: {refund.transactionId}
                                        </p>
                                    )}
                                </div>

                                <p className="text-sm leading-6 text-slate-600">{refund.reason}</p>

                                <span className={`w-fit rounded-lg border px-3 py-1.5 text-xs font-semibold ${STATUS_STYLES[refund.status]}`}>
                                    {STATUS_LABELS[refund.status] || refund.status}
                                </span>

                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => runAction(refund.id, processRefund)}
                                        disabled={actionLoadingId === refund.id || refund.status !== "APPROVED"}
                                        className="inline-flex h-10 items-center justify-center rounded-lg border border-sky-200 text-sky-700 transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-40"
                                        title="Xử lý yêu cầu hoàn tiền đã duyệt"
                                    >
                                        <Clock3 className="h-4 w-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => runAction(refund.id, approveRefund)}
                                        disabled={actionLoadingId === refund.id || refund.status !== "PENDING"}
                                        className="inline-flex h-10 items-center justify-center rounded-lg border border-emerald-200 text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40"
                                        title="Duyệt hoàn tiền"
                                    >
                                        <CheckCircle2 className="h-4 w-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => runAction(refund.id, rejectRefund)}
                                        disabled={actionLoadingId === refund.id || refund.status !== "PENDING"}
                                        className="inline-flex h-10 items-center justify-center rounded-lg border border-rose-200 text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
                                        title="Từ chối hoàn tiền"
                                    >
                                        <Ban className="h-4 w-4" />
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>

                    {filteredRefunds.length === 0 && (
                        <div className="p-10 text-center text-slate-500">
                            Không có yêu cầu hoàn tiền nào khớp với bộ lọc đã chọn.
                        </div>
                    )}
                </section>
            )}
        </ModeratorLayout>
    );
}
