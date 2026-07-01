export default function PermissionSelector({ permissions, selected, toggle }) {
    return (
        <div className="grid grid-cols-2 gap-2">
            {permissions.map((p) => (
                <label
                    key={p.id}
                    className="flex gap-2 items-center bg-gray-800 p-3 rounded-xl cursor-pointer"
                >
                    <input
                        type="checkbox"
                        checked={selected.includes(p.id)}
                        onChange={() => toggle(p.id)}
                    />
                    {p.code}
                </label>
            ))}
        </div>
    );
}