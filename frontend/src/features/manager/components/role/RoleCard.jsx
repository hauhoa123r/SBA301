export default function RoleCard({ role, expanded, setExpanded, onEdit, onDelete }) {
    return (
        <div className="bg-gray-900 rounded-xl p-5">
            <div className="flex justify-between">
                <div>
                    <h3 className="font-bold">{role.name}</h3>
                    <p className="text-gray-400 text-sm">{role.description}</p>
                </div>

                <div className="flex gap-2">
                    <button onClick={setExpanded} className="text-purple-400">
                        Permission
                    </button>
                    <button onClick={() => onEdit(role)} className="text-blue-400">
                        Edit
                    </button>
                    <button onClick={() => onDelete(role)} className="text-red-400">
                        Delete
                    </button>
                </div>
            </div>

            {expanded && (
                <div className="mt-4 flex flex-wrap gap-2">
                    {(role.permissions || []).map((p) => (
                        <span
                            key={p.id}
                            className="px-3 py-1 bg-purple-500/10 text-purple-400 rounded-lg text-xs"
                        >
                            {p.code}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}