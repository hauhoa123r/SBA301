import { Award, Check, ChevronRight, CirclePlay, ClipboardList, Clock3, X } from "lucide-react";
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
    open = false,
    onClose,
}) {
    const selectLesson = (lessonId) => {
        onLessonSelect(lessonId);
        onClose?.();
    };

    const selectQuiz = (quizId) => {
        onQuizSelect(quizId);
        onClose?.();
    };

    const selectAssignment = (chapterId) => {
        onAssignmentSelect(chapterId);
        onClose?.();
    };

    return (
        <>
            {open && (
                <button
                    type="button"
                    className="fixed inset-x-0 bottom-0 top-[68px] z-30 bg-brand-black/60 backdrop-blur-[2px] lg:hidden"
                    onClick={onClose}
                    aria-label="Đóng nội dung khóa học"
                />
            )}

            <aside
                id="learn-course-navigation"
                aria-label="Nội dung khóa học"
                className={`learning-course-sidebar fixed bottom-0 left-0 top-[68px] z-40 w-[min(22rem,calc(100vw-2.5rem))] overflow-y-auto border-r border-brand-border bg-brand-panel shadow-2xl shadow-brand-black/30 transition-[transform,visibility] duration-300 ${
                    open ? "visible translate-x-0" : "invisible -translate-x-full"
                } lg:visible lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:w-auto lg:translate-x-0 lg:overflow-y-auto lg:shadow-none`}
            >
                <div className="flex items-center gap-3 border-b border-brand-border p-5">
                    <div className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-accent text-2xl font-black">汉</div>
                    <div className="min-w-0 flex-1">
                        <h1 className="truncate text-base font-extrabold">{course.displayTitle}</h1>
                        <p className="truncate text-sm text-brand-courseMuted">{course.teacherName}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-brand-border text-brand-courseMuted transition hover:border-brand-accent/60 hover:text-brand-white lg:hidden"
                        aria-label="Đóng nội dung khóa học"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

            <div className="m-4 rounded-2xl border border-brand-sidebarActive bg-brand-sidebarItem p-4">
                <div className="mb-3 flex items-center justify-between text-sm font-bold">
                    <span className="text-brand-accentBright">Tiến độ tổng thể</span>
                    <span className="text-brand-accentBright">{progress}%</span>
                </div>
                <ProgressBar value={progress} />
                <p className="mt-3 text-sm text-brand-courseMuted">{completedCount}/{totalActivities} bài hoàn thành</p>
            </div>

            <nav className="space-y-2 px-3 pb-6">
                {course.chapters.map((chapter) => {
                    const stats = chapterStats[chapter.id];
                    const isActiveChapter = chapter.id === activeChapter.id;

                    return (
                        <div key={chapter.id} className="border-t border-brand-border pt-3 first:border-t-0">
                            <button
                                type="button"
                                onClick={() => selectLesson(chapter.lessons[0].id)}
                                className="flex w-full items-center gap-3 rounded-xl px-2 py-3 text-left transition hover:bg-brand-cardBg"
                            >
                                <StatusDot active={isActiveChapter} done={stats.done === stats.total} />
                                <span className="min-w-0 flex-1 truncate text-sm font-bold">
                                    Chương {chapter.orderIndex || chapter.order_index}: {chapter.title}
                                </span>
                                <span className="text-xs font-bold text-brand-learningMuted">{stats.done}/{stats.total}</span>
                                <ChevronRight className="h-4 w-4 text-brand-learningMuted" />
                            </button>

                            {isActiveChapter && (
                                <div className="ml-5 mt-1 space-y-1 border-l border-brand-border pl-4">
                                    {chapter.lessons.map((lesson) => (
                                        <div key={lesson.id} className="space-y-1">
                                            <SidebarItem
                                                active={mode === "lesson" && activeLesson.id === lesson.id}
                                                done={completedLessons.has(lesson.id)}
                                                icon={CirclePlay}
                                                label={`Bài ${lesson.orderIndex || lesson.order_index}: ${lesson.title}`}
                                                sub={formatDuration(lesson.durationSeconds || lesson.duration_seconds)}
                                                onClick={() => selectLesson(lesson.id)}
                                            />
                                            {lesson.quiz && (
                                                <SidebarItem
                                                    active={mode === "quiz" && activeQuiz?.id === lesson.quiz.id}
                                                    done={passedQuizzes.has(lesson.quiz.id)}
                                                    icon={ClipboardList}
                                                    label={lesson.quiz.title}
                                                    sub={`${lesson.quiz.time_limit_minutes || lesson.quiz.timeLimitMinutes || 5} phút`}
                                                    onClick={() => selectQuiz(lesson.quiz.id)}
                                                />
                                            )}
                                        </div>
                                    ))}
                                    {chapter.assignment && (
                                        <SidebarItem
                                            active={mode === "assignment" && activeAssignment?.id === chapter.assignment.id}
                                            done={submittedAssignments.has(chapter.assignment.id)}
                                            icon={Award}
                                            label={chapter.assignment.title}
                                            sub={chapterStats[chapter.id]?.done >= chapter.lessons.length * 2 ? "Sẵn sàng" : "Hoàn thành bài học trước"}
                                            highlight
                                            onClick={() => selectAssignment(chapter.id)}
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
                </nav>
            </aside>
        </>
    );
}

function SidebarItem({ active, done, icon: Icon, label, sub, highlight = false, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex w-full items-start gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-brand-cardBg ${active ? "bg-brand-cardBg" : ""}`}
        >
            <span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full ${done ? "bg-status-successStrong/15 text-status-successSoft" : highlight ? "bg-status-warningStrong/15 text-status-warningSoft" : "bg-brand-sidebarHover text-brand-accentBright"}`}>
                {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
            </span>
            <span className="min-w-0 flex-1">
                <span className={`block truncate text-sm font-bold ${highlight ? "text-brand-warning" : "text-brand-white"}`}>{label}</span>
                <span className="mt-1 flex items-center gap-1 text-xs text-brand-learningMuted">
                    <Clock3 className="h-3 w-3" />
                    {sub}
                </span>
            </span>
        </button>
    );
}

function StatusDot({ active, done }) {
    return (
        <span className={`grid h-4 w-4 shrink-0 place-items-center rounded-full ${done ? "bg-status-success" : active ? "bg-brand-accentBright" : "bg-brand-borderHover"}`}>
            <span className="h-2 w-2 rounded-full bg-brand-panel" />
        </span>
    );
}
