import { useMemo, useState } from "react";
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



const STATUS_STYLES = {
    OPEN: "border-rose-200 bg-rose-50 text-rose-700",
    IN_REVIEW: "border-amber-200 bg-amber-50 text-amber-700",
    RESOLVED: "border-emerald-200 bg-emerald-50 text-emerald-700",
    DISMISSED: "border-slate-200 bg-slate-100 text-slate-700",
};

const SEVERITY_STYLES = {
    High: "text-rose-700",
    Medium: "text-amber-700",
    Low: "text-sky-700",
};

export default function ViolationReportsPage() {
    const [reports, setReports] = useState([]);
    const [keyword, setKeyword] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const filteredReports = useMemo(() => {
        const searchValue = keyword.trim().toLowerCase();

        return reports.filter((report) => {
            const matchesStatus = statusFilter === "ALL" || report.status === statusFilter;
            const matchesKeyword = [report.id, report.target, report.reporter, report.type, report.summary]
                .join(" ")
                .toLowerCase()
                .includes(searchValue);

            return matchesStatus && matchesKeyword;
        });
    }, [reports, keyword, statusFilter]);

    const updateReportStatus = (reportId, nextStatus) => {
        setReports((items) =>
            items.map((report) =>
                report.id === reportId ? { ...report, status: nextStatus } : report
            )
        );
    };

    return (
        <ModeratorLayout
            eyebrow="Feature Report"
            title="Manage Violation Reports"
            description="Triage learner reports, inspect evidence, resolve valid violations, or dismiss invalid submissions."
            actions={
                <div className="grid grid-cols-3 gap-3 text-sm lg:min-w-[420px]">
                    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <AlertTriangle className="mb-3 h-5 w-5 text-rose-600" />
                        <span className="text-slate-600">Open</span>
                    </article>
                    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <ClipboardList className="mb-3 h-5 w-5 text-amber-600" />
                        <span className="text-slate-600">In review</span>
                    </article>
                    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <ShieldCheck className="mb-3 h-5 w-5 text-emerald-600" />
                        <span className="text-slate-600">Resolved</span>
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
                        placeholder="Search report id, target, reporter, type..."
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
                        <option value="ALL">All reports</option>
                        <option value="OPEN">Open</option>
                        <option value="IN_REVIEW">In review</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="DISMISSED">Dismissed</option>
                    </select>
                </label>
            </section>

            <section className="grid gap-4">
                {filteredReports.map((report) => (
                    <article key={report.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                                <div className="mb-3 flex flex-wrap items-center gap-2">
                                    <span className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                                        {report.id}
                                    </span>
                                    <span className={`rounded-lg border px-3 py-1 text-xs font-semibold ${STATUS_STYLES[report.status]}`}>
                                        {report.status.replace("_", " ")}
                                    </span>
                                    <span className={`text-xs font-semibold ${SEVERITY_STYLES[report.severity]}`}>
                                        {report.severity} severity
                                    </span>
                                </div>
                                <h2 className="text-lg font-semibold text-slate-950">{report.target}</h2>
                                <p className="mt-2 text-sm leading-6 text-slate-600">{report.summary}</p>
                                <p className="mt-3 text-xs uppercase text-slate-500">
                                    {report.type} · Reported by {report.reporter} · {report.createdAt}
                                </p>
                            </div>

                            <div className="grid grid-cols-3 gap-2 sm:w-[170px]">
                                <button
                                    type="button"
                                    onClick={() => updateReportStatus(report.id, "IN_REVIEW")}
                                    className="inline-flex h-10 items-center justify-center rounded-lg border border-sky-200 text-sky-700 transition hover:bg-sky-50"
                                    title="Review evidence"
                                >
                                    <Eye className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => updateReportStatus(report.id, "RESOLVED")}
                                    className="inline-flex h-10 items-center justify-center rounded-lg border border-emerald-200 text-emerald-700 transition hover:bg-emerald-50"
                                    title="Resolve report"
                                >
                                    <CheckCircle2 className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => updateReportStatus(report.id, "DISMISSED")}
                                    className="inline-flex h-10 items-center justify-center rounded-lg border border-rose-200 text-rose-700 transition hover:bg-rose-50"
                                    className="inline-flex h-10 items-center justify-center rounded-lg border border-rose-200 text-rose-700 transition hover:bg-rose-50"
                                    title="Dismiss report"
                                >
                                    <XCircle className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </article>
                ))}

                {filteredReports.length === 0 && (
                    <div className="rounded-lg border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
                        No violation reports match the selected filters.
                    </div>
                )}
            </section>
        </ModeratorLayout>
    );
}
