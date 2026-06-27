export default function ActivityHeatmap({ days, values }) {
    return (
        <div className="overflow-x-auto">
            <div className="grid min-w-[760px] grid-cols-[52px_repeat(12,1fr)] gap-1 text-xs">
                {days.map((day, dayIndex) => (
                    <div key={day} className="contents">
                        <div className="flex h-9 items-center text-brand-textSecondary">{day}</div>
                        {Array.from({ length: 12 }).map((_, weekIndex) => {
                            const value = values[(dayIndex * 12 + weekIndex) % values.length];
                            const bg = value > 120 ? "bg-brand-accentSoft text-brand-light" : value > 60 ? "bg-brand-accent text-brand-white" : value > 0 ? "bg-brand-accentMuted text-brand-textMutedLight" : "bg-brand-light text-brand-transparent";
                            return (
                                <div key={`${day}-${weekIndex}`} className={`grid h-9 place-items-center rounded-lg font-bold ${bg}`}>
                                    {value || ""}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}
