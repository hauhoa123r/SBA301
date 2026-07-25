import { BookOpenCheck, CircleDot, Flame, Lock, Route, Trophy } from "lucide-react";
import { AnimatedCard, UserReveal, UserStagger } from "@/shared/ui";
import ContinueLearningSection from "./continue-learning/ContinueLearningSection";

const hasMetric = (value) => value !== null && value !== undefined && Number.isFinite(Number(value));
const formatMetric = (value) => hasMetric(value) ? Number(value) : "—";
const formatRatio = (current, total) => hasMetric(current) && hasMetric(total) ? `${Number(current)}/${Number(total)}` : "—";

export default function OverviewPanel({
    course,
    statsCourseId,
    statsCourseTitle,
    totalActivities,
    openLessons,
    completedActivities,
    earnedCups,
    totalCups,
    isRefreshing = false,
}) {
    return (
        <div className="mx-auto w-full max-w-7xl space-y-6">
            <ContinueLearningSection
                course={course}
                statsCourseId={statsCourseId}
                statsCourseTitle={statsCourseTitle}
                completedActivities={completedActivities}
                totalActivities={totalActivities}
                openLessons={openLessons}
                earnedCups={earnedCups}
                totalCups={totalCups}
                isRefreshing={isRefreshing}
            />
            <UserReveal distance={18}>
                <TodayGoalCard course={course} statsCourseTitle={statsCourseTitle} />
            </UserReveal>
            <UserStagger as="section" aria-label="Tổng quan tiến độ học tập" className="grid gap-4 md:grid-cols-3" itemClassName="h-full" distance={18} step={65}>
                <OverviewStat icon={Route} label="Hoạt động đã hoàn thành" value={formatRatio(completedActivities, totalActivities)} />
                <OverviewStat icon={BookOpenCheck} label="Bài học trong khóa" value={formatMetric(openLessons)} green />
                <OverviewStat icon={Trophy} label="Cúp đã đạt" value={formatRatio(earnedCups, totalCups)} amber />
            </UserStagger>
        </div>
    );
}

function TodayGoalCard({ course, statsCourseTitle }) {
    const courseTitle = statsCourseTitle || course?.displayTitle || course?.title || "khóa học hiện tại";

    return (
        <section aria-labelledby="today-goal-title" className="rounded-2xl border border-brand-accent/20 bg-brand-panel p-4 shadow-xl shadow-brand-black/10 sm:p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
                <div className="flex min-w-0 items-center gap-4 xl:w-[34%]">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-status-warning/20 bg-status-warning/10 text-status-warningSoft">
                        <Flame aria-hidden="true" className="h-6 w-6" />
                    </span>
                    <div className="min-w-0">
                        <p className="text-xs font-black uppercase tracking-[0.16em] text-status-warningSoft">Mục tiêu hôm nay</p>
                        <h2 id="today-goal-title" className="mt-1 text-lg font-black text-brand-white">Hoàn thành 2 hoạt động</h2>
                    </div>
                </div>
                <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
                    <div className="flex items-center gap-3 rounded-xl border border-brand-accentBright/35 bg-brand-menu px-4 py-3">
                        <CircleDot aria-hidden="true" className="h-5 w-5 shrink-0 text-brand-accentSoft" />
                        <p className="min-w-0 text-sm font-semibold text-brand-textSecondary">
                            Hoàn thành trong <span className="font-black text-brand-white">{courseTitle}</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl border border-brand-accent/10 bg-brand-light/70 px-4 py-3">
                        <Lock aria-hidden="true" className="h-5 w-5 shrink-0 text-brand-meterMuted" />
                        <p className="text-sm font-semibold text-brand-mutedText">Nhiệm vụ tự chọn mở sau mục tiêu chính</p>
                    </div>
                </div>
            </div>
        </section>
    );
}

function OverviewStat({ icon: Icon, label, value, amber = false, green = false }) {
    const color = amber ? "text-status-warningSoft" : green ? "text-status-success" : "text-brand-accentSoft";

    return (
        <AnimatedCard className="flex h-full items-center gap-4 rounded-2xl border border-brand-accent/20 bg-brand-panel p-5">
            <div className={`grid h-12 w-12 place-items-center rounded-xl bg-brand-light ${color}`}>
                <Icon aria-hidden="true" className="h-5 w-5" />
            </div>
            <div>
                <p className="text-sm text-brand-textSecondary">{label}</p>
                <p className={`mt-1 text-xl font-black ${color}`}>{value}</p>
            </div>
        </AnimatedCard>
    );
}
