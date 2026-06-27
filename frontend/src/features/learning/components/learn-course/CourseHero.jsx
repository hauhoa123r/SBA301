import { BookOpen, Target, Trophy } from "lucide-react";
import ProgressBar from "./ProgressBar";

export default function CourseHero({ course, progress, completedCount, totalActivities, completedChapters }) {
    return (
        <>
            <section className="rounded-2xl border border-brand-scrollbar bg-brand-accentDeepest p-6 shadow-2xl shadow-brand-panel/40">
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div className="flex min-w-0 items-center gap-5">
                        <div className="grid h-[70px] w-[70px] shrink-0 place-items-center rounded-2xl border border-brand-white/10 bg-brand-accentHover text-4xl font-black">汉</div>
                        <div className="min-w-0 flex-1">
                            <h2 className="truncate text-2xl font-extrabold md:text-3xl">{course.displayTitle}</h2>
                            <p className="mt-2 text-sm text-brand-heroMuted">
                                GV: {course.teacherName} · {course.chapters.length} chương · {totalActivities} hoạt động
                            </p>
                            <div className="mt-5 flex items-center gap-3">
                                <ProgressBar value={progress} />
                                <span className="text-sm font-extrabold">{progress}%</span>
                            </div>
                        </div>
                    </div>
                    <div className="grid h-24 w-24 shrink-0 place-items-center rounded-full border-[6px] border-brand-accentHover/70 text-sm font-extrabold text-brand-accentSoft">
                        {progress}%
                    </div>
                </div>
            </section>

            <section className="my-7 grid gap-4 md:grid-cols-3">
                <StatCard icon={BookOpen} label="Bài hoàn thành" value={`${completedCount}/${totalActivities}`} />
                <StatCard icon={Trophy} label="Chương đã xong" value={`${completedChapters}/${course.chapters.length}`} amber />
                <StatCard icon={Target} label="Tiến độ chung" value={`${progress}%`} cyan />
            </section>
        </>
    );
}

function StatCard({ icon: Icon, label, value, amber = false, cyan = false }) {
    const color = amber ? "text-status-warningSoft bg-status-warningStrong/10" : cyan ? "text-status-infoSoft bg-status-info/10" : "text-brand-accentSoft bg-brand-accent/10";

    return (
        <div className="flex items-center gap-4 rounded-2xl border border-brand-border bg-brand-elevated p-5">
            <div className={`grid h-12 w-12 place-items-center rounded-2xl ${color}`}>
                <Icon className="h-5 w-5" />
            </div>
            <div>
                <p className="text-sm text-brand-courseMuted">{label}</p>
                <p className="mt-1 text-2xl font-extrabold">{value}</p>
            </div>
        </div>
    );
}
