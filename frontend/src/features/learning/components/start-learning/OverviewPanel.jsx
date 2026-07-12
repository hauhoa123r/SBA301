import { Link } from "react-router-dom";
import { BookOpenCheck, CircleDot, Flame, Lock, Route, Trophy } from "lucide-react";
import ChapterCourseCard from "./ChapterCourseCard";

export default function OverviewPanel({ course, totalActivities = 27, openLessons = 11, firstLesson, completedActivities = 3, earnedCups = 76, totalCups = 195 }) {
    return (
        <>
            <TodayGoalCard course={course} firstLesson={firstLesson} />
            <section className="grid gap-4 md:grid-cols-3">
                <OverviewStat icon={Route} label="Hoạt động đã hoàn thành" value={`${completedActivities}/${totalActivities}`} />
                <OverviewStat icon={BookOpenCheck} label="Bài học đang mở" value={openLessons} green />
                <OverviewStat icon={Trophy} label="Tổng số cúp" value={`${earnedCups}/${totalCups}`} amber />
            </section>
            <section className="rounded-2xl border border-brand-accent/20 bg-brand-panel p-5 shadow-xl shadow-brand-black/10">
                <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-black">Tiếp tục học</h2>
                        <p className="mt-1 text-sm text-brand-textSecondary">Hoàn thành mục tiêu hôm nay trước khi chuyển sang các mục khác.</p>
                    </div>
                    <Link to="/learning#study-plan" className="rounded-xl border border-brand-accent/30 px-4 py-2 text-sm font-bold text-brand-accentSoft no-underline hover:text-brand-white">
                        Xem kế hoạch học
                    </Link>
                </div>
                <ChapterCourseCard course={course} chapter={course.chapters[0]} />
            </section>
        </>
    );
}

function TodayGoalCard({ course, firstLesson }) {
    return (
        <section className="relative overflow-hidden rounded-2xl border border-brand-accent/25 bg-brand-light shadow-2xl shadow-brand-black/20">
            <div className="flex min-h-14 items-center gap-3 border-b border-brand-accent/20 bg-brand-progressTrack px-5 text-brand-white">
                <Flame className="h-5 w-5 text-status-warningSoft" />
                <h2 className="text-lg font-black md:text-xl">Mục tiêu hôm nay</h2>
            </div>

            <div className="space-y-4 p-5">
                <div className="flex flex-col gap-4 rounded-2xl border border-brand-accentBright/60 bg-brand-menu p-4 md:flex-row md:items-center">
                    <CircleDot className="h-7 w-7 shrink-0 text-brand-accentSoft" />
                    <div className="min-w-0 flex-1">
                        <h3 className="text-base font-black">Hoàn thành 2 bài tập</h3>
                        <p className="mt-1 text-sm text-brand-textSecondary">Bắt đầu 2 hoạt động trong {course.displayTitle}</p>
                    </div>
                    <Link to={`/learning/courses/${course.id}/lessons/${firstLesson.id}`} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-accent px-5 py-3 text-sm font-black text-brand-white no-underline transition hover:bg-brand-accentHover">
                        Bắt đầu
                        <span>→</span>
                    </Link>
                </div>

                <div className="flex items-start gap-4 rounded-2xl border border-brand-accent/10 bg-brand-panel px-4 py-4">
                    <CircleDot className="mt-0.5 h-7 w-7 shrink-0 text-brand-meterMuted" />
                    <div>
                        <h3 className="text-base font-black text-brand-textSoft">Chạm đích buổi học</h3>
                        <div className="mt-4 flex items-center gap-3 text-sm text-brand-mutedText">
                            <Lock className="h-5 w-5" />
                            <span>Hoàn thành nhiệm vụ chính để mở khóa nhiệm vụ tự chọn</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function OverviewStat({ icon: Icon, label, value, amber = false, green = false }) {
    const color = amber ? "text-status-warningSoft" : green ? "text-status-success" : "text-brand-accentSoft";

    return (
        <div className="flex items-center gap-4 rounded-2xl border border-brand-accent/20 bg-brand-panel p-5">
            <div className={`grid h-12 w-12 place-items-center rounded-xl bg-brand-light ${color}`}>
                <Icon className="h-5 w-5" />
            </div>
            <div>
                <p className="text-sm text-brand-textSecondary">{label}</p>
                <p className={`mt-1 text-xl font-black ${color}`}>{value}</p>
            </div>
        </div>
    );
}
