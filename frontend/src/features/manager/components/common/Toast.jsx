export default function Toast({ toast }) {
    if (!toast) return null;

    return (
        <div
            className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl text-sm font-semibold shadow-xl border flex items-center gap-2 ${toast.type === "error"
                    ? "bg-red-500/10 text-red-400 border-red-500/20"
                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                }`}
        >
            <span>{toast.type === "error" ? "⚠️" : "✅"}</span>
            {toast.message}
        </div>
    );
}