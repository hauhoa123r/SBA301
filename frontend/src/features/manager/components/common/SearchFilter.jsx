export default function SearchFilter({
    keyword,
    setKeyword,
    filterStatus,
    setFilterStatus,
}) {
    return (
        <div className="flex gap-3 mb-6">
            <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm tên hoặc email..."
                className="bg-gray-800 rounded-xl px-4 py-3 flex-1 outline-none focus:ring-1 focus:ring-purple-500"
            />

            <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-gray-800 rounded-xl px-4 outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
            >
                <option value="">All</option>
                <option value="ACTIVE">Active</option>
                <option value="LOCKED">Locked</option>
                <option value="DELETED">Deleted</option>
            </select>
        </div>
    );
}