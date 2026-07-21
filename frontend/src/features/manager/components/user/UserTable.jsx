const STATUS_CONFIG = {
    ACTIVE: {
        label: "Hoạt động",
        style: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
    LOCKED: {
        label: "Đã khóa",
        style: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    },
    DELETED: {
        label: "Đã xóa",
        style: "bg-red-500/10 text-red-400 border-red-500/20",
    },
};
export default function UserTable({ users, onLock, onDelete }) {
    return (
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-gray-800">
                    <th className="p-4">Người dùng</th>
                    <th>Email</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                </tr>
            </thead>
            <tbody>
                {users.map((user) => {
                    const status = STATUS_CONFIG[user.status] || STATUS_CONFIG.ACTIVE;

                    return (
                        <tr key={user.id} className="border-t border-gray-700 hover:bg-gray-800/50">
                            <td className="p-4">
                                <div className="font-semibold">{user.fullName}</div>
                            </td>
                            <td className="text-gray-400">{user.email}</td>
                            <td>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${status.style}`}>
                                    {status.label}
                                </span>
                            </td>
                            <td>
                                <div className="flex gap-2">
                                    {user.status !== "DELETED" && (
                                        <button
                                            onClick={() => onLock(user)}
                                            className={`px-3 py-1.5 rounded-lg text-xs border ${user.status === "ACTIVE"
                                                    ? "text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/10"
                                                    : "text-green-400 border-green-500/30 hover:bg-green-500/10"
                                                }`}
                                        >
                                            {user.status === "ACTIVE" ? "Khóa" : "Mở khóa"}
                                        </button>
                                    )}

                                    <button
                                        onClick={() => onDelete(user)}
                                        className="px-3 py-1.5 rounded-lg text-xs text-red-400 border border-red-500/30 hover:bg-red-500/10"
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
}
