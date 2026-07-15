import { useId } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, PlayCircle } from "lucide-react";
import ContinueLearningCard from "./ContinueLearningCard";
import ContinueLearningSkeleton from "./ContinueLearningSkeleton";
import buildContinueLearningModel from "./continueLearningModel";
import "./continueLearning.css";

export default function ContinueLearningSection({
    className = "",
    course,
    stats,
    statsCourseId,
    statsCourseTitle,
    completedActivities,
    totalActivities,
    openLessons,
    earnedCups,
    totalCups,
    loading = false,
    isRefreshing = false,
}) {
    const reactId = useId();
    const titleId = `continue-learning-${reactId.replace(/:/g, "")}`;
    const model = buildContinueLearningModel({
        course,
        stats,
        statsCourseId,
        statsCourseTitle,
        completedActivities,
        totalActivities,
        openLessons,
        earnedCups,
        totalCups,
    });

    return (
        <section aria-labelledby={titleId} className={`continue-learning-section ${className}`.trim()}>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                    <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-accent/15 text-brand-accentSoft ring-1 ring-brand-accent/25">
                        <PlayCircle aria-hidden="true" className="h-5 w-5" />
                    </span>
                    <div>
                        <h2 id={titleId} className="text-xl font-black text-brand-white sm:text-2xl">Tiếp tục học</h2>
                        <p className="mt-1 max-w-2xl text-sm leading-6 text-brand-textSecondary">
                            Quay lại lộ trình và hoàn thành hoạt động tiếp theo của bạn.
                        </p>
                    </div>
                </div>

                <Link
                    to="/learning#study-plan"
                    className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-bold text-brand-accentSoft no-underline transition hover:bg-brand-accent/10 hover:text-brand-white"
                >
                    Xem kế hoạch học
                    <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                </Link>
            </div>

            {loading || isRefreshing ? (
                <div role="status" aria-live="polite">
                    <span className="sr-only">Đang tải thông tin tiếp tục học...</span>
                    <ContinueLearningSkeleton />
                </div>
            ) : (
                <ContinueLearningCard model={model} />
            )}
        </section>
    );
}
