export default function ProgressBar({ value, label = "Tiến độ học tập" }) {
    const normalizedValue = Math.max(0, Math.min(100, Number(value) || 0));

    return (
        <div
            className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-brand-progressMuted"
            role="progressbar"
            aria-label={label}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={normalizedValue}
            aria-valuetext={`${normalizedValue}%`}
        >
            <div aria-hidden="true" className="h-full rounded-full bg-brand-accentBright transition-all" style={{ width: `${normalizedValue}%` }} />
        </div>
    );
}
