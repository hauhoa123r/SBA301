import { PlayCircle } from "lucide-react";

export default function CourseContent({
    chapters,
    courseDuration,
    totalLessons,
    expandedChapters,
    onToggleChapter,
    onExpandAll,
}) {
    return (
        <section className="mt-16">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="text-3xl font-black text-brand-white" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                        Nội dung khóa học
                    </h2>
                    <p className="mt-4 text-base font-semibold text-brand-textSecondary">
                        {chapters.length} chương <span className="mx-2 text-brand-accent">•</span> {totalLessons} bài học <span className="mx-2 text-brand-accent">•</span> {courseDuration}
                    </p>
                </div>
                <button type="button" onClick={onExpandAll} className="w-fit text-sm font-extrabold text-brand-accentSoft transition hover:text-brand-white">
                    Mở rộng tất cả
                </button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-brand-accent/10 bg-brand-cardBg shadow-xl shadow-brand-accent/5">
                {chapters.map((chapter) => {
                    const isExpanded = expandedChapters.has(chapter.id);

                    return (
                        <div key={chapter.id} className="border-b border-brand-accent/10 last:border-b-0">
                            <button
                                type="button"
                                onClick={() => onToggleChapter(chapter.id)}
                                className="flex w-full items-center justify-between gap-4 bg-brand-light/80 px-6 py-5 text-left transition hover:bg-brand-accent/10"
                            >
                                <span className="flex min-w-0 items-center gap-4">
                                    <span className="text-2xl font-black text-brand-accentSoft">{isExpanded ? "-" : "+"}</span>
                                    <span className="truncate text-xl font-black text-brand-white">
                                        {chapter.id}. {chapter.title}
                                    </span>
                                </span>
                                <span className="shrink-0 text-sm font-semibold text-brand-textSecondary sm:text-base">{chapter.lessons.length} bài học</span>
                            </button>

                            {isExpanded && (
                                <div className="bg-brand-cardBg px-6">
                                    {chapter.lessons.map((lesson, index) => (
                                        <div key={lesson.id} className="flex items-center justify-between gap-4 border-t border-brand-accent/10 py-5">
                                            <div className="flex min-w-0 items-center gap-4">
                                                <PlayCircle className="h-5 w-5 shrink-0 text-brand-accentSoft" />
                                                <span className="truncate text-base text-brand-white md:text-lg">
                                                    {chapter.id}.{index + 1} {lesson.title}
                                                </span>
                                            </div>
                                            <span className="text-sm font-medium text-brand-textSecondary md:text-base">{lesson.duration}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
