const clampProgress = (value) => Math.min(100, Math.max(0, Number(value) || 0));

export default function ContinueLearningProgress({ available = false, completed = 0, total = 0, value = 0 }) {
    const normalizedValue = clampProgress(value);
    const hasProgress = available && Number(total) > 0;
    const progressText = hasProgress
        ? `${completed}/${total} hoạt động đã hoàn thành`
        : "Chưa có dữ liệu tiến độ";
    const progressProps = hasProgress
        ? {
            role: "progressbar",
            "aria-label": "Tiến độ khóa học",
            "aria-valuemin": 0,
            "aria-valuemax": 100,
            "aria-valuenow": normalizedValue,
            "aria-valuetext": progressText,
        }
        : { "aria-hidden": true };

    return (
        <div className="space-y-2.5">
            <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-textSecondary">Tiến độ khóa học</p>
                    <p className="mt-1 text-sm font-semibold text-brand-textSoft">{progressText}</p>
                </div>
                <span className="text-2xl font-black tabular-nums text-brand-white">
                    {hasProgress ? `${normalizedValue}%` : "—"}
                </span>
            </div>
            <div
                className="h-2.5 overflow-hidden rounded-full bg-brand-progressTrack ring-1 ring-inset ring-brand-accent/10"
                {...progressProps}
            >
                <div
                    aria-hidden="true"
                    className="continue-learning-progress-fill h-full rounded-full"
                    style={{ "--continue-learning-progress": `${hasProgress ? normalizedValue : 0}%` }}
                />
            </div>
        </div>
    );
}
