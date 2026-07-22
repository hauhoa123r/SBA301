export default function AuditLogFilter({
    filters,
    setFilters,
    onApply,
    onReset,
}) {
    const handleChange = (field, value) => {
        setFilters((prev) => ({
            ...prev,
            [field]: value,
        }));
    };
    return (
        <div className="mb-6 flex gap-3">
            <input
                value={filters.keyword}
                onChange={(event) => handleChange("keyword", event.target.value)}
                placeholder="Tìm theo tên, vai trò"
                className="rounded-xl bg-gray-800 px-4 py-3 outline-none focus:ring-1 focus:ring-purple-500"/>
            <button
                onClick={onApply}
                className="rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-500">
                Lọc
            </button>
        </div>
    );
}
