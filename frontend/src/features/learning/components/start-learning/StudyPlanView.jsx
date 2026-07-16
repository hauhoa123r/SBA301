import { Link } from "react-router-dom";
import { CalendarDays, CheckCircle2, CircleDot, LayoutGrid, List, Route, Trophy } from "lucide-react";
import AnimatedCard from "../../../../shared/components/animation/AnimatedCard";
import UserStagger from "../../../../shared/components/animation/UserStagger";

const quizTypeLabels = {
    SINGLE_CHOICE: "Trắc nghiệm một đáp án",
};

export default function StudyPlanView({ course }) {
    const sessions = course.chapters.flatMap((chapter) =>
        chapter.lessons.map((lesson) => ({
            id: lesson.id,
            chapter,
            lesson,
            cups: chapter.order_index === 5 ? "0/6" : `${Math.min(3 + lesson.order_index, 5)}/6`,
            done: chapter.order_index < 5,
        }))
    );

    return (
        <section id="study-plan" className="scroll-mt-24">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="text-xl font-black">Kế hoạch học</h2>
                    <p className="mt-1 text-sm text-brand-textSecondary">Theo dõi lịch học và số hoạt động đã hoàn thành theo từng buổi.</p>
                </div>
                <button type="button" className="inline-flex items-center gap-2 rounded-xl border border-brand-accent/30 bg-brand-light px-4 py-2 text-sm font-bold text-brand-accentPale transition hover:border-brand-accent/60 hover:text-brand-white">
                    <Route className="h-4 w-4" />
                    Xem danh sách chặng
                </button>
            </div>

            <div className="grid gap-5 xl:grid-cols-[1fr_330px]">
                <div className="rounded-2xl border border-brand-accent/20 bg-brand-panel p-5 shadow-xl shadow-brand-black/10">
                    <div className="mb-5 flex flex-col gap-3 border-b border-brand-accent/15 pb-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-3">
                            <span className="rounded-xl border border-brand-accent/20 bg-brand-menu px-4 py-2 text-sm font-bold text-brand-white">Hôm nay</span>
                            <h3 className="text-lg font-black">Tổng quan</h3>
                        </div>
                        <div className="inline-flex w-fit overflow-hidden rounded-xl border border-brand-accent/20 bg-brand-menu">
                            <ViewButton icon={CalendarDays} label="Xem dạng lịch" />
                            <ViewButton active icon={LayoutGrid} label="Xem dạng lưới" />
                            <ViewButton icon={List} label="Xem dạng danh sách" />
                        </div>
                    </div>

                    <div className="mb-5 flex items-center gap-4">
                        <span className="h-px flex-1 bg-brand-accent/15" />
                        <span className="text-sm font-bold text-brand-textSecondary">Tháng 9 Năm 2026</span>
                        <span className="h-px flex-1 bg-brand-accent/15" />
                    </div>

                    <UserStagger className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3" itemClassName="h-full" distance={18} step={55}>
                        {sessions.slice(0, 8).map((session, index) => (
                            <SessionCard key={session.id} session={session} index={index} />
                        ))}
                    </UserStagger>
                </div>

                <aside className="rounded-2xl border border-brand-accent/20 bg-brand-panel p-5 shadow-xl shadow-brand-black/10">
                    <div className="mb-5 flex items-center justify-between gap-3">
                        <h3 className="text-lg font-black">Tiến độ học</h3>
                        <button type="button" className="text-sm font-bold text-brand-accentSoft hover:text-brand-white">Xếp lại lịch</button>
                    </div>
                    <PlanProgressRow label="Số ngày còn lại" value="87 ngày" />
                    <PlanProgressRow label="Số cúp đã đạt" value="76/195" trophy />
                    <div className="mt-5">
                        <p className="text-sm font-bold">Số chương đạt 2 cúp trở lên</p>
                        <div className="mt-3 h-3 overflow-hidden rounded-full bg-brand-borderSoft" role="progressbar" aria-label="Số chương đạt từ hai cúp" aria-valuemin={0} aria-valuemax={100} aria-valuenow={42}>
                            <div aria-hidden="true" className="h-full w-[42%] rounded-full bg-brand-accent" />
                        </div>
                        <div className="mt-3 space-y-2 text-sm text-brand-textSecondary">
                            <p><span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-status-success" />Hoàn thành: 2/5 chương</p>
                            <p><span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-brand-accent" />Kế hoạch: 5/5 chương</p>
                        </div>
                    </div>
                    <div className="mt-5 rounded-xl border border-brand-accent/15 bg-brand-light p-4 text-sm text-brand-textMutedLight">
                        Bạn có <span className="font-black text-status-warningSoft">3 buổi</span> cần hoàn thành trong tuần này.
                    </div>
                </aside>
            </div>
        </section>
    );
}

function ViewButton({ icon: Icon, label, active = false }) {
    return (
        <button type="button" aria-label={label} aria-pressed={active} className={`grid h-10 w-10 place-items-center ${active ? "bg-brand-accent/20 text-brand-accentPale" : "text-brand-textSecondary"}`}>
            <Icon className="h-4 w-4" />
        </button>
    );
}

function SessionCard({ session, index }) {
    const isWarning = index === 7;

    return (
        <AnimatedCard
            as={Link}
            to={`/learning/courses/${session.chapter.course_id}/lessons/${session.lesson.id}`}
            className={`block h-full rounded-2xl border p-4 no-underline hover:border-brand-accentSoft/70 ${
                isWarning
                    ? "border-status-warning/20 bg-status-warning/10"
                    : "border-status-success/10 bg-status-success/10"
            }`}
        >
            <div className="flex items-start justify-between gap-3">
                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-black text-brand-white ${isWarning ? "bg-status-warningStrong" : "bg-status-successStrong"}`}>
                    Buổi {index + 1}
                    {session.done ? <CheckCircle2 className="h-4 w-4" /> : <CircleDot className="h-4 w-4" />}
                </span>
                <span className="inline-flex items-center gap-1 text-sm font-bold text-status-warningSoft">
                    <Trophy className="h-4 w-4" />
                    {session.cups}
                </span>
            </div>
            <h4 className="mt-5 line-clamp-1 text-sm font-bold text-brand-white">{session.lesson.title}</h4>
            <p className="mt-2 text-xs text-brand-textSecondary">Chương {session.chapter.order_index}: {session.chapter.title}</p>
            <span className="mt-4 inline-flex rounded-full border border-brand-accent/20 bg-brand-menu px-3 py-1 text-xs font-semibold text-brand-accentPale">
                {session.lesson.quiz 
                    ? (quizTypeLabels[session.lesson.quiz.type] || session.lesson.quiz.type.replace("_", " "))
                    : "Lý thuyết & Thực hành"}
            </span>
        </AnimatedCard>
    );
}

function PlanProgressRow({ label, value, trophy = false }) {
    return (
        <div className="flex items-center justify-between border-b border-brand-accent/10 py-3 text-sm last:border-b-0">
            <span className="font-semibold text-brand-textMutedLight">{label}</span>
            <span className="inline-flex items-center gap-2 font-bold text-brand-textSecondary">
                {trophy && <Trophy className="h-4 w-4 text-status-warningSoft" />}
                {value}
            </span>
        </div>
    );
}
