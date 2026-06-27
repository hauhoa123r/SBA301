export default function ProgressBar({ value }) {
    return (
        <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-brand-progressMuted">
            <div className="h-full rounded-full bg-brand-accentBright transition-all" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
        </div>
    );
}
