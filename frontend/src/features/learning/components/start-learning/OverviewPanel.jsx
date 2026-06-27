import { Link } from "react-router-dom";
import { BookOpenCheck, CircleDot, Flame, Lock, Route, Trophy } from "lucide-react";
import ChapterCourseCard from "./ChapterCourseCard";

export default function OverviewPanel({ course, totalActivities, totalLessons, firstLesson }) {
    return (
        <>
            <TodayGoalCard course={course} firstLesson={firstLesson} />
            <section className="grid gap-4 md:grid-cols-3">
                <OverviewStat icon={Route} label="Hoạt động đã hoàn thành" value={`3/${totalActivities}`} />
                <OverviewStat icon={BookOpenCheck} label="Bài học đang mở" value={totalLessons} green />
                <OverviewStat icon={Trophy} label="Tổng số cúp" value="76/195" amber />
            </section>
            <section className="rounded-2xl border border-[#7c3aed]/20 bg-[#120922] p-5 shadow-xl shadow-black/10">
                <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-black">Tiếp tục học</h2>
                        <p className="mt-1 text-sm text-[#94a3b8]">Hoàn thành mục tiêu hôm nay trước khi chuyển sang các mục khác.</p>
                    </div>
                    <Link to="/learning#study-plan" className="rounded-xl border border-[#7c3aed]/30 px-4 py-2 text-sm font-bold text-[#a78bfa] no-underline hover:text-white">
                        Xem Study Plan
                    </Link>
                </div>
                <ChapterCourseCard course={course} chapter={course.chapters[0]} />
            </section>
        </>
    );
}

function TodayGoalCard({ course, firstLesson }) {
    return (
        <section className="relative overflow-hidden rounded-2xl border border-[#7c3aed]/25 bg-[#160e2e] shadow-2xl shadow-black/20">
            <div className="flex min-h-14 items-center gap-3 border-b border-[#7c3aed]/20 bg-[#26124d] px-5 text-white">
                <Flame className="h-5 w-5 text-amber-300" />
                <h2 className="text-lg font-black md:text-xl">Mục tiêu hôm nay</h2>
            </div>

            <div className="space-y-4 p-5">
                <div className="flex flex-col gap-4 rounded-2xl border border-[#8b5cf6]/60 bg-[#0f0920] p-4 md:flex-row md:items-center">
                    <CircleDot className="h-7 w-7 shrink-0 text-[#a78bfa]" />
                    <div className="min-w-0 flex-1">
                        <h3 className="text-base font-black">Hoàn thành 2 bài tập</h3>
                        <p className="mt-1 text-sm text-[#94a3b8]">Bắt đầu 2 hoạt động trong {course.displayTitle}</p>
                    </div>
                    <Link to={`/learning/courses/${course.id}/lessons/${firstLesson.id}`} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#7c3aed] px-5 py-3 text-sm font-black text-white no-underline transition hover:bg-[#6d28d9]">
                        Bắt đầu
                        <span>→</span>
                    </Link>
                </div>

                <div className="flex items-start gap-4 rounded-2xl border border-[#7c3aed]/10 bg-[#120922] px-4 py-4">
                    <CircleDot className="mt-0.5 h-7 w-7 shrink-0 text-[#5b4a7d]" />
                    <div>
                        <h3 className="text-base font-black text-[#d8ddf0]">Chạm đích buổi học</h3>
                        <div className="mt-4 flex items-center gap-3 text-sm text-[#7c879f]">
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
    const color = amber ? "text-amber-300" : green ? "text-emerald-400" : "text-[#a78bfa]";

    return (
        <div className="flex items-center gap-4 rounded-2xl border border-[#7c3aed]/20 bg-[#120922] p-5">
            <div className={`grid h-12 w-12 place-items-center rounded-xl bg-[#160e2e] ${color}`}>
                <Icon className="h-5 w-5" />
            </div>
            <div>
                <p className="text-sm text-[#94a3b8]">{label}</p>
                <p className={`mt-1 text-xl font-black ${color}`}>{value}</p>
            </div>
        </div>
    );
}
