import { PlayCircle } from "lucide-react";
import UserReveal from "../../../../shared/components/animation/UserReveal";
import UserStagger from "../../../../shared/components/animation/UserStagger";

export default function CourseContent({
    chapters,
    courseDuration,
    totalLessons,
    expandedChapters,
    onToggleChapter,
    onExpandAll,
}) {
    return (
        <UserReveal as="section" className="mt-12 sm:mt-16">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="text-2xl font-black text-brand-white sm:text-3xl">
                        Nội dung khóa học
                    </h2>
                    <p className="mt-3 text-sm font-semibold leading-6 text-brand-textSecondary sm:mt-4 sm:text-base">
                        {chapters.length} chương <span className="mx-2 text-brand-accent">•</span> {totalLessons} bài học <span className="mx-2 text-brand-accent">•</span> {courseDuration}
                    </p>
                </div>
                <button type="button" onClick={onExpandAll} className="w-fit rounded-lg px-1 py-1 text-sm font-extrabold text-brand-accentSoft transition hover:text-brand-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accentSoft">
                    Mở rộng tất cả
                </button>
            </div>

            <UserStagger className="overflow-hidden rounded-2xl border border-brand-accent/10 bg-brand-cardBg shadow-xl shadow-brand-accent/5" itemClassName="border-b border-brand-accent/10 last:border-b-0" step={60} distance={18}>
                {chapters.map((chapter) => {
                    const isExpanded = expandedChapters.has(chapter.id);
                    const triggerId = `course-chapter-${chapter.id}-trigger`;
                    const panelId = `course-chapter-${chapter.id}-panel`;

                    return (
                        <div key={chapter.id}>
                            <button
                                id={triggerId}
                                type="button"
                                aria-expanded={isExpanded}
                                aria-controls={panelId}
                                onClick={() => onToggleChapter(chapter.id)}
                                className="flex w-full items-start justify-between gap-3 bg-brand-light/80 px-4 py-4 text-left transition hover:bg-brand-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-accentSoft sm:items-center sm:gap-4 sm:px-6 sm:py-5"
                            >
                                <span className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-4">
                                    <span aria-hidden="true" className="w-4 shrink-0 text-xl font-black leading-6 text-brand-accentSoft sm:text-2xl">{isExpanded ? "−" : "+"}</span>
                                    <span className="min-w-0 break-words text-base font-black leading-6 text-brand-white sm:text-xl">
                                        {chapter.orderIndex}. {chapter.title}
                                    </span>
                                </span>
                                <span className="shrink-0 pt-0.5 text-xs font-semibold text-brand-textSecondary sm:pt-0 sm:text-base">{chapter.lessons.length} bài học</span>
                            </button>

                            <div id={panelId} role="region" aria-labelledby={triggerId} hidden={!isExpanded} className="bg-brand-cardBg px-4 sm:px-6">
                                {chapter.lessons.map((lesson, index) => (
                                    <div key={lesson.id} className="flex items-start justify-between gap-3 border-t border-brand-accent/10 py-4 sm:items-center sm:gap-4 sm:py-5">
                                        <div className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-4">
                                            <PlayCircle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-brand-accentSoft sm:mt-0" />
                                            <span className="break-words text-sm leading-6 text-brand-white sm:text-base md:text-lg">
                                                {chapter.orderIndex}.{lesson.orderIndex ?? index + 1} {lesson.title}
                                            </span>
                                        </div>
                                        <span className="shrink-0 pt-0.5 text-xs font-medium text-brand-textSecondary sm:pt-0 sm:text-sm md:text-base">{lesson.duration}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </UserStagger>
        </UserReveal>
    );
}
