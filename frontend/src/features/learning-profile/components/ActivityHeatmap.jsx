export default function ActivityHeatmap({ days, values }) {
    return (
        <div className="overflow-x-auto">
            <div className="grid min-w-[760px] grid-cols-[52px_repeat(12,1fr)] gap-1 text-xs">
                {days.map((day, dayIndex) => (
                    <div key={day} className="contents">
                        <div className="flex h-9 items-center text-[#94a3b8]">{day}</div>
                        {Array.from({ length: 12 }).map((_, weekIndex) => {
                            const value = values[(dayIndex * 12 + weekIndex) % values.length];
                            const bg = value > 120 ? "bg-[#a78bfa] text-[#160e2e]" : value > 60 ? "bg-[#7c3aed] text-white" : value > 0 ? "bg-[#4c2b82] text-[#cbd5e1]" : "bg-[#160e2e] text-transparent";
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
