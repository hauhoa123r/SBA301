export default function ActivityHeatmap({ data }) {
    if (!data.length) return <p className="text-sm text-brand-textSecondary">Chưa có hoạt động học tập.</p>;
    const dates = new Map(data.map(day => [day.date, day]));
    const first = new Date(`${data[0].date}T00:00:00Z`);
    const offset = (first.getUTCDay() + 6) % 7;
    first.setUTCDate(first.getUTCDate() - offset);
    const weeks = Math.ceil((data.length + offset) / 7);
    return <div className="overflow-x-auto">
        <div className="grid min-w-[700px] gap-1 text-xs" style={{ gridTemplateColumns: `52px repeat(${weeks}, 1fr)` }}>
            {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((day, index) => <div key={day} className="contents">
                <span className="flex h-9 items-center">{day}</span>
                {Array.from({ length: weeks }, (_, week) => {
                    const date = new Date(first);
                    date.setUTCDate(date.getUTCDate() + week * 7 + index);
                    const key = date.toISOString().slice(0, 10);
                    const value = dates.get(key);
                    const seconds = value?.watchSeconds || 0;
                    const count = value?.activityCount || 0;
                    const color = seconds > 3600 ? "bg-brand-accentSoft" : seconds >= 900 ? "bg-brand-accent" : seconds || count ? "bg-brand-accentMuted" : "bg-brand-light";
                    const title = `${key}: ${Math.floor(seconds / 60)} phút xem video, ${count} hoạt động`;
                    return <div key={key} title={title} aria-label={title} className={`grid h-9 place-items-center rounded-lg ${value ? color : "opacity-0"}`}>
                        {count || (seconds ? "•" : "")}
                    </div>;
                })}
            </div>)}
        </div>
    </div>;
}
