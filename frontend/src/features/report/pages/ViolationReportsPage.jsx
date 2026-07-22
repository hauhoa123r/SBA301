import { useEffect, useMemo, useState } from "react";
import {
    AlertTriangle,
    CheckCircle2,
    ClipboardList,
    Eye,
    Filter,
    Search,
    ShieldCheck,
    XCircle,
} from "lucide-react";
import ModeratorLayout from "../../moderator/components/ModeratorLayout";
import {
    dismissReport,
    getReports,
    markReportInvestigating,
    resolveReport,
} from "../services/reportService";

const STATUS_STYLES = {
    PENDING: "border-rose-200 bg-rose-50 text-rose-700",
    INVESTIGATING: "border-amber-200 bg-amber-50 text-amber-700",
    RESOLVED: "border-emerald-200 bg-emerald-50 text-emerald-700",
    DISMISSED: "border-slate-200 bg-slate-100 text-slate-700",
};

const STATUS_LABELS = {
    PENDING: "Chờ xử lý",
    INVESTIGATING: "Đang xác minh",
    RESOLVED: "Đã xử lý",
    DISMISSED: "Đã bỏ qua",
};

const TARGET_TYPE_LABELS = {
    COURSE: "Khóa học",
    USER: "Người dùng",
    COMMENT: "Bình luận",
    REVIEW: "Đánh giá",
};

const formatDate = (value) => {
    if (!value) return "Chưa có ngày";
    return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(new Date(value));
};

export default function ViolationReportsPage() {
    const [reports, setReports] = useState([]);
    const [keyword, setKeyword] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [actionLoadingId, setActionLoadingId] = useState(null);

    const loadReports = async () => {
        try {
            setLoading(true);
            setError("");
            const data = await getReports(statusFilter === "ALL" ? "" : statusFilter);
            setReports(data);
        } catch {
            setError("Không thể tải báo cáo vi phạm.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReports();
    }, [statusFilter]);

    const filteredReports = useMemo(() => {
        const searchValue = keyword.trim().toLowerCase();
        if (!searchValue) return reports;

        return reports.filter((report) =>
            [
                report.id,
                report.target,
                report.reporterName,
                report.targetType,
                report.reason,
                report.status,
            ]
                .join(" ")
                .toLowerCase()
                .includes(searchValue)
        );
    }, [reports, keyword]);

    const runAction = async (reportId, action) => {
        try {
            setActionLoadingId(reportId);
            const updatedReport = await action(reportId);
            setReports((items) =>
                items.map((report) => (report.id === reportId ? updatedReport : report))
            );
        } catch {
            setError("Không thể cập nhật báo cáo này.");
        } finally {
            setActionLoadingId(null);
        }
    };

    return (
        <ModeratorLayout
            eyebrow="Báo cáo vi phạm"
            title="Quản lý báo cáo vi phạm"
            description="Phân loại báo cáo của học viên, kiểm tra bằng chứng, xử lý vi phạm hợp lệ hoặc bỏ qua báo cáo không hợp lệ."
            actions={
                <div className="grid grid-cols-3 gap-3 text-sm lg:min-w-[420px]">
                    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <AlertTriangle className="mb-3 h-5 w-5 text-rose-600" />
                        <strong className="block text-2xl text-slate-950">
                            {reports.filter((report) => report.status === "PENDING").length}
                        </strong>
                        <span className="text-slate-600">Chờ xử lý</span>
                    </article>
                    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <ClipboardList className="mb-3 h-5 w-5 text-amber-600" />
                        <strong className="block text-2xl text-slate-950">
                            {reports.filter((report) => report.status === "INVESTIGATING").length}
                        </strong>
                        <span className="text-slate-600">Đang xác minh</span>
                    </article>
                    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <ShieldCheck className="mb-3 h-5 w-5 text-emerald-600" />
                        <strong className="block text-2xl text-slate-950">
                            {reports.filter((report) => report.status === "RESOLVED").length}
                        </strong>
                        <span className="text-slate-600">Đã xử lý</span>
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
                        placeholder="Tìm mã báo cáo, đối tượng, người báo cáo, loại..."
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
                        <option value="ALL">Tất cả báo cáo</option>
                        <option value="PENDING">Chờ xử lý</option>
                        <option value="INVESTIGATING">Đang xác minh</option>
                        <option value="RESOLVED">Đã xử lý</option>
                        <option value="DISMISSED">Đã bỏ qua</option>
                    </select>
                </label>
            </section>

            {loading && (
                <div className="rounded-lg border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
                    Đang tải báo cáo vi phạm...
                </div>
            )}

            {error && (
                <div className="mb-6 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
                    {error}
                </div>
            )}

            {!loading && (
                <section className="grid gap-4">
                    {filteredReports.map((report) => (
                        <article key={report.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div>
                                    <div className="mb-3 flex flex-wrap items-center gap-2">
                                        <span className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                                            #{report.id}
                                        </span>
                                        <span className={`rounded-lg border px-3 py-1 text-xs font-semibold ${STATUS_STYLES[report.status]}`}>
                                            {STATUS_LABELS[report.status] || report.status}
                                        </span>
                                    </div>

                                    <h2 className="text-lg font-semibold text-slate-950">{report.target}</h2>
                                    <p className="mt-2 text-sm leading-6 text-slate-600">{report.reason}</p>
                                    <p className="mt-3 text-xs uppercase text-slate-500">
                                        {TARGET_TYPE_LABELS[report.targetType] || report.targetType} · Người báo cáo: {report.reporterName || "Không rõ"} · {formatDate(report.createdAt)}
                                    </p>
                                </div>

                                <div className="grid grid-cols-3 gap-2 sm:w-[170px]">
                                    <button
                                        type="button"
                                        onClick={() => runAction(report.id, markReportInvestigating)}
                                        disabled={actionLoadingId === report.id || report.status !== "PENDING"}
                                        className="inline-flex h-10 items-center justify-center rounded-lg border border-sky-200 text-sky-700 transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-40"
                                        title="Đánh dấu đang xác minh"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => runAction(report.id, resolveReport)}
                                        disabled={actionLoadingId === report.id || report.status === "RESOLVED" || report.status === "DISMISSED"}
                                        className="inline-flex h-10 items-center justify-center rounded-lg border border-emerald-200 text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40"
                                        title="Đánh dấu đã xử lý"
                                    >
                                        <CheckCircle2 className="h-4 w-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => runAction(report.id, dismissReport)}
                                        disabled={actionLoadingId === report.id || report.status === "RESOLVED" || report.status === "DISMISSED"}
                                        className="inline-flex h-10 items-center justify-center rounded-lg border border-rose-200 text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
                                        title="Bỏ qua báo cáo"
                                    >
                                        <XCircle className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))}

                    {filteredReports.length === 0 && (
                        <div className="rounded-lg border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
                            Không có báo cáo vi phạm nào khớp với bộ lọc đã chọn.
                        </div>
                    )}
                </section>
            )}
        </ModeratorLayout>
    );
}
