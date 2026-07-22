const STATUS = {
    ACTIVE: {
        text: "Hoạt động",
        style: "text-green-400 bg-green-500/10",
    },
    LOCKED: {
        text: "Đã khóa",
        style: "text-yellow-400 bg-yellow-500/10",
    },
    DELETED: {
        text: "Đã xóa",
        style: "text-red-400 bg-red-500/10",
    },
};

export default function StatusBadge({ status }) {
    const s = STATUS[status] || STATUS.ACTIVE;

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium border border-current/10 ${s.style}`}>
            {s.text}
        </span>
    );
}
