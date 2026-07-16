import "./continueLearning.css";

const SkeletonBar = ({ className = "" }) => (
    <span className={`continue-learning-skeleton-bar block rounded-full ${className}`.trim()} />
);

export default function ContinueLearningSkeleton() {
    return (
        <div className="overflow-hidden rounded-3xl border border-brand-accent/15 bg-brand-panel" aria-hidden="true">
            <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(220px,30%)]">
                <div className="space-y-5 p-5 sm:p-7 lg:p-8">
                    <SkeletonBar className="h-7 w-40" />
                    <div className="space-y-3">
                        <SkeletonBar className="h-8 w-4/5" />
                        <SkeletonBar className="h-4 w-2/5" />
                    </div>
                    <div className="space-y-3 rounded-2xl border border-brand-accent/10 p-4">
                        <SkeletonBar className="h-3 w-36" />
                        <SkeletonBar className="h-5 w-3/4" />
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between gap-4">
                            <SkeletonBar className="h-4 w-44" />
                            <SkeletonBar className="h-6 w-12" />
                        </div>
                        <SkeletonBar className="h-2.5 w-full" />
                    </div>
                    <SkeletonBar className="h-12 w-full rounded-xl sm:w-40" />
                    <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                        <SkeletonBar className="h-16 w-full rounded-2xl" />
                        <SkeletonBar className="h-16 w-full rounded-2xl" />
                        <SkeletonBar className="h-16 w-full rounded-2xl sm:col-span-2 lg:col-span-1" />
                    </div>
                </div>
                <SkeletonBar className="h-28 w-full rounded-none sm:h-44 lg:h-full lg:min-h-80" />
            </div>
        </div>
    );
}
