import { ChevronRight, Lock } from "lucide-react";
import ProgressBar from "./ProgressBar";

export default function ChapterList({ course, activeChapter, chapterStats, onLessonSelect }) {
    return (
        <section className="mt-8">
            <h2 className="mb-4 text-base font-bold text-[#b9c5df]">Danh sách chương học</h2>
            <div className="space-y-4">
                {course.chapters.map((chapter) => {
                    const stats = chapterStats[chapter.id];
                    const percent = Math.round((stats.done / stats.total) * 100);
                    const previousChapter = course.chapters[chapter.order_index - 2];
                    const locked = chapter.order_index > 1 && chapterStats[previousChapter.id].done < previousChapter.lessons.length * 2 + 1;

                    return (
                        <button
                            key={chapter.id}
                            type="button"
                            disabled={locked}
                            onClick={() => onLessonSelect(chapter.lessons[0].id)}
                            className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
                                locked
                                    ? "cursor-not-allowed border-[#24183a] bg-[#120a23] opacity-50"
                                    : chapter.id === activeChapter.id
                                        ? "border-[#4f2f8f] bg-[#20103a] hover:border-[#7c3aed]"
                                        : "border-[#2b1852] bg-[#160d2b] hover:border-[#7c3aed]/70"
                            }`}
                        >
                            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#2d1760] text-lg font-black text-[#8b5cf6]">
                                {locked ? <Lock className="h-5 w-5 text-[#8892aa]" /> : chapter.order_index}
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="truncate text-base font-extrabold">Chương {chapter.order_index}: {chapter.title}</h3>
                                <p className="mt-1 truncate text-sm text-[#9aa4bd]">{chapter.description}</p>
                                <div className="mt-4 flex items-center gap-3">
                                    <ProgressBar value={percent} />
                                    <span className="w-12 text-sm font-semibold text-[#9aa4bd]">{stats.done}/{stats.total}</span>
                                </div>
                            </div>
                            {!locked && <ChevronRight className="h-5 w-5 text-white" />}
                        </button>
                    );
                })}
            </div>
        </section>
    );
}
