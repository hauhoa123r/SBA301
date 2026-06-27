import { Award, Check, ChevronRight, CirclePlay, ClipboardList, Clock3 } from "lucide-react";
import ProgressBar from "./ProgressBar";

const formatDuration = (seconds) => `${Math.max(1, Math.round(seconds / 60))} phút`;

export default function LearnCourseSidebar({
    course,
    activeChapter,
    activeLesson,
    activeQuiz,
    activeAssignment,
    chapterStats,
    completedLessons,
    passedQuizzes,
    submittedAssignments,
    completedCount,
    totalActivities,
    progress,
    mode,
    onLessonSelect,
    onQuizSelect,
    onAssignmentSelect,
}) {
    return (
        <aside className="learning-course-sidebar border-r border-[#2b1852] bg-[#120922] lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
            <div className="flex items-center gap-3 border-b border-[#2b1852] p-5">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#7c3aed] text-2xl font-black">汉</div>
                <div className="min-w-0">
                    <h1 className="truncate text-base font-extrabold">{course.displayTitle}</h1>
                    <p className="truncate text-sm text-[#a7b0c7]">{course.teacherName}</p>
                </div>
            </div>

            <div className="m-4 rounded-2xl border border-[#3d2371] bg-[#21113f] p-4">
                <div className="mb-3 flex items-center justify-between text-sm font-bold">
                    <span className="text-[#8b5cf6]">Tiến độ tổng thể</span>
                    <span className="text-[#8b5cf6]">{progress}%</span>
                </div>
                <ProgressBar value={progress} />
                <p className="mt-3 text-sm text-[#a7b0c7]">{completedCount}/{totalActivities} bài hoàn thành</p>
            </div>

            <nav className="space-y-2 px-3 pb-6">
                {course.chapters.map((chapter) => {
                    const stats = chapterStats[chapter.id];
                    const isActiveChapter = chapter.id === activeChapter.id;

                    return (
                        <div key={chapter.id} className="border-t border-[#2b1852] pt-3 first:border-t-0">
                            <button
                                type="button"
                                onClick={() => onLessonSelect(chapter.lessons[0].id)}
                                className="flex w-full items-center gap-3 rounded-xl px-2 py-3 text-left transition hover:bg-[#1c1236]"
                            >
                                <StatusDot active={isActiveChapter} done={stats.done === stats.total} />
                                <span className="min-w-0 flex-1 truncate text-sm font-bold">
                                    Chương {chapter.order_index}: {chapter.title}
                                </span>
                                <span className="text-xs font-bold text-[#9aa4bd]">{stats.done}/{stats.total}</span>
                                <ChevronRight className="h-4 w-4 text-[#9aa4bd]" />
                            </button>

                            {isActiveChapter && (
                                <div className="ml-5 mt-1 space-y-1 border-l border-[#2b1852] pl-4">
                                    {chapter.lessons.map((lesson) => (
                                        <div key={lesson.id} className="space-y-1">
                                            <SidebarItem
                                                active={mode === "lesson" && activeLesson.id === lesson.id}
                                                done={completedLessons.has(lesson.id)}
                                                icon={CirclePlay}
                                                label={`Bài ${lesson.order_index}: ${lesson.title}`}
                                                sub={formatDuration(lesson.duration_seconds)}
                                                onClick={() => onLessonSelect(lesson.id)}
                                            />
                                            <SidebarItem
                                                active={mode === "quiz" && activeQuiz?.id === lesson.quiz.id}
                                                done={passedQuizzes.has(lesson.quiz.id)}
                                                icon={ClipboardList}
                                                label={lesson.quiz.title}
                                                sub={`${lesson.quiz.time_limit_minutes} phút`}
                                                onClick={() => onQuizSelect(lesson.quiz.id)}
                                            />
                                        </div>
                                    ))}
                                    <SidebarItem
                                        active={mode === "assignment" && activeAssignment?.id === chapter.assignment.id}
                                        done={submittedAssignments.has(chapter.assignment.id)}
                                        icon={Award}
                                        label={chapter.assignment.title}
                                        sub={chapterStats[chapter.id].done >= chapter.lessons.length * 2 ? "Sẵn sàng" : "Hoàn thành lesson trước"}
                                        highlight
                                        onClick={() => onAssignmentSelect(chapter.id)}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>
        </aside>
    );
}

function SidebarItem({ active, done, icon: Icon, label, sub, highlight = false, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex w-full items-start gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-[#1c1236] ${active ? "bg-[#1c1236]" : ""}`}
        >
            <span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full ${done ? "bg-emerald-500/15 text-emerald-300" : highlight ? "bg-amber-500/15 text-amber-300" : "bg-[#241443] text-[#8b5cf6]"}`}>
                {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
            </span>
            <span className="min-w-0 flex-1">
                <span className={`block truncate text-sm font-bold ${highlight ? "text-[#fbbf24]" : "text-white"}`}>{label}</span>
                <span className="mt-1 flex items-center gap-1 text-xs text-[#9aa4bd]">
                    <Clock3 className="h-3 w-3" />
                    {sub}
                </span>
            </span>
        </button>
    );
}

function StatusDot({ active, done }) {
    return (
        <span className={`grid h-4 w-4 shrink-0 place-items-center rounded-full ${done ? "bg-emerald-400" : active ? "bg-[#8b5cf6]" : "bg-[#39255d]"}`}>
            <span className="h-2 w-2 rounded-full bg-[#120922]" />
        </span>
    );
}
