export default function ProgressBar({ value }) {
    return (
        <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-[#3a255d]">
            <div className="h-full rounded-full bg-[#8b5cf6] transition-all" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
        </div>
    );
}
