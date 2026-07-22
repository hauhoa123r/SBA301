import { useCallback, useEffect, useState } from "react";
import Toast from "../components/common/Toast";
import Loading from "../components/common/Loading";
import Pagination from "../components/common/Pagination";
import AuditLogFilter from "../components/audit/AuditLogFilter";
import AuditLogTable from "../components/audit/AuditLogTable";
import { getAuditLogs } from "../service/adminMonitoringService";

const INITIAL_FILTERS = {
    keyword: "",
};

export default function AuditLogPage() {
    const [filters, setFilters] = useState(INITIAL_FILTERS);
    const [appliedFilters, setAppliedFilters] = useState(INITIAL_FILTERS);
    const [logs, setLogs] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = useCallback((message, type = "error") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    }, []);

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAuditLogs({
                ...appliedFilters,
                page,
                size: 10,
            });

            setLogs(data.content || []);
            setTotalPages(data.totalPages || 1);
        } catch (error) {
            const message = error?.response?.data?.message || "Không thể tải nhật ký hệ thống";
            showToast(message);
        } finally {
            setLoading(false);
        }
    }, [appliedFilters, page, showToast]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const handleApplyFilters = () => {
        setPage(0);
        setAppliedFilters(filters);
    };

    const handleResetFilters = () => {
        setFilters(INITIAL_FILTERS);
        setAppliedFilters(INITIAL_FILTERS);
        setPage(0);
    };

    return (
        <div className="p-6 text-white">
            <Toast toast={toast} />

            <h1 className="mb-5 text-2xl font-bold">Nhật ký hệ thống</h1>
            <p className="mb-5 text-sm text-gray-400">
                Theo dõi nhanh giảng viên và điều phối viên đã thực hiện thao tác gì trong hệ thống.
            </p>

            <AuditLogFilter
                filters={filters}
                setFilters={setFilters}
                onApply={handleApplyFilters}
                onReset={handleResetFilters}
            />

            <div className="rounded-xl bg-gray-900 p-5">
                {loading ? (
                    <Loading />
                ) : (
                    <>
                        <AuditLogTable logs={logs} />
                        <Pagination page={page} totalPages={totalPages} setPage={setPage} />
                    </>
                )}
            </div>
        </div>
    );
}
