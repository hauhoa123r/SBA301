import { Loader2 } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import LearningGreeting from "../components/start-learning/LearningGreeting";
import LearningMessage from "../components/start-learning/LearningMessage";
import LearningViewContent from "../components/start-learning/LearningViewContent";
import useLearningDashboard from "../hooks/useLearningDashboard";

export default function StartLearningPage() {
    const {
        activeView = "overview",
        selectedCourseId,
        setSelectedCourseId,
        setEnrolledCourses,
    } = useOutletContext() || {};
    const { course, error, loading, stats } = useLearningDashboard({
        selectedCourseId,
        setSelectedCourseId,
        setEnrolledCourses,
    });

    if (loading && !stats) {
        return (
            <div role="status" aria-live="polite" className="flex min-h-[400px] flex-col items-center justify-center gap-3">
                <Loader2 aria-hidden="true" className="h-10 w-10 animate-spin text-brand-accentSoft" />
                <p className="text-sm text-brand-textSecondary">Đang tải khóa học của bạn...</p>
            </div>
        );
    }

    if (error) {
        return <LearningMessage title="Không thể tải khóa học" message={error} />;
    }

    if (!stats?.enrolledCourses?.length || !course) {
        return (
            <>
                <LearningGreeting studentName={stats?.studentName || "bạn"} />
                <LearningMessage
                    title="Bạn chưa sở hữu khóa học nào"
                    message="Các khóa học đã thanh toán thành công sẽ xuất hiện tại đây."
                    showCatalogLink
                />
            </>
        );
    }

    return (
        <>
            <LearningGreeting studentName={stats?.studentName || "bạn"} />
            <LearningViewContent
                activeView={activeView}
                course={course}
                stats={stats}
                isRefreshing={loading}
            />
        </>
    );
}
