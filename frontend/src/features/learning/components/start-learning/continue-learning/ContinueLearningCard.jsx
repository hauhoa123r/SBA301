import { Link } from "react-router-dom";
import { ArrowRight, BookOpenCheck, Clock3, Layers3, Trophy } from "lucide-react";
import AnimatedCard from "../../../../../shared/components/animation/AnimatedCard";
import UserImage from "../../../../../shared/components/animation/UserImage";
import ContinueLearningProgress from "./ContinueLearningProgress";

function LearningMeta({ className = "", icon: Icon, label, value }) {
    return (
        <div className={`flex min-w-0 items-center gap-3 rounded-2xl border border-brand-accent/10 bg-brand-darker/30 px-3 py-3 ${className}`.trim()}>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-accent/10 text-brand-accentSoft">
                <Icon aria-hidden="true" className="h-4 w-4" />
            </span>
            <span className="min-w-0">
                <span className="block text-[11px] font-semibold uppercase leading-4 tracking-wide text-brand-textSecondary">{label}</span>
                <span className="mt-0.5 block truncate text-sm font-black text-brand-white">{value}</span>
            </span>
        </div>
    );
}

function CourseIllustration({ thumbnailUrl }) {
    return (
        <div
            className="continue-learning-thumbnail relative h-28 overflow-hidden border-t border-brand-accent/15 bg-brand-menu sm:h-44 lg:h-auto lg:min-h-full lg:border-l lg:border-t-0"
            aria-hidden="true"
        >
            {thumbnailUrl ? (
                <UserImage
                    src={thumbnailUrl}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
            ) : (
                <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_center,var(--color-brand-accent)_0%,var(--color-brand-panel)_70%)]">
                    <BookOpenCheck className="h-14 w-14 text-brand-accentPale/80" />
                </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-brand-panel/90 via-brand-panel/30 to-brand-transparent lg:bg-gradient-to-t lg:from-brand-panel/80 lg:via-brand-transparent" />
        </div>
    );
}

export default function ContinueLearningCard({ model }) {
    const {
        chapterLabel,
        chapterTitle,
        courseTitle,
        cupsText,
        destination,
        lessonDuration,
        lessonTitle,
        openLessonsText,
        progress,
        thumbnailUrl,
    } = model;
    const learningMeta = [
        lessonDuration && { icon: Clock3, label: "Thời lượng bài", value: lessonDuration },
        openLessonsText && { icon: BookOpenCheck, label: "Bài học trong khóa", value: openLessonsText },
        cupsText && { icon: Trophy, label: "Cúp đã đạt", value: cupsText },
    ].filter(Boolean);

    return (
        <AnimatedCard
            as="article"
            className="continue-learning-card-shell group overflow-hidden rounded-3xl border border-brand-accent/25 bg-brand-panel shadow-2xl shadow-brand-black/20"
        >
            <div className="relative grid lg:grid-cols-[minmax(0,1fr)_minmax(220px,30%)]">
                <div className="relative z-10 p-5 sm:p-7 lg:p-8">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-2 rounded-full border border-brand-accent/25 bg-brand-accent/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-brand-accentPale">
                            <Layers3 aria-hidden="true" className="h-3.5 w-3.5" />
                            Khóa học đang chọn
                        </span>
                        {chapterLabel && (
                            <span className="rounded-full border border-brand-white/10 px-3 py-1.5 text-xs font-bold text-brand-textMutedLight">{chapterLabel}</span>
                        )}
                    </div>

                    <p className="mt-4 max-w-3xl text-lg font-black leading-tight text-brand-white sm:text-xl">{courseTitle}</p>
                    {chapterTitle && (
                        <p className="mt-2 text-sm font-semibold text-brand-accentSoft sm:text-base">{chapterTitle}</p>
                    )}

                    <div className="mt-5 rounded-2xl border border-brand-accent/15 bg-brand-darker/35 p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-textSecondary">Bài học được đề xuất</p>
                        <div className="mt-2 flex items-start gap-3">
                            <BookOpenCheck aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-brand-accentSoft" />
                            <h3 className="text-xl font-black leading-7 text-brand-white sm:text-2xl">
                                {lessonTitle || "Mở khóa học để xem nội dung tiếp theo"}
                            </h3>
                        </div>
                    </div>

                    <div className="mt-6"><ContinueLearningProgress {...progress} /></div>

                    <div className="mt-6 flex flex-wrap items-center gap-3">
                        <Link
                            to={destination}
                            className="continue-learning-cta inline-flex min-h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-brand-accent px-5 py-3 text-sm font-black text-brand-white no-underline shadow-lg shadow-brand-accent/20 transition hover:bg-brand-accentHover sm:w-auto"
                            aria-label={`Vào khóa học ${courseTitle}`}
                        >
                            <span className="relative z-10">Vào khóa học</span>
                            <ArrowRight aria-hidden="true" className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                        <p className="w-full text-center text-xs leading-5 text-brand-textSecondary sm:w-auto sm:text-left">Tiếp tục theo nhịp học phù hợp với bạn.</p>
                    </div>

                    {learningMeta.length > 0 && (
                        <div className="mt-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                            {learningMeta.map((item, index) => (
                                <LearningMeta
                                    key={item.label}
                                    {...item}
                                    className={learningMeta.length % 2 === 1 && index === learningMeta.length - 1 ? "sm:col-span-2 lg:col-span-1" : ""}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <CourseIllustration thumbnailUrl={thumbnailUrl} />
            </div>
        </AnimatedCard>
    );
}
