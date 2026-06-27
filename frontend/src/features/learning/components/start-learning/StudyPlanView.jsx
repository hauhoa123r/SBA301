import { Link } from "react-router-dom";
import { CalendarDays, CheckCircle2, CircleDot, LayoutGrid, List, Route, Trophy } from "lucide-react";

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
                    <h2 className="text-xl font-black">Study Plan</h2>
                    <p className="mt-1 text-sm text-[#94a3b8]">Theo dõi lịch học và số hoạt động đã hoàn thành theo từng buổi.</p>
                </div>
                <button type="button" className="inline-flex items-center gap-2 rounded-xl border border-[#7c3aed]/30 bg-[#160e2e] px-4 py-2 text-sm font-bold text-[#c4b5fd] transition hover:border-[#7c3aed]/60 hover:text-white">
                    <Route className="h-4 w-4" />
                    Xem danh sách chặng
                </button>
            </div>

            <div className="grid gap-5 xl:grid-cols-[1fr_330px]">
                <div className="rounded-2xl border border-[#7c3aed]/20 bg-[#120922] p-5 shadow-xl shadow-black/10">
                    <div className="mb-5 flex flex-col gap-3 border-b border-[#7c3aed]/15 pb-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-3">
                            <span className="rounded-xl border border-[#7c3aed]/20 bg-[#0f0920] px-4 py-2 text-sm font-bold text-white">Hôm nay</span>
                            <h3 className="text-lg font-black">Tổng quan</h3>
                        </div>
                        <div className="inline-flex w-fit overflow-hidden rounded-xl border border-[#7c3aed]/20 bg-[#0f0920]">
                            <ViewButton icon={CalendarDays} />
                            <ViewButton active icon={LayoutGrid} />
                            <ViewButton icon={List} />
                        </div>
                    </div>

                    <div className="mb-5 flex items-center gap-4">
                        <span className="h-px flex-1 bg-[#7c3aed]/15" />
                        <span className="text-sm font-bold text-[#94a3b8]">Tháng 9 Năm 2026</span>
                        <span className="h-px flex-1 bg-[#7c3aed]/15" />
                    </div>

                    <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
                        {sessions.slice(0, 8).map((session, index) => (
                            <SessionCard key={session.id} session={session} index={index} />
                        ))}
                    </div>
                </div>

                <aside className="rounded-2xl border border-[#7c3aed]/20 bg-[#120922] p-5 shadow-xl shadow-black/10">
                    <div className="mb-5 flex items-center justify-between gap-3">
                        <h3 className="text-lg font-black">Tiến độ học</h3>
                        <button type="button" className="text-sm font-bold text-[#a78bfa] hover:text-white">Xếp lại lịch</button>
                    </div>
                    <PlanProgressRow label="Số ngày còn lại" value="87 ngày" />
                    <PlanProgressRow label="Số cúp đã đạt" value="76/195" trophy />
                    <div className="mt-5">
                        <p className="text-sm font-bold">Số chương đạt 2 cúp trở lên</p>
                        <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#2a1a4d]">
                            <div className="h-full w-[42%] rounded-full bg-[#7c3aed]" />
                        </div>
                        <div className="mt-3 space-y-2 text-sm text-[#94a3b8]">
                            <p><span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-emerald-400" />Hoàn thành: 2/5 chương</p>
                            <p><span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-[#7c3aed]" />Kế hoạch: 5/5 chương</p>
                        </div>
                    </div>
                    <div className="mt-5 rounded-xl border border-[#7c3aed]/15 bg-[#160e2e] p-4 text-sm text-[#cbd5e1]">
                        Bạn có <span className="font-black text-amber-300">3 buổi</span> cần hoàn thành trong tuần này.
                    </div>
                </aside>
            </div>
        </section>
    );
}

function ViewButton({ icon: Icon, active = false }) {
    return (
        <button type="button" className={`grid h-10 w-10 place-items-center ${active ? "bg-[#7c3aed]/20 text-[#c4b5fd]" : "text-[#94a3b8]"}`}>
            <Icon className="h-4 w-4" />
        </button>
    );
}

function SessionCard({ session, index }) {
    const isWarning = index === 7;

    return (
        <Link
            to={`/learning/courses/${session.chapter.course_id}/lessons/${session.lesson.id}`}
            className={`rounded-2xl border p-4 no-underline transition hover:-translate-y-0.5 hover:border-[#a78bfa]/70 ${
                isWarning
                    ? "border-amber-400/20 bg-amber-400/10"
                    : "border-emerald-400/10 bg-emerald-400/10"
            }`}
        >
            <div className="flex items-start justify-between gap-3">
                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-black text-white ${isWarning ? "bg-amber-500" : "bg-emerald-500"}`}>
                    Buổi {index + 1}
                    {session.done ? <CheckCircle2 className="h-4 w-4" /> : <CircleDot className="h-4 w-4" />}
                </span>
                <span className="inline-flex items-center gap-1 text-sm font-bold text-amber-300">
                    <Trophy className="h-4 w-4" />
                    {session.cups}
                </span>
            </div>
            <h4 className="mt-5 line-clamp-1 text-sm font-bold text-white">{session.lesson.title}</h4>
            <p className="mt-2 text-xs text-[#94a3b8]">Chương {session.chapter.order_index}: {session.chapter.title}</p>
            <span className="mt-4 inline-flex rounded-full border border-[#7c3aed]/20 bg-[#0f0920] px-3 py-1 text-xs font-semibold text-[#c4b5fd]">
                {session.lesson.quiz.type.replace("_", " ")}
            </span>
        </Link>
    );
}

function PlanProgressRow({ label, value, trophy = false }) {
    return (
        <div className="flex items-center justify-between border-b border-[#7c3aed]/10 py-3 text-sm last:border-b-0">
            <span className="font-semibold text-[#cbd5e1]">{label}</span>
            <span className="inline-flex items-center gap-2 font-bold text-[#94a3b8]">
                {trophy && <Trophy className="h-4 w-4 text-amber-300" />}
                {value}
            </span>
        </div>
    );
}
