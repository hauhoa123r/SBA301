import { useMemo, useState } from "react";
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

const INITIAL_REFUNDS = [
    {
        id: "RF-2401",
        learner: "Nguyen Minh",
        course: "Full-Stack Web Dev with React & Node.js",
        amount: 1290000,
        method: "VNPay",
        status: "PENDING",
        requestedAt: "2026-06-18",
        reason: "Duplicate payment was captured during checkout.",
    },
    {
        id: "RF-2402",
        learner: "Tran Linh",
        course: "UI/UX Design Mastery: From Figma to Prototype",
        amount: 990000,
        method: "Momo",
        status: "PROCESSING",
        requestedAt: "2026-06-19",
        reason: "Refund requested within the 30-day guarantee period.",
    },
    {
        id: "RF-2403",
        learner: "Le Duc",
        course: "Machine Learning & AI for Practitioners",
        amount: 1590000,
        method: "Credit card",
        status: "APPROVED",
        requestedAt: "2026-06-20",
        reason: "Course access failed after successful payment.",
    },
    {
        id: "RF-2404",
        learner: "Pham Thu",
        course: "Digital Marketing & Growth Hacking",
        amount: 790000,
        method: "Bank transfer",
        status: "REJECTED",
        requestedAt: "2026-06-21",
        reason: "Request is outside the refund policy window.",
    },
];

const STATUS_STYLES = {
    PENDING: "border-amber-200 bg-amber-50 text-amber-700",
    PROCESSING: "border-sky-200 bg-sky-50 text-sky-700",
    APPROVED: "border-emerald-200 bg-emerald-50 text-emerald-700",
    REJECTED: "border-rose-200 bg-rose-50 text-rose-700",
};

const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(value);

export default function RefundRequestsPage() {
    const [refunds, setRefunds] = useState(INITIAL_REFUNDS);
    const [keyword, setKeyword] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const filteredRefunds = useMemo(() => {
        const searchValue = keyword.trim().toLowerCase();

        return refunds.filter((refund) => {
            const matchesStatus = statusFilter === "ALL" || refund.status === statusFilter;
            const matchesKeyword = [refund.id, refund.learner, refund.course, refund.method, refund.reason]
                .join(" ")
                .toLowerCase()
                .includes(searchValue);

            return matchesStatus && matchesKeyword;
        });
    }, [refunds, keyword, statusFilter]);

    const updateRefundStatus = (refundId, nextStatus) => {
        setRefunds((items) =>
            items.map((refund) =>
                refund.id === refundId ? { ...refund, status: nextStatus } : refund
            )
        );
    };

    const pendingTotal = refunds
        .filter((refund) => refund.status === "PENDING" || refund.status === "PROCESSING")
        .reduce((total, refund) => total + refund.amount, 0);

    return (
        <ModeratorLayout
            eyebrow="Feature Transaction"
            title="Process Refund Requests"
            description="Review payment context, process valid refunds, and reject requests that violate policy."
            actions={
                <div className="grid gap-3 text-sm sm:grid-cols-3 lg:min-w-[520px]">
                    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <ReceiptText className="mb-3 h-5 w-5 text-violet-600" />
                        <strong className="block text-2xl text-slate-950">{refunds.length}</strong>
                        <span className="text-slate-600">Requests</span>
                    </article>
                    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <WalletCards className="mb-3 h-5 w-5 text-amber-600" />
                        <strong className="block text-2xl text-slate-950">{formatCurrency(pendingTotal)}</strong>
                        <span className="text-slate-600">Pending value</span>
                    </article>
                    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <CreditCard className="mb-3 h-5 w-5 text-emerald-600" />
                        <strong className="block text-2xl text-slate-950">4</strong>
                        <span className="text-slate-600">Payment methods</span>
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
                        placeholder="Search request id, learner, course, reason..."
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
                        <option value="ALL">All refunds</option>
                        <option value="PENDING">Pending</option>
                        <option value="PROCESSING">Processing</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                    </select>
                </label>
            </section>

            <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="grid grid-cols-[1fr_1.2fr_130px_160px] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4 text-xs font-semibold uppercase text-slate-500 max-lg:hidden">
                    <span>Request</span>
                    <span>Reason</span>
                    <span>Status</span>
                    <span>Actions</span>
                </div>

                <div className="divide-y divide-slate-200">
                    {filteredRefunds.map((refund) => (
                        <article key={refund.id} className="grid gap-4 px-5 py-5 lg:grid-cols-[1fr_1.2fr_130px_160px] lg:items-center">
                            <div>
                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                    <span className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                                        {refund.id}
                                    </span>
                                    <span className="text-sm font-semibold text-slate-950">{formatCurrency(refund.amount)}</span>
                                </div>
                                <h2 className="font-semibold text-slate-950">{refund.learner}</h2>
                                <p className="mt-1 text-sm text-slate-600">
                                    {refund.course} · {refund.method} · {refund.requestedAt}
                                </p>
                            </div>

                            <p className="text-sm leading-6 text-slate-600">{refund.reason}</p>

                            <span className={`w-fit rounded-lg border px-3 py-1.5 text-xs font-semibold ${STATUS_STYLES[refund.status]}`}>
                                {refund.status}
                            </span>

                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    type="button"
                                    onClick={() => updateRefundStatus(refund.id, "PROCESSING")}
                                    className="inline-flex h-10 items-center justify-center rounded-lg border border-sky-200 text-sky-700 transition hover:bg-sky-50"
                                    title="Mark processing"
                                >
                                    <Clock3 className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => updateRefundStatus(refund.id, "APPROVED")}
                                    className="inline-flex h-10 items-center justify-center rounded-lg border border-emerald-200 text-emerald-700 transition hover:bg-emerald-50"
                                    title="Approve refund"
                                >
                                    <CheckCircle2 className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => updateRefundStatus(refund.id, "REJECTED")}
                                    className="inline-flex h-10 items-center justify-center rounded-lg border border-rose-200 text-rose-700 transition hover:bg-rose-50"
                                    title="Reject refund"
                                >
                                    <Ban className="h-4 w-4" />
                                </button>
                            </div>
                        </article>
                    ))}
                </div>

                {filteredRefunds.length === 0 && (
                    <div className="p-10 text-center text-slate-500">
                        No refund requests match the selected filters.
                    </div>
                )}
            </section>
        </ModeratorLayout>
    );
}
