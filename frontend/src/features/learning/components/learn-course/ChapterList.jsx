import { ChevronRight, Lock } from "lucide-react";
import ProgressBar from "./ProgressBar";

export default function ChapterList({ course, activeChapter, chapterStats, onLessonSelect, onQuizSelect }) {
    return (
        <section className="mt-8">
            <h2 className="mb-4 text-base font-bold text-brand-learningLight">Danh sách chương học</h2>
            <div className="space-y-4">
                {course.chapters.map((chapter) => {
                    const stats = chapterStats[chapter.id];
                    const percent = stats.total ? Math.floor((stats.done / stats.total) * 100) : 0;
                    const locked = !chapter.lessons.length && !chapter.quizzes?.length;

                    return (
                        <button
                            key={chapter.id}
                            type="button"
                            disabled={locked}
                            onClick={() => chapter.lessons[0] ? onLessonSelect(chapter.lessons[0].id) : onQuizSelect(chapter.quizzes[0].id)}
                            className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
                                locked
                                    ? "cursor-not-allowed border-brand-mutedPanel bg-brand-panelAlt opacity-50"
                                    : chapter.id === activeChapter.id
                                        ? "border-brand-scrollbar bg-brand-cardBgAlt hover:border-brand-accent"
                                        : "border-brand-border bg-brand-surface hover:border-brand-accent/70"
                            }`}
                        >
                            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand-accentDeepAlt text-lg font-black text-brand-accentBright">
                                {locked ? <Lock className="h-5 w-5 text-brand-learningText" /> : chapter.order_index}
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="truncate text-base font-extrabold">Chương {chapter.order_index}: {chapter.title}</h3>
                                <p className="mt-1 truncate text-sm text-brand-learningMuted">{chapter.description}</p>
                                <div className="mt-4 flex items-center gap-3">
                                    <ProgressBar value={percent} />
                                    <span className="w-12 text-sm font-semibold text-brand-learningMuted">{stats.done}/{stats.total}</span>
                                </div>
                            </div>
                            {!locked && <ChevronRight className="h-5 w-5 text-brand-white" />}
                        </button>
                    );
                })}
            </div>
        </section>
    );
}
