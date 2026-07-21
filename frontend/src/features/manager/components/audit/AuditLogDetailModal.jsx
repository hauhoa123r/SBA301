function formatDateTime(value) {
    if (!value) return "--";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("vi-VN");}
function JsonSection({ title, data }) {
    return (
        <div className="rounded-xl bg-gray-800 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-gray-400">{title}</p>
            <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-all text-sm text-gray-200">
                {data && Object.keys(data).length > 0 ? JSON.stringify(data, null, 2) : "Không có dữ liệu"}
            </pre>
        </div>
    );
}

export default function AuditLogDetailModal({ log, loading, onClose }) {
    if (!log && !loading) return null;
    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-3xl rounded-2xl bg-gray-900 border border-gray-800 p-6 shadow-2xl">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold">Chi tiết audit log</h2>
                        <p className="mt-1 text-sm text-gray-400">Thông tin đầy đủ của bản ghi hoạt động hệ thống.</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        Đóng
                    </button>
                </div>
                {loading ? (
                    <div className="py-16 text-center text-gray-400">Đang tải chi tiết...</div>) : (
                    <div className="mt-5 space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-xl bg-gray-800 px-4 py-3">
                                <p className="text-xs uppercase tracking-wide text-gray-400">Action</p>
                                <p className="mt-1 font-medium text-white">{log.action}</p>
                            </div>
                            <div className="rounded-xl bg-gray-800 px-4 py-3">
                                <p className="text-xs uppercase tracking-wide text-gray-400">Method</p>
                                <p className="mt-1 font-medium text-white">{log.method}</p>
                            </div>
                            <div className="rounded-xl bg-gray-800 px-4 py-3 md:col-span-2">
                                <p className="text-xs uppercase tracking-wide text-gray-400">User Agent</p>
                                <p className="mt-1 font-medium text-white break-all">{log.userAgent || "Không có dữ liệu"}</p>
                            </div>
                        </div>
                        <JsonSection title="Before Data" data={log.beforeData} />
                        <JsonSection title="After Data" data={log.afterData} />
                    </div>
                )}
            </div>
        </div>
    );
}
